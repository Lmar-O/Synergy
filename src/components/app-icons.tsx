import type { Tables } from "@/lib/supabase/types";

/**
 * The icon set from design.md §3: inline SVG on a 16×16 grid, stroke-width
 * 1.75, round caps and joins, `stroke="currentColor"` so callers colour them
 * with `style={{ color: "var(--…)" }}`. No emoji, no icon font.
 *
 * The four-point star is the brand mark and is the only icon that fills.
 */

type IconProps = { className?: string; style?: React.CSSProperties };

function Svg({
  className = "ico",
  style,
  children,
  ...rest
}: IconProps & { children: React.ReactNode } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M8 1c.6 4 3 6.4 7 7-4 .6-6.4 3-7 7-.6-4-3-6.4-7-7 4-.6 6.4-3 7-7z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 8.5l3 3 6-7" />
    </Svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 8a5 5 0 0 1-8.8 3.2M3 8a5 5 0 0 1 8.8-3.2" />
      <path d="M12 2v3h-3M4 14v-3h3" />
    </Svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.5 2.5l3 3-7.5 7.5H3v-3z" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </Svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75" />
      <path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 0 0 3.5 3.5l.75-.75" />
    </Svg>
  );
}

/** The link icon with its two hooks pulled apart — drawn for `not-found`. */
export function UnlinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.2 8.8 5.4 10.6a2.6 2.6 0 0 1-3.7-3.7l1.8-1.8" />
      <path d="M8.8 7.2l1.8-1.8a2.6 2.6 0 0 1 3.7 3.7l-1.8 1.8" />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5l6 11H2z" />
      <path d="M8 7v3M8 12h.01" />
    </Svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 3.5l4.5 4.5L6 12.5" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 8H3M7 4L3 8l4 4" />
    </Svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2.25" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 4.5h10M3 8h10M3 11.5h7" />
    </Svg>
  );
}

export function ColumnsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="3.2" height="10" rx="1" />
      <rect x="6.4" y="3" width="3.2" height="7" rx="1" />
      <rect x="10.8" y="3" width="3.2" height="10" rx="1" />
    </Svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 9.5V12a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V9.5" />
      <path d="M2.5 9.5h3l1 2h3l1-2h3" />
      <path d="M4.5 9.5l1-6h5l1 6" />
    </Svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2a6 6 0 0 1 6 6" />
      <path d="M8 14A6 6 0 0 1 8 2" opacity="0.3" />
    </Svg>
  );
}

/* ---- Status glyphs (design.md §3) ---------------------------------------
   Shared by the rail, the queue and the focus card. `waiting` is queued with
   a dashed ring, not a fifth colour. */

export type GlyphStatus = Tables<"tickets">["status"] | "waiting";

const GLYPH_COLOR: Record<GlyphStatus, string> = {
  queued: "var(--text-light)",
  waiting: "var(--text-light)",
  active: "var(--primary)",
  done: "var(--mint)",
  blocked: "var(--peach-text)",
};

const GLYPH_LABEL: Record<GlyphStatus, string> = {
  queued: "Queued",
  waiting: "Waiting on a prerequisite",
  active: "Active",
  done: "Done",
  blocked: "Blocked",
};

export function StatusGlyph({ status }: { status: GlyphStatus }) {
  return (
    <svg
      className="ico"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: GLYPH_COLOR[status] }}
      role="img"
      aria-label={GLYPH_LABEL[status]}
    >
      {status === "done" ? (
        <>
          <circle cx="8" cy="8" r="6.5" fill="currentColor" stroke="none" />
          <path
            d="M5 8.2l2 2 4-4.2"
            stroke="var(--on-dark)"
            strokeWidth="1.8"
          />
        </>
      ) : (
        <>
          <circle
            cx="8"
            cy="8"
            r="5.5"
            strokeDasharray={status === "waiting" ? "2.6 2.4" : undefined}
          />
          {status === "active" && (
            <circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none" />
          )}
          {status === "blocked" && <path d="M4.2 4.2l7.6 7.6" />}
        </>
      )}
    </svg>
  );
}

/* ---- Priority (design.md §3) --------------------------------------------
   Four signal bars. p1 fills all four in peach; p2–4 fill 3/2/1 in
   --text-muted; p5 fills none. A secondary cue — it never colours the row. */

export const PRIORITY_LABEL = [
  "Urgent",
  "High",
  "Medium",
  "Low",
  "None",
] as const;

export function priorityLabel(priority: number): string {
  return PRIORITY_LABEL[Math.min(Math.max(priority, 1), 5) - 1];
}

export function PriorityBars({ priority }: { priority: number }) {
  const clamped = Math.min(Math.max(priority, 1), 5);
  const filled = 5 - clamped;
  const fill = clamped === 1 ? "var(--peach)" : "var(--text-muted)";
  const bars = [
    { x: 1, y: 11, h: 4 },
    { x: 5, y: 8, h: 7 },
    { x: 9, y: 5, h: 10 },
    { x: 13, y: 2, h: 13 },
  ];

  return (
    <svg
      className="ico"
      viewBox="0 0 16 16"
      role="img"
      aria-label={`${priorityLabel(clamped)} priority`}
    >
      {bars.map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width="3"
          height={bar.h}
          rx="1"
          style={{ fill: index < filled ? fill : "var(--border-strong)" }}
        />
      ))}
    </svg>
  );
}

/** `SYN-004` — the mono ticket ref (design.md §2). */
export function ticketRef(number: number): string {
  return `SYN-${String(number).padStart(3, "0")}`;
}

/** "2.5h", never "2.5 hours" — and no trailing ".0". */
export function hours(value: number): string {
  return `${Number(value.toFixed(2))}h`;
}
