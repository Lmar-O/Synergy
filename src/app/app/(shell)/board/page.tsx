import Link from "next/link";

import {
  ClockIcon,
  LinkIcon,
  PriorityBars,
  StatusGlyph,
  hours,
  ticketRef,
  type GlyphStatus,
} from "@/components/app-icons";
import { AppToolbar } from "@/components/app-toolbar";
import { QueueDataError } from "@/components/queue-data-error";
import { QueueRail, type RailTicket } from "@/components/queue-rail";
import { buildQueueView } from "@/lib/queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Board — the queue as a kanban (design.md §7-A).
 *
 * Each column carries its own tint via `.bcol-{status}`, reusing the fixed
 * status mapping the chips and glyphs already use, so the board introduces no
 * new hues: it states the group's colour at column scale instead of in a 16px
 * glyph. Cards stay on `--card` so they lift off the tint rather than
 * absorbing it.
 *
 * Board is a second reading of the same `buildQueueView` output that /app and
 * /app/queue render — the sequencing is not re-derived here. `waiting` folds
 * into Queued rather than earning a column: a ticket held by a dependency is
 * still queued, and the rail is where the reason for the wait is spelled out.
 */

type BoardTicket = RailTicket;

type Column = {
  key: "queued" | "active" | "blocked" | "done";
  label: string;
  glyph: GlyphStatus;
  /** The group's ink, mirroring `.bcol-{key}` in globals.css. */
  tint: string;
  tickets: BoardTicket[];
};

function BoardCard({
  ticket,
  current,
  byId,
}: {
  ticket: BoardTicket;
  current: boolean;
  byId: Map<string, BoardTicket>;
}) {
  const deps = ticket.depends_on
    .map((id) => byId.get(id))
    .filter((dep) => dep !== undefined);
  const dim = ticket.status === "done";

  return (
    <Link
      href="/app"
      className={current ? "bcard on" : "bcard"}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="mono" style={{ color: "var(--text-light)" }}>
          {ticketRef(ticket.number)}
        </span>
        {!dim && (
          <span style={{ marginLeft: "auto" }}>
            <PriorityBars priority={ticket.priority} />
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1.35,
          textWrap: "pretty",
          ...(dim ? { color: "var(--text-muted)" } : {}),
        }}
      >
        {ticket.title}
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "var(--text-light)",
          }}
        >
          <ClockIcon />
          {hours(ticket.estimate_hours)}
        </span>

        {/* Dependencies as outline chips. No status chip: the column's tint and
            glyph already say which group this is. */}
        {deps.length > 0 && (
          <span className="chip chip-outline">
            <LinkIcon />
            {deps.map((dep) => ticketRef(dep.number)).join(", ")}
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function BoardPage() {
  const supabase = await createServerSupabaseClient();

  // Same read as /app — every live ticket the caller owns. See the note in
  // `(shell)/page.tsx` for why `superseded_at` is the only filter.
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(
      "id, number, title, estimate_hours, priority, position, status, depends_on",
    )
    .is("superseded_at", null);

  if (error) return <QueueDataError message={error.message} active="board" />;

  const rows: BoardTicket[] = tickets ?? [];
  const view = buildQueueView(rows);
  const byId = new Map(rows.map((ticket) => [ticket.id, ticket]));

  const columns: Column[] = [
    {
      key: "queued",
      label: "Queued",
      glyph: "queued",
      tint: "yellow",
      tickets: [...view.upcoming, ...view.waiting],
    },
    {
      key: "active",
      label: "Active",
      glyph: "active",
      tint: "primary",
      tickets: view.current ? [view.current] : [],
    },
    {
      key: "blocked",
      label: "Blocked",
      glyph: "blocked",
      tint: "peach",
      tickets: view.blocked,
    },
    {
      key: "done",
      label: "Done",
      glyph: "done",
      tint: "mint",
      tickets: view.done,
    },
  ];

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
        <AppToolbar active="board" />

        <div style={{ flex: 1, overflow: "auto", padding: "8px 32px 40px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div className="bcol-head">
                  <StatusGlyph status={column.glyph} />
                  <span style={{ color: `var(--${column.tint}-text)` }}>
                    {column.label}
                  </span>
                  <span className="sect-count">{column.tickets.length}</span>
                </div>

                <div className={`bcol bcol-${column.key}`}>
                  {column.tickets.map((ticket) => (
                    <BoardCard
                      key={ticket.id}
                      ticket={ticket}
                      current={ticket.id === view.current?.id}
                      byId={byId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
