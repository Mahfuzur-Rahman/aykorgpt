import asyncio
import base64
import hashlib
import hmac
import json
import logging
import math
import os
import secrets
import smtplib
import urllib.request
from datetime import date, datetime, timedelta
from email.message import EmailMessage

from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel, field_validator
from supabase import create_client

load_dotenv(".env.local")
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"],
)
gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="AykorGPT API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FREE_DAILY_LIMIT = 10
HISTORY_MAX_MESSAGES = 30  # last 15 turns fed back to the model

# User ids that bypass all quota limits (superusers / test accounts).
# Comma-separated in the SUPERUSER_IDS env var. The "loginnow" test
# superuser created by the web login page is included by default.
SUPERUSER_IDS = {
    s.strip()
    for s in os.environ.get("SUPERUSER_IDS", "superuser-loginnow").split(",")
    if s.strip()
}


# ── Custom auth (our own users table — NOT Supabase Auth) ──────────────────
VERIFY_CODE_TTL_MIN = 10          # verification code lifetime
SESSION_TTL_DAYS = 30             # signed session-token lifetime
SESSION_SECRET = os.environ.get("SESSION_SECRET", "dev-insecure-secret-change-me")
PBKDF2_ITERATIONS = 200_000

SYSTEM_PROMPT = """You are AykorGPT, an expert Bangladesh tax assistant having \
a conversation with a user.

How to answer:
- Tax facts (rates, limits, thresholds, definitions) must come from the \
Context block or from earlier messages in this conversation. Never invent \
tax facts. Cite the Act name, Section number, or SRO reference for each fact.
- When the user says things like "explain that simply", "give an example", \
or "summarize", they mean YOUR previous answer. Rephrase it freely, and \
illustrate it with a worked example using made-up numbers (e.g. a sample \
salary) applied to the rule you already cited. This is expected, not a \
violation of the rules.
- Only when the needed tax fact appears nowhere in the Context or the \
conversation: say you do not have that information and suggest the NBR \
helpline.
- Write clearly and concisely in English.
- End with: Disclaimer: Informational only, not tax advice."""

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    question: str
    user_id: str = "anonymous"
    conversation_id: str | None = None

    @field_validator("question")
    @classmethod
    def question_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("question must not be empty")
        return v.strip()


class Source(BaseModel):
    source: str
    section: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    queries_remaining: int


class QuotaResponse(BaseModel):
    plan: str
    queries_today: int
    queries_remaining: int
    reset_date: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _embed(text: str, task_type: str) -> list[float]:
    """Embed text with Gemini gemini-embedding-001 (768 dims)."""
    result = gemini.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(
            task_type=task_type,
            output_dimensionality=768,
        ),
    )
    values = result.embeddings[0].values
    # gemini-embedding-001 returns un-normalized vectors below 3072 dims;
    # normalize to unit length so similarity search is correct.
    norm = math.sqrt(sum(v * v for v in values))
    return [v / norm for v in values] if norm else values


def _get_or_create_quota(user_id: str) -> dict:
    row = (
        supabase.table("user_quotas")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if row.data:
        return row.data[0]

    today = date.today().isoformat()
    new_row = {"user_id": user_id, "plan": "free", "queries_today": 0, "reset_date": today}
    supabase.table("user_quotas").insert(new_row).execute()
    return new_row


def _check_quota(user_id: str) -> dict:
    """Verify the user may ask a question. Returns {"plan", "queries_today"}.

    Does NOT increment the counter — call _increment_quota() after the
    answer is successfully generated, so failed requests don't cost quota.
    """
    # Superusers / test accounts: unlimited, never counted.
    if user_id in SUPERUSER_IDS or user_id.startswith("superuser-"):
        return {"plan": "superuser", "queries_today": 0}

    quota = _get_or_create_quota(user_id)
    today = date.today().isoformat()
    queries_today = quota["queries_today"]

    if quota["reset_date"] < today:
        queries_today = 0
        supabase.table("user_quotas").update(
            {"queries_today": 0, "reset_date": today}
        ).eq("user_id", user_id).execute()

    if quota["plan"] == "free" and queries_today >= FREE_DAILY_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Free plan limit of {FREE_DAILY_LIMIT} queries/day reached. Upgrade to continue.",
        )

    return {"plan": quota["plan"], "queries_today": queries_today}


