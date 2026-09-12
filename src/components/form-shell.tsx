import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";

/**
 * design.md §4's form-page shell: the bloom layer behind everything, a 56px
 * wordmark header with no bottom border and no right-hand chrome, and the card
 * centered in the space below the header rather than in the full frame.
 *
 * Shared by `/onboarding` and `/app/north-star` — and, per §4, by the auth
 * pages, which build their own copy of it while both are in flight.
 *
 * The bloom is the landing page's own background (§2). It is what makes a form
 * page read as continuous with the page people arrived from, and it is the one
 * place these two hues are allowed.
 */
export function FormShell({
  children,
  width = 760,
  note,
}: {
  children: ReactNode;
  /** The form's own width — 760 for the North Star brief (§4). */
  width?: number;
  /** At most one muted line under the card (§4). */
  note?: ReactNode;
}) {
  return (
    <div
      className="app"
      style={{
        flex: 1,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div className="bloom-layer" aria-hidden="true">
        <span className="bloom bloom-warm" />
        <span className="bloom bloom-cool" />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppHeader bare />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 32px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: width,
              // `margin: auto` rather than `justify-content: center`: a brief
              // taller than the viewport must not have its top pushed out of
              // reach, which centring would do.
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {children}
            {note && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "var(--text-light)",
                  textAlign: "center",
                  textWrap: "pretty",
                }}
              >
                {note}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
