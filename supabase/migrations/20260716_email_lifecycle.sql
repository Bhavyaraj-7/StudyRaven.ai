-- StudyRaven: lifecycle email support — unsubscribe flag + welcome-email idempotency.
-- Paste this whole file into the Supabase SQL editor and click Run.
-- Safe to run more than once (everything is IF NOT EXISTS / guarded).

alter table public.profiles
  add column if not exists unsubscribed boolean not null default false;

alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

alter table public.profiles
  add column if not exists limit_email_sent_on date;
