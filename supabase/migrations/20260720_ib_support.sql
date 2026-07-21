-- StudyRaven: allow IB alongside IGCSE.
-- Paste this whole file into the Supabase SQL editor and click Run.
-- Safe to run more than once (drop-if-exists then re-add).
--
-- Grades 8/11/12 need NO change here — profiles.grade has no range constraint,
-- it was only the UI that restricted grade choices. This migration only widens
-- the curriculum CHECK, which currently rejects anything other than 'IGCSE'.

alter table public.profiles drop constraint if exists profiles_curriculum_check;

alter table public.profiles
  add constraint profiles_curriculum_check check (curriculum in ('IGCSE', 'IB'));
