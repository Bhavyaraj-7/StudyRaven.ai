-- ============================================================================
-- 006 — Google access requests (Gmail/Classroom beta)
-- Every click on "Connect Gmail/Classroom" is logged here so the owner can
-- add those users to the Google OAuth test-user list, then approve them.
-- Run this in the Supabase SQL editor.
-- ============================================================================

create table if not exists public.google_access_requests (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  email         text,
  service       text not null check (service in ('gmail', 'classroom')),
  requested_at  timestamptz default now(),
  unique (user_id, service)
);

-- RLS on with no user policies: only the service role (server) can touch it.
alter table public.google_access_requests enable row level security;
