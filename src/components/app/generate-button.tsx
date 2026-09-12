"use client";

import { useActionState } from "react";

import {
  generateTickets,
  type GenerateTicketsState,
} from "@/lib/actions/generate";
import { AlertIcon, RefreshIcon, SpinnerIcon, StarIcon } from "@/components/app/icons";

const initialState: GenerateTicketsState = {};

/**
 * The queue-generating action in the /app design language.
 *
 * The data flow is `generate-tickets-button.tsx`'s, unchanged — same server
 * action, same `useActionState`. Only the markup differs, because the label,
 * icon and weight vary by where it sits: `.btn-primary` on a stall card (the
 * one place design.md §3 allows primary), `.btn-outline btn-sm` in the rail
 * footer. That component keeps its own styling for the pages that still use it.
 */
export function GenerateButton({
  label,
  pendingLabel = "Generating…",
  variant = "primary",
  icon = "star",
}: {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "outline";
  icon?: "star" | "refresh";
}) {
  const [state, formAction, pending] = useActionState(
    generateTickets,
    initialState,
  );

  const Glyph = icon === "refresh" ? RefreshIcon : StarIcon;

  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <button
        type="submit"
        disabled={pending}
        className={[
          "btn",
          variant === "primary" ? "btn-primary" : "btn-outline btn-sm",
          pending ? "is-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={variant === "outline" ? { justifyContent: "center" } : undefined}
      >
        {pending ? <SpinnerIcon /> : <Glyph />}
        {pending ? pendingLabel : label}
      </button>

      {pending && (
        <span style={{ fontSize: 11, color: "var(--text-light)", lineHeight: 1.4 }}>
          This usually takes 10–30 seconds.
        </span>
      )}

      {/* design.md §3: a failed action is an inline message, never a toast. */}
      {!pending && state.message && (
        <span
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--peach-soft)",
            color: "var(--peach-text)",
            fontSize: 13,
            lineHeight: 1.45,
            textAlign: "left",
          }}
        >
          <AlertIcon />
          <span>{state.message}</span>
        </span>
      )}
    </form>
  );
}
