// Composes the five .body.html artboard sources for the ticket-generation
// canvas. The shell (system.css + the four additions) is build.mjs's job;
// this file is only the markup, factored so the split layout, the rail rows
// and the icon set are written once and the five frames differ only where
// the design differs.
//
//   node design/canvas-generation/gen.mjs && node design/canvas-generation/build.mjs

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------- icons */
const S = (d, extra = "") =>
  `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;

const icon = {
  star: (cls = "ico") =>
    `<svg class="${cls}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1c.6 4 3 6.4 7 7-4 .6-6.4 3-7 7-.6-4-3-6.4-7-7 4-.6 6.4-3 7-7z" fill="currentColor" stroke="none"></path></svg>`,
  refresh: S(`<path d="M13 8a5 5 0 0 1-8.8 3.2M3 8a5 5 0 0 1 8.8-3.2"></path><path d="M12 2v3h-3M4 14v-3h3"></path>`),
  check: S(`<path d="M3.5 8.5l3 3 6-7"></path>`),
  clock: S(`<circle cx="8" cy="8" r="6"></circle><path d="M8 4.5V8l2.5 1.5"></path>`),
  pencil: S(`<path d="M10.5 2.5l3 3-7.5 7.5H3v-3z"></path>`),
  alert: S(`<path d="M8 2.5l6 11H2z"></path><path d="M8 7v3M8 12h.01"></path>`),
  link: S(`<path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75"></path><path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 0 0 3.5 3.5l.75-.75"></path>`),
  arrow: S(`<path d="M3 8h10M9 4l4 4-4 4"></path>`),
  list: S(`<path d="M3 4.5h10M3 8h10M3 11.5h7"></path>`),
  columns: S(`<rect x="2" y="3" width="3.2" height="10" rx="1"></rect><rect x="6.4" y="3" width="3.2" height="7" rx="1"></rect><rect x="10.8" y="3" width="3.2" height="10" rx="1"></rect>`),
  target: S(`<circle cx="8" cy="8" r="6"></circle><circle cx="8" cy="8" r="2.25" fill="currentColor" stroke="none"></circle>`),
  inbox: S(`<path d="M2.5 9.5V12a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V9.5"></path><path d="M2.5 9.5h3l1 2h3l1-2h3"></path><path d="M4.5 9.5l1-6h5l1 6"></path>`),
  // §3 lists `spinner` in the set; drawn here in the same 16px / 1.75 grid as
  // a 300-degree arc so the gap reads at 16px. Spun by .spin, which is not a
  // §2 loop exception — it is the disabled-button affordance §3 already pairs
  // with .is-disabled, and it only exists while a request is in flight.
  spinner: `<svg class="ico spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M8 2a6 6 0 1 1-4.243 1.757"></path></svg>`,
};

/* Status glyphs — §3, 16px circle. */
const glyph = {
  queued: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--text-light)"><circle cx="8" cy="8" r="5.5"></circle></svg>`,
  waiting: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--text-light)"><circle cx="8" cy="8" r="5.5" stroke-dasharray="2.6 2.4"></circle></svg>`,
  active: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--primary)"><circle cx="8" cy="8" r="5.5"></circle><circle cx="8" cy="8" r="2.5" fill="currentColor" stroke="none"></circle></svg>`,
  done: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mint)"><circle cx="8" cy="8" r="6.5" fill="currentColor" stroke="none"></circle><path d="M5 8.2l2 2 4-4.2" stroke="var(--on-dark)" stroke-width="1.8"></path></svg>`,
  blocked: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" style="color: var(--peach-text)"><circle cx="8" cy="8" r="5.5"></circle><path d="M4.2 4.2l7.6 7.6"></path></svg>`,
};

/* Priority — §3, four signal bars. */
const priority = (level) => {
  const filled = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 }[level];
  const tone = level === 1 ? "var(--peach)" : "var(--text-muted)";
  const label = { 1: "Urgent", 2: "High", 3: "Medium", 4: "Low", 5: "None" }[level];
  const bars = [
    { x: 1, y: 11, h: 4 },
    { x: 5, y: 8, h: 7 },
    { x: 9, y: 5, h: 10 },
    { x: 13, y: 2, h: 13 },
  ]
    .map((b, i) => {
      const fill = i < filled ? tone : "var(--border-strong)";
      return `<rect x="${b.x}" y="${b.y}" width="3" height="${b.h}" rx="1" style="fill: ${fill}"></rect>`;
    })
    .join("");
  return `<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted);"><svg class="ico" viewBox="0 0 16 16" aria-label="${label} priority">${bars}</svg>${label}</span>`;
};

