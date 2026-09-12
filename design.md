# Synergy — App Design System

Source of truth for designing every view under `/app`, `/onboarding`, and auth.
Read this whole file before designing anything. The rules here override your
defaults; when this file and your taste disagree, this file wins.

**Files that travel with this doc**

| File | What it is |
|---|---|
| `design/system.css` | Every token and component class. Copy it whole into an artboard's `<style>`; never fork values. |
| `design/object-sans.woff2` | Subset display font (7.7 KB). Embed as a base64 `@font-face` data-URI in artboards. |
| `src/app/landing.css` | Where the light tokens come from. Read it if you need a value this file doesn't cover. |
| Reference canvas | **Synergy Ticket View** — https://claude.ai/code/artifact/e47890b8-ba1e-4ff3-96d9-9b3d01dbd865 — the Focus / Queue / Board views, card states, stall states, Tokens and Components sheets. Match it. |

---

## 1. Design Read

```yaml
artifact: product UI for a solo builder's AI-sequenced ticket queue
audience: one person mid-sprint; needs to see one thing to do and trust the sequencing
visual-language: soft-tint builder SaaS — the landing page's pastel oklch tints and
                 Object Sans, with Linear's operational grammar (rail, priority bars,
                 status glyphs) for patterns only — never Linear's colors or type
mode: extension of the landing system / overhaul of the current Tailwind scaffolding
visual-variance: 4    # stable grids, one asymmetric move max per view
motion-intensity: 3   # hover/focus + one short transition when state changes
information-density: 7 # operational, but each view has exactly one centerpiece
asset-dependence: 2   # type, tokens and structure carry it; only the logo mark is an asset
brand-fidelity: 9     # must look native beside the landing page
```

What the dials decide for you: no off-grid layouts; no scroll-driven or sequenced
motion; one primary object per screen with everything else subordinate; no
illustrations or imagery; **zero new hues**.

---

## 2. Tokens

All values live in `design/system.css` as CSS custom properties on `.app`; the
dark set is on `.app.dark`. Reference tokens as `var(--name)` — never paste raw
values into a component.

### Color

| Token | Light | Dark | Use |
|---|---|---|---|
| `--primary` | `oklch(60% .22 265)` | `oklch(70% .19 265)` | Active state, primary button, focus ring, logo mark |
| `--primary-hover` | `oklch(48% .22 265)` | `oklch(78% .16 265)` | Hover on primary |
| `--primary-soft` | `oklch(92% .08 265)` | `oklch(28% .08 265)` | Active chip bg, selected row bg, focus ring halo |
| `--primary-text` | `oklch(48% .22 265)` | `oklch(84% .11 265)` | Text on `--primary-soft` |
| `--mint` / `--mint-soft` / `--mint-text` | `72% .20 155` / `93% .07 155` / `48% .18 155` | `74% .18` / `26% .06` / `82% .14` | **Done** |
| `--peach` / `--peach-soft` / `--peach-text` | `82% .16 42` / `95% .06 42` / `52% .16 42` | `78% .15` / `27% .05` / `84% .11` | **Blocked**, errors, urgent priority |
| `--yellow-soft` / `--yellow-text` | `94% .12 95` / `52% .16 90` | `27% .06` / `85% .12` | **Queued** |
| `--lime-soft` / `--lime-text` | `94% .09 130` / `50% .20 130` | `27% .07` / `84% .16` | Spare accent — unused so far; don't reach for it without a reason |
| `--bg` | `#fff` | `oklch(15% .012 265)` | Page / main pane |
| `--rail` | `oklch(98% .01 265)` | `oklch(17% .012 265)` | Left rail |
| `--card` | `#fff` | `oklch(19.5% .012 265)` | Cards, popovers, active segment |
| `--surface` | `oklch(98% .01 265)` | `oklch(19.5% .012 265)` | Recessed areas: form footers, board columns, states sheets |
| `--surface-2` | `oklch(96% .015 265)` | `oklch(23% .014 265)` | Segmented control track, count pills, progress track |
| `--text` / `--text-muted` / `--text-light` | `#0d0d10` / `#6b6b80` / `#9898aa` | `96%` / `72%` / `56%` @ `.02 265` | Three levels only. There is no fourth. |
| `--border` / `--border-strong` | `rgba(0,0,0,.08)` / `.14` | `rgba(255,255,255,.08)` / `.15` | Dividers / inputs, outline buttons, unfilled priority bars |
| `--on-dark` | `#fff` | `oklch(15% .012 265)` | Glyph on a filled status circle |
| `--bloom-warm` | `oklch(76% .18 345 / .34)` | `… / .22` | Bloom layer, form pages only — see below |
| `--bloom-cool` | `oklch(80% .14 220 / .26)` | `… / .17` | Bloom layer, form pages only — see below |

