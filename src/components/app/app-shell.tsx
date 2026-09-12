import type { ReactNode } from "react";
import Link from "next/link";

import { PencilIcon } from "@/components/app/icons";
import { QueueRail } from "@/components/app/queue-rail";
import { ViewSwitcher } from "@/components/app/view-switcher";
import type { AppTicket } from "@/app/app/_data";
import type { QueueView } from "@/lib/queue";

/**
 * The split layout from design.md §4: a 320px rail of the whole queue beside a
 * main pane that switches between Focus, Queue and Board.
 *
 * The three views share everything except what goes in the pane, so they hand
 * that in as children and this holds the rest.
 */
export function AppShell({
  view,
  version,
  children,
}: {
  view: QueueView<AppTicket>;
  version: number;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <QueueRail view={view} version={version} />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 32px",
            flexShrink: 0,
          }}
        >
          <ViewSwitcher />
          <Link href="/app/north-star" className="btn btn-ghost btn-sm">
            <PencilIcon />
            Edit brief
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
}

/**
 * The scrolling body of a view's pane. v1 pushes the content 24px further down
 * from the toolbar than v0 did (8 → 32), and all three views use the same value
 * so switching tabs does not make the content jump.
 */
export function PaneBody({
  children,
  center,
}: {
  children: ReactNode;
  /** Focus centres a fixed-width card; Queue and Board fill the pane. */
  center?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: "32px 32px 40px",
        ...(center
          ? {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }
          : {}),
      }}
    >
      {children}
    </div>
  );
}

/** design.md §3 — a failed read or action, inline and non-blocking. */
export function InlineError({ children }: { children: ReactNode }) {
  return (
    <div
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
      }}
    >
      {children}
    </div>
  );
}
