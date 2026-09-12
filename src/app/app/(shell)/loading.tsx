import { RefreshIcon } from "@/components/app-icons";
import { AppToolbar } from "@/components/app-toolbar";
import { RailShell } from "@/components/queue-rail";
import { Skel, SkeletonRegion } from "@/components/skeleton";

/**
 * /app while the ticket read is in flight.
 *
 * The rule this follows: anything that is not data renders for real. The
 * header comes from `app/layout.tsx`, which has already resolved; the
 * segmented control and "Edit brief" are chrome that exists whatever the query
 * returns. Only the two data-shaped regions — the rail's queue and the Focus
 * card — become skeleton, at the shapes of the components that replace them.
 *
 * The section groups mirror the real rail (Now / Up next / Blocked / Done) so
 * the column does not re-flow when the rows arrive. The progress track is a
 * real empty `.prog`: at this moment the counts genuinely are unknown, and an
 * empty track says so more honestly than a grey bar pretending to be one.
 */

const SECTIONS = [
  { caption: 30, rows: [{ second: 44 }] },
  { caption: 48, rows: [{ second: 32 }, {}, { second: 58 }, {}] },
  { caption: 42, rows: [{}] },
  { caption: 34, rows: [{ second: 36 }, {}, {}] },
];

function RailRowSkeleton({ second }: { second?: number }) {
  return (
    <div className="row" style={{ alignItems: "flex-start" }}>
      <Skel shape="dot" w={16} h={16} style={{ marginTop: 2 }} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Skel w={46} h={9} />
          <Skel h={9} />
        </span>
        {second !== undefined && <Skel w={`${second}%`} h={9} />}
        <Skel w={24} h={8} />
      </span>
    </div>
  );
}

export default function AppLoading() {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <RailShell>
        <div
          style={{
            padding: "20px 20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Skel w={52} h={11} />
            <Skel w={116} h={9} />
          </div>
          <div className="prog" />
        </div>

        <SkeletonRegion
          label="Loading your queue"
          style={{
            flex: 1,
            overflow: "hidden",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {SECTIONS.map((section, index) => (
            <div
              key={index}
              style={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Skel
                w={section.caption}
                h={8}
                style={{ margin: "0 12px 6px" }}
              />
              {section.rows.map((row, rowIndex) => (
                <RailRowSkeleton key={rowIndex} second={row.second} />
              ))}
            </div>
          ))}
        </SkeletonRegion>

        <div
          style={{
            padding: 16,
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            disabled
            className="btn btn-outline btn-sm"
            style={{ width: "100%" }}
          >
            <RefreshIcon />
            Regenerate queue
          </button>
        </div>
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
        <AppToolbar active="focus" />

        <div
          style={{
            flex: 1,
            overflow: "hidden",
            padding: "32px 32px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <SkeletonRegion
            label="Loading your next ticket"
            className="card"
            style={{
              width: "100%",
              maxWidth: 760,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                padding: "28px 28px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Skel w={58} />
                <Skel w={56} h={18} />
                <Skel w={44} />
                <Skel w={26} />
                <Skel w={132} style={{ marginLeft: "auto" }} />
              </div>
              {/* The 36px title (design.md §7-D) at its cap height. */}
              <Skel shape="block" w="62%" h={26} />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <Skel w="100%" />
                <Skel w="96%" />
                <Skel w="57%" />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: "24px 28px",
              }}
            >
              <Skel w={118} h={8} />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {["84%", "71%", "89%", "52%"].map((width) => (
                  <div
                    key={width}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Skel shape="dot" w={16} h={16} />
                    <Skel w={width} />
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "20px 28px 24px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <Skel w={132} h={38} />
              <Skel w={104} h={38} />
            </div>
          </SkeletonRegion>
        </div>
      </main>
    </div>
  );
}
