"use client";

import { useActionState, useState } from "react";

import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  LinkIcon,
  PriorityBars,
  SpinnerIcon,
  priorityLabel,
} from "@/components/app-icons";
import {
  blockTicket,
  completeTicket,
  type TicketActionState,
} from "@/lib/actions/ticket";

const initialState: TicketActionState = {};

export type TicketCardTicket = {
  id: string;
  number: number;
  title: string;
  body: string;
  estimateHours: number;
  priority: number;
  acceptanceCriteria: string[];
  /** Prerequisites, already satisfied — the card only ever shows an eligible ticket. */
  dependsOn: { number: number }[];
};

const ref = (n: number) => `SYN-${String(n).padStart(3, "0")}`;

/**
 * The Focus card — design.md §3 and the v1 canvas: 36px Object Sans title,
 * 15px muted body, acceptance criteria as hollow circles, and two ways out of
 * the ticket on a divided footer.
 *
 * The parent keys this on the ticket id, so finishing or blocking one remounts
 * the card for the next — which is what resets the block form back to its
 * collapsed state.
 */
export function TicketCard({ ticket }: { ticket: TicketCardTicket }) {
  const [completeState, completeAction, completing] = useActionState(
    completeTicket,
    initialState,
  );
  const [blockState, blockAction, blocking] = useActionState(
    blockTicket,
    initialState,
  );
  const [showBlockForm, setShowBlockForm] = useState(false);

  const busy = completing || blocking;
  const message = completeState.message ?? blockState.message;

  return (
    <article
      className="card"
      style={{
        width: "100%",
        maxWidth: 760,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "28px 28px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span className="mono" style={{ color: "var(--text-light)" }}>
            {ref(ticket.number)}
          </span>
          <span className="chip chip-active">Active</span>
          <Meta>
            <PriorityBars priority={ticket.priority} />
            {priorityLabel(ticket.priority)}
          </Meta>
          <Meta>
            <ClockIcon />
            {ticket.estimateHours}h
          </Meta>
          {ticket.dependsOn.length > 0 && (
            <Meta style={{ marginLeft: "auto" }}>
              <LinkIcon />
              Depends on{" "}
              {ticket.dependsOn.map((dep) => (
                <span
                  key={dep.number}
                  className="mono"
                  style={{ color: "var(--mint-text)" }}
                >
                  {ref(dep.number)}
                </span>
              ))}
              <CheckIcon style={{ color: "var(--mint-text)" }} />
            </Meta>
          )}
        </div>

        <h1
          className="display"
          style={{ fontSize: 36, lineHeight: 1.15, margin: 0 }}
        >
          {ticket.title}
        </h1>

        {ticket.body && (
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--text-muted)",
              margin: 0,
              whiteSpace: "pre-line",
              textWrap: "pretty",
            }}
          >
            {ticket.body}
          </p>
        )}
      </div>

      {ticket.acceptanceCriteria.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "24px 28px",
          }}
        >
          <h2 className="caption" style={{ margin: 0 }}>
            Acceptance criteria
          </h2>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {ticket.acceptanceCriteria.map((criterion, index) => (
              <li className="ac" key={index}>
                <svg
                  className="ico"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  style={{ color: "var(--border-strong)", marginTop: 3 }}
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="6" />
                </svg>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "20px 28px 24px",
          borderTop: "1px solid var(--border)",
        }}
      >
        {showBlockForm ? (
          <form
            action={blockAction}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <label
              htmlFor="reason"
              style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}
            >
              What&rsquo;s blocking it?
            </label>
            <input type="hidden" name="ticketId" value={ticket.id} />
            <textarea
              id="reason"
              name="reason"
              rows={3}
              autoFocus
              className="textarea"
            />
            <span style={{ fontSize: 12, color: "var(--text-light)" }}>
              Blocked tickets are set aside for good — regenerate the queue
              later to re-sequence around them.
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button type="submit" disabled={busy} className="btn btn-dark">
                {blocking && <SpinnerIcon className="ico spin" />}
                {blocking ? "Skipping…" : "Skip this ticket"}
              </button>
              <button
                type="button"
                onClick={() => setShowBlockForm(false)}
                disabled={busy}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <form action={completeAction}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <button type="submit" disabled={busy} className="btn btn-dark">
                {completing ? (
                  <SpinnerIcon className="ico spin" />
                ) : (
                  <CheckIcon />
                )}
                {completing ? "Marking done…" : "Mark done"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setShowBlockForm(true)}
              disabled={busy}
              className="btn btn-outline"
            >
              Blocked
            </button>
          </div>
        )}

        {message && (
          <p className="inline-err" role="alert" style={{ margin: 0 }}>
            <AlertIcon />
            <span>{message}</span>
          </p>
        )}
      </div>
    </article>
  );
}

function Meta({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "var(--text-muted)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
