// Shared markup pieces for the four auth artboards.

export const ICON = {
  // Verbatim from design/canvas-v1/Main.dc.html — §6.10, one brand mark.
  star: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 1c.6 4 3 6.4 7 7-4 .6-6.4 3-7 7-.6-4-3-6.4-7-7 4-.6 6.4-3 7-7z" fill="currentColor" stroke="none" /></svg>`,
  arrow: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10" /><path d="M9 4l4 4-4 4" /></svg>`,
  alert: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.25" /><path d="M8 5v3.5" /><path d="M8 11h.01" /></svg>`,
  pencil: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.5 2.5l2 2-8 8H3.5v-2z" /></svg>`,
  eye: `<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4S1.5 8 1.5 8z" /><circle cx="8" cy="8" r="1.75" /></svg>`,
  spinner: `<svg class="ico spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M8 1.75a6.25 6.25 0 106.25 6.25" /></svg>`,
  google: `<svg class="ico" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z"/><path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 010-3.44V4.95H.96a9 9 0 000 8.1l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>`,
  github: `<svg class="ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 .2a8 8 0 00-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.09-.2-.36-1.02.07-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.43 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 008 .2z"/></svg>`,
};

/** The landing page's colour washes. See the .bloom rules in auth.css. */
export const bloomLayer = `
  <div class="bloom-layer" aria-hidden="true">
    <div class="bloom bloom-warm"></div>
    <div class="bloom bloom-cool"></div>
  </div>`;

/** App wordmark — 28px violet tile + "Synergy" in Object Sans (design.md §3). */
export const wordmark = `
      <a class="mark-lockup" href="#">
        <span class="mark">${ICON.star}</span>
        <span class="display mark-word">Synergy</span>
      </a>`;

export const securedByClerk = `
        <div class="clerk-badge">Secured by <strong>Clerk</strong></div>`;

/** The two OAuth block buttons Clerk renders from the instance's enabled providers. */
export const socialButtons = `
        <div class="social-row">
          <button class="btn btn-outline social-btn" type="button">${ICON.google}<span>Google</span></button>
          <button class="btn btn-outline social-btn" type="button">${ICON.github}<span>GitHub</span></button>
        </div>
        <div class="divider"><span class="divider-line"></span><span class="divider-text">or</span><span class="divider-line"></span></div>`;

export const cardHeader = (title, subtitle) => `
        <div class="card-header">
          <h1 class="display card-title">${title}</h1>
          <p class="card-sub">${subtitle}</p>
        </div>`;

export const footerAction = (text, link) => `
        <div class="card-footer">
          <span class="footer-text">${text}</span>
          <a class="footer-link" href="#">${link}</a>
        </div>`;
