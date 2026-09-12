"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The landing page brings its own sticky nav, so the app header rendered by
 * the root layout stands down on "/" — otherwise the page gets two stacked
 * navs. The header itself stays a server component passed in as children;
 * only this pathname check runs on the client.
 */
export function HideOnLanding({ children }: { children: ReactNode }) {
  return usePathname() === "/" ? null : children;
}