def _increment_quota(user_id: str, quota: dict) -> int:
    """Record one used query. Returns queries remaining (-1 = unlimited)."""
    used = quota["queries_today"] + 1
    supabase.table("user_quotas").update(
        {"queries_today": used}
    ).eq("user_id", user_id).execute()
    return -1 if quota["plan"] != "free" else FREE_DAILY_LIMIT - used


def _get_history(conversation_id: str | None, user_id: str) -> list[dict]:
    """Return prior messages of this conversation (oldest first), or []."""
    if not conversation_id:
        return []
    try:
        row = (
            supabase.table("conversations")
            .select("messages")
            .eq("id", conversation_id).eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if row.data:
            return row.data[0]["messages"] or []
    except Exception as exc:
        log.warning("Could not load conversation history: %s", exc)
    return []


def _save_message(conversation_id: str | None, user_id: str, question: str, answer: str, sources: list[dict] | None = None):
    turn = [
        {"role": "user",      "content": question, "ts": datetime.utcnow().isoformat()},
        {"role": "assistant", "content": answer,   "sources": sources or [], "ts": datetime.utcnow().isoformat()},
    ]
    if conversation_id:
        existing = (
            supabase.table("conversations")
            .select("messages")
            .eq("id", conversation_id).eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            updated = (existing.data[0]["messages"] or []) + turn
            supabase.table("conversations").update(
                {"messages": updated}
            ).eq("id", conversation_id).eq("user_id", user_id).execute()
            return

    new_row = {"user_id": user_id, "messages": turn}
    if conversation_id:
        # Use the client-generated id so follow-up messages append to
        # this conversation instead of creating a new row per turn.
        new_row["id"] = conversation_id
    supabase.table("conversations").insert(new_row).execute()


async def _generate_with_retry(contents: list) -> str:
    """Call Gemini 2.5 Flash. On 429, retry once, then fall back to
    flash-lite (separate free-tier quota bucket) before giving up."""
    attempts = [
        ("gemini-2.5-flash", 0),
        ("gemini-2.5-flash", 2),
        ("gemini-2.5-flash-lite", 2),
    ]
    for i, (model, delay) in enumerate(attempts):
        if delay:
            await asyncio.sleep(delay)
        try:
            response = gemini.models.generate_content(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
            )
            return response.text
        except Exception as exc:
            msg = str(exc).lower()
            is_transient = (
                "429" in msg or "quota" in msg
                or "503" in msg or "unavailable" in msg or "overloaded" in msg
            )
            if is_transient and i < len(attempts) - 1:
                log.warning("Gemini error on %s (%.80s) — trying %s", model, exc, attempts[i + 1][0])
                continue
async def _generate_with_web_search(contents: list) -> tuple[str, list[Source]]:
    """Fallback to Gemini Google Search grounding when local vector docs are absent or insufficient."""
    web_system_prompt = (
        "You are AykorGPT, an expert Bangladesh tax assistant. "
        "Search the web for accurate, up-to-date Bangladesh National Board of Revenue (NBR) tax information, "
        "acts, circulars, SROs, and tax rules to answer the user's question clearly. "
        "Cite official sources, circular dates, and web references where available. "
        "End with: Disclaimer: Informational only, not tax advice."
    )
    attempts = [
        ("gemini-2.5-flash", 0),
        ("gemini-2.5-flash", 2),
    ]
    for i, (model, delay) in enumerate(attempts):
        if delay:
            await asyncio.sleep(delay)
        try:
            response = gemini.models.generate_content(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=web_system_prompt,
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                ),
            )
            answer = response.text or "I could not find definitive information on this topic online."
            sources: list[Source] = []
            if response.candidates and response.candidates[0].grounding_metadata:
                gm = response.candidates[0].grounding_metadata
                if gm.grounding_chunks:
                    for chunk in gm.grounding_chunks[:5]:
                        if chunk.web:
                            title = chunk.web.title or "Web Search Source"
                            uri = chunk.web.uri or ""
                            sources.append(Source(source=f"🌐 {title}", section=uri))
            if not sources:
                sources.append(Source(source="🌐 Live Web Search", section="NBR Online Grounding"))
            return answer, sources
        except Exception as exc:
            log.warning("Web search generation failed on %s: %s", model, exc)
            if i < len(attempts) - 1:
                continue
            raise HTTPException(status_code=503, detail="AI web search service temporarily unavailable.")


# ---------------------------------------------------------------------------
# Custom auth helpers
# ---------------------------------------------------------------------------

def _hash_password(password: str) -> str:
    """PBKDF2-SHA256 with a random salt (stdlib only, no extra deps)."""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return (
        f"pbkdf2_sha256${PBKDF2_ITERATIONS}$"
        f"{base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"
    )


def _verify_password(password: str, stored: str) -> bool:
    try:
        _algo, iters, salt_b64, hash_b64 = stored.split("$")
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iters))
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False



