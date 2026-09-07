-- Synergy — core schema
--
-- Identity comes from Clerk, not Supabase Auth. Clerk user IDs are TEXT
-- ("user_2abc..."), not uuid, and there is no auth.users table to reference.
-- So profiles.id is `text primary key` and every user_id column is `text`.
--
-- RLS is enabled in the next migration (20260906044610_enable_rls.sql).
-- These two migrations must always be applied together.

create type public.ticket_status as enum ('queued', 'active', 'done', 'blocked');


-- profiles --------------------------------------------------------------

create table public.profiles (
  id         text        primary key,   -- Clerk user ID, from the JWT `sub` claim
  email      text        not null,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per Clerk user. id is the Clerk user ID (text), not a uuid.';


-- north_stars -----------------------------------------------------------
-- Append-only: every edit writes a NEW row with an incremented version.
-- The current North Star for a user is the highest version for that user_id.

create table public.north_stars (
  id                uuid        primary key default gen_random_uuid(),
  user_id           text        not null references public.profiles (id) on delete cascade,
  version           int         not null,
  product_name      text        not null,
  core_problem      text        not null,
  tech_stack        text        not null,
  current_milestone text        not null,
  constraints       text        not null default '',
  out_of_scope      text        not null default '',
  success_criteria  text        not null,
  created_at        timestamptz not null default now(),

  constraint north_stars_version_positive check (version > 0),
  constraint north_stars_user_version_unique unique (user_id, version)
);

comment on table public.north_stars is
  'Append-only brief. Never UPDATE — insert a new row; current = max(version) per user.';

-- version is assigned per user when the caller leaves it null.
create function public.north_stars_assign_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.version is null then
    -- Serialize concurrent inserts for this user so two rows cannot claim
    -- the same version. Released at end of transaction.
    perform pg_advisory_xact_lock(hashtext('north_stars:' || new.user_id));

    select coalesce(max(ns.version), 0) + 1
      into new.version
      from public.north_stars ns
     where ns.user_id = new.user_id;
  end if;

  return new;
end;
$$;

create trigger north_stars_assign_version
  before insert on public.north_stars
  for each row execute function public.north_stars_assign_version();


-- tickets ---------------------------------------------------------------

create table public.tickets (
  id                  uuid                 primary key default gen_random_uuid(),
  user_id             text                 not null references public.profiles (id) on delete cascade,
  north_star_id       uuid                 not null references public.north_stars (id) on delete cascade,
  number              int                  not null,  -- per-user sequence, displayed as SYN-014
  title               text                 not null,
  body                text                 not null default '',
  estimate_hours      numeric(4,1)         not null,
  priority            int                  not null default 3,  -- 1 = highest
  tags                text[]               not null default '{}',
  status              public.ticket_status not null default 'queued',
  blocked_reason      text,
  position            int                  not null default 0,
  acceptance_criteria jsonb                not null default '[]'::jsonb,
  depends_on          uuid[]               not null default '{}',  -- ticket ids; arrays cannot carry an FK
  created_at          timestamptz          not null default now(),
  completed_at        timestamptz,

  constraint tickets_user_number_unique unique (user_id, number),
  constraint tickets_number_positive    check (number > 0),
  constraint tickets_estimate_positive  check (estimate_hours > 0),
  constraint tickets_priority_range     check (priority between 1 and 5),
  constraint tickets_blocked_has_reason check (status <> 'blocked' or blocked_reason is not null),
  constraint tickets_done_has_completed check (status <> 'done'    or completed_at is not null),
  constraint tickets_criteria_is_array  check (jsonb_typeof(acceptance_criteria) = 'array'),
  constraint tickets_no_self_dependency check (not (id = any (depends_on)))
);

comment on column public.tickets.depends_on is
  'Ticket ids that must be status=done before this one is surfaced. Referential integrity is the generator''s job — Postgres cannot FK into an array.';

-- "One active ticket at a time" is the product's core idea. Enforce it here
-- so no code path can violate it.
create unique index tickets_one_active_per_user
  on public.tickets (user_id)
  where status = 'active';

-- number is assigned per user when the caller leaves it null.
create function public.tickets_assign_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.number is null then
    perform pg_advisory_xact_lock(hashtext('tickets:' || new.user_id));

    select coalesce(max(t.number), 0) + 1
      into new.number
      from public.tickets t
     where t.user_id = new.user_id;
  end if;

  return new;
end;
$$;

create trigger tickets_assign_number
  before insert on public.tickets
  for each row execute function public.tickets_assign_number();


-- generations -----------------------------------------------------------
-- Append-only log of every model call. This is what makes ticket quality
-- measurable — without the raw responses the prompt is tuned blind.

create table public.generations (
  id                uuid        primary key default gen_random_uuid(),
  user_id           text        not null references public.profiles (id) on delete cascade,
  north_star_id     uuid        not null references public.north_stars (id) on delete cascade,
  model             text        not null,
  prompt_tokens     int,
  completion_tokens int,
  raw_response      jsonb       not null,
  created_at        timestamptz not null default now()
);

comment on table public.generations is
  'Append-only. Logged before Zod validation so failed generations are captured too.';


-- indexes ---------------------------------------------------------------

create index north_stars_user_version_idx on public.north_stars (user_id, version desc);
create index tickets_user_status_idx      on public.tickets (user_id, status);
create index tickets_user_position_idx    on public.tickets (user_id, position);
create index tickets_north_star_id_idx    on public.tickets (north_star_id);
create index generations_user_created_idx on public.generations (user_id, created_at desc);
create index generations_north_star_idx   on public.generations (north_star_id);
