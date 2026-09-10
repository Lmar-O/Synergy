"use client";

import { useActionState, useState } from "react";

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
};

/**
 * The whole of /app: one ticket, two ways out of it.
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

  return (
    <article className="flex flex-col gap-5 rounded-lg border border-black/10 p-6 dark:border-white/15">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-xs text-black/50 dark:text-white/50">
          <span className="font-mono">
            SYN-{String(ticket.number).padStart(3, "0")}
          </span>
          <span>{ticket.estimateHours}h</span>
          <span>priority {ticket.priority}</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{ticket.title}</h2>
      </div>

      {ticket.body && (
        <p className="text-sm whitespace-pre-line text-black/70 dark:text-white/70">
          {ticket.body}
        </p>
      )}

      {ticket.acceptanceCriteria.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-black/50 uppercase dark:text-white/50">
            Acceptance criteria
          </h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-black/70 dark:text-white/70">
            {ticket.acceptanceCriteria.map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-5 dark:border-white/15">
        <form action={completeAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {completing ? "Marking done…" : "Mark done"}
          </button>
        </form>

        {!showBlockForm && (
          <button
            type="button"
            onClick={() => setShowBlockForm(true)}
            disabled={busy}
            className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-white/20"
          >
            Blocked
          </button>
        )}
      </div>

      {showBlockForm && (
        <form action={blockAction} className="flex flex-col gap-3">
          <label htmlFor="reason" className="text-sm font-medium">
            What&rsquo;s blocking it?
          </label>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <textarea
            id="reason"
            name="reason"
            rows={3}
            autoFocus
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              {blocking ? "Skipping…" : "Skip this ticket"}
            </button>
            <button
              type="button"
              onClick={() => setShowBlockForm(false)}
              disabled={busy}
              className="text-sm underline underline-offset-4 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {(completeState.message || blockState.message) && (
        <p className="text-sm text-black/70 dark:text-white/70">
          {completeState.message ?? blockState.message}
        </p>
      )}
    </article>
  );
}
