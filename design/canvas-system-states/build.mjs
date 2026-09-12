// Emits the .dc.html artboards for the "Synergy System States" canvas.
//
// Every artboard shares one <helmet> block: design/system.css verbatim (with
// the @font-face url swapped for a base64 data-URI of design/object-sans.woff2)
// plus the three primitives these views add — .skel, .detail, .err. Editing the
// system means editing design/system.css, never a copy in here.
//
//   node design/canvas-system-states/build.mjs

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

/* Three additions to §3, all built from existing tokens. See HANDOVER.md. */
const additions = `
/* --- Skeleton primitive -------------------------------------------------
   One fill (--surface-2, the system's recessed tone) standing in for content
   that has not arrived. Radius follows the thing it stands for: a text bar
   14px or shorter is a pill, a taller bar or a filled block takes the real
   element's own radius token, a glyph is a circle. No animation: design.md §2
   reserves looping motion for .ai-dot ("the AI is working"), which a database
   read is not. */
.skel { background: var(--surface-2); flex-shrink: 0; }
.skel-line { border-radius: var(--radius-pill); }
.skel-block { border-radius: var(--radius-sm); }
.skel-tile { border-radius: var(--radius-md); }
.skel-dot { border-radius: 50%; }
.skel-pill { border-radius: var(--radius-pill); }

/* --- Inline error (design.md §3) ---------------------------------------- */
.err { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-sm); background: var(--peach-soft); color: var(--peach-text); font-size: 13px; line-height: 1.45; }

/* --- Detail well --------------------------------------------------------
   The machine-readable half of a failure — a raw error message, a requested
   path — demoted below the human sentence. Same fill as .skel so the two read
   as one family; wraps rather than truncates (hard rule 5). */
.detail { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--surface-2); }
.detail-val { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; color: var(--text-muted); line-height: 1.5; overflow-wrap: anywhere; }
`;

const shell = (body) => `<!doctype html>
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
<script data-dc-script data-props='{"theme":{"editor":"enum","options":["light","dark"],"default":"light","section":"Theme"},"$preview":{"width":1440,"height":900}}'>
class Component extends DCLogic {
  renderVals() { return { theme: this.props.theme ?? 'light' }; }
}
</script>
</body>
</html>
`;

for (const name of readdirSync(here)) {
  if (!name.endsWith(".body.html")) continue;
  const artboard = name.replace(".body.html", ".dc.html");
  const body = readFileSync(join(here, name), "utf8").trimEnd();
  writeFileSync(join(here, artboard), shell(body));
  console.log(`wrote ${artboard}`);
}
