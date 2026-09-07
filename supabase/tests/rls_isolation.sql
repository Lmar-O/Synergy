-- RLS isolation check — paste into the Supabase SQL editor and run.
--
-- Wrapped in a transaction that ROLLS BACK. It writes nothing permanent.
--
-- PASS CONDITION: the run completes and the final row reads
-- "ALL RLS CHECKS PASSED". Every check raises an exception on failure, which
-- aborts the transaction, so there is no way to get that row with a hole in
-- the policies.
--
-- Scope: this proves the POLICIES are correct by impersonating two users at
-- the Postgres level. It does NOT prove the Clerk -> Supabase wiring works.
-- For that, sign in as two real Clerk users in the browser and confirm each
-- sees only their own rows. Run this first — if it fails, the browser test
-- cannot pass either.
--
-- Checks are written as DO blocks rather than a helper function on purpose:
-- the script switches roles with SET LOCAL ROLE, and a helper living in
-- pg_temp would not be callable once current_user is no longer the owner.

begin;

-- Seed as the table owner, which bypasses RLS. Ticket numbers are set
-- explicitly and far apart so that a cross-user write, if one ever succeeded,
-- fails the RLS check rather than tripping the (user_id, number) unique index
-- first and masking the real result.
insert into public.profiles (id, email) values
  ('user_rlstest_alpha', 'alpha@rls.test'),
  ('user_rlstest_beta',  'beta@rls.test');

insert into public.north_stars
  (user_id, product_name, core_problem, tech_stack, current_milestone, success_criteria)
values
  ('user_rlstest_alpha', 'Alpha', 'problem', 'stack', 'milestone', 'criteria'),
  ('user_rlstest_beta',  'Beta',  'problem', 'stack', 'milestone', 'criteria');

insert into public.tickets (user_id, north_star_id, number, title, estimate_hours)
select ns.user_id,
       ns.id,
       case ns.user_id when 'user_rlstest_alpha' then 1 else 101 end,
       ns.product_name || ' ticket',
       3
  from public.north_stars ns
 where ns.user_id in ('user_rlstest_alpha', 'user_rlstest_beta');

insert into public.generations (user_id, north_star_id, model, raw_response)
select ns.user_id, ns.id, 'gpt-4o', '{}'::jsonb
  from public.north_stars ns
 where ns.user_id in ('user_rlstest_alpha', 'user_rlstest_beta');


-- === anonymous ==========================================================

select set_config('request.jwt.claims', '', true);
set local role anon;

do $$
begin
  begin
    perform 1 from public.tickets;
    raise exception 'FAILED: anon could query tickets';
  exception when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.north_stars;
    raise exception 'FAILED: anon could query north_stars';
  exception when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.profiles;
    raise exception 'FAILED: anon could query profiles';
  exception when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.generations;
    raise exception 'FAILED: anon could query generations';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;


-- === alpha ==============================================================

select set_config('request.jwt.claims',
  '{"sub":"user_rlstest_alpha","role":"authenticated"}', true);
set local role authenticated;

