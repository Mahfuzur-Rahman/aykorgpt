-- TaxBuddy custom auth setup — OWN users table, NOT Supabase Auth.
-- Run once in the Supabase SQL Editor. The backend talks to this table with
-- the service key, so no RLS policies are required (service key bypasses RLS).

create table if not exists app_users (
    id                     uuid primary key default gen_random_uuid(),
    email                  text unique not null,
    password_hash          text not null,          -- pbkdf2_sha256$... (see api/chat.py)
    full_name              text,
    plan                   text not null default 'free',   -- free | pro | superuser
    email_verified         boolean not null default false,
    verify_code            text,                   -- 6-digit code, null once verified
    verify_code_expires_at timestamptz,
    created_at             timestamptz default now()
);

-- Fast lookups by email (login / register dedupe). The unique constraint above
-- already creates an index, but keep this explicit for clarity.
create index if not exists app_users_email_idx on app_users (lower(email));
