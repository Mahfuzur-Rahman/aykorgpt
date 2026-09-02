# PDF Ingestion Pipeline Guide

Complete documentation of the multi-step OCR and embedding pipeline for ingesting tax documents into the AykorGPT chatbot knowledge base.

---

## Overview

This guide documents the ingestion of **Income Tax Paripatra 2025-26** (197 pages) into Supabase as a searchable knowledge base. The process handles:
- Legacy Bangla-font PDFs via Gemini vision OCR
- Page-level caching for crash resilience
- Multi-key API rotation to maximize free-tier quotas
- Automatic retry with exponential backoff for transient errors
- Vector embeddings (768-dim) for semantic search

---

## Tools & Technologies Used

### Core Libraries (Python)

| Tool | Version | Purpose |
|------|---------|---------|
| `google-genai` | 1.5.0 | Gemini API client for vision OCR and embeddings |
| `pymupdf` (fitz) | ≥1.24.0 | PDF reading and page rendering to PNG |
| `supabase` | ≥2.13.0 | PostgreSQL client for vector storage and retrieval |
| `python-dotenv` | 1.0.1 | Environment variable loading (.env.local) |

### APIs

| Service | Model | Use Case | Quota |
|---------|-------|----------|-------|
| **Google Gemini** | gemini-2.5-flash | Vision OCR (extract Bangla text from legacy-font PDFs) | 20 requests/day per key |
| **Google Gemini** | gemini-embedding-001 | Vector embeddings (768-dim for semantic search) | 20 requests/day per key |

**API Key Strategy:**
- 8 Gemini API keys configured (GEMINI_API_KEY, GEMINI_API_KEY_2, ... GEMINI_API_KEY_8)
- Round-robin key rotation across all calls
- Total capacity: 8 keys × 20 calls/day = 160 OCR calls/day + 160 embedding calls/day

### Database

| Service | Feature | Use Case |
|---------|---------|----------|
| **Supabase (PostgreSQL)** | pgvector extension | Store 768-dim embeddings for vector similarity search |
| **Supabase** | match_tax_docs RPC | Semantic retrieval function (KNN search on embeddings) |

**Table schema:**
```sql
tax_documents (
  id BIGINT PRIMARY KEY,
  source TEXT,        -- e.g., "Income Tax Paripatra 2025-26"
  year INT,           -- e.g., 2025
  category TEXT,      -- act, sro, circular, budget, qa
  content TEXT,       -- chunk text (500 words, 50-word overlap)
  embedding vector(768)  -- normalized Gemini embedding
)
```

### Infrastructure

| Component | Role |
|-----------|------|
| **Python 3.13** | Runtime for ingest scripts |
| **.env.local** | Credentials storage (Gemini keys, Supabase URL/key) |
| **Bash/PowerShell** | Process orchestration and monitoring |
| **JSON** | OCR cache format (.pdf.ocr_cache.json per document) |

---

## Step 1: Verify PDF and Extract Metadata

**Prompt:**
```bash
python -c "
import fitz
doc = fitz.open('ingest/docs/Income_Tax_Paripatra_2025-2026.pdf')
print('Pages:', len(doc))
t = doc[5].get_text().strip()
print('Text sample:', t[:150])
"
```

**What it does:**
- Opens the PDF with PyMuPDF (fitz)
- Counts total pages (197)
- Samples text from page 6 to verify Bangla encoding and text layer quality
- Output should show Bangla text (possibly garbled if legacy font)

**Expected output:**
```
Pages: 197
Text sample: আয়কর পররপত্র ২০২৫- ২০২৬ | iv  
...
```

**Why this step:**
Confirms the PDF is readable and shows whether the text layer is usable or if OCR is required. Legacy fonts often show control characters, necessitating Gemini vision OCR.

---

## Step 2: Start Ingestion Process (OCR Phase)

**Prompt:**
```bash
python -u ingest/ingest.py \
  --file "ingest/docs/Income_Tax_Paripatra_2025-2026.pdf" \
  --source "Income Tax Paripatra 2025-26" \
  --year 2025 \
  --category circular > ingest/_ingest_run.log 2>&1 &
disown
```

**What it does:**
- Launches the ingestion script as a background process
- Redirects all output to a log file for monitoring
- Uses the built-in OCR cache to resume from where it left off

**Process flow inside ingest.py:**
1. Loads all 8 Gemini API keys from environment (GEMINI_API_KEY, GEMINI_API_KEY_2, etc.)
2. Opens the PDF and loads any existing OCR cache (`.pdf.ocr_cache.json`)
3. For each uncached page:
   - Renders the page to PNG at 200 DPI
   - Sends to Gemini 2.5-flash vision with OCR prompt
   - Caches result immediately (1 page = 1 file write = crash-safe)
   - Waits 12 seconds (per-key rate limit: 5 RPM × 8 keys = 40 RPM total)

