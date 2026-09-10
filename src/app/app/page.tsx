import Link from "next/link";
import { redirect } from "next/navigation";

import { GenerateTicketsButton } from "@/components/generate-tickets-button";
import { TicketCard } from "@/components/ticket-card";
import { buildQueueView, type QueueStall } from "@/lib/queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

/** `acceptance_criteria` is jsonb, so the generated type is `Json`. */
function toCriteria(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const STALL_COPY: Record<QueueStall, { title: string; body: string }> = {
  empty: {
    title: "No tickets yet",
    body: "Generate a queue from your North Star to get started.",
  },
  "all-done": {
    title: "Queue clear",
    body: "Every ticket is done. Generate a fresh queue for the next milestone.",
  },
  "all-blocked": {
    title: "Everything left is blocked",
    body: "Nothing can move until a blocker clears. Update your North Star and generate a new queue.",
  },
  "dependency-wait": {
    title: "Nothing is unblocked",
    body: "Every remaining ticket is waiting on a prerequisite that is not done. Generating a fresh queue will re-sequence the work.",
  },
};

export default async function AppPage() {
  const supabase = await createServerSupabaseClient();

  const { data: northStar } = await supabase
    .from("north_stars")
    .select("product_name, version")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!northStar) redirect("/onboarding");

  // Deliberately every live ticket the caller owns, not just those tied to the
  // newest North Star. `depends_on` never crosses a generation, so several
  // DAGs coexist without corrupting the gating — and editing the brief does
  // not silently strip work out of the queue. Regeneration retires what it
  // replaces by stamping `superseded_at`, so filtering on it here is what
  // keeps a stale plan from competing with a fresh one. RLS scopes the rows to
  // the caller.
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(
      "id, number, title, body, estimate_hours, priority, position, status, depends_on, acceptance_criteria",
    )
    .is("superseded_at", null);

  const { current, stall, counts } = buildQueueView(tickets ?? []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {northStar.product_name}
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/app/queue"
            className="text-sm underline underline-offset-4"
          >
            Queue
          </Link>
          <Link
            href="/app/north-star"
            className="text-sm underline underline-offset-4"
          >
            Edit brief
          </Link>
        </div>
      </header>

      {counts.total > 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          {counts.done} of {counts.total} done
          {counts.blocked > 0 && ` · ${counts.blocked} blocked`}
        </p>
      )}

      {error && (
        <p className="text-sm text-black/70 dark:text-white/70">
          Could not load your tickets: {error.message}
        </p>
      )}

      {current ? (
        <TicketCard
          key={current.id}
          ticket={{
            id: current.id,
            number: current.number,
            title: current.title,
            body: current.body,
            estimateHours: current.estimate_hours,
            priority: current.priority,
            acceptanceCriteria: toCriteria(current.acceptance_criteria),
          }}
        />
      ) : (
        stall && (
          <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-6 dark:border-white/15">
            <h2 className="text-lg font-medium">{STALL_COPY[stall].title}</h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              {STALL_COPY[stall].body}
            </p>
          </div>
        )
      )}

      <div className="flex flex-col gap-3 border-t border-black/10 pt-6 dark:border-white/15">
        <h2 className="text-sm font-medium">
          {counts.total > 0 ? "Regenerate the queue" : "Generate tickets"}
        </h2>
        {counts.remaining > 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Replans from your current North Star. Your {counts.remaining}{" "}
            unstarted ticket{counts.remaining === 1 ? "" : "s"} will be retired;
            finished and blocked work is kept and fed back into the prompt.
          </p>
        )}
        <GenerateTicketsButton />
      </div>
    </main>
  );
}
