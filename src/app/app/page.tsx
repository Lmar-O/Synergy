import Link from "next/link";

import { AppShell, InlineError, PaneBody } from "@/components/app/app-shell";
import { FocusCard } from "@/components/app/focus-card";
import { StallCard } from "@/components/app/stall-card";
import {
  AlertIcon,
  ArrowIcon,
  hours,
  ticketRef,
} from "@/components/app/icons";
import { loadAppQueue, toCriteria } from "@/app/app/_data";

/**
 * Focus — the default view. One ticket, everything else subordinate to it.
 */
export default async function AppPage() {
  const { view, tickets, version, error } = await loadFocus();
  const { current, upcoming, waiting, stall } = view;

  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const next = upcoming[0] ?? waiting[0] ?? null;

  return (
    <AppShell view={view} version={version}>
      <PaneBody center>
        {error && (
          <div style={{ width: "100%", maxWidth: 760 }}>
            <InlineError>
              <AlertIcon />
              <span>
                Couldn’t load your tickets — {error}. Nothing is lost; reload to
                try again.
              </span>
            </InlineError>
          </div>
        )}

        {current ? (
          <FocusCard
            key={current.id}
            ticket={{
              id: current.id,
              number: current.number,
              title: current.title,
              body: current.body,
              estimateHours: current.estimate_hours,
              priority: current.priority,
              acceptanceCriteria: toCriteria(current.acceptance_criteria),
              dependsOn: current.depends_on
                .map((id) => byId.get(id))
                .filter((dep) => dep !== undefined)
                .map((dep) => ({
                  number: dep.number,
                  done: dep.status === "done",
                })),
            }}
          />
        ) : (
          stall && <StallCard stall={stall} />
        )}

        {/* The one look-ahead the Focus view allows: what takes this slot next. */}
        {current && next && (
          <Link
            href="/app/queue"
            style={{
              width: "100%",
              maxWidth: 760,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 4px",
              fontSize: 13,
              color: "var(--text-light)",
              textDecoration: "none",
            }}
          >
            <ArrowIcon />
            <span>Up next</span>
            <span className="mono" style={{ color: "var(--text-light)" }}>
              {ticketRef(next.number)}
            </span>
            <span style={{ color: "var(--text-muted)" }}>{next.title}</span>
            <span style={{ marginLeft: "auto" }}>
              {hours(next.estimate_hours)}
            </span>
          </Link>
        )}
      </PaneBody>
    </AppShell>
  );
}

/** Narrows the shared loader to what this view needs. */
async function loadFocus() {
  const { view, tickets, northStar, error } = await loadAppQueue();
  return { view, tickets, version: northStar.version, error };
}