security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    # Mock token for quick local testing (superuser-loginnow.0.mock_signature)
    if token.endswith(".mock_signature"):
        user_id = token.split(".")[0]
        if user_id.startswith("superuser-"):
            return user_id
            
    try:
        body_b64, sig = token.split(".")
        expected_sig = hmac.new(SESSION_SECRET.encode(), body_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            raise ValueError()
        # Decode body (add padding if needed)
        pad = len(body_b64) % 4
        padded_body = body_b64 + "=" * ((4 - pad) if pad else 0)
        payload = base64.urlsafe_b64decode(padded_body).decode()
        user_id, exp_str = payload.split(".")
        if int(exp_str) < datetime.utcnow().timestamp():
            raise ValueError("Token expired")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")


def _make_session_token(user_id: str) -> str:
    """Compact HMAC-signed token: base64(user_id.exp).sig — no JWT dependency."""
    exp = int((datetime.utcnow() + timedelta(days=SESSION_TTL_DAYS)).timestamp())
    payload = f"{user_id}.{exp}"
    sig = hmac.new(SESSION_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    body = base64.urlsafe_b64encode(payload.encode()).decode().rstrip("=")
    return f"{body}.{sig}"


def _new_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _send_verification_email(to_email: str, code: str, full_name: str = "") -> None:
    """Send the 6-digit code from Gmail via SMTP (app password required)."""
    user = os.environ.get("GMAIL_USER")
    pw = os.environ.get("GMAIL_APP_PASSWORD")
    if not user or not pw:
        raise RuntimeError("Gmail SMTP not configured (GMAIL_USER / GMAIL_APP_PASSWORD)")

    greeting = f"Hi {full_name}," if full_name else "Hi,"
    msg = EmailMessage()
    msg["Subject"] = "Your BD Tax Bot verification code"
    msg["From"] = os.environ.get("GMAIL_FROM", user)
    msg["To"] = to_email
    msg.set_content(
        f"{greeting}\n\n"
        f"Your BD Tax Bot verification code is: {code}\n\n"
        f"It expires in {VERIFY_CODE_TTL_MIN} minutes. "
        f"If you didn't request this, you can ignore this email."
    )
    msg.add_alternative(
        f"""<div style="font-family:sans-serif;max-width:420px">
          <p>{greeting}</p>
          <p>Your BD Tax Bot verification code is:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#0F6E56">{code}</p>
          <p style="color:#666">It expires in {VERIFY_CODE_TTL_MIN} minutes.
          If you didn't request this, you can ignore this email.</p>
        </div>""",
        subtype="html",
    )
    port = int(os.environ.get("SMTP_PORT", "587"))
    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=15) as server:
            server.login(user, pw)
            server.send_message(msg)
    else:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            server.login(user, pw)
            server.send_message(msg)


def _find_user_by_email(email: str) -> dict | None:
    row = (
        supabase.table("app_users")
        .select("*")
        .eq("email", email)
        .limit(1)
        .execute()
    )
    return row.data[0] if row.data else None


# ---------------------------------------------------------------------------
# Auth schemas
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""
    plan: str = "free"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("invalid email address")
        return v

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        return v


class VerifyRequest(BaseModel):
    email: str
    code: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class ResendRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class GoogleAuthRequest(BaseModel):
    credential: str


class AuthResponse(BaseModel):
    user_id: str
    token: str
    full_name: str
    email: str
    plan: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/conversations")
def get_conversations(auth_user_id: str = Depends(get_current_user)):
    try:
        row = (
            supabase.table("conversations")
            .select("*")
            .eq("user_id", auth_user_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return row.data if row.data else []
    except Exception as exc:
        log.error("Failed to fetch conversations: %s", exc)
        raise HTTPException(status_code=500, detail="Could not fetch conversations.")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, auth_user_id: str = Depends(get_current_user)):
    req.user_id = auth_user_id
    # 1. Quota check (counter is incremented only after a successful answer)
    try:
        quota = _check_quota(req.user_id)
    except HTTPException:
        raise
    except Exception as exc:
        log.error("Quota check failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not verify usage quota.")
    queries_remaining = (
        -1 if quota["plan"] != "free"
        else FREE_DAILY_LIMIT - quota["queries_today"]
    )

    # 2. Load conversation history (for follow-up understanding)
    history = _get_history(req.conversation_id, req.user_id)[-HISTORY_MAX_MESSAGES:]

    # 3. Embed question. For follow-ups, prepend the previous user question so
    #    vague queries like "what about for women?" still retrieve the right docs.
    prev_user_questions = [m["content"] for m in history if m["role"] == "user"]
    retrieval_text = (
        f"{prev_user_questions[-1]}\n{req.question}"
        if prev_user_questions
        else req.question
    )
    try:
        embedding = _embed(retrieval_text, task_type="RETRIEVAL_QUERY")
    except Exception as exc:
        log.error("Embedding failed: %s", exc)
        raise HTTPException(status_code=503, detail="Embedding service unavailable.")

    # 4. Retrieve relevant chunks from local NBR vector store
    matched_docs = []
    try:
        result = supabase.rpc(
            "match_tax_docs",
            {"query_embedding": embedding, "match_count": 5},
        ).execute()
        if result.data:
            matched_docs = result.data
    except Exception as exc:
        log.warning("Supabase vector match failed or degraded: %s", exc)

    # 5. Multi-turn contents
    base_contents = [
        types.Content(
            role="user" if m["role"] == "user" else "model",
            parts=[types.Part(text=m["content"])],
        )
        for m in history
    ]

    # If no local docs found, fallback to real-time Web Search Grounding!
    if not matched_docs:
        log.info("No local vector documents matched. Falling back to real-time Web Search Grounding.")
        web_contents = list(base_contents)
        web_contents.append(
            types.Content(
                role="user",
                parts=[types.Part(text=f"Question: {req.question}")],
            )
        )
        answer, sources = await _generate_with_web_search(web_contents)
    else:
        context = "\n\n".join(
            f"[{d['source']} — {d['section']}]\n{d['content']}"
            for d in matched_docs
        )
        rag_contents = list(base_contents)
        rag_contents.append(
            types.Content(
                role="user",
                parts=[types.Part(text=f"Context:\n{context}\n\nQuestion: {req.question}")],
            )
        )
        answer = await _generate_with_retry(rag_contents)

        # Check if local context was insufficient and triggers web fallback
        no_info_triggers = [
            "do not have sufficient information",
            "do not have that information",
            "not found in the provided context",
            "not provided in the context",
            "cannot find information",
        ]
        if any(trigger in answer.lower() for trigger in no_info_triggers):
            log.info("Local documents had insufficient info. Falling back to real-time Web Search Grounding.")
            web_contents = list(base_contents)
            web_contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part(text=f"Question: {req.question}")],
                )
            )
            answer, web_sources = await _generate_with_web_search(web_contents)
            sources = web_sources
        else:
            sources = [
                Source(source=d["source"], section=d.get("section") or "")
                for d in matched_docs
            ]

    # 6. Count the query now that it succeeded (best-effort)
    try:
        queries_remaining = _increment_quota(req.user_id, quota)
    except Exception as exc:
        log.warning("Could not increment quota: %s", exc)

    # 7. Save conversation (best-effort)
    try:
        sources_dicts = [{"source": s.source, "section": s.section} for s in sources]
        _save_message(req.conversation_id, req.user_id, req.question, answer, sources_dicts)
    except Exception as exc:
        log.warning("Could not save conversation: %s", exc)

    return ChatResponse(answer=answer, sources=sources, queries_remaining=queries_remaining)