/* ---------------------------------------------------------- sample data */
/* The Ledgerly invoicing queue from the reference canvas (design.md rule 6). */
const T = {
  "001": { ref: "SYN-001", title: "Supabase schema for clients and invoices", est: "2h" },
  "002": { ref: "SYN-002", title: "Clerk auth and protected app routes", est: "1.5h" },
  "003": { ref: "SYN-003", title: "Invoice editor with line items", est: "4h" },
  "004": { ref: "SYN-004", title: "PDF export for invoices", est: "3h" },
  "005": { ref: "SYN-005", title: "Email invoices to clients via Resend", est: "2h" },
  "006": { ref: "SYN-006", title: "Stripe payment link on each invoice", est: "3h" },
  "007": { ref: "SYN-007", title: "Client list and detail page", est: "2.5h" },
  "008": { ref: "SYN-008", title: "Recurring invoice schedules", est: "4h" },
  "009": { ref: "SYN-009", title: "Dashboard overview with outstanding totals", est: "3h" },
};

/* ------------------------------------------------------------ fragments */
const row = (t, state, { on = false, dim = false } = {}) => {
  const faded = dim ? " opacity: 0.45;" : "";
  const muted = state === "done" ? ' style="color: var(--text-light);"' : "";
  return `<div class="row${on ? " on" : ""}" style="${faded}">
  ${glyph[state]}
  <span class="mono" style="color: var(--text-light); flex-shrink: 0;">${t.ref}</span>
  <div class="row-main">
    <span class="row-title"${muted}>${t.title}</span>
    <span class="row-est">${t.est}</span>
  </div>
</div>`;
};

const section = (label, rows, tag = "") => `<div style="display: flex; flex-direction: column; gap: 2px;">
      <div style="display: flex; align-items: baseline; padding: 0 12px 4px;"><span class="caption">${label}</span>${tag ? `<span class="tag">${tag}</span>` : ""}</div>
      ${rows.join("\n      ")}
    </div>`;

const header = `<div style="display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px; border-bottom: 1px solid var(--border); background: var(--bg); flex-shrink: 0;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <div style="width: 28px; height: 28px; border-radius: 8px; background: var(--primary); display: flex; align-items: center; justify-content: center; color: #fff;">${icon.star()}</div>
    <span class="display" style="font-size: 17px;">Synergy</span>
  </div>
  <div style="display: flex; align-items: center; gap: 14px;">
    <span style="font-size: 13px; color: var(--text-muted);">Ledgerly</span>
    <span class="chip chip-neutral">North Star v3</span>
    <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--mint) 0%, var(--primary) 100%);"></div>
  </div>
</div>`;

const toolbar = (busy = false) => `<div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; flex-shrink: 0;">
  <div class="seg">
    <div class="seg-item on">${icon.target}Focus</div>
    <div class="seg-item">${icon.list}Queue</div>
    <div class="seg-item">${icon.columns}Board</div>
  </div>
  <button class="btn btn-ghost btn-sm${busy ? " is-disabled" : ""}">${icon.pencil}Edit brief</button>
</div>`;

/* Rail — the queue, always. `head` is the truthful count line + progress
   bar; `body` the sections; `foot` whatever the regenerate trigger is
   currently showing. */
const rail = ({ count, bars, body, foot }) => `<aside style="width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--rail); border-right: 1px solid var(--border); overflow: hidden;">
  <div style="padding: 20px 20px 16px; display: flex; flex-direction: column; gap: 12px; border-bottom: 1px solid var(--border); flex-shrink: 0;">
    <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px;">
      <span class="display" style="font-size: 15px;">Queue</span>
      <span style="font-size: 12px; color: var(--text-muted);">${count}</span>
    </div>
    <div class="prog">${bars}</div>
  </div>
  <div style="flex: 1; min-height: 0; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 14px;">
    ${body}
  </div>
  <div style="padding: 16px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;">
    ${foot}
  </div>
</aside>`;

