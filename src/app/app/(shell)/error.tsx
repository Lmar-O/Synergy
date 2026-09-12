"use client";

import Link from "next/link";

import { AlertIcon, ArrowLeftIcon, RefreshIcon } from "@/components/app-icons";

/**
 * The `/app` route error boundary.
 *
 * `app/layout.tsx` sits above this boundary, so the header — and the `.app`
 * class the tokens hang off — survives the failure. The rail does not: the
 * rail *is* the queue, and the queue is what failed to render.
 *
 * The raw failure is shown, but demoted. `error.digest` is the only string
 * Next gives you in a production build (the message is stripped to avoid
 * leaking server details), and it is the value the server log indexes on — so
 * it belongs on the page, under the human sentence rather than instead of it.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
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
            background: "var(--peach-soft)",
            color: "var(--peach-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertIcon className="ico ico-20" />
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1
            className="display"
            style={{ fontSize: 22, lineHeight: 1.25, margin: 0 }}
          >
            This page didn&rsquo;t load
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
            Something broke while rendering it. Nothing was written — your
            tickets, your progress and your North Star are exactly where you
            left them. Try again; if it keeps happening,{" "}
            {error.digest
              ? "the digest below is what the server log calls this failure."
              : "the detail below is what to search for."}
          </p>
        </div>

        <div className="detail" style={{ width: "100%" }}>
          <span className="caption">
            {error.digest ? "Error digest" : "Error detail"}
          </span>
          <span className="detail-val">{error.digest ?? error.message}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 6,
          }}
        >
          <button type="button" onClick={reset} className="btn btn-dark">
            <RefreshIcon />
            Try again
          </button>
          <Link href="/app" className="btn btn-ghost">
            <ArrowLeftIcon />
            Back to queue
          </Link>
        </div>
      </section>
    </div>
  );
}