@app.get("/api/health")
def health():
    try:
        count = supabase.table("tax_documents").select("id", count="exact").execute()
        return {"status": "ok", "documents_indexed": count.count}
    except Exception as exc:
        log.error("Health check failed: %s", exc)
        return {"status": "degraded", "error": str(exc)}


@app.get("/api/quota/{user_id}", response_model=QuotaResponse)
def get_quota(user_id: str, auth_user_id: str = Depends(get_current_user)):
    if user_id != auth_user_id: raise HTTPException(403, "Forbidden")
    if user_id in SUPERUSER_IDS or user_id.startswith("superuser-"):
        return QuotaResponse(
            plan="superuser",
            queries_today=0,
            queries_remaining=-1,  # -1 signals "unlimited" to the frontend
            reset_date=date.today().isoformat(),
        )
    try:
        quota = _get_or_create_quota(user_id)
    except Exception as exc:
        log.error("Quota fetch failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not fetch quota.")

    today = date.today().isoformat()
    queries_today = quota["queries_today"] if quota["reset_date"] >= today else 0
    remaining = max(0, FREE_DAILY_LIMIT - queries_today) if quota["plan"] == "free" else -1

    return QuotaResponse(
        plan=quota["plan"],
        queries_today=queries_today,
        queries_remaining=remaining,
        reset_date=quota["reset_date"],
    )


