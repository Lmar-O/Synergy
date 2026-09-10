"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  generateTickets,
  type GenerateTicketsState,
} from "@/lib/actions/generate";

const initialState: GenerateTicketsState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
    >
      {pending ? "Generating… (10–30s)" : "Generate tickets"}
    </button>
  );
}

export function GenerateTicketsButton() {
  const [state, formAction] = useActionState(generateTickets, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <SubmitButton />
      {state.message && <p className="text-sm">{state.message}</p>}
      {state.tickets && state.tickets.length > 0 && (
        <ol className="flex flex-col gap-2 text-sm">
          {state.tickets.map((ticket, index) => (
            <li
              key={index}
              className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15"
            >
              <span className="font-medium">{ticket.title}</span>
              <span className="text-black/60 dark:text-white/60">
                {" "}
                — {ticket.estimate_hours}h, priority {ticket.priority}
              </span>
            </li>
          ))}
        </ol>
      )}
    </form>
  );
}
