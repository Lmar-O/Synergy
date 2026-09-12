import { ArrowRightIcon } from "@/components/app-icons";
import { AppToolbar } from "@/components/app-toolbar";
import { QueueDataError } from "@/components/queue-data-error";
import { QueueRail } from "@/components/queue-rail";
import { StallCard } from "@/components/stall-card";
import { TicketCard } from "@/components/ticket-card";
import { buildQueueView, unmetDependencies } from "@/lib/queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

/** `acceptance_criteria` is jsonb, so the generated type is `Json`. */
function toCriteria(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function AppPage() {
  const supabase = await createServerSupabaseClient();

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

  if (error) return <QueueDataError message={error.message} />;

  const rows = tickets ?? [];
  const view = buildQueueView(rows);
  const byId = new Map(rows.map((ticket) => [ticket.id, ticket]));
  const current = view.current;

  const upNext = view.upcoming[0] ?? null;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <QueueRail view={view} />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}
      >
        <AppToolbar active="focus" />

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "32px 32px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
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
                // The card only ever shows an eligible ticket, so everything
                // it depends on is done — `unmetDependencies` returning empty
                // is what makes the satisfied-check mark honest.
                dependsOn:
                  unmetDependencies(current, byId).length === 0
                    ? current.depends_on
                        .map((id) => byId.get(id))
                        .filter((dep) => dep !== undefined)
                        .map((dep) => ({ number: dep.number }))
                    : [],
              }}
            />
          ) : (
            view.stall && <StallCard stall={view.stall} />
          )}

          {current && upNext && (
            <div
              style={{
                width: "100%",
                maxWidth: 760,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 4px",
                fontSize: 13,
                color: "var(--text-light)",
              }}
            >
              <ArrowRightIcon />
              <span>Up next</span>
              <span className="mono" style={{ color: "var(--text-light)" }}>
                SYN-{String(upNext.number).padStart(3, "0")}
              </span>
              <span style={{ color: "var(--text-muted)" }}>{upNext.title}</span>
              <span style={{ marginLeft: "auto" }}>
                {upNext.estimate_hours}h
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
