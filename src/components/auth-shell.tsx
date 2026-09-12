import type { ReactNode } from "react";
import Link from "next/link";

import "@/app/auth.css";

/**
 * The page shell around Clerk's card: the bloom layer, the wordmark, and the
 * centred slot the card drops into. design.md §4, "Form pages".
 *
 * The blooms are the landing page's own background washes, so the page someone
 * arrives from and the page they sign in on read as one product. Unlike the
 * landing's, these do not drift — there is nothing to scroll here — so this
 * stays a server component with no client JS.
 */
export function AuthShell({
  children,
  note,
}: {
  children: ReactNode;
  /** One muted line under the card. At most one; design.md §4. */
  note?: string;
}) {
  return (
    <div className="app auth-page">
      <div className="bloom-layer" aria-hidden="true">
        <div className="bloom bloom-warm" />
        <div className="bloom bloom-cool" />
      </div>

      <header className="auth-head">
        <Link href="/" className="mark-lockup">
          <span className="mark">
            {/* The brand mark — the one icon in the set that fills. */}
            <svg className="ico" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 1c.6 4 3 6.4 7 7-4 .6-6.4 3-7 7-.6-4-3-6.4-7-7 4-.6 6.4-3 7-7z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="display mark-word">Synergy</span>
        </Link>
      </header>

      <main className="auth-body">
        {children}
        {note ? <p className="page-note">{note}</p> : null}
      </main>
    </div>
  );
}
