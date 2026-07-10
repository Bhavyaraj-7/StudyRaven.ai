-- ============================================================================
-- RESOLVO.AI — INITIAL SCHEMA
-- Run this in Supabase SQL Editor (Database → SQL Editor → New Query).
-- All tables have Row Level Security. Users can only access their own rows.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- profiles  (linked 1:1 with auth.users via id)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  grade       int,
  curriculum  text default 'IGCSE' check (curriculum = 'IGCSE'),
  country     text,
  created_at  timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- subjects
-- ----------------------------------------------------------------------------
create table if not exists public.subjects (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  code            text,
  exam_date       date,
  predicted_grade text,
  created_at      timestamptz default now()
);
create index if not exists subjects_user_id_idx on public.subjects(user_id);

-- ----------------------------------------------------------------------------
-- tasks
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete set null,
  title       text not null,
  due_date    timestamptz,
  status      text not null default 'pending' check (status in ('pending','in_progress','done')),
  priority    text not null default 'medium' check (priority in ('low','medium','high')),
  created_at  timestamptz default now()
);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- ----------------------------------------------------------------------------
-- mock_tests
-- ----------------------------------------------------------------------------
create table if not exists public.mock_tests (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete set null,
  score       numeric not null,
  max_score   numeric not null,
  feedback    text,
  topic_breakdown jsonb default '[]'::jsonb,
  predicted_grade text,
  taken_at    timestamptz default now()
);
create index if not exists mock_tests_user_id_idx on public.mock_tests(user_id);

-- ----------------------------------------------------------------------------
-- college_profiles
-- ----------------------------------------------------------------------------
create table if not exists public.college_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid unique not null references auth.users(id) on delete cascade,
  readiness_score     int not null default 0,
  strengths           jsonb default '[]'::jsonb,
  gaps                jsonb default '[]'::jsonb,
  action_plan         jsonb default '[]'::jsonb,
  target_country      text,
  target_universities jsonb default '[]'::jsonb,
  interests           jsonb default '[]'::jsonb,
  extracurriculars    jsonb default '[]'::jsonb,
  university_matches  jsonb default '[]'::jsonb,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- competitions  (opportunities surfaced for the user)
-- ----------------------------------------------------------------------------
create table if not exists public.competitions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  deadline    date,
  url         text not null,
  category    text,
  created_at  timestamptz default now()
);
create index if not exists competitions_user_id_idx on public.competitions(user_id);

-- ----------------------------------------------------------------------------
-- subscriptions
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid unique not null references auth.users(id) on delete cascade,
  plan                text not null default 'free' check (plan in ('free','pro')),
  billing_cycle       text check (billing_cycle in ('monthly','yearly')),
  razorpay_id         text,
  status              text not null default 'active' check (status in ('active','cancelled','expired','trial')),
  current_period_end  timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- user_papers  (user-uploaded past papers + mark schemes)
-- ----------------------------------------------------------------------------
create table if not exists public.user_papers (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subject         text not null,
  year            int,
  paper_number    text,
  pdf_url         text not null,
  mark_scheme_url text,
  created_at      timestamptz default now()
);
create index if not exists user_papers_user_id_idx on public.user_papers(user_id);

-- ----------------------------------------------------------------------------
-- ai_papers  (Groq-generated practice papers)
-- ----------------------------------------------------------------------------
create table if not exists public.ai_papers (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject      text not null,
  questions    jsonb not null default '[]'::jsonb,
  mark_scheme  jsonb not null default '[]'::jsonb,
  difficulty   text check (difficulty in ('easy','medium','hard')) default 'medium',
  created_at   timestamptz default now()
);
create index if not exists ai_papers_user_id_idx on public.ai_papers(user_id);

-- ----------------------------------------------------------------------------
-- flashcards
-- ----------------------------------------------------------------------------
create table if not exists public.flashcards (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  subject_id    uuid references public.subjects(id) on delete set null,
  front         text not null,
  back          text not null,
  difficulty    text check (difficulty in ('easy','medium','hard')) default 'medium',
  mastery_level int not null default 0,
  created_at    timestamptz default now()
);
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);

-- ----------------------------------------------------------------------------
-- notes  (Studio outputs saved by the user)
-- ----------------------------------------------------------------------------
create table if not exists public.notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  content    text not null,
  type       text not null check (type in ('summary','study_guide','slide_deck','mind_map','transcript','flashcards')),
  subject_id uuid references public.subjects(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists notes_user_id_idx on public.notes(user_id);

-- ----------------------------------------------------------------------------
-- waitlist  (public — for landing-page email captures)
-- ----------------------------------------------------------------------------
create table if not exists public.waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  created_at timestamptz default now()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

alter table public.profiles         enable row level security;
alter table public.subjects         enable row level security;
alter table public.tasks            enable row level security;
alter table public.mock_tests       enable row level security;
alter table public.college_profiles enable row level security;
alter table public.competitions     enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.user_papers      enable row level security;
alter table public.ai_papers        enable row level security;
alter table public.flashcards       enable row level security;
alter table public.notes            enable row level security;
alter table public.waitlist         enable row level security;

-- helper macro pattern: select/insert/update/delete by user_id = auth.uid()
-- Drop if exist + recreate so this migration is re-runnable.

do $$
declare
  t text;
  tables text[] := array[
    'subjects','tasks','mock_tests','college_profiles','competitions',
    'subscriptions','user_papers','ai_papers','flashcards','notes'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "own_select"  on public.%I', t);
    execute format('drop policy if exists "own_insert"  on public.%I', t);
    execute format('drop policy if exists "own_update"  on public.%I', t);
    execute format('drop policy if exists "own_delete"  on public.%I', t);
    execute format('create policy "own_select" on public.%I for select using  (auth.uid() = user_id)', t);
    execute format('create policy "own_insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "own_update" on public.%I for update using  (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "own_delete" on public.%I for delete using  (auth.uid() = user_id)', t);
  end loop;
end $$;

-- profiles uses `id` instead of `user_id`
drop policy if exists "own_select_profile" on public.profiles;
drop policy if exists "own_insert_profile" on public.profiles;
drop policy if exists "own_update_profile" on public.profiles;
create policy "own_select_profile" on public.profiles for select using  (auth.uid() = id);
create policy "own_insert_profile" on public.profiles for insert with check (auth.uid() = id);
create policy "own_update_profile" on public.profiles for update using  (auth.uid() = id) with check (auth.uid() = id);

-- waitlist: anyone can insert, nobody can read (service role only)
drop policy if exists "waitlist_insert" on public.waitlist;
create policy "waitlist_insert" on public.waitlist for insert with check (true);

-- ============================================================================
-- TRIGGERS
-- Auto-create profile + free subscription on signup.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
