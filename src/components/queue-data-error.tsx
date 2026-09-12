import { AlertIcon } from "@/components/app-icons";
import { AppToolbar } from "@/components/app-toolbar";
import { RailFooter, RailHeader, RailShell } from "@/components/queue-rail";
import { TryAgainButton } from "@/components/try-again-button";

/**
 * The ticket read failed. The shell survives — header, rail frame, toolbar —
 * because none of it depended on the rows: only what goes inside them did.
 *
 * This is not a stall card. A stall is the queue working and having nothing to
 * hand over; this is the queue being unreadable, and the difference is the
 * whole message.
 */
export function QueueDataError({
  message,
  active = "focus",
}: {
  message: string;
  /** Which segment the failed view owns, so the control stays honest. */
  active?: "focus" | "queue" | "board";
}) {
  const emptyCounts = { total: 0, done: 0, blocked: 0, remaining: 0 };

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <RailShell>
        <RailHeader counts={emptyCounts} hasCurrent={false} unknown />
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            padding: "16px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <p className="inline-err" style={{ margin: 0 }}>
            <AlertIcon />
            <span>
              Couldn&rsquo;t load the queue. Your tickets are still there — the
              rail fills in as soon as the read comes back.
            </span>
          </p>
        </div>
        {/* Regenerating retires every unstarted ticket. We cannot see them, so
            it stays out of reach rather than acting on a queue we can't read. */}
        <RailFooter remaining={0} disabled />
      </RailShell>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}
      >
        <AppToolbar active={active} />
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "32px 32px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <section
            className="card"
            style={{
              width: "100%",
              maxWidth: 760,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              padding: 28,
            }}
          >
            <p className="inline-err" role="alert" style={{ margin: 0 }}>
              <AlertIcon />
              <span>
                Couldn&rsquo;t load your tickets — the database didn&rsquo;t
                answer.
              </span>
            </p>

            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--text-muted)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              Nothing has changed. Your tickets, your progress and your North
              Star are all still saved — this was a read that didn&rsquo;t come
              back, not a write that went wrong. Try again; if it keeps failing,
              the detail below is what to search for.
            </p>

            <div className="detail">
              <span className="caption">Error detail</span>
              <span className="detail-val">{message}</span>
            </div>

            <div style={{ paddingTop: 4 }}>
              <TryAgainButton />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
