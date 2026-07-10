-- ============================================================================
-- STUDYRAVEN.AI — MIGRATION 002
-- 1. Private Storage bucket for user-uploaded papers (per-user RLS)
-- 2. Google connection columns on profiles (Gmail + Classroom OAuth)
-- Run this in Supabase SQL Editor after 001_initial_schema.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Google connection state on profiles
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists gmail_connected     boolean not null default false,
  add column if not exists classroom_connected boolean not null default false,
  add column if not exists google_refresh_token text;

-- ----------------------------------------------------------------------------
-- Storage bucket: papers (private — signed URLs only)
-- Files live at <user_id>/<filename>, so the first folder segment must match
-- the authenticated user's id.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('papers', 'papers', false)
on conflict (id) do nothing;

drop policy if exists "papers_select_own" on storage.objects;
drop policy if exists "papers_insert_own" on storage.objects;
drop policy if exists "papers_update_own" on storage.objects;
drop policy if exists "papers_delete_own" on storage.objects;

create policy "papers_select_own" on storage.objects
  for select using (
    bucket_id = 'papers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "papers_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'papers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "papers_update_own" on storage.objects
  for update using (
    bucket_id = 'papers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "papers_delete_own" on storage.objects
  for delete using (
    bucket_id = 'papers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