const shell = (railHtml, mainHtml, { h = 900 } = {}) => `<div class="app {{theme}}" style="width: 1440px; height: ${h}px; overflow: hidden; display: flex; flex-direction: column; background: var(--bg);">

${header}
<div style="display: flex; flex: 1; min-height: 0;">
${railHtml}
  <main style="flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--bg);">
${mainHtml}
  </main>
</div>
</div>`;

/* The steady-state Ledgerly rail: 9 live tickets, 3 done, 1 active, 4 queued,
   1 blocked. counts.remaining (active + queued) = 5 — the number the
   regenerate copy in src/app/app/page.tsx quotes. */
const steadyBars = `<div style="width: 33.3%; background: var(--mint);"></div>
      <div style="width: 11.1%; background: var(--primary);"></div>
      <div style="width: 11.1%; background: var(--peach);"></div>`;

const steadySections = ({ dim = false, tags = false } = {}) =>
  [
    section("Now", [row(T["004"], "active", { on: !dim, dim })], tags ? "Retires 1" : ""),
    section(
      "Up next",
      [
        row(T["006"], "queued", { dim }),
        row(T["007"], "queued", { dim }),
        row(T["005"], "waiting", { dim }),
        row(T["009"], "waiting", { dim }),
      ],
      tags ? "Retires 4" : "",
    ),
    section("Blocked", [row(T["008"], "blocked")], tags ? "Kept" : ""),
    section(
      "Done",
      [row(T["001"], "done"), row(T["002"], "done"), row(T["003"], "done")],
      tags ? "Kept" : "",
    ),
  ].join("\n    ");

/* ------------------------------------------------------------ artboards */
const boards = {};

/* ===== Main — first generation in progress, from the `empty` stall ===== */
boards.Main = shell(
  rail({
    count: `Nothing queued yet`,
    bars: ``,
    body: `<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 0 28px 40px; text-align: center;">
      <div style="color: var(--text-light);">${icon.inbox}</div>
      <span style="font-size: 13px; color: var(--text-light); line-height: 1.5; text-wrap: pretty;">Your sequenced queue lands here.</span>
    </div>`,
    foot: `<button class="btn btn-outline btn-sm is-disabled" style="justify-content: center;">${icon.spinner}Generating…</button>
    <span style="font-size: 11px; color: var(--text-light); text-align: center; line-height: 1.4;">Both triggers share one request — the rail waits with the card.</span>`,
  }),
  `${toolbar(true)}
  <div style="flex: 1; min-height: 0; overflow: hidden; padding: 32px 32px 72px; display: flex; flex-direction: column; align-items: center; justify-content: center;">

<article class="card" style="width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 20px; padding: 36px 32px 32px;">

  <div style="display: flex; align-items: flex-start; gap: 16px;">
    <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--primary-soft); color: var(--primary-text); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${icon.star("ico ico-20")}</div>
    <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 2px;">
      <h1 class="display" style="font-size: 22px; line-height: 1.25; margin: 0;">Sequencing your first queue</h1>
      <p style="font-size: 14px; line-height: 1.6; color: var(--text-muted); margin: 0; text-wrap: pretty;">Synergy is reading your North Star and planning the work to finish this milestone. Leave this page open — the queue fills in the rail when it lands.</p>
    </div>
  </div>

  <div class="work">
    <span class="ai-dot"></span>
    <span>Working. This usually takes 10–30 seconds.</span>
    <span class="work-el">18s</span>
  </div>

  <div style="display: flex; flex-direction: column; gap: 2px; padding: 16px 18px; border-radius: var(--radius-sm); background: var(--surface);">
    <div class="caption" style="padding-bottom: 8px;">What was sent</div>
    <div style="display: flex; gap: 16px; align-items: baseline; padding: 5px 0;">
      <span style="width: 92px; flex-shrink: 0; font-size: 12px; color: var(--text-light);">Brief</span>
      <span style="font-size: 13px; color: var(--text); line-height: 1.5;">North Star v3 — Ledgerly</span>
    </div>
    <div style="display: flex; gap: 16px; align-items: baseline; padding: 5px 0;">
      <span style="width: 92px; flex-shrink: 0; font-size: 12px; color: var(--text-light);">Milestone</span>
      <span style="font-size: 13px; color: var(--text); line-height: 1.5; text-wrap: pretty;">Get an invoice from draft to paid without leaving the app</span>
    </div>
    <div style="display: flex; gap: 16px; align-items: baseline; padding: 5px 0;">
      <span style="width: 92px; flex-shrink: 0; font-size: 12px; color: var(--text-light);">Expect</span>
      <span style="font-size: 13px; color: var(--text); line-height: 1.5;">Up to 10 tickets, 2–4 hours each, sequenced by dependency</span>
    </div>
  </div>

  <div class="note">
    ${icon.clock}
    <span>Nothing is written until the whole queue validates. If the request fails you land back here with the same brief and nothing lost.</span>
  </div>

</article>
  </div>`,
);

