<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Synergy

Read this file before writing code. It is the shared brief for every agent and every
editor — Claude Code loads it through `CLAUDE.md`, Cursor loads it directly and through
`.cursor/rules/synergy.mdc`. Anything an agent needs to know about this project belongs
here, not in a tool-specific file.

## What it is

Synergy turns a founder's "North Star" (project brief + current milestone) into a
sequenced queue of engineering tickets, and shows them one at a time. You set the North
Star, generate tickets from it, then work the queue — mark done, or mark blocked with a
reason. Currently finishing an MVP build sequence.

## Stack and commands

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Clerk (auth) ·
Supabase/Postgres (data + RLS) · Gemini via the `openai` SDK (ticket generation).

```bash
npm run dev     # next dev — port 3000
npm run build   # next build
npm run lint    # eslint
```

There is **no test runner**. Don't write test files expecting `npm test` to exist, and
don't add one as a drive-by — it is a deliberate post-MVP item. Verify behaviour by
running the app.

Environment variables are documented in `.env.example`; real values live in
`.env.local` (untracked). Never print, copy, or commit their values.

## Where things live

| Path | What |
| --- | --- |
| `src/app/**` | Routes. `/` landing, `/app` queue, `/app/north-star`, `/onboarding`, `/sign-in`, `/sign-up` |
| `src/components/**` | Client components (ticket card, forms, buttons) |
| `src/lib/actions/**` | Server Actions — the only place writes happen |
| `src/lib/queue.ts` | Pure dependency-gating / ordering logic. No I/O, no Supabase |
| `src/lib/tickets.ts` | Zod schema the model's output is validated against |
| `src/lib/supabase/**` | Request-scoped client (`server.ts`) and generated `types.ts` |
| `supabase/migrations/**` | Timestamped SQL. Append-only |
| `design/**`, `design.md` | Source design + notes for the landing page |

## Invariants — get these wrong and things fail silently

- **Auth flows through the Clerk session token into Supabase RLS.** Every policy keys
  off `auth.jwt() ->> 'sub'`. No token means no `sub` means every policy denies — a
  signed-in user's queries come back *empty*, not erroring. If rows are missing, suspect
  the token before the query. This uses Supabase's native Third-Party Auth path; do not
  reach for the deprecated `getToken({ template: "supabase" })` JWT template.
- **Create a new Supabase client per request** via `createServerSupabaseClient()`.
  Never hoist one to module scope — it would pin one user's token.
- **`src/lib/queue.ts` stays pure.** It takes whatever set of tickets it is handed and
  orders them. Deciding which tickets are live (the `superseded_at` filter) is the
  caller's query, deliberately.
- **Blocking a ticket is a one-way door.** There is no unblock action, by design. A
  queue where everything is blocked dead-ends and the empty state says so; recovery is
  regenerating. `blocked_reason` is stored from day one to build the labelled corpus
  that Phase 2 AI re-sequencing will be designed against. **Do not add an unblock button
  as a drive-by fix** — it competes with that design.
- **Ticket generation is Gemini behind the `openai` SDK** (OpenAI-compatible endpoint,
  `zodResponseFormat` strict schemas). Only the base URL, key, and model differ. Don't
  "correct" it to an OpenAI client, and don't swap in a Google SDK.
- **Migrations are append-only.** Never edit a migration that already exists — it may be
  applied in someone's database. Add a new timestamped file, generating the timestamp at
  the moment you create it.

## Known debt — noted on purpose, do not fix in passing

- The landing nav declares `position: sticky` but never sticks: the design's own
  `> *:not(.bloom-layer) { position: relative }` rule wins on specificity. Ported
  faithfully from the v0 design, bug included. Fixing it changes the design's behaviour,
  so confirm intent first.
- Landing copy is AI-drafted and unreviewed; the Solo tier copy is unresolved and ~18
  links still point at `#`.
- `src/app/fonts/object-sans.ttf` is a third-party display font, committed and served.
  Its web license has not been confirmed — settle before launch.
- Mobile CTA wrapping, an unused Geist preload, and a pathname-based header gate that
  should probably be a route group.

## Working agreement

When you spot a gap mid-task, **write it down and keep going**. Don't fix it inline and
don't widen the current step. List deferred items plainly at the end of your turn. The
build sequence is ordered deliberately; detouring to polish scaffolding steals time from
the parts that actually need it.

## Parallel agents

Multiple agents may be working in this repo simultaneously, possibly across different
editors. These rules exist so they don't fight each other.

### Stay in your lane

Each agent gets a scope and edits only inside it:

| Scope | Owns |
| --- | --- |
| frontend | `src/app/**` (pages, layouts, CSS), `src/components/**`, `public/**` |
| backend | `src/lib/**`, `src/app/api/**` |
| database | `supabase/**`, `src/lib/supabase/types.ts` |
| design/docs | `design/**`, `design.md`, `README.md` |

Shared files — `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
`src/app/layout.tsx`, `src/app/globals.css`, `.env*`, `AGENTS.md` — belong to nobody.
Touch them only if your task requires it, keep the edit surgical, and say so in your
summary. Never reformat or reorder a shared file. If your task genuinely needs a file
outside your scope, say so and ask rather than reaching over.

### Build errors you didn't cause

**If you see a type error, build error, or lint error in a file you did NOT edit, do not
fix it.** Another agent is probably mid-edit. Wait 30 seconds and re-run the build. Only
if it still fails after a retry — and it blocks your own work — report it and ask.
Chasing other agents' transient errors is how cascading failure loops start.

`next build` and `tsc` see the whole tree, so a red build is not automatically your
problem. Check `git status` / `git diff` for whether the failing file is yours first.

### One dev server, one browser

- `next dev` runs on port 3000. **Do not start a second one, and do not kill or restart
  one you didn't start** — another agent is likely watching it. If port 3000 is busy,
  assume it's someone else's server and use it. Don't `kill -9` the port.
- Claude Code: use the `synergy-dev` config in `.claude/launch.json` via `preview_start`;
  it reuses a running server, which is the correct outcome.
- Each session drives its own browser. Never assume a tab you didn't open is still on the
  page you expect — re-navigate and re-read the page before clicking. Two gotchas that
  look like app bugs but aren't: a hidden/backgrounded pane reports a 0x0 viewport and
  pauses `requestAnimationFrame`, and element refs from a stale page read click nothing.

### Git hygiene

- **Never `git add -A` or `git commit -a`.** You will sweep up another agent's
  half-finished work. Stage explicit paths: `git add src/lib/queue.ts`.
- Never `git checkout`, `git stash`, `git reset`, or `git restore` files you didn't edit.
- Don't switch branches in the shared working tree — other agents are standing in it.
- For risky work touching shared code, use a **git worktree** so the change lands on an
  isolated copy and gets reviewed before merging.
- The `nextjs-agent-rules` block at the top of this file is rewritten by `next dev`.
  Leave it alone; if it shows as modified, commit it with your work rather than reverting.

### Leave a trail

With several agents running, nobody can reconstruct who did what. Append one line per
meaningful action to `.agent-log.md` (gitignored, local coordination only):

```
2026-09-12T14:03Z | backend | edited src/lib/queue.ts — added supersede guard
```

Append only; never rewrite or prune someone else's lines. Do this at the end of your
turn, not for every tool call.
