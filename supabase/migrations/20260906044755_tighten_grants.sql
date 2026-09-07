-- Synergy — tighten table grants
--
-- Supabase ships `alter default privileges in schema public grant all on
-- tables to anon, authenticated, service_role`. Every table created in
-- 20260906044553_init_schema.sql therefore handed `authenticated` the full
-- set — DELETE, TRUNCATE, UPDATE, REFERENCES, TRIGGER — before RLS was even
-- switched on.
--
-- The targeted `grant select, insert ...` in 20260906044610_enable_rls.sql
-- ADDS privileges; it does not remove the ones already there. So the
-- append-only tables were append-only only because they have no UPDATE or
-- DELETE policy. That does hold the line — RLS matched zero rows — but it
-- leaves the grant surface much wider than intended, and it means a future
-- permissive policy would silently unlock mutation.
--
-- Revoke first, then grant exactly what each table needs.
--
-- ANY FUTURE MIGRATION THAT CREATES A TABLE IN `public` MUST DO THIS TOO.
-- The default privileges will re-grant ALL every time.

revoke all on public.profiles    from anon, authenticated;
revoke all on public.north_stars from anon, authenticated;
revoke all on public.tickets     from anon, authenticated;
revoke all on public.generations from anon, authenticated;

-- anon is granted nothing at all: there is no unauthenticated surface.

grant select, insert, update         on public.profiles    to authenticated;
grant select, insert                 on public.north_stars to authenticated;  -- append-only
grant select, insert, update, delete on public.tickets     to authenticated;
grant select, insert                 on public.generations to authenticated;  -- append-only
