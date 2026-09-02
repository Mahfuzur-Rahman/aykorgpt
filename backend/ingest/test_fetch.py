# Run: python ingest/test_fetch.py "your test question here"
# Embeds the question with the same model used at ingest time, then calls
# the match_tax_docs RPC to prove retrieval works end-to-end.

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from ingest import supabase, get_embedding

query = sys.argv[1] if len(sys.argv) > 1 else 'What is the tax rate for individuals?'

print(f'Query: {query}\n')

embedding = get_embedding(query)

res = supabase.rpc('match_tax_docs', {
    'query_embedding': embedding,
    'match_count': 5,
}).execute()

rows = res.data or []
if not rows:
    print('No results. Either the table is empty or ingestion embeddings are missing.')
else:
    for r in rows:
        print(f"[{r['similarity']:.3f}] {r['source']} {r['section'] or ''}")
        print(r['content'][:200].replace('\n', ' ') + '...\n')
