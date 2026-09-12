"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { RefreshIcon, SpinnerIcon } from "@/components/app-icons";

/**
 * Re-runs the server render that failed. `router.refresh()` rather than a form
 * submit or `location.reload()`: it refetches the route on the server and
 * swaps the result in without a full document load, so a transient read error
 * clears without losing the page — and the URL stays clean.
 */
export function TryAgainButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-dark"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? <SpinnerIcon className="ico spin" /> : <RefreshIcon />}
      {pending ? "Trying…" : "Try again"}
    </button>
  );
}
