import Link from "next/link";

import { AppShell, InlineError, PaneBody } from "@/components/app/app-shell";
import {
  AlertIcon,
  ClockIcon,
  LinkIcon,
  PriorityBars,
  StatusGlyph,
  hours,
  ticketRef,
  type GlyphStatus,
} from "@/components/app/icons";
import { loadAppQueue, type AppTicket } from "@/app/app/_data";

/**
 * Board — the queue as a kanban.
 *
 * Each group carries its own tint (`.bcol-{status}`): queued yellow, active
 * primary, blocked peach, done mint. That is the same fixed mapping the chips
 * and glyphs use, so the board introduces no new hues — it just states the
 * group's colour at column scale instead of in a 16px glyph. Cards stay on
 * `--card` so they lift off the tint rather than absorbing it.
 */

type Column = {
  key: "queued" | "active" | "blocked" | "done";
  label: string;
  glyph: GlyphStatus;
  tickets: AppTicket[];
};

function BoardCard({
  ticket,
  current,
  byId,
}: {
  ticket: AppTicket;
  current: boolean;
  byId: Map<string, AppTicket>;
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
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
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

        {/* Dependencies as outline chips. No status chip here — the column's
            tint and glyph already say which group this is; a chip repeating it
            is the duplicate the v1 critique removed. */}
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
  const { view, tickets, northStar, error } = await loadAppQueue();
  const { current, upcoming, waiting, blocked, done } = view;

  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  const columns: Column[] = [
    {
      key: "queued",
      label: "Queued",
      glyph: "queued",
      tickets: [...upcoming, ...waiting],
    },
    {
      key: "active",
      label: "Active",
      glyph: "active",
      tickets: current ? [current] : [],
    },
    { key: "blocked", label: "Blocked", glyph: "blocked", tickets: blocked },
    { key: "done", label: "Done", glyph: "done", tickets: done },
  ];

  return (
    <AppShell view={view} version={northStar.version}>
      <PaneBody>
        {error && (
          <div style={{ marginBottom: 24 }}>
            <InlineError>
              <AlertIcon />
              <span>
                Couldn’t load your tickets — {error}. Nothing is lost; reload to
                try again.
              </span>
            </InlineError>
          </div>
        )}

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
                <span style={{ color: `var(--${TINT[column.key]}-text)` }}>
                  {column.label}
                </span>
                <span className="sect-count">{column.tickets.length}</span>
              </div>

              <div className={`bcol bcol-${column.key}`}>
                {column.tickets.map((ticket) => (
                  <BoardCard
                    key={ticket.id}
                    ticket={ticket}
                    current={ticket.id === current?.id}
                    byId={byId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PaneBody>
    </AppShell>
  );
}

/** The group's ink. Mirrors `.bcol-{status}` in app.css — same fixed mapping. */
const TINT = {
  queued: "yellow",
  active: "primary",
  blocked: "peach",
  done: "mint",
} as const;
