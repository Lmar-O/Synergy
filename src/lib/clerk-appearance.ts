/**
 * Theme for Clerk's <SignIn/> and <SignUp/>, per the auth design canvas.
 *
 * Two things to know before editing:
 *
 * 1. `variables` names changed in Clerk v6/v7 — it is `colorForeground` (not
 *    `colorText`) and `colorInput` (not `colorInputBackground`), and layout
 *    options moved from `layout` to `options`.
 * 2. `colorPrimary`, `colorDanger` and `colorNeutral` are `CssColorOrScale`:
 *    Clerk derives a whole shade scale from them at runtime, which a `var()`
 *    string does not survive. They carry literal light-mode values. Everything
 *    that actually has to flip between light and dark is either another
 *    `variables` entry (a plain pass-through, where `var()` is safe) or an
 *    `elements` rule, both of which land in CSS and follow the tokens.
 */
// Deliberately un-annotated: Clerk v7 types `appearance` through a global
// declaration-merging registry rather than a public exported name, so the object
// is checked against the prop at each call site instead.
export const clerkAppearance = {
  variables: {
    // Literals — see note 2. Light-mode values; these only reach details the
    // `elements` rules below don't already cover.
    colorPrimary: "oklch(60% 0.22 265)",
    colorDanger: "oklch(52% 0.16 42)",

    colorPrimaryForeground: "#fff",
    colorForeground: "var(--text)",
    colorMutedForeground: "var(--text-muted)",
    colorBackground: "var(--card)",
    colorInput: "var(--card)",
    colorInputForeground: "var(--text)",
    colorBorder: "var(--border-strong)",
    colorRing: "var(--primary-soft)",

    // --radius-sm. Buttons and the card are pushed to their own radii below;
    // a single base can't express pill buttons and 8px inputs at once.
    borderRadius: "8px",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
  },

  options: {
    logoPlacement: "none" as const, // the shell renders the wordmark
    socialButtonsVariant: "blockButton" as const,
    socialButtonsPlacement: "top" as const,
    shimmer: false, // design.md §2: .ai-dot owns the only looping animation
  },

  elements: {
    cardBox: { width: "400px", boxShadow: "none" },
    card: {
      background: "var(--card)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-card)",
      padding: "28px",
    },

    headerTitle: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: "22px",
      lineHeight: 1.25,
      letterSpacing: "-0.01em",
    },
    headerSubtitle: { fontSize: "14px", color: "var(--text-muted)", textWrap: "pretty" },

    // .btn-outline
    // auto-fit, not a fixed 2 columns: an instance with one enabled provider
    // would otherwise get a half-width button that truncates its own label.
    socialButtons: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "8px",
    },
    socialButtonsBlockButton: {
      height: "44px",
      borderRadius: "var(--radius-pill)",
      border: "1px solid var(--border-strong)",
      background: "transparent",
      color: "var(--text)",
      "&:hover": { background: "var(--surface-2)" },
    },
    socialButtonsBlockButtonText: { fontSize: "14px", fontWeight: 500 },

    dividerLine: { background: "var(--border)" },
    dividerText: { fontSize: "13px", color: "var(--text-light)" },

    formFieldLabel: { fontSize: "13px", fontWeight: 500, color: "var(--text)" },
    formFieldAction: { fontSize: "13px", color: "var(--primary-text)" },
    // The .textarea recipe at single-line height.
    formFieldInput: {
      height: "44px",
      padding: "0 14px",
      fontSize: "14px",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-strong)",
      background: "var(--card)",
      color: "var(--text)",
      "&:focus": {
        borderColor: "var(--primary)",
        boxShadow: "0 0 0 3px var(--primary-soft)",
      },
    },
    // design.md §3's inline-error recipe. Clerk renders this as a text node, so
    // it is made a block here rather than left as loose red text.
    formFieldErrorText: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
      padding: "12px 14px",
      borderRadius: "var(--radius-sm)",
      background: "var(--peach-soft)",
      color: "var(--peach-text)",
      fontSize: "13px",
      lineHeight: 1.5,
    },
    formFieldInputShowPasswordButton: { color: "var(--text-light)" },

    // .btn-dark — NOT .btn-primary, which design.md reserves for generating a queue.
    formButtonPrimary: {
      height: "44px",
      borderRadius: "var(--radius-pill)",
      background: "var(--text)",
      color: "var(--bg)",
      fontSize: "14px",
      fontWeight: 600,
      textTransform: "none",
      boxShadow: "var(--shadow-btn)",
      "&:hover": { background: "var(--text)", opacity: 0.9 },
    },

    identityPreview: {
      background: "var(--surface-2)",
      borderRadius: "var(--radius-pill)",
      border: "none",
    },

    footer: { background: "var(--card-footer)", borderTop: "1px solid var(--border)" },
    footerActionText: { fontSize: "13px", color: "var(--text-muted)" },
    footerActionLink: { fontSize: "13px", fontWeight: 500, color: "var(--text)" },
  },
};
