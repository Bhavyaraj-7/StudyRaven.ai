-- StudyRaven R0: marking accuracy programme (master prompt §10A.3).
--
-- NOT RUN YET. Founder: paste this whole file into the Supabase SQL editor
-- and click Run. Additive only, safe to run more than once.
--
-- How it works: the team uploads anonymised answers (with written student
-- and parent consent), teachers mark them blind, the AI marks the same
-- answers, and the server compares the two. Only real, measured numbers
-- are ever published. Every table has RLS on with NO policies: all access
-- goes through server code that checks staff_roles first.

-- Who may use the admin and reviewer tools. Never user_metadata (§9.1).
-- Add yourself after running this file:
--   insert into public.staff_roles (user_id, role) values ('<your user id>', 'admin');
create table if not exists public.staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'reviewer')),
  created_at timestamptz not null default now()
);
alter table public.staff_roles enable row level security;

-- A paper in the board's style, written by the team (never past-paper text).
create table if not exists public.accuracy_papers (
  id uuid primary key default gen_random_uuid(),
  subject_key text not null,          -- e.g. 'physics' (matches a student's subject name)
  subject_label text not null,        -- e.g. 'Physics (0625-style)'
  title text not null,
  max_marks integer not null check (max_marks > 0),
  -- StudyRaven's own estimate, e.g. [{"grade":"A*","min":68},{"grade":"A","min":58},…]
  grade_boundaries jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.accuracy_papers enable row level security;

create table if not exists public.accuracy_questions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.accuracy_papers(id) on delete cascade,
  number integer not null,
  question_text text not null,
  max_marks integer not null check (max_marks > 0),
  -- The team's own paraphrased marking points: [{"id":"M1","text":"…","marks":1}]
  mark_points jsonb not null default '[]'::jsonb,
  unique (paper_id, number)
);
alter table public.accuracy_questions enable row level security;

-- One student's sitting, by anonymous code only. No names, ever.
create table if not exists public.accuracy_scripts (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.accuracy_papers(id) on delete cascade,
  label text not null,                               -- e.g. 'S-014'
  consent_confirmed boolean not null default false,  -- written student + parent consent held by the team
  in_sample boolean not null default false,          -- from the monthly live-mock sample (opted in)
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (paper_id, label)
);
alter table public.accuracy_scripts enable row level security;

create table if not exists public.accuracy_answers (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references public.accuracy_scripts(id) on delete cascade,
  question_id uuid not null references public.accuracy_questions(id) on delete cascade,
  answer_text text not null,
  unique (script_id, question_id)
);
alter table public.accuracy_answers enable row level security;

-- Marks from the AI and from each teacher. Teachers never see AI marks
-- before they submit their own (enforced in the review API).
create table if not exists public.accuracy_marks (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.accuracy_answers(id) on delete cascade,
  marker_type text not null check (marker_type in ('ai', 'teacher')),
  marker_id uuid references auth.users(id) on delete set null,  -- the teacher; null for AI
  model text,                                                   -- AI model id
  marks_awarded numeric not null check (marks_awarded >= 0),
  points_awarded jsonb not null default '[]'::jsonb,            -- e.g. ["M1","A1"]
  created_at timestamptz not null default now()
);
create unique index if not exists accuracy_marks_one_per_marker
  on public.accuracy_marks (answer_id, marker_type, coalesce(marker_id, '00000000-0000-0000-0000-000000000000'::uuid));
alter table public.accuracy_marks enable row level security;

-- Each comparison, kept forever. Only published runs appear on /accuracy.
create table if not exists public.accuracy_runs (
  id uuid primary key default gen_random_uuid(),
  subject_key text not null,
  subject_label text not null,
  scripts integer not null,
  answers integer not null,
  question_exact numeric not null,
  question_within_1 numeric not null,
  total_mae numeric not null,
  grade_exact numeric,
  grade_within_1 numeric,
  teacher_agreement_within_1 numeric,  -- teacher vs teacher, when two teachers marked
  bar jsonb not null,
  passed boolean not null,
  method text not null,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists accuracy_runs_subject_idx on public.accuracy_runs (subject_key, created_at desc);
alter table public.accuracy_runs enable row level security;

-- Down-migration (only if you need to remove it):
-- drop table if exists public.accuracy_runs, public.accuracy_marks, public.accuracy_answers,
--   public.accuracy_scripts, public.accuracy_questions, public.accuracy_papers, public.staff_roles;
