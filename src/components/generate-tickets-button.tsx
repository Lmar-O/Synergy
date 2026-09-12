"use client";

import { useActionState } from "react";

import {
  AlertIcon,
  RefreshIcon,
  SpinnerIcon,
  StarIcon,
} from "@/components/app-icons";
import {
  generateTickets,
  type GenerateTicketsState,
} from "@/lib/actions/generate";

const initialState: GenerateTicketsState = {};

/**
 * Fires a generation and gets out of the way. The action calls `refresh()`, so
 * the tickets it produced are rendered by the queue view around it, not here.
 *
 * design.md §3 reserves `.btn-primary` for exactly this action, which is why
 * the rail's footer copy of it is `.btn-outline`: two primaries on one screen
 * would both stop meaning "this is the one thing that generates a queue".
 */
export function GenerateTicketsButton({
  label = "Generate tickets",
  variant = "primary",
  full = false,
}: {
  label?: string;
  variant?: "primary" | "outline";
  full?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    generateTickets,
    initialState,
  );

  return (
    <form
      action={formAction}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: full ? "100%" : undefined,
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className={
          variant === "primary"
            ? "btn btn-primary"
            : "btn btn-outline btn-sm"
        }
        style={full ? { width: "100%" } : undefined}
      >
        {pending ? (
          <SpinnerIcon className="ico spin" />
        ) : variant === "primary" ? (
          <StarIcon />
        ) : (
          <RefreshIcon />
        )}
        {pending ? "Generating…" : label}
      </button>

      {pending && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12,
            color: "var(--text-muted)",
            justifyContent: full ? "center" : undefined,
          }}
        >
          <span className="ai-dot" />
          This usually takes 10–30 seconds.
        </span>
      )}

      {!pending && state.message && (
        <p className="inline-err" role="alert" style={{ margin: 0 }}>
          <AlertIcon />
          <span>{state.message}</span>
        </p>
      )}
    </form>
  );
}
