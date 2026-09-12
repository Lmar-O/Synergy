import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { StarIcon } from "@/components/app-icons";

/**
 * design.md §3: 56px, 1px bottom border, 28px logo tile + "Synergy" in Object
 * Sans; on the right the product name, the North Star version chip and the
 * avatar. Identical on every authenticated page.
 *
 * It renders in three shapes, and which one a route picks says what that route
 * knows about you:
 *
 * - `/app/*` — the full header. The North Star is fetched by `app/layout.tsx`,
 *   so it is already resolved when a page suspends: this is what stays on
 *   screen above `loading.tsx` and `error.tsx`.
 * - `/onboarding` — avatar only. There is no North Star yet to name.
 * - `not-found` — wordmark only. It is global, so it cannot assume a signed-in
 *   user at all, and Clerk's `<UserButton />` would render nothing useful.
 */
export function AppHeader({
  productName,
  version,
  showUser = false,
}: {
  productName?: string;
  version?: number;
  showUser?: boolean;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        flexShrink: 0,
      }}
    >
      <Link
        href={productName ? "/app" : "/"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--text)",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <StarIcon />
        </span>
        <span className="display" style={{ fontSize: 17 }}>
          Synergy
        </span>
      </Link>

      {(productName || showUser) && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {productName && (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {productName}
            </span>
          )}
          {version !== undefined && (
            <span className="chip chip-neutral">North Star v{version}</span>
          )}
          {showUser && (
            <UserButton
              appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }}
            />
          )}
        </div>
      )}
    </header>
  );
}
