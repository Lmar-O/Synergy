import Link from "next/link";

import { GenerateButton } from "@/components/app/generate-button";
import {
  AlertIcon,
  CheckIcon,
  InboxIcon,
  LinkIcon,
  PencilIcon,
} from "@/components/app/icons";
import type { QueueStall } from "@/lib/queue";

/**
 * What stands in for the Focus card when `buildQueueView` returns no current
 * ticket. One per `QueueStall`, all four built from design.md §3's stall-card
 * recipe: 40px tinted icon tile, 22px title, 14px muted body, one primary
 * action and one way out.
 *
 * The tint names the reason using the fixed status mapping — nothing left to
 * do is mint, everything blocked is peach, waiting is yellow — so the card is
 * recognisable before it is read.
 */

const STALL = {
  empty: {
    tint: "primary",
    title: "No tickets yet",
    body: "Generate a queue from your North Star to get started. Synergy sequences the work and hands you one ticket at a time.",
    action: { label: "Generate tickets", pending: "Generating…" },
  },
  "all-done": {
    tint: "mint",
    title: "Queue clear",
    body: "Every ticket is done. Generate a fresh queue for the next milestone — finished work is fed back into the prompt.",
    action: { label: "Generate next queue", pending: "Generating…" },
    secondary: { href: "/app/north-star", label: "Edit brief" },
  },
  "all-blocked": {
    tint: "peach",
    title: "Everything left is blocked",
    body: "Nothing can move until a blocker clears. Update your North Star with what you learned and generate a new queue.",
    action: { label: "Regenerate queue", pending: "Regenerating…" },
    secondary: { href: "/app/north-star", label: "Edit North Star" },
  },
  "dependency-wait": {
    tint: "yellow",
    title: "Nothing is unblocked",
    body: "Every remaining ticket is waiting on a prerequisite that isn’t done. Regenerating will re-sequence the work around what’s finished.",
    action: { label: "Regenerate queue", pending: "Regenerating…" },
    secondary: { href: "/app/queue", label: "View queue" },
  },
} as const satisfies Record<QueueStall, unknown>;

function StallIcon({ stall }: { stall: QueueStall }) {
  if (stall === "all-done") return <CheckIcon className="ico ico-20" />;
  if (stall === "all-blocked") return <AlertIcon className="ico ico-20" />;
  if (stall === "dependency-wait") return <LinkIcon className="ico ico-20" />;
  return <InboxIcon className="ico ico-20" />;
}

export function StallCard({ stall }: { stall: QueueStall }) {
  const spec = STALL[stall];
  const secondary = "secondary" in spec ? spec.secondary : null;

  return (
    <div
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
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: `var(--${spec.tint}-soft)`,
          color: `var(--${spec.tint}-text)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StallIcon stall={stall} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2
          className="display"
          style={{ fontSize: 22, lineHeight: 1.25, margin: 0 }}
        >
          {spec.title}
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
          {spec.body}
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
        <GenerateButton
          label={spec.action.label}
          pendingLabel={spec.action.pending}
          icon={stall === "empty" ? "star" : "refresh"}
        />
        {secondary && (
          <Link href={secondary.href} className="btn btn-ghost">
            <PencilIcon />
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
}