**Key parameters:**
- `--file`: Path to PDF
- `--source`: Document name (appears in search results)
- `--year`: Year (for filtering/grouping)
- `--category`: One of `act`, `sro`, `circular`, `budget`, `qa`

---

## Step 3: Monitor OCR Progress

**Prompt (set up persistent monitor):**
```bash
tail -n +1 -f ingest/_ingest_run.log | grep --line-buffered \
  -E "OCR page (25|50|75|100|125|150|175|197)/197|Found [0-9]+ chunks|Done!|Stopped at chunk|Traceback"
```

**What to watch for:**
- `OCR page N/197...` — page N completed successfully
- `page N rate limited, waiting Xs` — quota exceeded, retrying with backoff
- `Stopped at chunk`: Permanent error or exhausted quota
- `Traceback`: Unrecoverable error (investigate log)

**Milestone reporting (197 pages):**
```
OCR page 25/197...   (12% complete)
OCR page 50/197...   (25% complete)
OCR page 75/197...   (38% complete)
OCR page 100/197...  (51% complete)
OCR page 125/197...  (63% complete)
OCR page 150/197...  (76% complete)
OCR page 175/197...  (89% complete)
OCR page 197/197...  (100% complete — OCR done!)
```

**Why this step:**
Real-time visibility into OCR progress. Bangla text is memory-intensive; rendering 197 pages to PNG + sending to Gemini takes hours across quota windows.

---

## Step 4: Handle Quota Exhaustion (Automatic Resume)

**When quota hits:**
```
page 55/197 rate limited, waiting 5s (retry 1/5)...
page 55/197 rate limited, waiting 10s (retry 2/5)...
page 55/197 rate limited, waiting 20s (retry 3/5)...
page 55/197 rate limited, waiting 40s (retry 4/5)...
page 55/197 rate limited, waiting 80s (retry 5/5)...
Traceback (most recent call last):
  ...
google.genai.errors.ClientError: 429 RESOURCE_EXHAUSTED
```

**What happened:**
- Hit 20 requests/day per key per model limit (Gemini 2.5-flash)
- 8 keys × 20 = 160 requests/day max
- Process exhausted the daily quota and stopped at page 55

**Quota math for Paripatra:**
- 197 pages = 197 OCR calls needed
- 8 keys × 20 calls/day = 160 calls/day capacity
- 160 calls → ~132 pages/day (12s pacing)
- Paripatra needed: ~2 days (pages 1–79 day 1, pages 80–197 day 2)

**Resume prompt (hourly retry loop):**
```bash
# After ~1 hour, quota resets at midnight UTC. Run:
python -u ingest/ingest.py \
  --file "ingest/docs/Income_Tax_Paripatra_2025-2026.pdf" \
  --source "Income Tax Paripatra 2025-26" \
  --year 2025 \
  --category circular > ingest/_ingest_run.log 2>&1 &
disown
```

**Cache check:**
```bash
python -c "
import json
p = 'ingest/docs/Income_Tax_Paripatra_2025-2026.pdf.ocr_cache.json'
cached = len(json.load(open(p, encoding='utf-8')))
print(f'OCR cache: {cached}/197')
"
```

**Why this works:**
- Each page's OCR result is saved immediately to `.pdf.ocr_cache.json`
- If the process dies or quota hits, restart the command and it skips cached pages
- No wasted API calls on pages already done

---

## Step 5: Verify OCR Complete → Chunking Phase

**When you see:**
```
OCR page 197/197...
Found 95 chunks. Ingesting into Supabase...
```

**What happens next (automatic):**
1. All 197 OCR'd pages are concatenated into one text blob
2. Text is split into overlapping chunks (500 words, 50-word overlap)
3. Result: 95 chunks ready for embedding and storage

**Verify OCR cache is complete:**
```bash
python -c "
import json
cached = len(json.load(open('ingest/docs/Income_Tax_Paripatra_2025-2026.pdf.ocr_cache.json', encoding='utf-8')))
print(f'OCR cache: {cached}/197')
"
```

Expected: `OCR cache: 197/197`

---

## Step 6: Embedding and Database Insertion

**Process (automatic after chunking):**
```
  10 / 95 done...
  20 / 95 done...
  ...
  90 / 95 done...
```

