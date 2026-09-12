# View prompts for parallel design agents

One prompt per agent. Each is self-contained: paste it as the agent's first
message. Every prompt assumes the agent is running in the Synergy repo root.

**Order**: run prompt 5 (Ticket view v1) first and let it finish; then 1–4 in
parallel, so the shared rail and Focus card they reference are already at v1.

---

## 1 · North Star brief (onboarding + edit)

```
Design the North Star brief form for Synergy — the two pages `/onboarding` (first run) and `/app/north-star` (edit). Read `design.md` and `design/system.css` first; they are the confirmed design system. Invoke /web-design-engineer and /design, skip direction exploration and the design-system checkpoint, and build a design canvas.

What this view is: a 7-field form that the AI turns into a ticket queue. Fields, labels, placeholders and validation messages are canonical in `src/lib/north-star.ts` and the current markup is `src/components/north-star-form.tsx` — reuse that copy verbatim. `product_name` is single-line; the other six are multiline. Four are required (product name, core problem, tech stack, current milestone, success criteria); constraints and out-of-scope are optional. North Stars are append-only: saving from the edit page creates version N+1, and the page says so.

Layout: no rail (there's no queue yet on first run). Header from design.md §3 on both pages; on `/onboarding` the right side shows only the avatar. Content centered at max-width 760 in a `.card` with 28px padding, or an open layout if you can justify it — pick one and say why.

Artboards (1440 × 900 unless the content needs taller — give the frame the height it needs, don't clip):
- `Main.dc.html` — `/onboarding`, empty form, heading "What are you building?" + subline from the current page
- `Edit.dc.html` — `/app/north-star`, pre-filled with the Ledgerly v3 brief (invent plausible field text for Ledgerly, an invoicing tool for freelancers), heading "Edit your North Star", the "saving creates version 4" note, submit label "Save new version"
- `Validation.dc.html` — submitted with two required fields empty; inline field errors using the peach inline-error recipe, field borders in `--peach-text`, first error focused
- `Submitting.dc.html` — button disabled with spinner and "Saving…", fields read-only
- `Saved.dc.html` — the success beat before redirect to /app: what does a founder see for ~1 second after saving? Keep it to one small confirmation, not a page

Constraints: light and dark on every artboard (theme tweak). Every input needs default / focus / error / disabled states visible somewhere across the boards. No new components beyond §3 if you can help it; if you need a "field group" or "field hint" pattern, define it and list it in the handover.

Handover: canvas link, assumptions, invented components.
```

---

## 2 · Auth (sign-in / sign-up via Clerk)

```
Design the sign-in and sign-up pages for Synergy. Read `design.md` and `design/system.css` first; they are the confirmed design system. Invoke /web-design-engineer and /design, skip direction exploration and the design-system checkpoint, and build a design canvas.

Context: `src/app/sign-in/[[...sign-in]]/page.tsx` and `sign-up` render Clerk's `<SignIn/>` / `<SignUp/>` components centered on a blank page. We can't change Clerk's structure, only theme it through the `appearance` prop (variables + per-element classes). So the deliverable is two things: (1) the page shell around the Clerk card, and (2) a mockup of how the Clerk card itself should look once themed — email field, continue button, "or" divider, Google/GitHub buttons, footer link to the other flow.

Design intent: this is the door between the landing page and the app, so it should feel like the landing page's last section and the app's first. Wordmark top-left (28px violet tile + "Synergy" in Object Sans). Card uses `.card` on `--bg`, inputs use the `.textarea` recipe at single-line height (44px), the primary action is `.btn-dark` (not `.btn-primary` — that's reserved for generating a queue). Social buttons are `.btn-outline`. Error state uses the inline-error recipe.

Artboards, 1440 × 900:
- `Main.dc.html` — sign-in, default
- `SignUp.dc.html` — sign-up, default
- `Error.dc.html` — sign-in with a wrong-password error
- `Loading.dc.html` — Clerk's loading state (card skeleton) so the page never flashes blank

Also produce, in the handover, a `clerkAppearance` object sketch: which `variables` (colorPrimary, colorText, colorBackground, colorInputBackground, borderRadius, fontFamily) map to which tokens, and any `elements` overrides you needed. Keep it to what the mockup actually requires.

Light and dark on every artboard (theme tweak). Handover: canvas link, assumptions, the appearance sketch.
```

---

## 3 · Generation flow (generate / regenerate the queue)

