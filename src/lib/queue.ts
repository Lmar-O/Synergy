import type { Tables } from "@/lib/supabase/types";

/**
 * The columns dependency gating actually reads. Structural rather than the
 * full `Tables<"tickets">` row so the ordering rules can be exercised with
 * literals instead of fixtures.
 */
export type SequencedTicket = Pick<
  Tables<"tickets">,
  "id" | "number" | "status" | "priority" | "position" | "depends_on"
>;

/** Why the queue has nothing to surface. Drives the empty state on /app. */
export type QueueStall =
  | "empty" // nothing generated yet
  | "all-done" // every ticket completed
  | "all-blocked" // everything left is blocked
  | "dependency-wait"; // open work exists, but no prerequisite set is satisfied

export type QueueView<T extends SequencedTicket> = {
  current: T | null;
  stall: QueueStall | null;
  counts: { total: number; done: number; blocked: number; remaining: number };
};

/**
 * A ticket is eligible when every id in `depends_on` belongs to a ticket that
 * is `done`.
 *
 * An id with no matching row counts as UNSATISFIED. `depends_on` is a `uuid[]`
 * and Postgres cannot FK into an array, so nothing guarantees the referent
 * still exists. Surfacing work whose prerequisite cannot be verified is the
 * one behaviour this view must never have, so an unresolvable dependency holds
 * a ticket back rather than releasing it.
 */
function dependenciesSatisfied(
  ticket: SequencedTicket,
  byId: Map<string, SequencedTicket>,
): boolean {
  return ticket.depends_on.every((id) => byId.get(id)?.status === "done");
}

/**
 * Lowest `priority` first (1 = highest), then `position`, then `number`. The
 * last two are only tie-breakers — they exist so the surfaced ticket is stable
 * across renders instead of riding on whatever order Postgres returned.
 */
function byPriority(a: SequencedTicket, b: SequencedTicket): number {
  return (
    a.priority - b.priority || a.position - b.position || a.number - b.number
  );
}

/**
 * Picks the one ticket /app should show: the highest-priority open ticket
 * whose dependencies are all `done`.
 *
 * This is derived on every read rather than stored. Nothing is written during
 * render, so the surfaced ticket always reflects the current state of the
 * graph — including a dependency that another action just completed.
 */
export function buildQueueView<T extends SequencedTicket>(
  tickets: T[],
): QueueView<T> {
  const byId = new Map<string, T>(tickets.map((ticket) => [ticket.id, ticket]));

  const blocked = tickets.filter((ticket) => ticket.status === "blocked");
  const done = tickets.filter((ticket) => ticket.status === "done");
  const open = tickets.filter(
    (ticket) => ticket.status === "queued" || ticket.status === "active",
  );

  const counts = {
    total: tickets.length,
    done: done.length,
    blocked: blocked.length,
    remaining: open.length,
  };

  // An `active` ticket is already in progress, so it wins outright — the
  // partial unique index guarantees there is at most one per user.
  const active = open.find((ticket) => ticket.status === "active");
  if (active) return { current: active, stall: null, counts };

  const eligible = open
    .filter((ticket) => dependenciesSatisfied(ticket, byId))
    .sort(byPriority);

  if (eligible.length > 0) {
    return { current: eligible[0], stall: null, counts };
  }

  // Order matters: open-but-gated work is a dependency wait even when other
  // tickets are blocked, because completing a blocker's prerequisite is what
  // releases it.
  const stall: QueueStall =
    tickets.length === 0
      ? "empty"
      : open.length > 0
        ? "dependency-wait"
        : blocked.length > 0
          ? "all-blocked"
          : "all-done";

  return { current: null, stall, counts };
}
