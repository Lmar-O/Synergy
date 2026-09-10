"use client";

import { useActionState } from "react";

import {
  generateTickets,
  type GenerateTicketsState,
} from "@/lib/actions/generate";

const initialState: GenerateTicketsState = {};

/**
 * Fires a generation and gets out of the way. The action calls `refresh()`, so
 * the tickets it produced are rendered by the queue view above, not here.
 */
export function GenerateTicketsButton() {
  const [state, formAction, pending] = useActionState(
    generateTickets,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-white/20"
      >
        {pending ? "Generating…" : "Generate tickets"}
      </button>
      {pending && (
        <p className="text-sm text-black/60 dark:text-white/60">
          This usually takes 10–30 seconds.
        </p>
      )}
      {!pending && state.message && (
        <p className="text-sm text-black/70 dark:text-white/70">
          {state.message}
        </p>
      )}
    </form>
  );
}