do $$
declare n int; affected int;
begin
  if public.clerk_user_id() is distinct from 'user_rlstest_alpha' then
    raise exception 'FAILED: clerk_user_id() returned %, expected user_rlstest_alpha',
      coalesce(public.clerk_user_id(), '<null>');
  end if;

  -- Sees own rows.
  select count(*) into n from public.north_stars;
  if n <> 1 then raise exception 'FAILED: alpha sees % north_stars, expected 1', n; end if;

  select count(*) into n from public.tickets;
  if n <> 1 then raise exception 'FAILED: alpha sees % tickets, expected 1', n; end if;

  select count(*) into n from public.generations;
  if n <> 1 then raise exception 'FAILED: alpha sees % generations, expected 1', n; end if;

  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'FAILED: alpha sees % profiles, expected 1', n; end if;

  -- Sees none of beta's.
  select count(*) into n from public.north_stars where user_id = 'user_rlstest_beta';
  if n <> 0 then raise exception 'FAILED: alpha read % of beta north_stars', n; end if;

  select count(*) into n from public.tickets where user_id = 'user_rlstest_beta';
  if n <> 0 then raise exception 'FAILED: alpha read % of beta tickets', n; end if;

  select count(*) into n from public.generations where user_id = 'user_rlstest_beta';
  if n <> 0 then raise exception 'FAILED: alpha read % of beta generations', n; end if;

  select count(*) into n from public.profiles where id = 'user_rlstest_beta';
  if n <> 0 then raise exception 'FAILED: alpha read beta profile'; end if;

  -- Cannot write a row owned by beta.
  begin
    insert into public.tickets (user_id, north_star_id, title, estimate_hours)
    values ('user_rlstest_beta',
            (select id from public.north_stars where user_id = 'user_rlstest_alpha'),
            'hijack', 1);
    raise exception 'FAILED: alpha inserted a ticket owned by beta';
  exception when insufficient_privilege then null;
  end;

  -- Cannot reassign one of its own rows to beta (this is what `with check` buys).
  begin
    update public.tickets set user_id = 'user_rlstest_beta'
     where user_id = 'user_rlstest_alpha';
    raise exception 'FAILED: alpha reassigned a ticket to beta';
  exception when insufficient_privilege then null;
  end;

  -- Beta's rows are invisible to UPDATE and DELETE — no error, no effect.
  update public.tickets set title = 'hijacked' where user_id = 'user_rlstest_beta';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'FAILED: alpha updated % of beta tickets', affected;
  end if;

  delete from public.tickets where user_id = 'user_rlstest_beta';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'FAILED: alpha deleted % of beta tickets', affected;
  end if;

  -- Append-only tables reject mutation outright, for everyone.
  begin
    update public.generations set model = 'tampered';
    raise exception 'FAILED: generations accepted an update';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.generations;
    raise exception 'FAILED: generations accepted a delete';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.north_stars set product_name = 'tampered';
    raise exception 'FAILED: north_stars accepted an update';
  exception when insufficient_privilege then null;
  end;

  -- Can write its own rows.
  insert into public.tickets (user_id, north_star_id, title, estimate_hours)
  values ('user_rlstest_alpha',
          (select id from public.north_stars where user_id = 'user_rlstest_alpha'),
          'legitimate', 2);
end;
$$;

reset role;


-- === beta ===============================================================
-- The mirror image, so a policy that accidentally pins one user still fails.

select set_config('request.jwt.claims',
  '{"sub":"user_rlstest_beta","role":"authenticated"}', true);
set local role authenticated;

do $$
declare n int;
begin
  select count(*) into n from public.tickets;
  if n <> 1 then raise exception 'FAILED: beta sees % tickets, expected 1', n; end if;

  select count(*) into n from public.tickets where user_id = 'user_rlstest_alpha';
  if n <> 0 then raise exception 'FAILED: beta read % of alpha tickets', n; end if;

  -- Alpha's extra ticket above must not be visible here.
  select count(*) into n from public.tickets where title = 'legitimate';
  if n <> 0 then raise exception 'FAILED: beta saw a ticket alpha just created'; end if;
end;
$$;

reset role;


-- === degenerate JWTs ====================================================
-- A missing claim, or a sub that is not a uuid, must deny rather than expose.
-- The non-uuid sub is the exact shape that breaks anything reaching for
-- auth.uid() instead of auth.jwt() ->> 'sub'.

select set_config('request.jwt.claims', '', true);
set local role authenticated;

do $$
declare n int;
begin
  if public.clerk_user_id() is not null then
    raise exception 'FAILED: clerk_user_id() returned % with no JWT', public.clerk_user_id();
  end if;

  select count(*) into n from public.tickets;
  if n <> 0 then raise exception 'FAILED: a missing JWT saw % tickets', n; end if;

  select count(*) into n from public.north_stars;
  if n <> 0 then raise exception 'FAILED: a missing JWT saw % north_stars', n; end if;

  select count(*) into n from public.profiles;
  if n <> 0 then raise exception 'FAILED: a missing JWT saw % profiles', n; end if;
end;
$$;

reset role;

select set_config('request.jwt.claims',
  '{"sub":"not-a-uuid-at-all","role":"authenticated"}', true);
set local role authenticated;

do $$
declare n int;
begin
  select count(*) into n from public.tickets;
  if n <> 0 then raise exception 'FAILED: an unknown sub saw % tickets', n; end if;
end;
$$;

reset role;

select 'ALL RLS CHECKS PASSED' as result;

rollback;
