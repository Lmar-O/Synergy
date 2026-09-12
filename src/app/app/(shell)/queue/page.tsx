import Link from "next/link";

import {
  AlertIcon,
  ChevronIcon,
  ClockIcon,
  PriorityBars,
  StatusGlyph,
  hours,
  priorityLabel,
  ticketRef,
  type GlyphStatus,
} from "@/components/app-icons";
import { AppToolbar } from "@/components/app-toolbar";
import { QueueDataError } from "@/components/queue-data-error";
import { QueueRail, type RailTicket } from "@/components/queue-rail";
import { buildQueueView, dependents } from "@/lib/queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Queue — design.md §7-C: this view must show what the rail cannot, not a
 * second copy of the row list.
 *
 * What the rail has no room for, and this does: each ticket's dependency chain
 * in both directions (what it waits on, what waits on it), the full blocked
 * reason, priority and estimate per ticket, and hours remaining per section.
 *
 * The chain refs are tinted by the referenced ticket's own status, so
 * reachability reads at a glance — a prerequisite that is already active means
 * this ticket is imminent; two still-queued ones mean it is far off. No new
 * hues: it is the same fixed status mapping the chips and glyphs use.
 */

type QueueTicket = RailTicket & { blocked_reason: string | null };

const CHIP_FOR: Record<QueueTicket["status"], string> = {
  done: "chip-done",
  active: "chip-active",
  queued: "chip-queued",
  blocked: "chip-blocked",
};

function ChainRefs({ tickets }: { tickets: QueueTicket[] }) {
  if (tickets.length === 0) {
    return (
      <span className="light" style={{ fontSize: 12 }}>
        Nothing
      </span>
    );
  }
  return (
    <span
      style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}
    >
      {tickets.map((ticket) => (
        <span
          key={ticket.id}
          className={`chip ${CHIP_FOR[ticket.status]} chain-ref`}
          title={ticket.title}
        >
          {ticketRef(ticket.number)}
        </span>
      ))}
    </span>
  );
}

function Chain({
  waitsOn,
  unblocks,
}: {
  waitsOn: QueueTicket[];
  unblocks: QueueTicket[];
}) {
  // Both sides empty says something worth saying — this ticket is a leaf — but
  // it says it once, not as two separate "Nothing"s.
  if (waitsOn.length === 0 && unblocks.length === 0) {
    return (
      <div className="qrow-chain">
        <div className="chain-line">
          <span className="caption chain-lbl">Chain</span>
          <span className="light" style={{ fontSize: 12 }}>
            No dependencies
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="qrow-chain">
      <div className="chain-line">
        <span className="caption chain-lbl">Waits on</span>
        <ChainRefs tickets={waitsOn} />
      </div>
      <div className="chain-line">
        <span className="caption chain-lbl">Unblocks</span>
        <ChainRefs tickets={unblocks} />
      </div>
    </div>
  );
}

function QueueRow({
  ticket,
  glyph,
  current,
  tickets,
  byId,
}: {
  ticket: QueueTicket;
  glyph: GlyphStatus;
  current: boolean;
  tickets: QueueTicket[];
  byId: Map<string, QueueTicket>;
}) {
  const waitsOn = ticket.depends_on
    .map((id) => byId.get(id))
    .filter((dep) => dep !== undefined);
  const unblocks = dependents(ticket, tickets);
  const showPriority = ticket.status !== "done";

  return (
    <>
      <Link
        href="/app"
        className={current ? "qrow on" : "qrow"}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <StatusGlyph status={glyph} />
        <span
          className="mono"
          style={{ color: "var(--text-light)", width: 60, flexShrink: 0 }}
        >
          {ticketRef(ticket.number)}
        </span>

        <span className="qrow-main">
          <span
            className="qrow-title"
            style={
              ticket.status === "done"
                ? { color: "var(--text-muted)" }
                : undefined
            }
          >
            {ticket.title}
          </span>
          <span className="qrow-meta">
            {showPriority && (
              <>
                <span
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <PriorityBars priority={ticket.priority} />
                  {priorityLabel(ticket.priority)}
                </span>
                <span className="light">·</span>
              </>
            )}
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <ClockIcon />
              {hours(ticket.estimate_hours)}
            </span>
          </span>
        </span>

        <Chain waitsOn={waitsOn} unblocks={unblocks} />
        <ChevronIcon style={{ color: "var(--text-light)" }} />
      </Link>

      {/* The blocked reason in full — the rail can only ever hint at it. */}
      {ticket.status === "blocked" && ticket.blocked_reason && (
        <div className="qblock">
          <AlertIcon />
          <span>{ticket.blocked_reason}</span>
        </div>
      )}
    </>
  );
}

function Section({
  label,
  tickets,
  glyph,
  total,
  currentId,
  all,
  byId,
}: {
  label: string;
  tickets: QueueTicket[];
  glyph: GlyphStatus;
  /** Blocked work is "set aside", finished work is "done"; only open work remains. */
  total: string;
  currentId: string | undefined;
  all: QueueTicket[];
  byId: Map<string, QueueTicket>;
}) {
  if (tickets.length === 0) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="sect">
        <span className="caption" style={{ fontSize: 11 }}>
          {label}
        </span>
        <span className="sect-count">{tickets.length}</span>
        <span className="sect-tot">{total}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--card)",
          overflow: "hidden",
        }}
      >
        {tickets.map((ticket) => (
          <QueueRow
            key={ticket.id}
            ticket={ticket}
            glyph={glyph}
            current={ticket.id === currentId}
            tickets={all}
            byId={byId}
          />
        ))}
      </div>
    </section>
  );
}