```
Design the ticket-generation flow for Synergy. Read `design.md` and `design/system.css` first; they are the confirmed design system. Invoke /web-design-engineer and /design, skip direction exploration and the design-system checkpoint, and build a design canvas.

Context: `src/components/generate-tickets-button.tsx` is a single button that calls the Gemini-backed `generateTickets` server action; it takes 10–30 seconds and today shows only "Generating…" and a one-line note. Regeneration retires every unstarted ticket (queued + active), keeps done and blocked ones, and feeds them back into the prompt — that consequence is stated in the current /app page copy; reuse it. This is the only place `.btn-primary` is allowed.

The flow lives in the split layout from design.md §4 (rail + main pane). The trigger sits in two places: the rail footer ("Regenerate queue", `.btn-outline btn-sm`) and the stall cards' primary button ("Generate tickets", `.btn-primary`). Design what happens after the click.

Artboards, 1440 × 900, all in the split layout with the Ledgerly sample data:
- `Main.dc.html` — first generation in progress from the `empty` stall state: what does 10–30 seconds of waiting look like? Use the `.ai-dot` pulse; consider a staged status line ("Reading your North Star… Sequencing 9 tickets…") only if it's honest to what the backend does — check `src/lib/actions/generate.ts` and don't invent stages the code can't emit
- `Reveal.dc.html` — the moment tickets land: the rail fills, SYN-004 takes the Focus slot. Show the ~250ms entrance (design.md §2 Motion) as a frozen mid-state or annotate it
- `Confirm.dc.html` — regenerate pressed with 5 unstarted tickets: an inline confirmation (not a modal) that states what's retired and what's kept, with "Regenerate" (`.btn-dark`) and "Keep this queue" (`.btn-ghost`)
- `Regenerating.dc.html` — regeneration in progress: retired rail rows fade while done/blocked stay solid
- `Failed.dc.html` — Gemini call failed: the inline-error recipe in place, previous queue intact, retry available

Rules: no progress percentages (the backend can't report them), no confetti, no modal dialogs. The rail's progress bar and counts must stay truthful in every frame.

Light and dark on every artboard (theme tweak). Handover: canvas link, assumptions, invented components.
```

---

## 4 · System states (loading, error boundary, not found, data errors)

```
Design Synergy's system states — the screens Next.js shows via `loading.tsx`, `error.tsx`, and `not-found.tsx`, plus the in-page data-load error. Read `design.md` and `design/system.css` first; they are the confirmed design system. Invoke /web-design-engineer and /design, skip direction exploration and the design-system checkpoint, and build a design canvas.

Context: none of these files exist yet, so today the app shows Next's unstyled defaults. `/app/page.tsx` also has an inline "Could not load your tickets: {error.message}" paragraph that needs a real treatment. Every state must be built only from design.md §3 components — these are the pages people see when something's wrong, so they should be the calmest in the app.

Artboards, 1440 × 900:
- `Main.dc.html` — `app/loading.tsx`: the split layout with skeletons. Header real, rail and Focus card as skeleton blocks in `--surface-2` with the shapes of the real components (rail rows, card title, criteria lines, two pill buttons). No shimmer unless it's subtle and honors reduced motion
- `LoadingForm.dc.html` — `onboarding/loading.tsx` / north-star: the form skeleton
- `Error.dc.html` — `app/error.tsx`: a route error boundary inside the shell (header stays). One `.card` at max-width 560, 22px Object Sans title, muted body, "Try again" (`.btn-dark`, calls `reset()`) and "Back to queue" (`.btn-ghost`). Decide whether the raw error message is shown, and where
- `NotFound.dc.html` — `not-found.tsx`: no rail. Wordmark header, centered card. Title and body in the product's voice (design.md §5), one action back to `/app`
- `DataError.dc.html` — the `/app` page when tickets fail to load: rail shows the North Star header but an inline-error block where rows would be; Focus pane shows the same error, not a stall card

Sample copy: write it in the tone from design.md §5 — say what happened and what survives. No mascots, no illustrations, no "Oops".

Light and dark on every artboard (theme tweak). Handover: canvas link, assumptions, invented components (a skeleton primitive is expected — define its token and radius rules).
```

---

## 5 · Ticket view v1 (apply the critique)

```
Update the existing Synergy Ticket View canvas to v1. Read `design.md` and `design/system.css` first; they are the confirmed design system. Invoke /web-design-engineer and /design. The canvas is https://claude.ai/code/artifact/e47890b8-ba1e-4ff3-96d9-9b3d01dbd865 — read it back with the /design skill's update flow and edit in place; do not create a new canvas.

Apply exactly these changes, on every artboard where the element appears:
1. Focus card title: 28px → 36px Object Sans, line-height 1.15; body stays 15px muted; add `text-wrap: pretty` to the body. Push the card 24px further below the toolbar.
2. Rail rows: titles wrap to two lines instead of truncating; the estimate moves to a second line under the title in `--text-light` 12px.
3. Delete the "Sequenced from North Star v3" footer badge from the Focus card, and the duplicate "Stripe approval" chip from the blocked board card (the glyph already says blocked).
4. Normalize padding drift: anywhere a component uses 10 or 14 px inner padding that isn't from landing.css, move it to 12 or 16.
5. Progress bar segments in rail order: done (mint) → active (primary) → blocked (peach) — verify, don't assume.
6. Queue view (`Queue.dc.html`): per design.md §7-C, it must show what the rail can't. Redesign the main pane so it is not a second row list — surface the dependency chain per ticket (what it waits on, what waits on it), blocked reasons in full, priority and estimate per section, and section totals (hours remaining). Keep the `.qrow` recipe as the base; propose one layout and justify it in the handover.

Do NOT: change the header, replace the segmented control, add a gradient band, or touch the Tokens sheet's values (design.md §7 has settled these). Update the Components sheet so it shows the new rail row, the new title size, and any new Queue-view element.

Handover: the same canvas link, a before/after line per change, and anything you saw that the critique missed.
```

---

## Optional · Mobile pass (deferred — only if asked)

```
Design the 390 × 844 phone layout of the Synergy Focus view and the North Star form. Read `design.md` first. The rail collapses into a bottom sheet or a "Queue" tab; the Focus card fills the width with 20px gutters; the segmented control becomes a bottom tab bar. No fake status bar or keyboard. Light and dark. Deliver as a canvas with `Main.dc.html` (Focus), `Queue.dc.html` (rail as a sheet), `Brief.dc.html` (form).
```
