-- StudyRaven: per-student daily AI limits + token usage (master prompt §10.7.6).
--
-- NOT RUN YET. Founder: paste this whole file into the Supabase SQL editor
-- and click Run. Additive only, safe to run more than once. Until it runs,
-- the app keeps working without limits and logs a warning.

create table if not exists public.api_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  bucket text not null,
  count integer not null default 0,
  prompt_tokens bigint not null default 0,
  completion_tokens bigint not null default 0,
  primary key (user_id, day, bucket)
);

-- RLS on with NO policies: only server code (service role) can read or
-- write, so students can't reset their own counters.
alter table public.api_usage enable row level security;

-- Counts one request if the student is under the limit, atomically (two
-- requests at once can't both slip past the last slot). Days are IST, so
-- limits reset at midnight in India.
create or replace function public.consume_api_quota(p_user uuid, p_bucket text, p_limit integer)
returns table (allowed boolean, used integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Asia/Kolkata')::date;
  v_count integer;
begin
  if p_limit <= 0 then
    return query select false, 0;
    return;
  end if;

  insert into public.api_usage as u (user_id, day, bucket, count)
  values (p_user, v_day, p_bucket, 1)
  on conflict (user_id, day, bucket)
    do update set count = u.count + 1
    where u.count < p_limit
  returning u.count into v_count;

  if v_count is null then
    -- At the limit: report the count without adding to it.
    select u.count into v_count
      from public.api_usage u
     where u.user_id = p_user and u.day = v_day and u.bucket = p_bucket;
    return query select false, coalesce(v_count, 0);
    return;
  end if;

  return query select true, v_count;
end;
$$;

-- Adds the tokens an AI call used to today's row (for cost tracking).
create or replace function public.record_api_tokens(
  p_user uuid, p_bucket text, p_prompt integer, p_completion integer
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.api_usage
     set prompt_tokens = prompt_tokens + greatest(p_prompt, 0),
         completion_tokens = completion_tokens + greatest(p_completion, 0)
   where user_id = p_user
     and bucket = p_bucket
     and day = (now() at time zone 'Asia/Kolkata')::date;
$$;

-- Supabase lets anon/authenticated call public functions by default.
-- These are security definer and take a user id, so lock them to the
-- server: otherwise anyone could use up another student's quota.
revoke all on function public.consume_api_quota(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.record_api_tokens(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_quota(uuid, text, integer) to service_role;
grant execute on function public.record_api_tokens(uuid, text, integer, integer) to service_role;

-- Down-migration (only if you need to remove it):
-- drop function if exists public.record_api_tokens(uuid, text, integer, integer);
-- drop function if exists public.consume_api_quota(uuid, text, integer);
-- drop table if exists public.api_usage;
