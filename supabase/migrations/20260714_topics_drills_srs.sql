-- StudyRaven upgrade: topic tracker, daily drills, spaced repetition.
-- Paste this whole file into the Supabase SQL editor and click Run.
-- Safe to run more than once (everything is IF NOT EXISTS / guarded).

-- ------------------------------------------------------------------
-- 1. topics — per-student syllabus topics with red/amber/green rating
-- ------------------------------------------------------------------
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  name text not null,
  rating text not null default 'unrated'
    check (rating in ('unrated', 'red', 'amber', 'green')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, subject_id, name)
);

create index if not exists idx_topics_user_id on topics (user_id);
create index if not exists idx_topics_subject_id on topics (subject_id);

alter table topics enable row level security;

drop policy if exists "topics own select" on topics;
create policy "topics own select" on topics
  for select using (auth.uid() = user_id);

drop policy if exists "topics own insert" on topics;
create policy "topics own insert" on topics
  for insert with check (auth.uid() = user_id);

drop policy if exists "topics own update" on topics;
create policy "topics own update" on topics
  for update using (auth.uid() = user_id);

drop policy if exists "topics own delete" on topics;
create policy "topics own delete" on topics
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------
-- 2. drills — one row per day per student (daily drill + streak)
-- ------------------------------------------------------------------
create table if not exists drills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  drill_date date not null default current_date,
  subject text,
  topic text,
  questions jsonb not null default '[]'::jsonb,
  score integer,
  total integer,
  created_at timestamptz not null default now(),
  unique (user_id, drill_date)
);

create index if not exists idx_drills_user_id on drills (user_id);
create index if not exists idx_drills_user_date on drills (user_id, drill_date);

alter table drills enable row level security;

drop policy if exists "drills own select" on drills;
create policy "drills own select" on drills
  for select using (auth.uid() = user_id);

drop policy if exists "drills own insert" on drills;
create policy "drills own insert" on drills
  for insert with check (auth.uid() = user_id);

drop policy if exists "drills own update" on drills;
create policy "drills own update" on drills
  for update using (auth.uid() = user_id);

drop policy if exists "drills own delete" on drills;
create policy "drills own delete" on drills
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------
-- 3. flashcards — spaced repetition (SM-2) columns
-- ------------------------------------------------------------------
alter table flashcards add column if not exists ease numeric not null default 2.5;
alter table flashcards add column if not exists interval_days integer not null default 0;
alter table flashcards add column if not exists due_date date not null default current_date;
alter table flashcards add column if not exists reps integer not null default 0;
alter table flashcards add column if not exists topic text;

create index if not exists idx_flashcards_user_due on flashcards (user_id, due_date);
