"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ColumnsIcon, ListIcon, TargetIcon } from "@/components/app/icons";

/**
 * design.md §7-A: the app switches views with a segmented control, not the
 * landing page's pill-link nav. The active segment is a `--card` with the card
 * shadow riding on a `--surface-2` track.
 *
 * A client component only because it reads the pathname to mark the active
 * segment; the views themselves stay on the server.
 */

const VIEWS = [
  { href: "/app", label: "Focus", Icon: TargetIcon },
  { href: "/app/queue", label: "Queue", Icon: ListIcon },
  { href: "/app/board", label: "Board", Icon: ColumnsIcon },
] as const;

export function ViewSwitcher() {
  const pathname = usePathname();

  return (
    <nav className="seg" aria-label="View">
      {VIEWS.map(({ href, label, Icon }) => {
        // Exact match: /app must not light up while /app/queue is open.
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={active ? "seg-item on" : "seg-item"}
            aria-current={active ? "page" : undefined}
            style={{ textDecoration: "none" }}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
