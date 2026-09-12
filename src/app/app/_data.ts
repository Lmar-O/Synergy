import { redirect } from "next/navigation";

import { buildQueueView, type QueueView } from "@/lib/queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

/**
 * The one read the three /app views share. Each view loads it for itself: the
 * rail shows the whole queue on all three, so there is nothing to hoist into a
 * layout that would not then need the same query anyway.
 *
 * Colocated under the route rather than in `src/lib` because it is this
 * segment's loader, not queue logic — the sequencing rules stay in
 * `src/lib/queue.ts`.
 */

/** The columns every /app view reads. */
const TICKET_COLUMNS =
  "id, number, title, body, estimate_hours, priority, position, status, depends_on, acceptance_criteria, blocked_reason";

export type AppTicket = {
  id: string;
  number: number;
  title: string;
  body: string;
  estimate_hours: number;
  priority: number;
  position: number;
  status: "queued" | "active" | "done" | "blocked";
  depends_on: string[];
  acceptance_criteria: Json;
  blocked_reason: string | null;
};

export type AppQueue = {
  northStar: { product_name: string; version: number };
  view: QueueView<AppTicket>;
  tickets: AppTicket[];
  /** Set when the ticket read failed; the views render an inline error. */
  error: string | null;
};

/**
 * `acceptance_criteria` is jsonb, so the generated type is `Json` and the
 * strings have to be narrowed on the way out.
 */
export function toCriteria(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function loadAppQueue(): Promise<AppQueue> {
  const supabase = await createServerSupabaseClient();

  const { data: northStar } = await supabase
    .from("north_stars")
    .select("product_name, version")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!northStar) redirect("/onboarding");

  // Every live ticket the caller owns, not just those tied to the newest North
  // Star: `depends_on` never crosses a generation, so several DAGs coexist
  // without corrupting the gating. `superseded_at is null` is what keeps a
  // retired plan from competing with a fresh one. RLS scopes rows to the caller.
  const { data, error } = await supabase
    .from("tickets")
    .select(TICKET_COLUMNS)
    .is("superseded_at", null);

  const tickets = (data ?? []) as AppTicket[];

  return {
    northStar,
    tickets,
    view: buildQueueView(tickets),
    error: error?.message ?? null,
  };
}
