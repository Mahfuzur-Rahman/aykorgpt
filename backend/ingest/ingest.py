# Run: python ingest/ingest.py --file myfile.pdf --source 'VAT Act 2012' --year 2012

from google import genai
from google.genai import types
from supabase import create_client
import fitz, json, os, argparse, time, math
from dotenv import load_dotenv

load_dotenv('.env.local')

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)


def _load_gemini_keys():
    """Collect every Gemini key from the environment. Supports either a
    comma-separated GEMINI_API_KEYS, or numbered GEMINI_API_KEY / _2 / _3 ...
    with no upper bound. Rotating across keys multiplies the free-tier
    rate limit by key count."""
    keys = []
    for k in (os.getenv('GEMINI_API_KEYS') or '').split(','):
        k = k.strip()
        if k and k not in keys:
            keys.append(k)
    k = (os.getenv('GEMINI_API_KEY') or '').strip()
    if k and k not in keys:
        keys.append(k)
    i = 2
    while True:
        k = (os.getenv(f'GEMINI_API_KEY_{i}') or '').strip()
        if not k:
            break
        if k not in keys:
            keys.append(k)
        i += 1
    if not keys:
        raise RuntimeError('No Gemini key found. Set GEMINI_API_KEY or GEMINI_API_KEYS.')
    return keys


_clients = [genai.Client(api_key=k) for k in _load_gemini_keys()]
_client_idx = 0
print(f'Using {len(_clients)} Gemini API key(s).')


OCR_PROMPT = (
    'Transcribe all text on this page exactly as written (Bangla and/or '
    'English). Output only the transcription, no commentary.'
)


def extract_text(pdf_path):
    """Extract all text from a PDF by rendering each page as an image and
    transcribing it with Gemini vision.

    Many Bangladesh gazette PDFs embed legacy Bangla fonts (e.g. SutonnyMJ)
    whose /ToUnicode CMap is broken, so PyPDF2/pdfminer/PyMuPDF's text layer
    all decode to garbage control characters. OCR via Gemini is the only
    reliable way to recover correct Bangla text from these files.

    Each page's transcription is cached to disk as it completes, so a
    crash or rate-limit exhaustion partway through a large PDF doesn't
    force re-spending API calls on pages already done."""
    doc = fitz.open(pdf_path)
    cache_path = pdf_path + '.ocr_cache.json'
    pages = _load_ocr_cache(cache_path)
    total = len(doc)
    for i in range(len(pages), total):
        pix = doc[i].get_pixmap(dpi=200)
        text = _ocr_page_with_retry(pix.tobytes('png'), i + 1, total)
        pages.append(text or '')
        _save_ocr_cache(cache_path, pages)
        print(f'  OCR page {i + 1}/{total}...')
        # Free tier is 5 requests/minute PER KEY. Rotating across N keys
        # means the same key comes up again after N calls, so spacing
        # calls at 60/5 = 12s apart keeps every individual key under its
        # own per-minute cap regardless of how many keys are configured.
        time.sleep(12)
    return ' '.join(pages)


def _load_ocr_cache(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def _save_ocr_cache(path, pages):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(pages, f, ensure_ascii=False)


def _ocr_page_with_retry(png_bytes, page_num, total):
    """Transcribe one page image, retrying transient errors (rate limits,
    5xx) with exponential backoff, same pattern as _store_chunk."""
    delay = 5
    for attempt in range(6):
        try:
            return _ocr_page(png_bytes)
        except Exception as e:
            if _is_transient(e) and attempt < 5:
                reason = 'rate limited' if _is_rate_limit(e) else 'service unavailable'
                print(f'    page {page_num}/{total} {reason}, waiting {delay}s (retry {attempt + 1}/5)...')
                time.sleep(delay)
                delay = min(delay * 2, 120)
                continue
            raise


def _ocr_page(png_bytes):
    """Transcribe one page image with Gemini, rotating across keys the
    same way get_embedding does. A single dead/denied key shouldn't abort
    the whole call, so any per-key failure (transient or not, e.g. a
    revoked key) just moves on to the next key; only raise once every key
    has failed.

    If any key's failure was transient, that's the one raised (even if a
    later, permanently-dead key failed last) — otherwise a mix of one bad
    key and several merely rate-limited ones would make the caller's
    backoff-and-retry logic give up immediately instead of waiting out
    the rate limit."""
    global _client_idx
    last_exc = None
    last_transient_exc = None
    for _ in range(len(_clients)):
        client = _clients[_client_idx]
        _client_idx = (_client_idx + 1) % len(_clients)
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[
                    types.Part.from_bytes(data=png_bytes, mime_type='image/png'),
                    OCR_PROMPT,
                ],
            )
            return response.text
        except Exception as e:
            last_exc = e
            if _is_transient(e):
                last_transient_exc = e
            continue
    raise last_transient_exc or last_exc


