-- ----------------------------------------------------------------------------
-- 003: daily generation usage (free tier = 5/day)
-- RLS is enabled with NO user policies on purpose: only the service role can
-- read or write this table, so users cannot reset their own counters.
-- ----------------------------------------------------------------------------
create table if not exists public.generation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);

alter table public.generation_usage enable row level security;
