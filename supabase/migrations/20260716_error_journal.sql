-- StudyRaven: error journal — every question you dropped marks on, kept until fixed.
-- Paste this whole file into the Supabase SQL editor and click Run.
-- Safe to run more than once (everything is IF NOT EXISTS / guarded).

-- ------------------------------------------------------------------
-- mistakes — one row per question where marks were lost in a mock
-- ------------------------------------------------------------------
create table if not exists mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  subject_name text,
  question text not null,
  your_answer text,
  correct_answer text,
  topic text,
  marks_lost integer not null default 0,
  why text,
  fixed boolean not null default false,
  fixed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_mistakes_user_id on mistakes (user_id);
create index if not exists idx_mistakes_user_fixed on mistakes (user_id, fixed);
create index if not exists idx_mistakes_created_at on mistakes (created_at desc);

alter table mistakes enable row level security;

drop policy if exists "mistakes own select" on mistakes;
create policy "mistakes own select" on mistakes
  for select using (auth.uid() = user_id);

drop policy if exists "mistakes own insert" on mistakes;
create policy "mistakes own insert" on mistakes
  for insert with check (auth.uid() = user_id);

drop policy if exists "mistakes own update" on mistakes;
create policy "mistakes own update" on mistakes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "mistakes own delete" on mistakes;
create policy "mistakes own delete" on mistakes
  for delete using (auth.uid() = user_id);
