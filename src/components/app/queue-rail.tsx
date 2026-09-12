import Link from "next/link";

import { GenerateButton } from "@/components/app/generate-button";
import {
  hours,
  StatusGlyph,
  ticketRef,
  type GlyphStatus,
} from "@/components/app/icons";
import type { AppTicket } from "@/app/app/_data";
import type { QueueView } from "@/lib/queue";

/**
 * The left rail from design.md §4 and §7-E: 320px, the whole queue in four
 * sections (Now / Up next / Blocked / Done), progress and counts at the top,
 * regeneration at the bottom.
 *
 * Rendered per page rather than from the layout, because §4 says views without
 * a queue drop the rail — /app/north-star sits under /app and must not get one.
 */

type Section = {
  label: string;
  tickets: AppTicket[];
  /** Waiting tickets are queued-with-a-dashed-ring, not a fifth status. */
  glyph?: GlyphStatus;
  dim?: boolean;
};

/** design.md §3 — the rail row: glyph · ref · title, estimate on its own line. */
function RailRow({
  ticket,
  glyph,
  current,
  dim,
}: {
  ticket: AppTicket;
  glyph: GlyphStatus;
  current: boolean;
  dim?: boolean;
}) {
  return (
    <Link
      href="/app"
      className={current ? "row on" : "row"}
      aria-current={current ? "true" : undefined}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <StatusGlyph status={glyph} labelled />
      <span
        className="mono"
        style={{ color: "var(--text-light)", flexShrink: 0 }}
      >
        {ticketRef(ticket.number)}
      </span>
      <span className="row-main">
        {/* v1: the title wraps to two lines. It never truncates — design.md
            rule 5: if text cannot wrap, the layout is wrong. */}
        <span
          className="row-title"
          style={dim ? { color: "var(--text-light)" } : undefined}
        >
          {ticket.title}
        </span>
        <span className="row-est">{hours(ticket.estimate_hours)}</span>
      </span>
    </Link>
  );
}

export function QueueRail({
  view,
  version,
}: {
  view: QueueView<AppTicket>;
  version: number;
}) {
  const { current, upcoming, waiting, blocked, done, counts } = view;

  const sections: Section[] = [
    { label: "Now", tickets: current ? [current] : [], glyph: "active" },
    // Eligible work first, then dependency-gated work: the rail's order is the
    // order the queue will actually hand them over in.
    { label: "Up next", tickets: [...upcoming, ...waiting] },
    { label: "Blocked", tickets: blocked, glyph: "blocked" },
    { label: "Done", tickets: done, glyph: "done", dim: true },
  ];

  const waitingIds = new Set(waiting.map((ticket) => ticket.id));
  const total = counts.total || 1;

  return (
    <aside
      aria-label="Queue"
      style={{
        width: 320,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--rail)",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span className="display" style={{ fontSize: 15 }}>
            Queue
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {counts.done} of {counts.total} done
            {counts.blocked > 0 && ` · ${counts.blocked} blocked`}
          </span>
        </div>
        {/* design.md §3: segments in rail order — done, active, blocked. The
            uncoloured remainder of the track is queued work. */}
        <div className="prog">
          <div
            style={{
              width: `${(counts.done / total) * 100}%`,
              background: "var(--mint)",
            }}
          />
          <div
            style={{
              width: `${(current ? 1 / total : 0) * 100}%`,
              background: "var(--primary)",
            }}
          />
          <div
            style={{
              width: `${(counts.blocked / total) * 100}%`,
              background: "var(--peach)",
            }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {sections.map(
          (section) =>
            section.tickets.length > 0 && (
              <div
                key={section.label}
                style={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <div className="caption" style={{ padding: "0 12px 4px" }}>
                  {section.label}
                </div>
                {section.tickets.map((ticket) => (
                  <RailRow
                    key={ticket.id}
                    ticket={ticket}
                    glyph={
                      section.glyph ??
                      (waitingIds.has(ticket.id) ? "waiting" : "queued")
                    }
                    current={ticket.id === current?.id}
                    dim={section.dim}
                  />
                ))}
              </div>
            ),
        )}
      </div>

      <div
        style={{
          padding: 16,
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <GenerateButton
          label="Regenerate queue"
          pendingLabel="Regenerating…"
          variant="outline"
          icon="refresh"
        />
        <span
          style={{
            fontSize: 11,
            color: "var(--text-light)",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {counts.remaining > 0
            ? `Replans from North Star v${version}. Retires ${counts.remaining} unstarted ticket${counts.remaining === 1 ? "" : "s"}; keeps done and blocked work.`
            : `Replans from North Star v${version}. Done and blocked work is kept.`}
        </span>
      </div>
    </aside>
  );
}
