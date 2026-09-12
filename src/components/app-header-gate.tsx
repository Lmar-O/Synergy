"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Routes that render their own header and must not get the layout's as well. */
const OWN_CHROME = ["/sign-in", "/sign-up"];

/**
 * The root layout's header stands down on routes that bring their own: the
 * landing page has its sticky nav, and the auth pages have the wordmark from
 * design.md §4's form-page shell. Without this they stack.
 *
 * The header itself stays a server component passed in as children; only this
 * pathname check runs on the client.
 *
 * This is a gate, not an architecture: the header belongs in a layout under the
 * authenticated routes, at which point this component goes away. Doing that
 * means moving /app and /onboarding under a shared segment, which is a bigger
 * change than the auth pages needed.
 */
export function AppHeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  // Clerk's catch-all routes mean /sign-in has sub-paths (/sign-in/factor-two…).
  if (OWN_CHROME.some((route) => pathname.startsWith(route))) return null;
  return children;
}
