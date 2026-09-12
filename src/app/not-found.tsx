"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { ArrowLeftIcon, UnlinkIcon } from "@/components/app-icons";

/**
 * The global 404.
 *
 * A client component for one reason: `not-found.tsx` gets no request object,
 * and `usePathname()` is the only way to tell the reader which address came up
 * empty — usually the fastest way to spot a typo.
 *
 * Wordmark-only header. This route is global, so it cannot assume a signed-in
 * user, a North Star, or a queue; naming a product here would be a guess.
 *
 * The tile is neutral rather than peach. A wrong address is not a failure, and
 * design.md §2 gives peach to blocked work and errors.
 */
export default function NotFound() {
  const pathname = usePathname();

  return (
    <div
      className="app"
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppHeader />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px 72px",
        }}
      >
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
              background: "var(--surface-2)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UnlinkIcon className="ico ico-20" />
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1
              className="display"
              style={{ fontSize: 22, lineHeight: 1.25, margin: 0 }}
            >
              There&rsquo;s nothing at this address
            </h1>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--text-muted)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              The link you followed points at a page Synergy doesn&rsquo;t have
              — a typo, or something that moved. Nothing is missing: your queue
              is where you left it.
            </p>
          </div>

          {pathname && (
            <div className="detail" style={{ width: "100%" }}>
              <span className="caption">Requested path</span>
              <span className="detail-val">{pathname}</span>
            </div>
          )}

          <div style={{ marginTop: 6 }}>
            <Link href="/app" className="btn btn-dark">
              <ArrowLeftIcon />
              Back to your queue
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