/* ===== Reveal — the first queue lands ===== */
boards.Reveal = shell(
  rail({
    count: `0 of 9 done`,
    bars: `<div style="width: 11.1%; background: var(--primary);"></div>`,
    body: `<div style="display: flex; flex-direction: column; gap: 14px; opacity: {{enterOpacity}}; transform: translateY({{enterShift}});">
    ${section("Now", [row(T["001"], "active", { on: true })])}
    ${section("Up next", [
      row(T["002"], "queued"),
      row(T["003"], "waiting"),
      row(T["004"], "waiting"),
      row(T["007"], "waiting"),
      row(T["006"], "waiting"),
      row(T["005"], "waiting"),
      row(T["009"], "waiting"),
      row(T["008"], "waiting"),
    ])}
    </div>`,
    foot: `<button class="btn btn-outline btn-sm" style="justify-content: center;">${icon.refresh}Regenerate queue</button>
    <span style="font-size: 11px; color: var(--text-light); text-align: center; line-height: 1.4;">Replans from North Star v3. Retires all 9 unstarted tickets.</span>`,
  }),
  `${toolbar()}
  <div style="flex: 1; min-height: 0; overflow: hidden; padding: 32px 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 16px;">

    <div style="width: 100%; max-width: 760px; display: flex; align-items: center; gap: 10px; padding: 0 4px 2px; font-size: 12px; color: var(--text-light);">
      <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--mint-text);">${icon.check}Generated 9 tickets.</span>
    </div>

<article class="card" style="width: 100%; max-width: 760px; display: flex; flex-direction: column; opacity: {{enterOpacity}}; transform: translateY({{enterShift}});">
  <div style="display: flex; flex-direction: column; gap: 14px; padding: 28px 28px 0;">
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <span class="mono" style="color: var(--text-light);">SYN-001</span>
      <span class="chip chip-active">Active</span>
      ${priority(1)}
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted);">${icon.clock}2h</span>
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); margin-left: auto;">${icon.link}No prerequisites</span>
    </div>
    <h1 class="display" style="font-size: 36px; line-height: 1.15; margin: 0; text-wrap: pretty;">Supabase schema for clients and invoices</h1>
    <p style="font-size: 15px; line-height: 1.6; color: var(--text-muted); margin: 0; text-wrap: pretty;">Create the tables everything else in this milestone reads and writes: clients, invoices, and invoice line items, with row-level security scoped to the signed-in user. Everything downstream — the editor, the PDF, the payment link — depends on these columns being right the first time.</p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 10px; padding: 24px 28px;">
    <div class="caption">Acceptance criteria</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>Migration creates clients, invoices and invoice_items with foreign keys</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>RLS policies on all three tables key off the signed-in user</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>Invoice totals derive from line items rather than a stored column</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>Generated types check in and the app builds against them</span></div>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 12px; padding: 20px 28px 24px; border-top: 1px solid var(--border);">
    <button class="btn btn-dark">${icon.check}Mark done</button>
    <button class="btn btn-outline">Blocked</button>
  </div>
</article>

    <div style="width: 100%; max-width: 760px; display: flex; align-items: center; gap: 10px; padding: 0 4px; font-size: 13px; color: var(--text-light);">
      ${icon.arrow}<span>Up next</span>
      <span class="mono" style="color: var(--text-light);">SYN-002</span>
      <span style="color: var(--text-muted);">Clerk auth and protected app routes</span>
      <span style="margin-left: auto;">1.5h</span>
    </div>
  </div>`,
);

