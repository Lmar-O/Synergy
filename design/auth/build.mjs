// Assembles the four auth artboards from design/system.css + auth.css + parts.mjs.
// Re-run after editing any of those: `node build.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ICON, bloomLayer, wordmark, securedByClerk, socialButtons, cardHeader, footerAction } from './parts.mjs';

const fontB64 = readFileSync(join(import.meta.dirname, '../object-sans.woff2')).toString('base64');
const systemCss = readFileSync(join(import.meta.dirname, '../system.css'), 'utf8').replace(
  'url(./object-sans.woff2) format(\'woff2\')',
  `url(data:font/woff2;base64,${fontB64}) format('woff2')`,
);
const authCss = readFileSync(join(import.meta.dirname, 'auth.css'), 'utf8');

const page = ({ title, props, logic, body }) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
${systemCss}${authCss}
  </style>
</helmet>
<div class="app {{theme}} auth-page">${bloomLayer}
  <header class="auth-head">${wordmark}
  </header>
  <div class="auth-body">
${body}
  </div>
</div>
</x-dc>
<script data-dc-script data-props='${props}'>
class Component extends DCLogic {
  renderVals() {
${logic}
  }
}
</script>
</body>
</html>
`;

const THEME_PROP = `"theme":{"editor":"enum","options":["light","dark"],"default":"light","section":"Theme"},"$preview":{"width":1440,"height":900}`;
const THEME_VAL = `    const theme = this.props.theme === 'dark' ? 'dark' : '';`;

/* ---------------- Main — sign-in, default (identifier-first) ---------------- */
writeFileSync(join(import.meta.dirname, 'Main.dc.html'), page({
  title: 'Sign in',
  props: `{${THEME_PROP},"state":{"editor":"enum","options":["default","focus","submitting"],"default":"default","section":"Field state"}}`,
  logic: `${THEME_VAL}
    const s = this.props.state ?? 'default';
    return {
      theme,
      emailCls: s === 'focus' ? 'textarea line focus' : 'textarea line',
      emailText: s === 'submitting' ? 'lena@ledgerly.app' : '',
      btnCls: s === 'submitting' ? 'btn btn-dark submit busy is-disabled' : 'btn btn-dark submit',
    };`,
  body: `    <div class="card clerk-card">
${cardHeader('Sign in to Synergy', 'Welcome back. Sign in to pick up your queue.')}
${socialButtons}
      <div class="field">
        <div class="field-label-row"><label class="field-label">Email address</label></div>
        <div class="{{emailCls}}"><span>{{emailText}}</span><span class="caret"></span></div>
      </div>
      <button class="{{btnCls}}" type="button">
        <span class="b-busy">${ICON.spinner}<span>Signing in…</span></span>
        <span class="b-idle"><span>Continue</span>${ICON.arrow}</span>
      </button>
${footerAction('Don&#39;t have an account?', 'Sign up')}
    </div>
${securedByClerk}`,
}));

/* ---------------- SignUp ---------------- */
writeFileSync(join(import.meta.dirname, 'SignUp.dc.html'), page({
  title: 'Sign up',
  props: `{${THEME_PROP}}`,
  logic: `${THEME_VAL}
    return { theme };`,
  body: `    <div class="card clerk-card">
${cardHeader('Create your Synergy account', 'Create an account, then write your North Star.')}
${socialButtons}
      <div class="field">
        <div class="field-label-row"><label class="field-label">Email address</label></div>
        <div class="textarea line"><span>lena@ledgerly.app</span></div>
      </div>
      <div class="field">
        <div class="field-label-row"><label class="field-label">Password</label></div>
        <div class="input-group">
          <div class="textarea line"><span class="dots">••••••••••••</span></div>
          <button class="reveal" type="button">${ICON.eye}</button>
        </div>
      </div>
      <button class="btn btn-dark submit" type="button"><span>Continue</span>${ICON.arrow}</button>
${footerAction('Already have an account?', 'Sign in')}
    </div>
${securedByClerk}
    <p class="page-note">Free forever for solo founders · No credit card</p>`,
}));

/* ---------------- Error — sign-in step 2, wrong password ---------------- */
writeFileSync(join(import.meta.dirname, 'Error.dc.html'), page({
  title: 'Sign in — wrong password',
  props: `{${THEME_PROP}}`,
  logic: `${THEME_VAL}
    return { theme };`,
  body: `    <div class="card clerk-card">
${cardHeader('Enter your password', 'Enter the password linked to your account.')}
      <div class="identity"><span>lena@ledgerly.app</span><button type="button">${ICON.pencil}</button></div>
      <div class="field">
        <div class="field-label-row"><label class="field-label">Password</label><a class="field-action" href="#">Forgot password?</a></div>
        <div class="input-group">
          <div class="textarea line err"><span class="dots">••••••••••</span></div>
          <button class="reveal" type="button">${ICON.eye}</button>
        </div>
        <div class="inline-err">${ICON.alert}<span>Password is incorrect. Try again, or use another method.</span></div>
      </div>
      <button class="btn btn-dark submit" type="button"><span>Continue</span>${ICON.arrow}</button>
${footerAction('Don&#39;t have an account?', 'Sign up')}
    </div>
${securedByClerk}`,
}));

/* ---------------- Loading — <ClerkLoading> skeleton ---------------- */
const skel = (w, h, extra = '') => `<div class="skel${extra}" style="width: ${w}; height: ${h}px"></div>`;
/** A bar of `h` centred in a `line`-tall box, so the skeleton measures like the text. */
const skelLine = (line, w, h) => `<div class="skel-line" style="height: ${line}px">${skel(w, h)}</div>`;
writeFileSync(join(import.meta.dirname, 'Loading.dc.html'), page({
  title: 'Loading',
  props: `{${THEME_PROP}}`,
  logic: `${THEME_VAL}
    return { theme };`,
  body: `    <div class="card clerk-card" aria-busy="true">
      <div class="card-header">
        ${skelLine(27.5, '190px', 20)}
        ${skelLine(21, '260px', 14)}
      </div>
      <div class="social-row">
        ${skel('100%', 44, ' skel-pill')}
        ${skel('100%', 44, ' skel-pill')}
      </div>
      <div class="divider"><span class="divider-line"></span>${skelLine(19.5, '18px', 12)}<span class="divider-line"></span></div>
      <div class="field">
        ${skelLine(19.5, '92px', 13)}
        ${skel('100%', 44)}
      </div>
      ${skel('100%', 44, ' skel-pill submit')}
      <div class="card-footer">${skelLine(19.5, '196px', 13)}</div>
    </div>
${securedByClerk}`,
}));

console.log('wrote Main.dc.html SignUp.dc.html Error.dc.html Loading.dc.html');
