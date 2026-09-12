import Link from "next/link";
import type { ReactNode } from "react";

import {
  AlertIcon,
  CheckIcon,
  InboxIcon,
  LinkIcon,
} from "@/components/app-icons";
import { GenerateTicketsButton } from "@/components/generate-tickets-button";
import type { QueueStall } from "@/lib/queue";

/**
 * What the Focus slot holds when `buildQueueView` has no ticket to hand over.
 *
 * Anatomy from design.md §3: `.card`, 36×32 padding, a 40px icon tile tinted
 * by what happened, a 22px Object Sans title, 14px muted body, one primary and
 * one tertiary action.
 *
 * Copy is `STALL_COPY` from the page this replaced — §5 makes the strings
 * already in `src/` canonical.
 *
 * One deliberate departure from the reference canvas: it puts `.btn-primary`
 * on "Edit North Star" in the all-blocked state. §3 reserves that button for
 * generating a queue and nothing else, so the editing action here is
 * `.btn-dark` and regeneration keeps the accent.
 */

const STALL_COPY: Record<
  QueueStall,
  { title: string; body: string; tint: string; ink: string; icon: ReactNode }
> = {
  empty: {
    title: "No tickets yet",
    body: "Generate a queue from your North Star to get started.",
    tint: "var(--primary-soft)",
    ink: "var(--primary-text)",
    icon: <InboxIcon className="ico ico-20" />,
  },
  "all-done": {
    title: "Queue clear",
    body: "Every ticket is done. Generate a fresh queue for the next milestone.",
    tint: "var(--mint-soft)",
    ink: "var(--mint-text)",
    icon: <CheckIcon className="ico ico-20" />,
  },
  "all-blocked": {
    title: "Everything left is blocked",
    body: "Nothing can move until a blocker clears. Update your North Star and generate a new queue.",
    tint: "var(--peach-soft)",
    ink: "var(--peach-text)",
    icon: <AlertIcon className="ico ico-20" />,
  },
  "dependency-wait": {
    title: "Nothing is unblocked",
    body: "Every remaining ticket is waiting on a prerequisite that is not done. Generating a fresh queue will re-sequence the work.",
    tint: "var(--yellow-soft)",
    ink: "var(--yellow-text)",
    icon: <LinkIcon className="ico ico-20" />,
  },
};

export function StallCard({ stall }: { stall: QueueStall }) {
  const copy = STALL_COPY[stall];

  return (
    <section
      className="card"
      style={{
        width: "100%",
        maxWidth: 560,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        padding: "36px 32px 32px",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: copy.tint,
          color: copy.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {copy.icon}
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2
          className="display"
          style={{ fontSize: 22, lineHeight: 1.25, margin: 0 }}
        >
          {copy.title}
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            margin: 0,
            textWrap: "pretty",
          }}
        >
          {copy.body}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 6,
          flexWrap: "wrap",
        }}
      >
        {stall === "all-blocked" ? (
          <>
            <Link href="/app/north-star" className="btn btn-dark">
              Edit North Star
            </Link>
            <GenerateTicketsButton
              variant="outline"
              label="Regenerate anyway"
            />
          </>
        ) : (
          <>
            <GenerateTicketsButton
              label={
                stall === "empty"
                  ? "Generate tickets"
                  : stall === "all-done"
                    ? "Generate next queue"
                    : "Regenerate queue"
              }
            />
            {stall === "all-done" && (
              <Link href="/app/north-star" className="btn btn-ghost">
                Edit brief
              </Link>
            )}
            {stall === "dependency-wait" && (
              <Link href="/app/queue" className="btn btn-ghost">
                View queue
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}