const sum = (tickets: QueueTicket[]) =>
  tickets.reduce((total, ticket) => total + ticket.estimate_hours, 0);

export default async function QueuePage() {
  const supabase = await createServerSupabaseClient();

  // Same read as /app — every live ticket the caller owns. See the note in
  // `(shell)/page.tsx` for why `superseded_at` is the only filter.
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(
      "id, number, title, estimate_hours, priority, position, status, depends_on, blocked_reason",
    )
    .is("superseded_at", null);

  if (error) return <QueueDataError message={error.message} active="queue" />;

  const rows: QueueTicket[] = tickets ?? [];
  const view = buildQueueView(rows);
  const byId = new Map(rows.map((ticket) => [ticket.id, ticket]));

  const { current, upcoming, waiting, blocked, done } = view;
  const now = current ? [current] : [];
  const remaining = sum(now) + sum(upcoming) + sum(waiting);

  const sections = [
    { label: "Now", tickets: now, glyph: "active" as const, total: `${hours(sum(now))} remaining` },
    {
      label: "Ready to start",
      tickets: upcoming,
      glyph: "queued" as const,
      total: `${hours(sum(upcoming))} remaining`,
    },
    {
      label: "Waiting on dependencies",
      tickets: waiting,
      glyph: "waiting" as const,
      total: `${hours(sum(waiting))} remaining`,
    },
    {
      label: "Blocked",
      tickets: blocked,
      glyph: "blocked" as const,
      total: `${hours(sum(blocked))} set aside`,
    },
    {
      label: "Done",
      tickets: done,
      glyph: "done" as const,
      total: `${hours(sum(done))} done`,
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
        <AppToolbar active="queue" />

        <div style={{ flex: 1, overflow: "auto", padding: "8px 32px 40px" }}>
          <div
            style={{
              maxWidth: 880,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {rows.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  padding: "0 16px",
                }}
              >
                <span className="display" style={{ fontSize: 16 }}>
                  {hours(remaining)} remaining
                </span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {hours(sum(blocked))} blocked · {hours(sum(done))} done
                </span>
              </div>
            )}

            {sections.map((section) => (
              <Section
                key={section.label}
                label={section.label}
                tickets={section.tickets}
                glyph={section.glyph}
                total={section.total}
                currentId={current?.id}
                all={rows}
                byId={byId}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