def chunk_text(text, chunk_size=500, overlap=50):
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = ' '.join(words[i : i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def get_embedding(text):
    """Get a 768-dim embedding from gemini-embedding-001.

    Round-robins across the configured keys to spread load. Any per-key
    failure (rate limit, 5xx, or a dead/revoked key) just moves on to the
    next key; only raises once every key has failed (the caller then
    backs off and retries). If any failure was transient, that's the one
    raised — see _ocr_page for why."""
    global _client_idx
    last_exc = None
    last_transient_exc = None
    for _ in range(len(_clients)):
        client = _clients[_client_idx]
        _client_idx = (_client_idx + 1) % len(_clients)
        try:
            result = client.models.embed_content(
                model='gemini-embedding-001',
                contents=text,
                config=types.EmbedContentConfig(
                    task_type='RETRIEVAL_DOCUMENT',
                    output_dimensionality=768,
                ),
            )
            values = result.embeddings[0].values
            # gemini-embedding-001 returns un-normalized vectors below 3072
            # dims; normalize to unit length so similarity search is correct.
            norm = math.sqrt(sum(v * v for v in values))
            return [v / norm for v in values] if norm else values
        except Exception as e:
            last_exc = e
            if _is_transient(e):
                last_transient_exc = e
            continue
    raise last_transient_exc or last_exc


def _is_rate_limit(exc):
    s = str(exc)
    return '429' in s or 'RESOURCE_EXHAUSTED' in s or 'quota' in s.lower()


def _is_transient(exc):
    """Retryable conditions: rate limits, transient server errors
    (503 UNAVAILABLE / 500 INTERNAL), and network blips that resolve on
    their own (dropped connections, resets, timeouts)."""
    s = str(exc)
    return (
        _is_rate_limit(exc)
        or '503' in s or 'UNAVAILABLE' in s
        or '500' in s or 'INTERNAL' in s
        or 'Connection' in type(exc).__name__
        or 'Connection aborted' in s or 'Connection reset' in s
        or 'ConnectionTerminated' in s or 'Server disconnected' in s
        or 'RemoteDisconnected' in s or 'timed out' in s.lower()
    )


def _store_chunk(source, year, category, chunk):
    """Embed one chunk and insert it. Retries transient errors (rate limits
    and 5xx) with exponential backoff. Raises if it cannot succeed (so the
    caller can stop cleanly without leaving a gap)."""
    delay = 5
    for attempt in range(6):
        try:
            embedding = get_embedding(chunk)
            supabase.table('tax_documents').insert({
                'source':    source,
                'year':      year,
                'category':  category,
                'content':   chunk,
                'embedding': embedding,
            }).execute()
            return
        except Exception as e:
            if _is_transient(e) and attempt < 5:
                reason = 'rate limited' if _is_rate_limit(e) else 'service unavailable'
                print(f'    {reason}, waiting {delay}s (retry {attempt + 1}/5)...')
                time.sleep(delay)
                delay = min(delay * 2, 120)
                continue
            raise


def _already_ingested(source):
    """How many chunks for this source are already in the table, so a
    re-run resumes instead of duplicating."""
    try:
        res = (
            supabase.table('tax_documents')
            .select('id', count='exact')
            .eq('source', source)
            .execute()
        )
        return res.count or 0
    except Exception:
        return 0


def ingest(file_path, source, year, category='act'):
    print(f'Reading {file_path}...')
    text = extract_text(file_path)
    chunks = chunk_text(text)

    start = _already_ingested(source)
    if start >= len(chunks):
        print(f'"{source}" already fully ingested ({start} chunks). Nothing to do.')
        return
    if start:
        print(f'Resuming "{source}": {start} of {len(chunks)} chunks already done.')
    print(f'Found {len(chunks)} chunks. Ingesting into Supabase...')

    for i in range(start, len(chunks)):
        try:
            _store_chunk(source, year, category, chunks[i])
        except Exception as e:
            print(f'\n  Stopped at chunk {i}: {e}')
            if _is_rate_limit(e):
                print('  Your Gemini free-tier quota is likely used up for now.')
                print(f'  Progress is saved — re-run the same command later to resume from chunk {i}.')
            return
        if (i + 1) % 10 == 0:
            print(f'  {i + 1} / {len(chunks)} done...')
        time.sleep(0.7)   # stay under the free-tier embedding rate limit

    print(f'Done! "{source}" is now searchable in your chatbot.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Ingest a PDF into Supabase')
    parser.add_argument('--file',     required=True,  help='Path to PDF file')
    parser.add_argument('--source',   required=True,  help='Document name, e.g. VAT Act 2012')
    parser.add_argument('--year',     required=True,  type=int, help='Year of the document')
    parser.add_argument('--category', default='act',  help='act | sro | circular | budget | qa')
    args = parser.parse_args()
    ingest(args.file, args.source, args.year, args.category)
