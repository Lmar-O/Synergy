import localFont from "next/font/local";

import { AppHeader } from "@/components/app/app-header";
import { loadAppQueue } from "@/app/app/_data";
import "../app.css";

/**
 * The authenticated shell. design.md §3: the 56px header is identical on every
 * page under /app, so it lives here; §4's rail is not here, because views
 * without a queue (the North Star form) drop it — each view brings its own.
 *
 * `app.css` is imported at this segment rather than merged into globals.css:
 * the tokens are scoped to `.app`, so nothing here can reach the landing page,
 * and the two files stay independently editable.
 */

// Scoped the same way the landing page scopes it — on the wrapper, not the
// document — so /app can use var(--font-object-sans) without the root layout
// having to know about it.
const objectSans = localFont({
  src: "../fonts/object-sans.ttf",
  variable: "--font-object-sans",
  display: "swap",
});

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const { northStar } = await loadAppQueue();

  return (
    <div
      className={`app ${objectSans.variable}`}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <AppHeader
        productName={northStar.product_name}
        version={northStar.version}
      />
      {children}
    </div>
  );
}