/* ===== Confirm — regenerate pressed with 5 unstarted tickets ===== */
boards.Confirm = shell(
  rail({
    count: `3 of 9 done · 1 blocked`,
    bars: steadyBars,
    body: steadySections({ tags: true }),
    foot: `<div style="display: flex; flex-direction: column; gap: 10px;">
      <span class="display" style="font-size: 15px;">Regenerate the queue?</span>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; gap: 8px; align-items: flex-start; font-size: 12px; color: var(--text-muted); line-height: 1.45;"><span style="color: var(--text-light);">${icon.refresh}</span><span>Retires your <strong style="font-weight: 600; color: var(--text);">5 unstarted tickets</strong> — SYN-004 and the four behind it.</span></div>
        <div style="display: flex; gap: 8px; align-items: flex-start; font-size: 12px; color: var(--text-muted); line-height: 1.45;"><span style="color: var(--mint-text);">${icon.check}</span><span>Keeps <strong style="font-weight: 600; color: var(--text);">3 done</strong> and <strong style="font-weight: 600; color: var(--text);">1 blocked</strong>, and feeds them back into the prompt.</span></div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px;">
        <button class="btn btn-dark btn-sm">${icon.refresh}Regenerate</button>
        <button class="btn btn-ghost btn-sm">Keep this queue</button>
      </div>
    </div>`,
  }),
  `${toolbar()}
  <div style="flex: 1; min-height: 0; overflow: hidden; padding: 32px 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 16px;">

    <div class="note" style="width: 100%; max-width: 760px;">
      ${icon.alert}
      <span>This ticket is unstarted, so regenerating retires it too. Mark it done or blocked first if the work already happened — done and blocked tickets survive and shape the next queue.</span>
    </div>

<article class="card" style="width: 100%; max-width: 760px; display: flex; flex-direction: column;">
  <div style="display: flex; flex-direction: column; gap: 14px; padding: 28px 28px 0;">
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <span class="mono" style="color: var(--text-light);">SYN-004</span>
      <span class="chip chip-active">Active</span>
      ${priority(2)}
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted);">${icon.clock}3h</span>
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); margin-left: auto;">${icon.link}Depends on <span class="mono" style="color: var(--mint-text);">SYN-003</span><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mint-text)"><path d="M3.5 8.5l3 3 6-7"></path></svg></span>
    </div>
    <h1 class="display" style="font-size: 36px; line-height: 1.15; margin: 0;">PDF export for invoices</h1>
    <p style="font-size: 15px; line-height: 1.6; color: var(--text-muted); margin: 0; text-wrap: pretty;">Render a finished invoice to a downloadable PDF from the invoice detail page. Reuse the editor’s line-item layout so the PDF matches what the user sees on screen. Generate it server-side so the file is identical regardless of browser.</p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 10px; padding: 24px 28px;">
    <div class="caption">Acceptance criteria</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>“Download PDF” on an invoice page returns a file named INV-&lt;number&gt;.pdf</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>PDF shows client, line items, totals, due date, and payment terms</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>Rendering completes in under 2s for an invoice with 50 line items</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>Works for invoices with and without a logo</span></div>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 12px; padding: 20px 28px 24px; border-top: 1px solid var(--border);">
    <button class="btn btn-dark">${icon.check}Mark done</button>
    <button class="btn btn-outline">Blocked</button>
  </div>
</article>
  </div>`,
);

/* ===== Regenerating — the replacement queue is in flight ===== */
boards.Regenerating = shell(
  rail({
    count: `3 of 9 done · 1 blocked`,
    bars: steadyBars,
    body: steadySections({ dim: true, tags: true }),
    foot: `<div class="work" style="padding: 10px 12px;">
      <span class="ai-dot"></span>
      <span>Regenerating…</span>
      <span class="work-el">7s</span>
    </div>
    <span style="font-size: 11px; color: var(--text-light); text-align: center; line-height: 1.4;">Counts hold at 9 until the new queue lands.</span>`,
  }),
  `${toolbar(true)}
  <div style="flex: 1; min-height: 0; overflow: hidden; padding: 32px 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 16px;">

    <div class="work" style="width: 100%; max-width: 760px;">
      <span class="ai-dot"></span>
      <span>Replanning around 3 finished and 1 blocked ticket. Usually 10–30 seconds.</span>
      <span class="work-el">7s</span>
    </div>

<article class="card" style="width: 100%; max-width: 760px; display: flex; flex-direction: column; opacity: 0.45;">
  <div style="display: flex; flex-direction: column; gap: 14px; padding: 28px 28px 0;">
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <span class="mono" style="color: var(--text-light);">SYN-004</span>
      <span class="chip chip-active">Active</span>
      ${priority(2)}
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted);">${icon.clock}3h</span>
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); margin-left: auto;">${icon.link}Depends on <span class="mono" style="color: var(--mint-text);">SYN-003</span><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mint-text)"><path d="M3.5 8.5l3 3 6-7"></path></svg></span>
    </div>
    <h1 class="display" style="font-size: 36px; line-height: 1.15; margin: 0;">PDF export for invoices</h1>
    <p style="font-size: 15px; line-height: 1.6; color: var(--text-muted); margin: 0; text-wrap: pretty;">Render a finished invoice to a downloadable PDF from the invoice detail page. Reuse the editor’s line-item layout so the PDF matches what the user sees on screen. Generate it server-side so the file is identical regardless of browser.</p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 10px; padding: 24px 28px;">
    <div class="caption">Acceptance criteria</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>“Download PDF” on an invoice page returns a file named INV-&lt;number&gt;.pdf</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>PDF shows client, line items, totals, due date, and payment terms</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>Rendering completes in under 2s for an invoice with 50 line items</span></div>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 12px; padding: 20px 28px 24px; border-top: 1px solid var(--border);">
    <button class="btn btn-dark is-disabled">${icon.check}Mark done</button>
    <button class="btn btn-outline is-disabled">Blocked</button>
  </div>
</article>
  </div>`,
);

