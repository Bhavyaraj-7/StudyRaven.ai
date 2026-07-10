-- ----------------------------------------------------------------------------
-- 004: mock_attempts — tracks when a mock test starts, so we can detect
-- "started but never finished" and send a comeback reminder.
-- ----------------------------------------------------------------------------
create table if not exists public.mock_attempts (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  subject_id     uuid references public.subjects(id) on delete set null,
  subject_name   text not null,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  reminder_sent  boolean not null default false
);
create index if not exists mock_attempts_user_id_idx on public.mock_attempts(user_id);
create index if not exists mock_attempts_pending_idx
  on public.mock_attempts(started_at)
  where completed_at is null and reminder_sent = false;

alter table public.mock_attempts enable row level security;

drop policy if exists "own_select" on public.mock_attempts;
drop policy if exists "own_insert" on public.mock_attempts;
drop policy if exists "own_update" on public.mock_attempts;
drop policy if exists "own_delete" on public.mock_attempts;
create policy "own_select" on public.mock_attempts for select using  (auth.uid() = user_id);
create policy "own_insert" on public.mock_attempts for insert with check (auth.uid() = user_id);
create policy "own_update" on public.mock_attempts for update using  (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.mock_attempts for delete using  (auth.uid() = user_id);
