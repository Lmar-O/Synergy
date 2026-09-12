import Link from "next/link";

import {
  ColumnsIcon,
  ListIcon,
  PencilIcon,
  TargetIcon,
} from "@/components/app-icons";

/**
 * The main pane's toolbar from design.md §4: the view switcher on the left,
 * "Edit brief" on the right.
 *
 * §7-A settles that the app uses a segmented control rather than the landing's
 * pill-link nav. Board joined the control when `/app/board` landed; the `.seg`
 * recipe never cared how many items it holds.
 *
 * Static markup rather than a client component: the active segment is a fact
 * about which page rendered it, so each page passes it rather than the browser
 * working it out again.
 */
export function AppToolbar({
  active,
}: {
  active: "focus" | "queue" | "board";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        flexShrink: 0,
        gap: 16,
      }}
    >
      <nav className="seg" aria-label="View">
        <Link
          href="/app"
          className={active === "focus" ? "seg-item on" : "seg-item"}
          aria-current={active === "focus" ? "page" : undefined}
        >
          <TargetIcon />
          Focus
        </Link>
        <Link
          href="/app/queue"
          className={active === "queue" ? "seg-item on" : "seg-item"}
          aria-current={active === "queue" ? "page" : undefined}
        >
          <ListIcon />
          Queue
        </Link>
        <Link
          href="/app/board"
          className={active === "board" ? "seg-item on" : "seg-item"}
          aria-current={active === "board" ? "page" : undefined}
        >
          <ColumnsIcon />
          Board
        </Link>
      </nav>

      <Link href="/app/north-star" className="btn btn-ghost btn-sm">
        <PencilIcon />
        Edit brief
      </Link>
    </div>
  );
}
