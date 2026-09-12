import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// The display face. Lives at the root rather than on the landing page so auth
// and /app can reach var(--font-object-sans) — design.md §9.
const objectSans = localFont({
  src: "./fonts/object-sans.ttf",
  variable: "--font-object-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synergy",
  description:
    "Tell Synergy what you're building. It writes the sprint, tracks progress, and keeps you moving.",
};

/**
 * The root layout carries fonts, Clerk and the stylesheet — and no chrome.
 *
 * It used to render a generic header behind a pathname gate, which each route
 * that brought its own had to be added to. That list could never cover
 * `not-found.tsx`: a 404 renders inside this layout, and nothing here can know
 * a route 404'd, so the generic header stacked on top of the real one.
 *
 * Every route now brings its own header, so there is nothing left to gate:
 * the landing page has its sticky nav, auth and the North Star brief have
 * design.md §4's form-page wordmark, `/app` has §3's app header from
 * `app/(shell)/layout.tsx`, and `not-found.tsx` has its own.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // landing.css scrolls <html> smoothly for the #pricing anchor. Since
      // Next 16, this attribute is what makes the router suspend that across
      // navigations, so changing pages jumps instead of gliding to the top.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${objectSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <div className="flex flex-1 flex-col">{children}</div>
        </ClerkProvider>
      </body>
    </html>
  );
}
