import { UserButton } from "@clerk/nextjs";

import { StarIcon } from "@/components/app/icons";

/**
 * design.md §3: 56px, 1px bottom border, a 28px violet logo tile with the
 * four-point brand mark plus "Synergy" in Object Sans; on the right the
 * product name, the North Star version chip, and the avatar.
 *
 * Identical on every authenticated page, so it lives in the /app layout.
 */
export function AppHeader({
  productName,
  version,
}: {
  productName: string;
  version: number;
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
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
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
        </div>
        <span className="display" style={{ fontSize: 17 }}>
          Synergy
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {productName}
        </span>
        <span className="chip chip-neutral">North Star v{version}</span>
        <UserButton
          appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }}
        />
      </div>
    </header>
  );
}
