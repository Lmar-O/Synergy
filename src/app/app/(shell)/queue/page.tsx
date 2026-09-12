import Link from "next/link";
import { redirect } from "next/navigation";

import {
  buildQueueView,
  unmetDependencies,
  unresolvedDependencies,
  type SequencedTicket,
} from "@/lib/queue";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type QueueTicket = SequencedTicket & {
  title: string;
  estimate_hours: number;
  blocked_reason: string | null;
};

const ref = (ticket: { number: number }) =>
  `SYN-${String(ticket.number).padStart(3, "0")}`;

function Row({ ticket, note }: { ticket: QueueTicket; note?: string }) {
  return (
    <li className="flex flex-col gap-1 border-t border-black/10 py-3 first:border-t-0 dark:border-white/15">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-black/50 dark:text-white/50">
          {ref(ticket)}
        </span>
        <span className="text-sm">{ticket.title}</span>
        <span className="ml-auto shrink-0 text-xs text-black/50 dark:text-white/50">
          {ticket.estimate_hours}h
        </span>
      </div>
      {note && (
        <p className="pl-14 text-xs text-black/50 dark:text-white/50">{note}</p>
      )}
    </li>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wide text-black/50 uppercase dark:text-white/50">
        {title} · {count}
      </h2>
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
}

/**
 * The whole plan at a glance. /app stays the one-thing-at-a-time view; this is
 * where the dependency graph becomes legible — every gated ticket says which
 * prerequisites are still standing in its way.
 */
export default async function QueuePage() {
  const supabase = await createServerSupabaseClient();

  const { data: northStar } = await supabase
    .from("north_stars")
    .select("product_name")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!northStar) redirect("/onboarding");

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(
      "id, number, title, estimate_hours, priority, position, status, depends_on, blocked_reason",
    )
    .is("superseded_at", null);

  const live: QueueTicket[] = tickets ?? [];
  const { current, upcoming, waiting, blocked, done, counts } =
    buildQueueView(live);
  const byId = new Map(live.map((ticket) => [ticket.id, ticket]));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
        <Link href="/app" className="text-sm underline underline-offset-4">
          Back to current ticket
        </Link>
      </header>

      {error && (
        <p className="text-sm text-black/70 dark:text-white/70">
          Could not load your tickets: {error.message}
        </p>
      )}

      {counts.total === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">
          No tickets yet. Generate a queue from{" "}
          <Link href="/app" className="underline underline-offset-4">
            your North Star
          </Link>
          .
        </p>
      ) : (
        <>
          <p className="text-sm text-black/60 dark:text-white/60">
            {counts.done} of {counts.total} done
            {counts.blocked > 0 && ` · ${counts.blocked} blocked`}
          </p>

          <Section title="Now" count={current ? 1 : 0}>
            {current && <Row ticket={current} />}
          </Section>

          <Section title="Ready" count={upcoming.length}>
            {upcoming.map((ticket) => (
              <Row key={ticket.id} ticket={ticket} />
            ))}
          </Section>

          <Section title="Waiting on dependencies" count={waiting.length}>
            {waiting.map((ticket) => {
              const unmet = unmetDependencies(ticket, byId);
              const missing = unresolvedDependencies(ticket, byId);
              const parts = [
                unmet.length > 0 && `waiting on ${unmet.map(ref).join(", ")}`,
                // A depends_on id with no row can never be satisfied, so the
                // ticket is stuck until a regeneration replaces it. Say so
                // rather than leaving it looking merely patient.
                missing > 0 &&
                  `${missing} prerequisite${missing === 1 ? "" : "s"} no longer exist${missing === 1 ? "s" : ""} — regenerate to clear`,
              ].filter(Boolean);
              return (
                <Row key={ticket.id} ticket={ticket} note={parts.join(" · ")} />
              );
            })}
          </Section>

          <Section title="Blocked" count={blocked.length}>
            {blocked.map((ticket) => (
              <Row
                key={ticket.id}
                ticket={ticket}
                note={ticket.blocked_reason ?? undefined}
              />
            ))}
          </Section>

          <Section title="Done" count={done.length}>
            {done.map((ticket) => (
              <Row key={ticket.id} ticket={ticket} />
            ))}
          </Section>
        </>
      )}
    </main>
  );
}
