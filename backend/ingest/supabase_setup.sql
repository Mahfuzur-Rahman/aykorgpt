-- TaxBuddy Supabase setup
-- Run this once in the Supabase SQL Editor of a NEW project, then put that
-- project's URL + service key into .env.local before running ingest.py.

-- 1. Vector extension (pgvector)
create extension if not exists vector;

-- 2. Documents table. Embedding is 768 dims to match gemini-embedding-001
--    called with output_dimensionality=768 (see ingest.py / api/chat.py).
create table if not exists tax_documents (
    id         bigint generated always as identity primary key,
    source     text not null,        -- e.g. "Income Tax Act 2023"
    year       int,
    category   text default 'act',   -- act | sro | circular | budget | qa
    section    text,                 -- optional section/clause label
    content    text not null,
    embedding  vector(768),
    created_at timestamptz default now()
);

-- 3. Approximate-nearest-neighbour index (cosine distance)
create index if not exists tax_documents_embedding_idx
    on tax_documents using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- 4. Similarity search RPC used by api/chat.py.
--    Returns the closest chunks by cosine similarity.
create or replace function match_tax_docs(
    query_embedding vector(768),
    match_count int default 5
)
returns table (
    id       bigint,
    source   text,
    section  text,
    content  text,
    similarity float
)
language sql stable
as $$
    select
        td.id,
        td.source,
        coalesce(td.section, '') as section,
        td.content,
        1 - (td.embedding <=> query_embedding) as similarity
    from tax_documents td
    order by td.embedding <=> query_embedding
    limit match_count;
$$;
