-- ============================================================================
-- 005 — College guide tabs: Ask StudyRaven chat + Application tracker
-- Run this in the Supabase SQL editor (or via supabase db push).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- college_chats — Ask StudyRaven conversation history
-- ----------------------------------------------------------------------------
create table if not exists public.college_chats (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz default now()
);
create index if not exists college_chats_user_created_idx
  on public.college_chats(user_id, created_at);

alter table public.college_chats enable row level security;

drop policy if exists "college_chats_select_own" on public.college_chats;
create policy "college_chats_select_own" on public.college_chats
  for select using (auth.uid() = user_id);

drop policy if exists "college_chats_insert_own" on public.college_chats;
create policy "college_chats_insert_own" on public.college_chats
  for insert with check (auth.uid() = user_id);

drop policy if exists "college_chats_delete_own" on public.college_chats;
create policy "college_chats_delete_own" on public.college_chats
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- college_applications — Application tracker
-- ----------------------------------------------------------------------------
create table if not exists public.college_applications (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  university_name       text not null,
  deadline              date,
  status                text not null default 'not_started'
                          check (status in ('not_started', 'in_progress', 'submitted')),
  essay_done            boolean not null default false,
  recommendations_done  boolean not null default false,
  test_scores_done      boolean not null default false,
  notes                 text,
  created_at            timestamptz default now()
);
create index if not exists college_applications_user_idx
  on public.college_applications(user_id);

alter table public.college_applications enable row level security;

drop policy if exists "college_applications_select_own" on public.college_applications;
create policy "college_applications_select_own" on public.college_applications
  for select using (auth.uid() = user_id);

drop policy if exists "college_applications_insert_own" on public.college_applications;
create policy "college_applications_insert_own" on public.college_applications
  for insert with check (auth.uid() = user_id);

drop policy if exists "college_applications_update_own" on public.college_applications;
create policy "college_applications_update_own" on public.college_applications
  for update using (auth.uid() = user_id);

drop policy if exists "college_applications_delete_own" on public.college_applications;
create policy "college_applications_delete_own" on public.college_applications
  for delete using (auth.uid() = user_id);
