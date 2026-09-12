"use client";

import { useActionState, useState } from "react";

import {
  blockTicket,
  completeTicket,
  type TicketActionState,
} from "@/lib/actions/ticket";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  LinkIcon,
  PriorityBars,
  priorityLabel,
  SpinnerIcon,
  hours,
  ticketRef,
} from "@/components/app/icons";

const initialState: TicketActionState = {};

export type FocusTicket = {
  id: string;
  number: number;
  title: string;
  body: string;
  estimateHours: number;
  priority: number;
  acceptanceCriteria: string[];
  /** Prerequisites, already resolved to refs and whether each is finished. */
  dependsOn: { number: number; done: boolean }[];
};

/**
 * The Focus card — the one centrepiece of /app.
 *
 * The data flow is `ticket-card.tsx`'s, unchanged: the same two server actions
 * behind `useActionState`, the same collapsed-until-asked block form, and the
 * parent still keys this on the ticket id so finishing one remounts the card
 * for the next and resets the form.
 *
 * What changed is the surface — design.md §2/§3 and the v1 critique: the title
 * is 36px Object Sans at line-height 1.15, the body stays 15px muted with
 * `text-wrap: pretty`, and the "Sequenced from North Star v3" footer badge is
 * gone (the rail already says where the sequence came from, and the `.ai-dot`
 * it used belongs to "the AI is working", nowhere else).
 */
export function FocusCard({ ticket }: { ticket: FocusTicket }) {
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
            {ticketRef(ticket.number)}
          </span>
          <span className="chip chip-active">Active</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <PriorityBars priority={ticket.priority} />
            {priorityLabel(ticket.priority)}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            <ClockIcon />
            {hours(ticket.estimateHours)}
          </span>

          {ticket.dependsOn.length > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "var(--text-muted)",
                marginLeft: "auto",
              }}
            >
              <LinkIcon />
              Depends on
              {ticket.dependsOn.map((dep) => (
                <span
                  key={dep.number}
                  className="mono"
                  style={{
                    color: dep.done ? "var(--mint-text)" : "var(--text-muted)",
                  }}
                >
                  {ticketRef(dep.number)}
                </span>
              ))}
              {ticket.dependsOn.every((dep) => dep.done) && (
                <CheckIcon style={{ color: "var(--mint-text)" }} />
              )}
            </span>
          )}
        </div>

        {/* v1: 36px, line-height 1.15. Object Sans has one weight — emphasis
            in display text is size, never weight. */}
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
              textWrap: "pretty",
              whiteSpace: "pre-line",
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
          <div className="caption">Acceptance criteria</div>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {ticket.acceptanceCriteria.map((criterion, index) => (
              <li className="ac" key={index}>
                {/* Static, not a checkbox — there is no per-criterion state
                    to write, and a control that does nothing is a lie. */}
                <svg
                  className="ico"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                  style={{ color: "var(--border-strong)", marginTop: 2 }}
                >
                  <circle cx="8" cy="8" r="6" />
                </svg>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            margin: "0 28px 24px",
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--peach-soft)",
            color: "var(--peach-text)",
            fontSize: 13,
            lineHeight: 1.45,
          }}
          role="status"
        >
          <AlertIcon />
          <span>{message}</span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "20px 28px 24px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <form action={completeAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <button
            type="submit"
            disabled={busy}
            className={`btn btn-dark${busy ? " is-disabled" : ""}`}
          >
            {completing ? <SpinnerIcon /> : <CheckIcon />}
            {completing ? "Marking done…" : "Mark done"}
          </button>
        </form>

        {!showBlockForm && (
          <button
            type="button"
            onClick={() => setShowBlockForm(true)}
            disabled={busy}
            className={`btn btn-outline${busy ? " is-disabled" : ""}`}
          >
            Blocked
          </button>
        )}
      </div>

      {showBlockForm && (
        <form
          action={blockAction}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "20px 28px 24px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
            borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          }}
        >
          <label htmlFor="reason" style={{ fontSize: 14, fontWeight: 600 }}>
            What&rsquo;s blocking it?
          </label>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <textarea
            id="reason"
            name="reason"
            rows={3}
            autoFocus
            required
            className="textarea"
            style={{ minHeight: 76 }}
          />
          <span style={{ fontSize: 12, color: "var(--text-light)" }}>
            Blocked tickets are set aside for good — regenerate the queue later
            to re-sequence around them.
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 4,
            }}
          >
            <button
              type="submit"
              disabled={busy}
              className={`btn btn-dark btn-sm${busy ? " is-disabled" : ""}`}
            >
              {blocking ? "Skipping…" : "Skip this ticket"}
            </button>
            <button
              type="button"
              onClick={() => setShowBlockForm(false)}
              disabled={busy}
              className={`btn btn-ghost btn-sm${busy ? " is-disabled" : ""}`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
