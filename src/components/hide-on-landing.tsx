"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Routes that render their own header and must not get the layout's as well. */
const OWN_CHROME = ["/app"];

/**
 * The root layout's header stands down on routes that bring their own: the
 * landing page has its sticky nav, and everything under /app has the 56px app
 * header from design.md §3. Without this they stack.
 *
 * The header itself stays a server component passed in as children; only this
 * pathname check runs on the client.
 *
 * This is a gate, not an architecture: the header belongs in a layout under the
 * authenticated routes — which is where /app's now is. Once /onboarding and the
 * auth pages sit under that same segment, this component goes away.
 */
export function HideOnLanding({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  if (OWN_CHROME.some((route) => pathname.startsWith(route))) return null;
  return children;
}
