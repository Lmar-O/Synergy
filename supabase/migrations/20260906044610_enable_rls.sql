-- Synergy — row level security
--
-- Every table is scoped to the Clerk user ID carried in the JWT `sub` claim.
--
-- auth.uid() is USELESS here. It casts the subject to uuid, and Clerk IDs
-- ("user_2abc...") are not uuids — it returns null and every policy that uses
-- it silently denies (or, paired with a permissive default, fails open).
-- Read auth.jwt() ->> 'sub' instead.
--
-- PREREQUISITE: Clerk must be registered as a Third-Party Auth provider in the
-- Supabase dashboard (Authentication -> Sign In / Providers). Until that is
-- done auth.jwt() is null, clerk_user_id() is null, and every policy below
-- denies everything. That is the correct failure direction, but it looks like
-- a broken app rather than a config gap — check this first.

create function public.clerk_user_id()
returns text
language sql
stable
set search_path = ''
as $$ select nullif(auth.jwt() ->> 'sub', '') $$;

comment on function public.clerk_user_id() is
  'Clerk user ID from the request JWT. Null for anonymous requests, which makes every comparison below null and therefore denies.';


-- profiles --------------------------------------------------------------

alter table public.profiles enable row level security;

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

create policy "profiles: select own" on public.profiles
  for select to authenticated
  using (id = (select public.clerk_user_id()));

create policy "profiles: insert own" on public.profiles
  for insert to authenticated
  with check (id = (select public.clerk_user_id()));

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using      (id = (select public.clerk_user_id()))
  with check (id = (select public.clerk_user_id()));

-- No delete policy: account deletion runs server-side with the service role.


-- north_stars -----------------------------------------------------------
-- Append-only by design, so no update or delete policy. Editing the brief
-- inserts a new version; old versions are history the Phase 2 invalidation
-- work will need.

alter table public.north_stars enable row level security;

revoke all on public.north_stars from anon;
grant select, insert on public.north_stars to authenticated;

create policy "north_stars: select own" on public.north_stars
  for select to authenticated
  using (user_id = (select public.clerk_user_id()));

create policy "north_stars: insert own" on public.north_stars
  for insert to authenticated
  with check (user_id = (select public.clerk_user_id()));


-- tickets ---------------------------------------------------------------

alter table public.tickets enable row level security;

revoke all on public.tickets from anon;
grant select, insert, update, delete on public.tickets to authenticated;

create policy "tickets: select own" on public.tickets
  for select to authenticated
  using (user_id = (select public.clerk_user_id()));

create policy "tickets: insert own" on public.tickets
  for insert to authenticated
  with check (user_id = (select public.clerk_user_id()));

-- `with check` repeats the predicate so a row cannot be reassigned to another user.
create policy "tickets: update own" on public.tickets
  for update to authenticated
  using      (user_id = (select public.clerk_user_id()))
  with check (user_id = (select public.clerk_user_id()));

create policy "tickets: delete own" on public.tickets
  for delete to authenticated
  using (user_id = (select public.clerk_user_id()));


-- generations -----------------------------------------------------------
-- Append-only audit log. Select and insert only; the absence of update and
-- delete policies is what makes it append-only.

alter table public.generations enable row level security;

revoke all on public.generations from anon;
grant select, insert on public.generations to authenticated;

create policy "generations: select own" on public.generations
  for select to authenticated
  using (user_id = (select public.clerk_user_id()));

create policy "generations: insert own" on public.generations
  for insert to authenticated
  with check (user_id = (select public.clerk_user_id()));
