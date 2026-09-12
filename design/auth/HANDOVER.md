# Auth canvas — handover

Canvas: https://claude.ai/code/artifact/fe4f75f5-c3a8-4102-88f4-48738d55db14
Artboards: `Main` (sign-in) · `SignUp` · `Error` (sign-in, wrong password) · `Loading`.
Working files here; `node build.mjs` regenerates the four `.dc.html` from
`../system.css` + `auth.css` + `parts.mjs`. Re-run it after any `system.css` change.

## Deliberate departures from design.md

| # | Departure | Why |
|---|---|---|
| 1 | ~~Bloom layer~~ | **Resolved — merged into the system.** `--bloom-warm` / `--bloom-cool` and `.bloom-layer` are in `system.css`; design.md §2, §3, §4 and §7-H now specify the form-page shell. No longer a departure. |
| 2 | **Header has no bottom border**, though §3 specifies one. Padding `0 20px` matches the reference canvases. | Auth is not the app shell, and a rule across the top cuts through the bloom layer. |
| 3 | **Card is 400px**, not §4's 760. | Clerk's own card width. §4's max-widths assume our own form layout. |
| 4 | **Google mark keeps its four brand hexes** (`#4285F4 #34A853 #FBBC05 #EA4335`) on an 18-grid multi-fill, against §3's 16-grid `currentColor` stroke rule. | It is a vendor asset Clerk renders, not palette. GitHub's mark is `currentColor`. |
| 5 | **Skeleton does not animate.** | §2 reserves the only looping animation for `.ai-dot`. If the system-states canvas decides skeletons may pulse, this should follow it. |

## Components added (candidates for §3 / system.css)

| Class | Anatomy |
|---|---|
| `.textarea.line` | single-line modifier on the `.textarea` recipe: `min-height:0; height:44px; padding:0 14px` |
| `.inline-err` | §3 describes this but `system.css` has no class. 10px gap, 12×14, `--radius-sm`, `--peach-soft` bg, `--peach-text`, alert icon |
| `.skel` / `.skel-line` | skeleton bar on `--surface-2`, `--radius-sm` (`.skel-pill` for buttons). `.skel-line` centres a bar in a box the height of the text it replaces, so a skeleton measures like the thing it stands in for |
| `.bloom-layer` (merged) | now in `system.css` — see design.md §3 / §4 |
| `.mark-lockup` / `.mark` | 28px `--primary` tile, radius 8, the canvas-v1 four-point star in `#fff`, + 17px Object Sans |
| `.clerk-card` | `.card` at 400px with 28px padding, footer bleeding to the card edge on `--surface` (`--bg` in dark) |

## Sample data

`lena@ledgerly.app` — consistent with the Ledgerly queue (§6.6). The sign-up footnote
is verbatim from `src/app/page.tsx`. The error string is Clerk's own
`form_password_incorrect`.

## Copy that needs `localization`, not `appearance`

Clerk's default header subtitles carry exclamation marks ("Welcome back! Please sign
in to continue"), which §5 forbids. Both subtitles on these artboards are rewritten
and need the `localization` prop to ship.

## Open

- **Should the `.textarea` recipe stay on `--card`?** The North Star form has seven of
  these fields. If auth and that form disagree about input background, the split shows.
