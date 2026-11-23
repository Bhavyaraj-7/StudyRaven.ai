-- StudyRaven: lock down the subscriptions table.
-- Already run in production on 23 Nov 2026. Safe to run again.
--
-- Why: 001 gave users insert/update/delete on their own subscriptions row,
-- and isProUser() trusts plan='pro' AND status='active' — so any logged-in
-- user could grant themselves Pro from the browser. All legitimate writes
-- use the service role (create/verify/cancel-subscription, razorpay-webhook,
-- the handle_new_user trigger), which bypasses RLS, so nothing breaks.
-- Users keep read access (own_select) so the app can show their plan.

drop policy if exists "own_insert" on public.subscriptions;
drop policy if exists "own_update" on public.subscriptions;
drop policy if exists "own_delete" on public.subscriptions;

-- Down-migration (DO NOT run unless you mean to reopen the hole):
-- create policy "own_insert" on public.subscriptions for insert with check (auth.uid() = user_id);
-- create policy "own_update" on public.subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "own_delete" on public.subscriptions for delete using (auth.uid() = user_id);
