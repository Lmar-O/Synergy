import type { CSSProperties } from "react";

/**
 * The /app icon set — design.md §3: inline SVG on a 16×16 grid, stroke-width
 * 1.75, round caps and joins, `stroke="currentColor"` so colour comes from the
 * `color` property. No emoji, no icon font.
 *
 * The four-point star is the brand mark and the only icon that fills.
 */

type IconProps = {
  className?: string;
  style?: CSSProperties;
  /** Icons are decorative by default; pass a label to name one for a reader. */
  label?: string;
};

function Icon({
  className = "ico",
  style,
  label,
  children,
}: IconProps & { children: React.ReactNode }) {
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
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M8 1c.6 4 3 6.4 7 7-4 .6-6.4 3-7 7-.6-4-3-6.4-7-7 4-.6 6.4-3 7-7z"
        fill="currentColor"
        stroke="none"
      />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 8.5l3 3 6-7" />
    </Icon>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2.25" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 4.5h10M3 8h10M3 11.5h7" />
    </Icon>
  );
}

export function ColumnsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="3" width="3.2" height="10" rx="1" />
      <rect x="6.4" y="3" width="3.2" height="7" rx="1" />
      <rect x="10.8" y="3" width="3.2" height="10" rx="1" />
    </Icon>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.5l4.5 4.5L6 12.5" />
    </Icon>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </Icon>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75" />
      <path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 0 0 3.5 3.5l.75-.75" />
    </Icon>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 8a5 5 0 0 1-8.8 3.2M3 8a5 5 0 0 1 8.8-3.2" />
      <path d="M12 2v3h-3M4 14v-3h3" />
    </Icon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.5 2.5l3 3-7.5 7.5H3v-3z" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 2.5l6 11H2z" />
      <path d="M8 7v3M8 12h.01" />
    </Icon>
  );
}

export function SpinnerIcon({ className = "ico spin", ...rest }: IconProps) {
  return (
    <Icon className={className} {...rest}>
      <path d="M8 2a6 6 0 1 1-6 6" />
    </Icon>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 9.5V12a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V9.5" />
      <path d="M2.5 9.5h3l1 2h3l1-2h3" />
      <path d="M4.5 9.5l1-6h5l1 6" />
    </Icon>
  );
}

/* ---------------------------------------------------------------- status */

/**
 * design.md §2: the mapping is fixed — queued → yellow, active → primary,
 * done → mint, blocked → peach. "Waiting on a dependency" is not a fifth
 * colour; it is queued with a dashed ring.
 */
export type GlyphStatus = "queued" | "waiting" | "active" | "done" | "blocked";

const GLYPH_LABEL: Record<GlyphStatus, string> = {
  queued: "Queued",
  waiting: "Waiting on a dependency",
  active: "Active",
  done: "Done",
  blocked: "Blocked",
};

/** The 16px status circle shared by the rail, the queue and the board. */
export function StatusGlyph({
  status,
  labelled = false,
}: {
  status: GlyphStatus;
  /** Name the status for a screen reader — off where adjacent text says it. */
  labelled?: boolean;
}) {
  const label = labelled ? GLYPH_LABEL[status] : undefined;

  if (status === "done") {
    return (
      <Icon style={{ color: "var(--mint)" }} label={label}>
        <circle cx="8" cy="8" r="6.5" fill="currentColor" stroke="none" />
        <path d="M5 8.2l2 2 4-4.2" stroke="var(--on-dark)" strokeWidth="1.8" />
      </Icon>
    );
  }
  if (status === "blocked") {
    return (
      <Icon style={{ color: "var(--peach-text)" }} label={label}>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M4.2 4.2l7.6 7.6" />
      </Icon>
    );
  }
  if (status === "active") {
    return (
      <Icon style={{ color: "var(--primary)" }} label={label}>
        <circle cx="8" cy="8" r="5.5" />
        <circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none" />
      </Icon>
    );
  }
  return (
    <Icon style={{ color: "var(--text-light)" }} label={label}>
      <circle
        cx="8"
        cy="8"
        r="5.5"
        strokeDasharray={status === "waiting" ? "2.6 2.4" : undefined}
      />
    </Icon>
  );
}

/* -------------------------------------------------------------- priority */

/** design.md §3 — p1 Urgent fills four in peach, p2–p4 fill 3/2/1, p5 none. */
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

const BAR_GEOMETRY = [
  { x: 1, y: 11, h: 4 },
  { x: 5, y: 8, h: 7 },
  { x: 9, y: 5, h: 10 },
  { x: 13, y: 2, h: 13 },
];

/**
 * Four signal bars. A secondary cue only — priority never colours the row
 * itself, and only Urgent gets a hue of its own.
 */
export function PriorityBars({ priority }: { priority: number }) {
  const clamped = Math.min(Math.max(priority, 1), 5);
  const filled = 5 - clamped;
  const fill = clamped === 1 ? "var(--peach)" : "var(--text-muted)";

  return (
    <svg className="ico" viewBox="0 0 16 16" aria-hidden="true">
      {BAR_GEOMETRY.map((bar, index) => (
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

/** `SYN-004` — the mono ref, and the only place mono is used (design.md §2). */
export function ticketRef(number: number): string {
  return `SYN-${String(number).padStart(3, "0")}`;
}

/** "2.5h", never "2.5 hours" — and no trailing ".0". */
export function hours(value: number): string {
  return `${Number(value.toFixed(2))}h`;
}
