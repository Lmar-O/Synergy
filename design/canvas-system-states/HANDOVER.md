# System states — handover

Canvas: https://claude.ai/code/artifact/7d712058-e3c8-4e98-af19-bb7f0dbf1e89
Artboards: `Main` (`app/loading.tsx`) · `LoadingForm` · `DataError` · `Error` ·
`NotFound`. Working files here; `node build.mjs` regenerates the five
`.dc.html` from `../system.css` + the `.body.html` fragments. Re-run it after
any `system.css` change.

This branch also ports the canvas into the app (design.md §9), which meant
building the shell the five states sit in. See "What shipped" below.

---

## A bug in `system.css`, fixed at the source

`.light { color: var(--text-light) }` collided with the artboard root,
`<div class="app {{theme}}">`: in light mode the theme value lands on the same
element as the utility, so every default-coloured string on every light
artboard rendered at `--text-light`. It affected all six artboards of the
Ticket View canvas too, not just this one.

Fixed with one scoped selector, `.light:not(.app)`. The utility is not used
anywhere yet, so nothing else moved. Re-seed any canvas built before this to
pick it up.

---

## Decisions

| # | Decision | Why |
|---|---|---|
| 1 | **Skeletons do not animate.** | §2 gives the only looping animation to `.ai-dot` — "the AI is working" — and a database read is not that. A shimmer would be a second loop and a false signal. The auth canvas reached the same conclusion independently; both now agree. |
| 2 | **Anything that is not data renders for real.** Header, segmented control, "Edit brief", the form headings. | Only the data-shaped regions become skeleton, at the shapes of what replaces them, so nothing re-flows on arrival. |
| 3 | **The raw failure is shown, but demoted.** Human sentence first; the machine half in a detail well underneath. | `error.digest` is the only string Next gives you in production and the one the server log indexes on. Hiding it costs the solo builder their only diagnostic; leading with it buries what actually happened. |
| 4 | **`error.tsx` keeps the header, drops the rail.** | The layout above the boundary resolved. The rail *is* the queue, and the queue is what failed. |
| 5 | **`not-found.tsx` is a client component.** | It gets no request object; `usePathname()` is the only way to show which address came up empty, which is usually how you spot a typo. |
| 6 | **404's tile is neutral, not peach.** | §2 gives peach to blocked work and errors. A wrong address is neither. |
| 7 | **The data error is not a stall card.** No icon tile, no 22px title, no `.btn-primary`. | A stall is the queue working and having nothing to hand over. This is the queue being unreadable. The difference is the whole message. |
| 8 | **"Regenerate queue" is disabled when the read failed.** | It retires every unstarted ticket. We cannot see them. |
| 9 | **`.btn-primary` on "Edit North Star" in the all-blocked stall → `.btn-dark`.** | A departure from the reference canvas. §3 reserves `.btn-primary` for generating a queue and nothing else. |
| 10 | **The Board segment is absent.** | `/app/board` does not exist. A third segment that 404s is worse than a two-segment control; `.seg` does not care how many items it holds. It joins when the route does. |

## Components added (candidates for §3 / `system.css`)

| Class | Anatomy |
|---|---|
| `.skel` | Skeleton fill on `--surface-2`. Radius follows the thing it stands for: a text bar ≤14px is `--radius-pill`, a taller bar or block takes the real element's own token (`.skel-block` → `--radius-sm`, `.skel-tile` → `--radius-md`), a glyph is `.skel-dot`. No animation (decision 1). |
| `.detail` / `.detail-val` | Detail well. `--surface-2`, `--radius-sm`, 10×12; a `.caption` label over a 12px mono value that wraps rather than truncates (§6.5). Carries a raw error message, an error digest, or a requested path. Same fill as `.skel` so the two read as one family. |
| `.inline-err` | §3 describes the inline error but `system.css` had no class. 10px gap, 12×14, `--radius-sm`, `--peach-soft` on `--peach-text`, alert icon. The auth canvas proposed the same name and anatomy; this is that class. |
| Neutral icon tile | The stall card's 40px tile with `--surface-2` / `--text-muted` instead of a status tint. Used by `not-found`. |
| `UnlinkIcon` | The `link` glyph with its two hooks pulled apart, same 16-grid and 1.75 stroke. |

---

## What shipped in code

Ported per §9: `design/system.css` → `src/app/globals.css`, scoped under
`.app`, dark on `prefers-color-scheme` rather than a class. Values verbatim;
`system.css` stays the source of truth.

**The five states**

- `src/app/app/(shell)/loading.tsx`
- `src/app/app/(shell)/error.tsx`
- `src/app/not-found.tsx`
- `src/app/onboarding/loading.tsx`, `src/app/app/north-star/loading.tsx`
- `src/components/queue-data-error.tsx` — replaces the inline
  `Could not load your tickets: {error.message}` paragraph

**The shell they sit in** — `app-header`, `queue-rail`, `app-toolbar`,
`stall-card`, `form-shell`, `skeleton`, `form-skeleton`, `app-icons`,
`try-again-button`; `ticket-card` and `north-star-form` restyled onto the
system, data flow unchanged.

### Structural changes worth knowing about

**`/app` is a route group now.** `src/app/app/(shell)/` holds the queue views
and owns the header; `/app/north-star` sits outside it because §4 gives the
North Star brief the form-page shell (bloom, borderless wordmark header, no
rail). URLs are unchanged — the build output still lists `/app`, `/app/queue`,
`/app/north-star`.

The header lives in `(shell)/layout.tsx` rather than per-page **on purpose**:
it resolves before a page suspends, which is what lets `loading.tsx` and
`error.tsx` show a real header above a skeleton or a failure.

**The root layout has no chrome.** It used to render a generic header behind a
pathname gate that every route bringing its own had to be added to. That list
can never cover `not-found.tsx` — a 404 renders inside the root layout and
nothing there can know a route 404'd, so the generic header stacked on top of
the real one. Every route now brings its own header, so `hide-on-landing.tsx`
(and the `app-header-gate.tsx` that replaced it on the auth branch) is gone.

**The queue shell has a definite height** (`100dvh`), not `flex: 1`. Against
the root layout's `min-h-full` body, `flex: 1` resolves to the content's own
height and the rail's footer leaves the viewport. Form pages are the opposite
case and flow normally — a seven-field brief is taller than 900px.

---

## Verified

`tsc --noEmit` and `eslint` clean (two pre-existing warnings in
`lib/actions/generate.ts`); `next build` passes. Every state was rendered at
1440×900 in light and dark through a temporary preview route — the app is
behind Clerk and signing in is not something I can do — and that route was
deleted before this commit.

## Open

- **`/app/queue` is inside the shell but its own markup is still Tailwind.**
  It gets the header, rail and toolbar and then a plain list. Restyling it is
  the Queue-view canvas's job (design.md §7-C).
- **`(shell)/loading.tsx` covers `/app/queue` too**, so that route briefly
  shows the Focus card skeleton. Right shape, wrong centrepiece. A
  `queue/loading.tsx` fixes it once the Queue view lands.
- **Two North Star reads per `/app` render** — one in `(shell)/layout.tsx` for
  the header, one in the page. Cheap and indexed, but it is two.
- **The auth pages are untouched here** and still carry their own wordmark;
  when that branch lands, `FormShell` and its copy of the shell should merge.
