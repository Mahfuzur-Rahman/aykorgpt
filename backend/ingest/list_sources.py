# Run: python ingest/list_sources.py
# Lists every distinct `source` value in tax_documents with row counts,
# so you can confirm what has actually been ingested.

from ingest import supabase

res = supabase.table('tax_documents').select('source').execute()
rows = res.data or []

counts = {}
for r in rows:
    counts[r['source']] = counts.get(r['source'], 0) + 1

if not counts:
    print('tax_documents is empty.')
else:
    for source, count in sorted(counts.items()):
        print(f'{count:5d}  {source}')
