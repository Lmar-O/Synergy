// Emits the .dc.html artboards for the "Synergy Ticket Generation" canvas.
//
// Every artboard shares one <helmet> block: design/system.css verbatim (with
// the @font-face url swapped for a base64 data-URI of design/object-sans.woff2)
// plus the four primitives this flow adds — .work, .note, .detail, .tag.
// Editing the system means editing design/system.css, never a copy in here.
//
//   node design/canvas-generation/build.mjs

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const design = join(here, "..");

const font = readFileSync(join(design, "object-sans.woff2")).toString("base64");
const system = readFileSync(join(design, "system.css"), "utf8").replace(
  "url(./object-sans.woff2)",
  `url(data:font/woff2;base64,${font})`,
);

/* Four additions to §3, all built from existing tokens. See HANDOVER.md. */
const additions = `
/* --- Working strip ------------------------------------------------------
   "The AI is working", stated in place. Same slab geometry as the §3 inline
   error (12x14, --radius-sm, 13/1.45) in the ACTIVE tone rather than the
   error one, because a generation in flight is the active state — §2 maps
   active -> primary. Carries the .ai-dot, which §2 reserves for exactly this.
   The elapsed reading on the right is the only honest moving number the
   backend affords (see HANDOVER.md); it is body-face meta, never mono —
   §2 gives mono to ticket refs and nothing else. */
.work { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--radius-sm); background: var(--primary-soft); color: var(--primary-text); font-size: 13px; line-height: 1.45; }
.work-el { margin-left: auto; font-size: 12px; color: var(--primary-text); opacity: 0.75; font-variant-numeric: tabular-nums; }

/* --- Neutral note -------------------------------------------------------
   The inline-error recipe with the alarm taken out: a consequence the user
   should read before acting, which is not a failure. --surface-2 ground,
   --text-muted type, --text-light glyph. Anything that IS a failure keeps
   the peach .err; this exists so a warning-shaped sentence does not have to
   borrow the error colour to be noticed. */
.note { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-sm); background: var(--surface-2); color: var(--text-muted); font-size: 13px; line-height: 1.45; }

/* --- Inline error (design.md §3) ---------------------------------------- */
.err { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-sm); background: var(--peach-soft); color: var(--peach-text); font-size: 13px; line-height: 1.45; }

/* --- Detail well (carried over from the System States canvas) -----------
   The machine-readable half of a failure — the raw model error — demoted
   below the human sentence. Wraps rather than truncates (hard rule 5). */
.detail { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--surface-2); }
.detail-val { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; color: var(--text-muted); line-height: 1.5; overflow-wrap: anywhere; }

/* --- Section tag --------------------------------------------------------
   A .caption pushed to the right of a rail section heading, naming what a
   pending regeneration will do to that section. Same 10/600/tracked/uppercase
   as the heading it shares a line with, and deliberately --text-muted rather
   than peach/mint: "retires" is not a blocked state and "kept" is not a done
   one, and §2's status mapping is fixed. */
.tag { margin-left: auto; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
`;

const shell = (body, props) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
${system}
${additions}
  </style>
</helmet>
${body}
</x-dc>
<script data-dc-script data-props='${props}'>
class Component extends DCLogic {
  renderVals() {
    const phase = this.props.phase ?? 'mid-entrance';
    const settled = phase === 'settled';
    return {
      theme: this.props.theme ?? 'light',
      enterOpacity: settled ? '1' : '0.78',
      enterShift: settled ? '0px' : '2px',
      enterLabel: settled ? 'settled — 250ms complete' : 'frozen at ~170ms of 250ms',
    };
  }
}
</script>
</body>
</html>
`;

const THEME = `"theme":{"editor":"enum","options":["light","dark"],"default":"light","section":"Theme"}`;
const PHASE = `"phase":{"editor":"enum","options":["mid-entrance","settled"],"default":"mid-entrance","section":"Motion"}`;
const SIZE = `"$preview":{"width":1440,"height":900}`;

for (const name of readdirSync(here)) {
  if (!name.endsWith(".body.html")) continue;
  const artboard = name.replace(".body.html", ".dc.html");
  const body = readFileSync(join(here, name), "utf8").trimEnd();
  const props = name.startsWith("Reveal")
    ? `{${THEME},${PHASE},${SIZE}}`
    : `{${THEME},${SIZE}}`;
  writeFileSync(join(here, artboard), shell(body, props));
  console.log(`wrote ${artboard}`);
}