/* ===== Failed — the Gemini call failed, the queue is untouched ===== */
boards.Failed = shell(
  rail({
    count: `3 of 9 done · 1 blocked`,
    bars: steadyBars,
    body: steadySections(),
    foot: `<div class="err" style="padding: 10px 12px; align-items: center;">
      ${icon.alert}
      <span>Last generation failed. Queue untouched.</span>
    </div>
    <button class="btn btn-outline btn-sm" style="justify-content: center;">${icon.refresh}Regenerate queue</button>`,
  }),
  `${toolbar()}
  <div style="flex: 1; min-height: 0; overflow: hidden; padding: 32px 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 16px;">

    <div style="width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 12px;">
      <div class="err">
        ${icon.alert}
        <span>Couldn’t generate a new queue — the model request failed. Your queue is exactly as it was: nothing retired, nothing added, SYN-004 still yours to work on.</span>
      </div>
      <div class="detail">
        <span class="caption">Model response</span>
        <span class="detail-val">Model request failed: 503 The model is overloaded. Please try again later.</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button class="btn btn-dark btn-sm">${icon.refresh}Try again</button>
      </div>
    </div>

<article class="card" style="width: 100%; max-width: 760px; display: flex; flex-direction: column;">
  <div style="display: flex; flex-direction: column; gap: 14px; padding: 28px 28px 0;">
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <span class="mono" style="color: var(--text-light);">SYN-004</span>
      <span class="chip chip-active">Active</span>
      ${priority(2)}
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted);">${icon.clock}3h</span>
      <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-muted); margin-left: auto;">${icon.link}Depends on <span class="mono" style="color: var(--mint-text);">SYN-003</span><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--mint-text)"><path d="M3.5 8.5l3 3 6-7"></path></svg></span>
    </div>
    <h1 class="display" style="font-size: 36px; line-height: 1.15; margin: 0;">PDF export for invoices</h1>
    <p style="font-size: 15px; line-height: 1.6; color: var(--text-muted); margin: 0; text-wrap: pretty;">Render a finished invoice to a downloadable PDF from the invoice detail page. Reuse the editor’s line-item layout so the PDF matches what the user sees on screen. Generate it server-side so the file is identical regardless of browser.</p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 10px; padding: 24px 28px;">
    <div class="caption">Acceptance criteria</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>“Download PDF” on an invoice page returns a file named INV-&lt;number&gt;.pdf</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>PDF shows client, line items, totals, due date, and payment terms</span></div>
      <div class="ac"><svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" style="color: var(--border-strong)"><circle cx="8" cy="8" r="6"></circle></svg><span>Rendering completes in under 2s for an invoice with 50 line items</span></div>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 12px; padding: 20px 28px 24px; border-top: 1px solid var(--border);">
    <button class="btn btn-dark">${icon.check}Mark done</button>
    <button class="btn btn-outline">Blocked</button>
  </div>
</article>
  </div>`,
);

for (const [name, html] of Object.entries(boards)) {
  writeFileSync(join(here, `${name}.body.html`), html + "\n");
  console.log(`wrote ${name}.body.html`);
}
