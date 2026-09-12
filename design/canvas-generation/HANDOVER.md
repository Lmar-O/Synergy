# Ticket-generation flow — handover

**Canvas:** https://claude.ai/code/artifact/2ec0ac18-df81-49ff-be31-cd3d35191e18
**Artboards:** 5 × 1440 × 900, split layout (design.md §4), Ledgerly sample data,
Theme tweak (light/dark) on every one; `Reveal` also carries a Motion tweak
(`mid-entrance` / `settled`).

| Artboard | State |
|---|---|
| `Main.dc.html` | First generation in flight, from the `empty` stall. Rail empty and honest. |
| `Reveal.dc.html` | The queue lands. Frozen mid-entrance. |
| `Confirm.dc.html` | Regenerate pressed with 5 unstarted tickets. Inline confirmation in the rail footer. |
| `Regenerating.dc.html` | Regeneration in flight. Retiring rows faded, done/blocked solid, counts frozen. |
| `Failed.dc.html` | Model call failed. Queue intact, inline error, retry from both triggers. |

Source: `gen.mjs` composes the `.body.html` files, `build.mjs` wraps each in
`design/system.css` + the additions below. Re-run both, re-seed, republish.

## Assumptions

The one place I did not follow the brief: **`Reveal` puts SYN-001 in the Focus
slot, not SYN-004.** `Reveal` is the first generation landing, so nothing is
done — and `buildQueueView()` only surfaces a ticket whose `depends_on` are all
`done`. SYN-004 depends on SYN-003; it cannot be current until three tickets
finish. Showing it there would have made the rail lie about its own gating, and
"the rail must stay truthful in every frame" was the stronger instruction. SYN-001
is the dependency-free foundation ticket, so it is what the queue would actually
hand you. Everything past the two dependency-free tickets carries the dashed
waiting ring. If you want SYN-004 in Focus at reveal, the frame has to be a
regeneration landing on top of 3 done tickets — say the word and I'll rebuild it
that way.

**There is no staged status line, deliberately.** `generateTickets()` is one
blocking server action around a single non-streaming `chat.completions.create`.
The client observes `pending: true`, then `pending: false` with a message —
nothing in between. "Reading your North Star… Sequencing 9 tickets…" would be
invented, and the count is not known until the model has already answered. What
the wait shows instead is true when painted: the `.ai-dot`, the 10–30s
expectation (existing copy), elapsed seconds (the client's own timer, in the body
face — §2 gives mono to ticket refs only), and a static summary of what actually
went into the prompt. "Up to 10 tickets, 2–4 hours each" is the system prompt's
own cap, quoted, not guessed.

**Other assumptions, all cheap to change:**

- Ledgerly's milestone line ("Get an invoice from draft to paid without leaving
  the app") and SYN-001's body + acceptance criteria are invented in the sample's
  voice — `design/prompts.md` already sanctions inventing plausible Ledgerly
  field text. The 503 string on `Failed` is sample text in the shape Gemini
  returns; swap it for the real `error.message`.
- **Status appears where the trigger was.** The stall card's `.btn-primary` keeps
  its status in the card; the rail footer's `.btn-outline btn-sm` keeps its
  confirmation, working state and error in the rail footer. Both triggers share
  one pending state, so the idle one goes `.is-disabled` rather than staying live.
- On `Regenerating` the focus card's "Mark done" / "Blocked" are `.is-disabled`.
  That is a spec decision (acting on a ticket that is about to be retired is a
  race), not a description of current code — nothing disables them today.
- Past 30s the working line changes once — "Still working. This is slower than
  usual." — and nothing else moves. Not drawn; noted on the canvas.
- `Confirm` and `Regenerating` scroll the rail list by roughly one row at 900px
  (the reference canvas used 1000 for this reason). The `Done` section's later
  rows sit below the fold; the confirmation panel's own copy and the section tags
  carry the "kept" claim, so nothing load-bearing is hidden.

## Invented components

Four additions to design.md §3, all built from existing tokens. They live in
`build.mjs`'s `additions` block, commented, ready to merge into §3 and
`design/system.css`.

| Class | Anatomy | Tokens |
|---|---|---|
| `.work` | The inline-error slab geometry (flex, 10px gap, 12×14, `--radius-sm`, 13/1.45) in the **active** tone instead of the error one — a generation in flight is the active state, and §2 maps active → primary. Carries the `.ai-dot`. `.work-el` is the elapsed reading, pushed right, tabular-nums, 12px at .75 opacity. | `--primary-soft` bg, `--primary-text` fg, `--radius-sm` |
| `.note` | The same recipe with the alarm taken out: a consequence to read before acting that is not a failure. Exists so a warning-shaped sentence doesn't have to borrow the error colour to be noticed. | `--surface-2` bg, `--text-muted` fg, `--text-light` glyph, `--radius-sm` |
| `.tag` | A `.caption` pushed to the right of a rail section heading, naming what a pending regeneration does to that section ("Retires 4", "Kept"). Same 10/600/0.08em/uppercase as the heading it shares a line with; `--text-muted` on purpose — "retires" is not blocked and "kept" is not done, and §2's status mapping is fixed. | `--text-muted` |
| `.detail` / `.detail-val` | Carried over unchanged from the System States canvas: the raw model error, demoted below the human sentence. Wraps rather than truncates. | `--surface-2` bg, `--font-mono` 12/0.02em, `--text-muted` |

`.err` is design.md §3's documented inline error, written out here because it has
no class in `system.css` yet — worth adding as one.

Also drawn: the `spinner` icon §3 lists but the set didn't have — a 300° arc on
the same 16px / 1.75 / round-cap grid, spun by the existing `.spin`. It only
appears on a `.is-disabled` button while a request is in flight, so it is not a
second §2 looping animation competing with `.ai-dot`.

## Deferred

- `.claude/launch.json` gained one entry, `generation-canvas-preview` (port 4601,
  static server over the scratchpad) to screenshot the frames. Surgical addition
  to a shared file; delete it if you don't want it.
