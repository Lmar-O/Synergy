-- Regeneration supersedes the outstanding plan instead of deleting it.
--
-- A queued ticket the user never got to is still evidence. Ticket completion
-- rate is the signal the product is judged on (the spec's >65% bar), and that
-- needs abandoned tickets in its denominator — deleting them would leave only
-- tickets that were completed or blocked and read artificially high. Keeping
-- the rows also keeps SYN-nnn references resolvable.
--
-- Only queued work is ever superseded. done and blocked rows are history.

alter table public.tickets
  add column superseded_at timestamptz;

comment on column public.tickets.superseded_at is
  'Set when a later generation replaced this still-queued ticket. Non-null rows are excluded from the queue but retained for completion-rate measurement.';

alter table public.tickets
  add constraint tickets_superseded_only_queued
  check (superseded_at is null or status = 'queued');

-- The queue reads live rows on every render; superseded rows accumulate.
create index tickets_user_live_idx
  on public.tickets (user_id)
  where superseded_at is null;