**What's happening:**
- For each chunk (1–95):
  1. Embed with Gemini embedding-001 (768-dim vector)
  2. Insert into `tax_documents` table (source, year, category, content, embedding)
  3. Wait 0.7s to stay under free-tier embedding rate limit
  4. Log progress every 10 chunks

**Each chunk insert:**
- Calls `get_embedding()` which round-robins across 8 keys
- Any transient error (rate limit, 5xx, connection drop) triggers exponential backoff
- Network resilience: `_is_transient()` catches DNS failures, connection resets, etc.

**Potential errors during this phase:**
```
Stopped at chunk 33: [Errno 11001] getaddrinfo failed
```
→ Network DNS error (transient). Restart the process; it resumes from chunk 33.

```
Stopped at chunk 50: 429 RESOURCE_EXHAUSTED
```
→ Quota exhausted. Wait for reset, then restart.

---

## Step 7: Completion and Verification

**Success message:**
```
Done! "Income Tax Paripatra 2025-26" is now searchable in your chatbot.
```

**Verify chunks in Supabase:**
```bash
python -c "
import sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from dotenv import load_dotenv
load_dotenv('.env.local')
import os
from supabase import create_client

def count(src=None):
    for i in range(4):
        try:
            sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))
            q = sb.table('tax_documents').select('id', count='exact')
            if src: q = q.eq('source', src)
            return q.execute().count
        except Exception:
            if i == 3: raise
            time.sleep(2)

p = count('Income Tax Paripatra 2025-26')
t = count()
print(f'Paripatra: {p} chunks')
print(f'Table total: {t} chunks')
"
```

**Expected output:**
```
Paripatra: 95 chunks
Table total: 402 chunks
```

---

## Step 8: Test Retrieval

**Verify semantic search works:**
```bash
python ingest/test_fetch.py "পারিষদ আয়কর সংক্রান্ত প্রশ্ন"
```

**Prompt translation:** "Paripatra income tax related question"

**Expected output:**
```
Query: পারিষদ আয়কর সংক্রান্ত প্রশ্ন

[0.85] Income Tax Paripatra 2025-26
[Text chunk with high similarity score...]

[0.82] Income Tax Paripatra 2025-26
[Text chunk with high similarity...]
```

**What this proves:**
- Vector embeddings are stored correctly
- Semantic search (match_tax_docs RPC) works
- Bangla text is clean and searchable

---

## Complete Knowledge Base After Paripatra Ingestion

| Document | Chunks | Pages | Category |
|----------|--------|-------|----------|
| Income Tax Act 2023 | 169 | 316 | act |
| Finance Act 2025 | 64 | 123 | act |
| Income Tax Nirdeshika 2025-26 | 74 | 141 | circular |
| Income Tax Paripatra 2025-26 | 95 | 197 | circular |
| **TOTAL** | **402** | **777** | — |

---

## Troubleshooting

### Issue: OCR page N stuck, no output for 5+ minutes

**Cause:** Likely rate-limited on that key, exponential backoff in progress.

**Prompt to check status:**
```bash
tail -20 ingest/_ingest_run.log
```

**Action:** Wait. Backoff goes up to 120s. Process will continue.

---

### Issue: `google.genai.errors.ClientError: 429 RESOURCE_EXHAUSTED`

**Cause:** All 8 keys hit daily quota (20 requests/day per key per model).

**Prompt to check quota state:**
```bash
python -c "
import json
cached = len(json.load(open('ingest/docs/Income_Tax_Paripatra_2025-2026.pdf.ocr_cache.json', encoding='utf-8')))
print(f'Cached: {cached}/197 pages')
print('Quota resets at midnight UTC.')
"
```

**Action:** Wait for UTC midnight, then restart the same command.

---

### Issue: `Stopped at chunk 33: [Errno 11001] getaddrinfo failed`

**Cause:** Network DNS resolution failure (transient).

**Prompt to resume:**
```bash
python -u ingest/ingest.py \
  --file "ingest/docs/Income_Tax_Paripatra_2025-2026.pdf" \
  --source "Income Tax Paripatra 2025-26" \
  --year 2025 \
  --category circular > ingest/_ingest_run.log 2>&1 &
disown
```

**What happens:** Process detects 32 chunks already in DB, resumes from chunk 33.

---

### Issue: Duplicate chunks in Supabase

**Cause:** Network retry inserted the same chunk twice (once completed server-side, but connection dropped before client got confirmation).