**The bloom washes are the one exception to "no new hues"** (§6.1) **and to
"no gradients"** (§6.2). They are not palette: they are the landing page's own
background, lifted verbatim from `src/components/landing-bloom.tsx` (its
`bloom-1` and `bloom-3` stop lists sampled at scroll progress 0) so that the
pages either side of the sign-in door look like one product. Do not invent a
third wash, do not reuse these hues on anything else, and do not put them
behind a view that has a rail.

**Semantic status mapping — fixed, do not remap:**
`queued → yellow` · `active → primary` · `done → mint` · `blocked → peach`.
Waiting-on-dependency is *queued with a dashed ring*, not a fifth color.

### Typography

| Role | Face | Size / weight | Where |
|---|---|---|---|
| Page title | Object Sans | 32 / 400 / lh 1.15 | Tokens & Components sheets, form pages |
| Ticket title | Object Sans | 28 / 400 / lh 1.2 (→ **36** in v1, see §7) | Focus card |
| Empty-state title | Object Sans | 22 / 400 / lh 1.25 | Stall cards |
| Section heading | Object Sans | 16 / 400 | Rail heading, design-system row labels |
| Wordmark | Object Sans | 17 / 400 | App header |
| Body-lg | system-ui | 15 / 400 / lh 1.6 | Ticket body, form helper text |
| Body | system-ui | 14 / 400 | Rows, criteria, inputs, buttons |
| Body-sm | system-ui | 13 / 400–500 | Rail rows, small buttons, segmented control |
| Meta | system-ui | 12 / 400 | Estimates, notes, dependency lines |
| Caption | system-ui | 10 / 600 / 0.08em tracked / uppercase / `--text-light` | Section labels ("NOW", "ACCEPTANCE CRITERIA") |
| Mono | ui-monospace | 12 / 0.02em | Ticket refs (`SYN-004`) — and nothing else |

Object Sans has one weight (400). Emphasis in display text is size, never weight.
`letter-spacing: -0.01em` on all Object Sans. Body faces never appear above 15px.

### Spacing, radius, elevation