@app.get("/api/conversations")
def get_conversations(user_id: str = Depends(get_current_user)):
    try:
        res = (
            supabase.table("conversations")
            .select("id, user_id, messages, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        log.error("Failed to fetch conversations for %s: %s", user_id, exc)
        return []


@app.delete("/api/conversations/{conv_id}")
def delete_conversation(conv_id: str, user_id: str = Depends(get_current_user)):
    try:
        supabase.table("conversations").delete().eq("id", conv_id).eq("user_id", user_id).execute()
        return {"status": "deleted", "id": conv_id}
    except Exception as exc:
        log.error("Failed to delete conversation %s: %s", conv_id, exc)
        raise HTTPException(status_code=500, detail="Could not delete conversation.")


# ---------------------------------------------------------------------------
# Auth endpoints (custom users table + Gmail verification code)
# ---------------------------------------------------------------------------

@app.post("/api/auth/register")
def register(req: RegisterRequest):
    existing = _find_user_by_email(req.email)
    if existing and existing["email_verified"]:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    code = _new_code()
    expires = (datetime.utcnow() + timedelta(minutes=VERIFY_CODE_TTL_MIN)).isoformat()
    plan = req.plan if req.plan in ("free", "pro") else "free"

    if existing:
        # Unverified signup exists — refresh password + code and resend.
        supabase.table("app_users").update({
            "password_hash": _hash_password(req.password),
            "full_name": req.full_name,
            "plan": plan,
            "verify_code": code,
            "verify_code_expires_at": expires,
        }).eq("id", existing["id"]).execute()
    else:
        try:
            supabase.table("app_users").insert({
                "email": req.email,
                "password_hash": _hash_password(req.password),
                "full_name": req.full_name,
                "plan": plan,
                "email_verified": False,
                "verify_code": code,
                "verify_code_expires_at": expires,
            }).execute()
        except Exception as exc:
            log.error("User insert failed: %s", exc)
            raise HTTPException(status_code=500, detail="Could not create account.")

    try:
        _send_verification_email(req.email, code, req.full_name)
    except Exception as exc:
        log.error("Verification email failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not send the verification email. Try again shortly.")

    return {"status": "code_sent", "email": req.email}


@app.post("/api/auth/verify", response_model=AuthResponse)
def verify(req: VerifyRequest):
    user = _find_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    if user["email_verified"]:
        raise HTTPException(status_code=400, detail="Email already verified. Please sign in.")

    if not user.get("verify_code") or user["verify_code"] != req.code.strip():
        raise HTTPException(status_code=400, detail="Incorrect code.")

    expires_at = user.get("verify_code_expires_at")
    if expires_at and datetime.fromisoformat(expires_at) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code expired. Request a new one.")

    supabase.table("app_users").update({
        "email_verified": True,
        "verify_code": None,
        "verify_code_expires_at": None,
    }).eq("id", user["id"]).execute()

    return AuthResponse(
        user_id=user["id"],
        token=_make_session_token(user["id"]),
        full_name=user.get("full_name") or "",
        email=user["email"],
        plan=user["plan"],
    )


@app.post("/api/auth/resend")
def resend(req: ResendRequest):
    user = _find_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    if user["email_verified"]:
        raise HTTPException(status_code=400, detail="Email already verified. Please sign in.")

    code = _new_code()
    expires = (datetime.utcnow() + timedelta(minutes=VERIFY_CODE_TTL_MIN)).isoformat()
    supabase.table("app_users").update({
        "verify_code": code,
        "verify_code_expires_at": expires,
    }).eq("id", user["id"]).execute()

    try:
        _send_verification_email(req.email, code, user.get("full_name") or "")
    except Exception as exc:
        log.error("Resend email failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not send the verification email.")

    return {"status": "code_sent", "email": req.email}


@app.post("/api/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    email_lower = req.email.strip().lower()
    user = _find_user_by_email(email_lower)
    if not user or not _verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if not user["email_verified"]:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in.")

    return AuthResponse(
        user_id=user["id"],
        token=_make_session_token(user["id"]),
        full_name=user.get("full_name") or "",
        email=user["email"],
        plan=user["plan"],
    )


@app.post("/api/auth/google", response_model=AuthResponse)
def google_auth(req: GoogleAuthRequest):
    """Authenticate or register a user using a Google OAuth ID Token."""
    if not req.credential:
        raise HTTPException(status_code=400, detail="Missing Google credential.")

    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={req.credential}"
        req_obj = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req_obj, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        log.error("Google token verification failed: %s", exc)
        raise HTTPException(status_code=401, detail="Invalid Google sign-in token.")

    email = data.get("email", "").strip().lower()
    name = data.get("name", "") or data.get("given_name", "") or email.split("@")[0]

    if not email:
        raise HTTPException(status_code=400, detail="Google account email not found.")

    user = _find_user_by_email(email)

    if not user:
        try:
            insert_res = (
                supabase.table("app_users")
                .insert({
                    "email": email,
                    "password_hash": _hash_password(secrets.token_hex(16)),
                    "full_name": name,
                    "plan": "free",
                    "email_verified": True,
                })
                .execute()
            )
            user = insert_res.data[0]
        except Exception as exc:
            log.error("Failed to create Google user: %s", exc)
            raise HTTPException(status_code=500, detail="Could not create user account.")
    elif not user.get("email_verified"):
        supabase.table("app_users").update({"email_verified": True}).eq("id", user["id"]).execute()
        user["email_verified"] = True

    return AuthResponse(
        user_id=user["id"],
        token=_make_session_token(user["id"]),
        full_name=user.get("full_name") or name,
        email=user["email"],
        plan=user.get("plan", "free"),
    )


class UpgradeRequest(BaseModel):
    user_id: str
    plan: str = "pro"
    payment_method: str = "bkash"
    trx_id: str = ""


@app.post("/api/subscription/upgrade")
def upgrade_subscription(req: UpgradeRequest, auth_user_id: str = Depends(get_current_user)):
    if req.user_id != auth_user_id: raise HTTPException(403, "Forbidden")
    if not req.user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")

    try:
        supabase.table("app_users").update({"plan": req.plan}).eq("id", req.user_id).execute()

        quota = (
            supabase.table("user_quotas")
            .select("*")
            .eq("user_id", req.user_id)
            .limit(1)
            .execute()
        )
        if quota.data:
            supabase.table("user_quotas").update({"plan": req.plan}).eq("user_id", req.user_id).execute()
        else:
            supabase.table("user_quotas").insert({
                "user_id": req.user_id,
                "plan": req.plan,
                "queries_today": 0,
                "reset_date": date.today().isoformat()
            }).execute()

        log.info("User %s upgraded to %s via %s (TrxID: %s)", req.user_id, req.plan, req.payment_method, req.trx_id)
        return {"status": "upgraded", "plan": req.plan, "user_id": req.user_id}
    except Exception as exc:
        log.error("Subscription upgrade failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not upgrade subscription.")


# ---------------------------------------------------------------------------
# Vercel entry point
# ---------------------------------------------------------------------------

handler = Mangum(app)
