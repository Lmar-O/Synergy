import type { Metadata } from "next";
import Link from "next/link";

import { LandingBloom } from "@/components/landing-bloom";

import "./landing.css";

export const metadata: Metadata = {
  title: "Synergy — Everything you need, in one place",
};

/**
 * Build-sequence step 8: the landing page, ported from
 * synergy-landing-v0_1.html with the plan's pre-port corrections applied.
 * CTAs with a real destination go to Clerk; the rest stay "#" until those
 * pages exist.
 */
export default function Home() {
  return (
    <div className="landing">
      <LandingBloom />

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-mark">✦</div>
            Synergy
          </Link>
          <ul className="nav-links">
            <li><a href="#">Product</a></li>
            <li><a href="#">Teams</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <div className="nav-cta">
            <Link href="/sign-in" className="btn btn-outline">Log in</Link>
            <Link href="/sign-up" className="btn btn-dark">Try for free →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <h1 className="hero-headline">Stop managing.<br />Start shipping.</h1>
            <p className="hero-subtext">Tell Synergy what you&apos;re building. It writes the sprint, tracks progress, and keeps you moving — so you can focus on the work that actually matters.</p>
            <div className="hero-actions">
              <Link href="/sign-up" className="btn btn-primary btn-lg">Start for free →</Link>
              <a href="#" className="btn btn-outline btn-lg">Watch 2-min demo</a>
            </div>
            <p className="hero-note">Free forever for solo founders · No credit card</p>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <span className="hero-card-title">Q4 North Star · Active</span>
                <div className="hero-card-avatars">
                  <div className="avatar avatar-1">L</div>
                </div>
              </div>
              <div className="hero-card-body">
                <div className="ticket-item">
                  <div className="ticket-dot ticket-dot-done"></div>
                  <div className="ticket-content">
                    <div className="ticket-label">Completed · 2.5h</div>
                    <div className="ticket-text">Set up Supabase schema for user auth and North Star documents</div>
                    <span className="ticket-tag tag-mint">✓ Done</span>
                  </div>
                </div>
                <div className="ticket-item" style={{ background: "oklch(98% 0.02 265)" }}>
                  <div className="ticket-dot ticket-dot-active"></div>
                  <div className="ticket-content">
                    <div className="ticket-label">In progress · ~3h</div>
                    <div className="ticket-text">Build AI ticket generation endpoint using GPT-4o structured output</div>
                    <span className="ticket-tag tag-primary">● Active</span>
                  </div>
                </div>
                <div className="ticket-item">
                  <div className="ticket-dot ticket-dot-next"></div>
                  <div className="ticket-content">
                    <div className="ticket-label">Up next · ~2h</div>
                    <div className="ticket-text">Wire daily check-in form to update ticket queue via Supabase RPC</div>
                    <span className="ticket-tag tag-yellow">→ Queued</span>
                  </div>
                </div>
              </div>
              <div className="hero-card-footer">
                <div className="ai-badge">
                  <div className="ai-dot"></div>
                  6 tickets queued · Next: Onboarding flow
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION 1: North Star */}
      <section className="section">
        <div className="container">
          <div className="section-2col">
            <div>
              <h2 className="section-headline">One document.<br />An infinite sprint.</h2>
              <p className="section-body">Describe your product in plain language — what you&apos;re building, your stack, what&apos;s done, and what&apos;s blocked. Synergy reads it once and generates a prioritized, sequenced ticket queue ready to execute.</p>
              <ul className="feature-list">
                <li>Tickets scoped to 2-4 hours so you always know the next move</li>
                <li>Sequenced to avoid blockers before you hit them</li>
                <li>Updates automatically when you check in each morning</li>
              </ul>
              <Link href="/sign-up" className="btn btn-dark">Set your North Star →</Link>
            </div>
            <div>
              <div className="north-star-card">
                <div className="ns-header">
                  <div className="ns-header-label">North Star Document</div>
                  <div className="ns-header-title">Synergy — Collaboration &amp; Project OS</div>
                </div>
                <div className="ns-body">
                  <div className="ns-field">
                    <div className="ns-field-label">Core problem</div>
                    <div className="ns-field-value">Solo founders lose time managing instead of building. No tool gives them a real AI project manager.</div>
                  </div>
                  <div className="ns-field">
                    <div className="ns-field-label">Tech stack</div>
                    <div className="ns-field-value">Next.js · Supabase · GPT-4o · Stripe · Railway</div>
                  </div>
                  <div className="ns-field">
                    <div className="ns-field-label">Current milestone</div>
                    <div className="ns-field-value">MVP: North Star → ticket generation → daily check-in flow</div>
                  </div>
                </div>
                <div style={{ padding: "0 24px 20px" }}>
                  <div className="ns-arrow">
                    <span>Synergy generates your sprint</span>
                  </div>
                  <div className="generated-ticket">
                    <div className="gt-num">SYN-012</div>
                    <div className="gt-text">Implement GPT-4o prompt chain for North Star → ticket generation with structured output schema</div>
                    <div className="gt-meta">
                      <span className="ticket-tag tag-primary">~3h</span>
                      <span className="ticket-tag tag-yellow">Backend</span>
                    </div>
                  </div>
                  <div className="generated-ticket">
                    <div className="gt-num">SYN-013</div>
                    <div className="gt-text">Build ticket queue UI with drag-to-reorder and status updates</div>
                    <div className="gt-meta">
                      <span className="ticket-tag tag-primary">~2h</span>
                      <span className="ticket-tag tag-mint">Frontend</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION 2: Daily Check-In */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-2col flip">
            <div>
              <h2 className="section-headline">Three questions.<br />Zero standups.</h2>
              <p className="section-body">Every morning, Synergy asks what you completed, what&apos;s blocking you, and what you&apos;re working on next. Answers reprioritize the queue before you open your IDE.</p>
              <ul className="feature-list">
                <li>Async by design — no meetings, no interruptions</li>
                <li>Blockers escalated and rescheduled automatically</li>
                <li>Weekly velocity report every Friday</li>
              </ul>
              <a href="#" className="btn btn-dark">See how it works →</a>
            </div>
            <div>
              <div className="north-star-card">
                <div className="ns-header" style={{ background: "linear-gradient(135deg, oklch(62% 0.20 155) 0%, oklch(68% 0.18 175) 100%)" }}>
                  <div className="ns-header-label">Friday · Daily check-in</div>
                  <div className="ns-header-title">Good morning, Lmar ☀️</div>
                </div>
                <div className="ns-body">
                  <div className="ns-field">
                    <div className="ns-field-label">What did you ship yesterday?</div>
                    <div className="ns-field-value" style={{ color: "var(--text)" }}>Finished the Supabase schema + auth flow. North Star form is wired up.</div>
                  </div>
                  <div className="ns-field">
                    <div className="ns-field-label">Anything blocking you?</div>
                    <div className="ns-field-value" style={{ color: "var(--text)" }}>Not sure how to structure the GPT-4o prompt for ticket sequencing.</div>
                  </div>
                  <div className="ns-field">
                    <div className="ns-field-label">What&apos;s on deck today?</div>
                    <div className="ns-field-value" style={{ color: "var(--text)" }}>Ticket generation endpoint + queue UI</div>
                  </div>
                </div>
                <div style={{ padding: "12px 24px 20px" }}>
                  <div style={{ background: "oklch(93% 0.07 155)", borderRadius: "var(--radius-md)", padding: "14px 16px", fontSize: "13px", color: "oklch(38% 0.18 155)", lineHeight: "1.5" }}>
                    <strong>Synergy read your check-in.</strong> Moved SYN-015 (prompt design) ahead of SYN-012. Added a reference to the structured output docs. Your queue is updated.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRIPTYCH */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "560px", margin: "0 auto" }}><h2 className="section-headline">Everything you need.<br />Taken care of.</h2>
          </div>
          <div className="triptych-grid">
            <div className="feature-card">
              <div className="feature-icon icon-primary">✦</div>
              <h3 className="feature-card-title">North Star</h3>
              <p className="feature-card-body">Write your product brief once. The AI parses it, understands your stack, and builds a sequenced sprint — scoped to 2-4 hour tickets you can actually finish.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-mint">↻</div>
              <h3 className="feature-card-title">Daily check-in</h3>
              <p className="feature-card-body">Three async questions every morning. Answers unblock tickets, reprioritize the queue, and keep things clean — without touching your calendar.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-peach">📊</div>
              <h3 className="feature-card-title">Velocity tracking</h3>
              <p className="feature-card-body">Weekly reports show planned vs shipped, milestone health, and where time went — so you always know if you&apos;re on track before it&apos;s too late to change course.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number stat-primary">2–4h</div>
              <div className="stat-label">Target ticket size · actually executable</div>
            </div>
            <div className="stat-item">
              <div className="stat-number stat-mint">&lt;10</div>
              <div className="stat-label">Tickets in queue · no infinite backlog</div>
            </div>
            <div className="stat-item">
              <div className="stat-number stat-lime">3</div>
              <div className="stat-label">Check-in questions · no standups</div>
            </div>
            <div className="stat-item">
              <div className="stat-number stat-peach">0</div>
              <div className="stat-label">Meetings required · async by design</div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="pricing-header"><h2 className="pricing-headline">Start free. Scale when<br />you&apos;re ready.</h2>
            <p className="pricing-subtext">Every plan includes the full AI core. Pay more only for more team members.</p>
          </div>
          <div className="pricing-grid">
            {/* Solo */}
            <div className="pricing-card">
              <div className="pricing-tier pricing-tier-muted">Solo</div>
              <div className="pricing-price">$0</div>
              <div className="pricing-unit">forever</div>
              <div className="pricing-desc">The full AI stack, for you. No seat limits, no time limits.</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li>North Star AI</li>
                <li>Unlimited tickets</li>
                <li>Daily check-in</li>
                <li>Weekly velocity report</li>
              </ul>
              <Link href="/sign-up" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>Get started free</Link>
            </div>
            {/* Team (featured) */}
            <div className="pricing-card featured">
              <div style={{ position: "absolute", top: "-10px", left: "24px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", background: "var(--lime)", color: "oklch(30% 0.10 130)", padding: "4px 12px", borderRadius: "var(--radius-pill)" }}>MOST POPULAR</div>
              <div className="pricing-tier pricing-tier-white">Team</div>
              <div className="pricing-price">$18</div>
              <div className="pricing-unit pricing-unit-white">/ user / month</div>
              <div className="pricing-desc pricing-desc-white">Full PM suite for teams that move fast.</div>
              <div className="pricing-divider pricing-divider-white"></div>
              <ul className="pricing-features pricing-features-white">
                <li>Everything in Solo</li>
                <li>Multi-user boards</li>
                <li>Team check-ins</li>
                <li>Cross-project rollup</li>
                <li>Integrations</li>
              </ul>
              <a href="#" className="btn btn-white" style={{ width: "100%", justifyContent: "center" }}>Start team trial →</a>
            </div>
            {/* Growth */}
            <div className="pricing-card">
              <div className="pricing-tier pricing-tier-muted">Growth</div>
              <div className="pricing-price">$28</div>
              <div className="pricing-unit">/ user / month</div>
              <div className="pricing-desc">For companies scaling beyond a single team.</div>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li>Everything in Team</li>
                <li>SSO + admin controls</li>
                <li>Priority support</li>
                <li>Custom integrations</li>
                <li>SLA</li>
              </ul>
              <a href="#" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>Contact sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-headline">Your next sprint<br />is one brief away.</h2>
          <p className="cta-subtext">Tell Synergy what you&apos;re building. Everything else follows.</p>
          <div className="cta-actions">
            <Link href="/sign-up" className="btn btn-primary btn-lg">Start for free →</Link>
            <a href="#" className="btn btn-outline btn-lg">See a demo</a>
          </div>
          <p className="cta-note">No credit card · Solo plan is free forever</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="nav-logo" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="nav-logo-mark">✦</div>
                <span className="footer-brand-name">Synergy</span>
              </div>
              <p className="footer-brand-desc">Everything you need to build, ship, and grow — taken care of in one place.</p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-links">
                <li><a href="#">North Star AI</a></li>
                <li><a href="#">Ticket queue</a></li>
                <li><a href="#">Daily check-in</a></li>
                <li><a href="#">Integrations</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Changelog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <ul className="footer-links">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 Synergy. Built for founders who ship.</span>
            <span className="footer-copy">Made with ✦</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