- **Spacing scale**: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40. Card padding 28 (landing's value). Rail is 320px wide. Focus card max-width 760; queue list max-width 880.
- **Radius**: `--radius-sm` 8 (inputs, rows, inline messages) · `--radius-md` 14 (ticket cards, list containers, board columns, icon tiles) · `--radius-lg` 20 (focus card, stall cards) · `--radius-xl` 28 (landing only) · `--radius-pill` 999 (buttons, chips, segmented control, count pills).
- **Elevation**: `--shadow-card` on any card sitting on `--bg` · `--shadow-float` for future overlays/popovers only · `--ring-primary` (2px soft + 1px primary) for the selected board card and focused inputs. Never a border *and* a card shadow on the same element unless the shadow token already includes its ring.

### Motion

- 150 ms `ease` on hover, press, and color changes (landing's `transition: all .15s`).
- ~250 ms fade + 8px slide-up when a new object takes a slot (next ticket into Focus, a saved form's confirmation).
- `.ai-dot` pulse (2 s) is the only looping animation; use it for "the AI is working", nowhere else.
- Honor `prefers-reduced-motion`: keep opacity fades, drop translations.

---

## 3. Components (all in `design/system.css`)

| Class | Anatomy | Notes |
|---|---|---|
| `.btn` + `.btn-dark` | pill, 14/600, 9×20 padding, `--text` bg, `--bg` text | **Default action** ("Mark done", "Save"). Inverts in dark. |
| `.btn-primary` | violet bg, white text, violet glow | **Reserved for generating a queue.** Nothing else is primary. |
| `.btn-outline` | transparent, `--border-strong` | Secondary ("Blocked", "Regenerate queue") |
| `.btn-ghost` | transparent, no border | Tertiary / navigation ("Edit brief", "Cancel") |
| `.btn-sm` / `.btn-xs` | 13/7×14 · 12/5×12 | Size modifiers |
| `.is-disabled` | opacity .5 | Busy or unavailable. Pair with `I.spinner` + progressive label ("Saving…") |
| `.chip` + `.chip-{queued,active,done,blocked}` | pill, 11/600, 2×8, soft bg + deep text | Status only |
| `.chip-neutral` / `.chip-outline` | `--surface-2` / bordered | Version chip ("North Star v3"), dependency refs |
| Status glyphs | 16px circle: queued (stroke) · waiting (dashed) · active (stroke + dot) · done (filled mint + check) · blocked (stroke + slash) | Shared by rail, queue, board, and tokens sheet |
| Priority | 4 signal bars; p1 fills 4 in peach, p2–4 fill 3/2/1 in `--text-muted`, p5 empty | Labels Urgent / High / Medium / Low / None. Secondary cue — never colors the row |
| `.seg` / `.seg-item` / `.on` | pill track on `--surface-2`, active item is a `--card` with `--shadow-card` | View switcher |
| `.row` / `.row.on` | rail row: glyph · mono ref · title · est | Selected = `--primary-soft`. **Wrap, don't truncate** (v1 rule). |
| `.qrow` / `.qrow-note` | queue row: glyph · ref (60px col) · title + note · priority · est · chevron | Inside a `--card` container with `--radius-md` |
| `.bcard` / `.bcard.on` | board card: ref + priority / title / meta | Active gets `--ring-primary` |
| `.card` | `--card` bg, `--radius-lg`, `--shadow-card` | Focus card, stall cards, form cards |
| `.ac` | acceptance-criteria line: hollow circle + text | Static; not a checkbox unless the feature exists |
| `.textarea` / `.textarea.focus` | 1px `--border-strong`, `--radius-sm`, 10×14; focus = primary border + 3px `--primary-soft` halo | Same recipe for `<input>` |
| Inline error | 10px gap, 12×14, `--radius-sm`, `--peach-soft` bg, `--peach-text`, alert icon | Never a modal or toast for a failed action |
| `.prog` | 6px track on `--surface-2`; segments mint (done) → primary (active) → peach (blocked) | Same order as rail sections |
| Stall card | `.card`, 36×32 padding, 40px icon tile (`--radius-md`, `{tint}-soft` bg), 22px title, 14 muted body, one `.btn-primary` + one `.btn-ghost` | Four variants exist: empty / all-done / all-blocked / dependency-wait |
| `.bloom-layer` | two 520×440 circles, `blur(100px)`, `--bloom-warm` off the top-left corner, `--bloom-cool` off the bottom-right; absolutely positioned, `pointer-events: none`, behind everything | **Form pages only** (§4). Static — there is no scroll here to drift them, and §2 Motion reserves the only loop for `.ai-dot` |
| App header | 56px, 1px bottom border, 28px logo tile (`--primary`, radius 8, white 4-point star) + "Synergy" 17px Object Sans; right: product name 13 muted · version `.chip-neutral` · 28px avatar | Identical on every authenticated page |

**Icons**: inline SVG, 16×16 grid, `stroke-width 1.75`, round caps/joins, `stroke="currentColor"`, colored via `style="color: var(--…)"`. The existing set: check, target, list, columns, chevron, arrow, link, refresh, pencil, clock, alert, star, spinner, x, inbox, flag, user. Draw new ones in the same style; **no emoji, no icon fonts, no dingbats**. The four-point star is the brand mark and is the only icon that ever fills rather than strokes.

---

## 4. Layout shell

```
┌──────────────────────────────────────────────────────────────┐
│ header 56px — wordmark ··· product · version chip · avatar   │
├──────────────┬───────────────────────────────────────────────┤
│ rail 320px   │ toolbar 16×32 — [Focus|Queue|Board] … Edit brief │
│ --rail bg    │                                               │
│ Queue + prog │   main pane, --bg, scrolls                    │
│ NOW          │   one centerpiece (card / list / board)       │
│ UP NEXT      │   max-width 760 (card) · 880 (list) · full (board) │
│ BLOCKED      │                                               │
│ DONE         │                                               │
│ regenerate   │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

Frame: **1440 × 900**. Views without a queue (North Star form, auth, system
states) drop the rail and center their content at the same max-widths.
Mobile is out of scope for now.

### Form pages

Sign-in, sign-up and the North Star brief share one shell. So does anything
else that is a single centered card with no queue behind it.

```
┌──────────────────────────────────────────────────────────────┐
│ ◜ warm bloom                                                 │
│  ▪ Synergy      ← 56px, wordmark only, NO bottom border      │
│                                                              │
│                  ┌──────────────────┐                        │
│                  │  .card, 28px pad │  ← centered in the     │
│                  │  title · fields  │    space below the     │
│                  │  .btn-dark       │    header              │
│                  └──────────────────┘                        │
│                        note ·  cool bloom ◟                  │
└──────────────────────────────────────────────────────────────┘
```

- **`.bloom-layer` behind everything**, on `--bg`. This is what makes a form
  page read as continuous with the landing.
- **Header keeps §3's 56px and 28px tile but drops the bottom border** and the
  right-hand chrome: a rule across the top cuts the bloom in half, and there is
  no product/version/avatar to show to someone who isn't signed in yet.
- **Card centered in the space below the header**, not in the full frame.
  Width is the form's own (400 for Clerk's card; 760 for the North Star brief).
- Primary action is **`.btn-dark`** — `.btn-primary` stays reserved for
  generating a queue.
- At most one muted line under the card. Reuse landing copy where it exists.

---

## 5. Copy tone

Plain, second person, no exclamation marks, no emoji. Buttons are verbs
("Mark done", "Skip this ticket", "Save new version"). Helper text explains
consequences, not features ("Blocked tickets are set aside for good — regenerate
the queue later to re-sequence around them"). Errors say what happened and what
survives ("Couldn't mark this ticket done — the request timed out. Your work
isn't lost; try again."). Existing product copy in `src/` is canonical — reuse
it before writing new lines.

---

## 6. Hard rules

1. **No new hues.** Every color is a token above. Need a color you don't have? You don't. *(The `--bloom-*` washes are the exception, and only inside `.bloom-layer` on a form page — §2, §4.)*
2. **No gradients** except the landing's North Star header gradient (`--primary → oklch(62% .22 285)`), and only if §7 approves it, and the `.bloom-layer` washes on form pages.
3. **No emoji, no illustration, no stock imagery, no SVG-drawn scenes.** Missing icon → draw it in the set's style. Missing image → there is no image.
4. **No rounded-card-with-left-border-accent, no purple→pink, no Inter/Roboto.**
5. **No truncation.** Text wraps. If it can't, the layout is wrong.
6. **No fabricated data.** Sample content is the "Ledgerly" invoicing queue from the reference canvas (tickets SYN-001…009, North Star v3). Reuse it so every view tells the same story.
7. **Every actionable element has states**: default / hover / focus / disabled / loading, plus empty and error where the scenario has them.
8. **Light and dark both.** Author on `.app`, verify on `.app.dark`. A Theme tweak (enum light/dark) on every artboard.
9. **Deletion test** before you ship: remove an element; if nothing gets worse, it's gone.
10. **Extension fidelity**: new UI should be indistinguishable from the reference canvas. If you invent a component, add it to §3 in your handover so it can be merged here.

---

## 7. Decisions (resolved — do not reopen)

| # | Decision | Outcome |
|---|---|---|
| A | Header grammar | **56px header + segmented control.** The landing's pill-link nav is not used in the app. |
| B | North Star gradient band on the Focus card | **No band.** The Focus card stays plain. |
| C | Queue tab depth, given the rail always shows the whole queue | **The Queue tab must show what the rail can't**: dependency lines, blocked reasons, priority, estimates per section — not a second copy of the row list. |
| D | Ticket title 36px; rail rows wrap to two lines | **Approved.** Apply wherever these appear. |
| E | Rail scope | **Whole queue** (Now / Up next / Blocked / Done). |
| F | Mobile | **Deferred.** Desktop 1440 × 900 only. |
| G | Fidelity of canvases | **Static mockups.** Canvases are design guidelines; the views are then built in code from them (see §9). |
| H | Whether the landing's bloom washes carry into the app | **Yes, on form pages only** (§4) — two washes on a diagonal, behind sign-in, sign-up and the North Star brief. Not behind any view with a rail. |

## 8. How to deliver (for parallel agents)

1. Invoke `/web-design-engineer` and `/design`. Skip the direction exploration and the design-system checkpoint — **this file is the confirmed system**. Go straight to the v0 → build.
2. Build a design canvas with the `/design` skill. Artboards at 1440 × 900 unless the prompt says otherwise. Name artboards by view and state (`Main.dc.html` = the default state; `Error.dc.html`, `Submitting.dc.html`, …). One canvas per prompt.
3. Paste `design/system.css` into every artboard's `<helmet><style>`, swapping the `@font-face` `url(./object-sans.woff2)` for a base64 data-URI of `design/object-sans.woff2` (`base64 -i design/object-sans.woff2`). Root element: `<div class="app {{theme}}">` with a `theme` enum tweak.
4. Use the sample data in rule 6 and the copy in `src/` verbatim where it exists.
5. Handover: the canvas link, one paragraph on what you assumed, and a list of any component you had to invent (anatomy + tokens used).
6. Run the skill's 5-dimension critique on your own work before handing over; fix anything under 7.

---

## 9. From canvas to code

The canvases are the spec, not the product. When implementing a view:

- Port `design/system.css` tokens into `src/app/globals.css` as CSS custom properties on the app shell (light on `:root`/`.app`, dark under the existing `dark:` strategy), then reference them from Tailwind via arbitrary values or `@theme` — don't re-type oklch values in class names.
- Object Sans is already loaded via `next/font/local` in `src/app/page.tsx`; lift it to the root layout so `/app` can use `var(--font-object-sans)`.
- Reuse the existing components (`ticket-card.tsx`, `north-star-form.tsx`, `generate-tickets-button.tsx`) and server actions; restyle, don't rewrite the data flow.
- Match the canvas pixel-for-pixel where it's specified; where it's silent, fall back to §2–§3.

