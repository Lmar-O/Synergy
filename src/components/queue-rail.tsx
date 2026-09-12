import type { ReactNode } from "react";

import { StatusGlyph, type GlyphStatus } from "@/components/app-icons";
import { GenerateTicketsButton } from "@/components/generate-tickets-button";
import type { QueueView } from "@/lib/queue";

/**
 * The left rail from design.md §4: 320px, the whole queue in four sections,
 * progress and counts at the top, regeneration at the bottom.
 *
 * Rendered per-page rather than from `app/layout.tsx`, because §4 says views
 * without a queue drop the rail — `/app/north-star` sits under `/app` and must
 * not get one.
 */

export type RailTicket = {
  id: string;
  number: number;
  title: string;
  estimate_hours: number;
  status: "queued" | "active" | "done" | "blocked";
};

const RAIL_WIDTH = 320;

export function RailShell({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Queue"
      style={{
        width: RAIL_WIDTH,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--rail)",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {children}
    </aside>
  );
}

export function RailHeader({
  counts,
  hasCurrent,
}: {
  counts: QueueView<RailTicket>["counts"];
  hasCurrent: boolean;
}) {
  const pct = (n: number) => (counts.total > 0 ? (n / counts.total) * 100 : 0);

  return (
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
          gap: 12,
        }}
      >
        <span className="display" style={{ fontSize: 15 }}>
          Queue
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {counts.total === 0
            ? "No tickets yet"
            : `${counts.done} of ${counts.total} done${
                counts.blocked > 0 ? ` · ${counts.blocked} blocked` : ""
              }`}
        </span>
      </div>
      {/* Segments in rail order: done → active → blocked (design.md §3). */}
      <div className="prog">
        <div style={{ width: `${pct(counts.done)}%`, background: "var(--mint)" }} />
        <div
          style={{
            width: `${hasCurrent ? pct(1) : 0}%`,
            background: "var(--primary)",
          }}
        />
        <div
          style={{ width: `${pct(counts.blocked)}%`, background: "var(--peach)" }}
        />
      </div>
    </div>
  );
}

export function RailFooter({ remaining }: { remaining: number }) {
  return (
    <div
      style={{
        padding: 16,
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <GenerateTicketsButton
        variant="outline"
        full
        label={remaining > 0 ? "Regenerate queue" : "Generate tickets"}
      />
      {remaining > 0 && (
        <span
          style={{
            fontSize: 11,
            color: "var(--text-light)",
            textAlign: "center",
            lineHeight: 1.4,
            textWrap: "pretty",
          }}
        >
          Retires {remaining} unstarted ticket{remaining === 1 ? "" : "s"};
          keeps done and blocked work.
        </span>
      )}
    </div>
  );
}

function RailRow({
  ticket,
  status,
  current,
}: {
  ticket: RailTicket;
  status: GlyphStatus;
  current?: boolean;
}) {
  return (
    <div className={current ? "row on" : "row"}>
      <StatusGlyph status={status} />
      <span className="mono" style={{ color: "var(--text-light)", flexShrink: 0 }}>
        SYN-{String(ticket.number).padStart(3, "0")}
      </span>
      <span className="row-main">
        <span
          className="row-title"
          style={status === "done" ? { color: "var(--text-light)" } : undefined}
        >
          {ticket.title}
        </span>
        <span className="row-est">{ticket.estimate_hours}h</span>
      </span>
    </div>
  );
}

function RailSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div className="caption" style={{ padding: "0 12px 4px" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

/** The scrolling middle of the rail. */
export function RailSections({ view }: { view: QueueView<RailTicket> }) {
  const upNext = [
    ...view.upcoming.map((t) => ({ ticket: t, status: "queued" as const })),
    ...view.waiting.map((t) => ({ ticket: t, status: "waiting" as const })),
  ];

  return (
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
      {view.current && (
        <RailSection label="Now">
          <RailRow ticket={view.current} status="active" current />
        </RailSection>
      )}
      {upNext.length > 0 && (
        <RailSection label="Up next">
          {upNext.map(({ ticket, status }) => (
            <RailRow key={ticket.id} ticket={ticket} status={status} />
          ))}
        </RailSection>
      )}
      {view.blocked.length > 0 && (
        <RailSection label="Blocked">
          {view.blocked.map((ticket) => (
            <RailRow key={ticket.id} ticket={ticket} status="blocked" />
          ))}
        </RailSection>
      )}
      {view.done.length > 0 && (
        <RailSection label="Done">
          {view.done.map((ticket) => (
            <RailRow key={ticket.id} ticket={ticket} status="done" />
          ))}
        </RailSection>
      )}
    </div>
  );
}

export function QueueRail({ view }: { view: QueueView<RailTicket> }) {
  return (
    <RailShell>
      <RailHeader counts={view.counts} hasCurrent={view.current !== null} />
      <RailSections view={view} />
      <RailFooter remaining={view.counts.remaining} />
    </RailShell>
  );
}