**Prompt to find duplicates:**
```bash
python -c "
from dotenv import load_dotenv
import os
from supabase import create_client
load_dotenv('.env.local')
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

# Find chunks with identical content for this source
res = sb.table('tax_documents').select('*').eq('source', 'Income Tax Paripatra 2025-26').execute()
chunks = res.data

from collections import defaultdict
seen = defaultdict(list)
for row in chunks:
    seen[row['content']].append(row['id'])

dups = {k: v for k, v in seen.items() if len(v) > 1}
if dups:
    print(f'Found {len(dups)} unique duplicate chunks')
    for content, ids in list(dups.items())[:3]:
        print(f'  IDs {ids}: {content[:50]}...')
else:
    print('No duplicates found')
"
```

**Prompt to delete duplicates (keep first occurrence):**
```bash
python -c "
from dotenv import load_dotenv
import os
from supabase import create_client
load_dotenv('.env.local')
sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

res = sb.table('tax_documents').select('*').eq('source', 'Income Tax Paripatra 2025-26').execute()
chunks = res.data

from collections import defaultdict
seen = defaultdict(list)
for row in chunks:
    seen[row['content']].append(row['id'])

to_delete = []
for content, ids in seen.items():
    if len(ids) > 1:
        to_delete.extend(ids[1:])  # Keep first, delete rest

if to_delete:
    sb.table('tax_documents').delete().in_('id', to_delete).execute()
    print(f'Deleted {len(to_delete)} duplicate rows')
else:
    print('No duplicates to delete')
"
```

---

## API Keys Configuration

**File:** `.env.local`

**Required keys:**
```
GEMINI_API_KEY=<key1>
GEMINI_API_KEY_2=<key2>
GEMINI_API_KEY_3=<key3>
...
GEMINI_API_KEY_8=<key8>
SUPABASE_URL=<url>
SUPABASE_SERVICE_KEY=<service_key>
```

**Check loaded keys:**
```bash
python -c "
from ingest.ingest import _load_gemini_keys
keys = _load_gemini_keys()
print(f'Loaded {len(keys)} Gemini API keys')
for i, k in enumerate(keys, 1):
    print(f'  {i}. {k[:20]}...')
"
```

---

## Quota Tracking

**Current quota state (API):**
Visit: https://aistudio.google.com/app/apikey → view quota metrics for each key

**Expected for 8 keys:**
- 20 OCR calls/day per key = 160 OCR calls/day total
- 20 embedding calls/day per key = 160 embedding calls/day total
- Reset time: Midnight UTC

**Monitor quota across ingestion:**
```bash
# Before starting, note the time:
date -u

# Check current cache:
python -c "
import json
cached = len(json.load(open('ingest/docs/Income_Tax_Paripatra_2025-2026.pdf.ocr_cache.json', encoding='utf-8')))
print(f'OCR cache: {cached}/197')
"

# If stuck >1 hour, quota has likely reset. Restart the process.
```

---

## Production Checklist

Before ingesting a new document:

- [ ] Verify document pages and Bangla text quality (Step 1)
- [ ] Set up log monitoring (Step 3)
- [ ] Ensure all 8 Gemini keys are active and valid
- [ ] Reserve 2–3 hours per 197-page document (quota resets once/day)
- [ ] Monitor for "Stopped at chunk" — indicates need to resume
- [ ] Verify chunks in Supabase after completion (Step 7)
- [ ] Test retrieval with a Bangla query (Step 8)
- [ ] Check for duplicates if network errors occurred
- [ ] Confirm new document appears in chatbot search results

---

## Files Involved

| File | Purpose |
|------|---------|
| `ingest/ingest.py` | Main ingestion logic (OCR, chunking, embedding, DB insert) |
| `ingest/test_fetch.py` | Semantic search test (verify retrieval works) |
| `ingest/docs/*.pdf` | Source documents |
| `ingest/docs/*.pdf.ocr_cache.json` | Per-document OCR page cache |
| `.env.local` | API keys and Supabase credentials |
| `ingest/_ingest_run.log` | Live log of current ingestion |

---

## Reference: Key Functions in ingest.py

- `extract_text(pdf_path)` → Gemini vision OCR for all pages
- `_ocr_page_with_retry(png_bytes, page_num, total)` → Single page OCR with exponential backoff
- `chunk_text(text, chunk_size=500, overlap=50)` → Split text into overlapping chunks
- `get_embedding(text)` → 768-dim vector from gemini-embedding-001
- `_store_chunk(source, year, category, chunk)` → Embed + insert into Supabase
- `_is_transient(exc)` → Detect retryable errors (rate limits, connection drops, 5xx)
- `ingest(file_path, source, year, category)` → Orchestrate the entire pipeline

---

**Document Date:** 2026-07-09  
**Last Updated:** Income Tax Paripatra 2025-26 ingestion completed  
**Status:** All 402 tax document chunks live and searchable
