import type { CSSProperties } from "react";

/**
 * The skeleton primitive. One fill — `--surface-2`, the system's recessed
 * tone — standing in for content that has not arrived.
 *
 * Radius follows the thing it stands for, which is why `shape` exists rather
 * than a radius prop: a text bar is a pill, a filled block takes the real
 * element's own radius token, a status glyph is a circle. Callers pick what
 * they are replacing, not what it should look like.
 *
 * Deliberately static. design.md §2 gives the only looping animation to
 * `.ai-dot` — "the AI is working" — and a database read is not that, so a
 * shimmer here would be a second loop and a false signal. A loading state
 * that holds still is also the calmer one, which is the brief for these
 * screens.
 */
export function Skel({
  w,
  h = 10,
  shape = "line",
  style,
}: {
  /** CSS width. A number is px; `undefined` fills the row via flex. */
  w?: number | string;
  h?: number | string;
  shape?: "line" | "block" | "tile" | "dot";
  style?: CSSProperties;
}) {
  const className =
    shape === "line"
      ? "skel"
      : shape === "dot"
        ? "skel skel-dot"
        : shape === "tile"
          ? "skel skel-tile"
          : "skel skel-block";

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "block",
        width: w ?? undefined,
        flex: w === undefined ? 1 : undefined,
        height: h,
        ...style,
      }}
    />
  );
}

/** A region that is standing in for content, announced once to screen readers. */
export function SkeletonRegion({
  label,
  children,
  className,
  style,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
