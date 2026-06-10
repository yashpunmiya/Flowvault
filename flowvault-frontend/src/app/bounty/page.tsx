import type { ReactNode } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";

const stacksLogo =
  "https://cdn.prod.website-files.com/618b0aafa4afde65f2fe38fe/65dbdd6c87cf20baca9ac049_stacks-logo-navbar.svg";

const tracks = [
  {
    icon: "team",
    title: "Payroll & Compensation",
    examples: ["Freelancer payouts", "Contributor distributions", "Startup payroll routing", "Salary auto-allocation"]
  },
  {
    icon: "target",
    title: "Goal-Based Savings",
    examples: ["Savings challenges", "Locked reserves", "Group savings", "Milestone unlocks"]
  },
  {
    icon: "bank",
    title: "Treasury Automation",
    examples: ["DAO treasury routing", "Operational budgets", "Reserve allocation", "Emergency funds"]
  },
  {
    icon: "coin",
    title: "Creator Revenue Flows",
    examples: ["Revenue sharing", "Affiliate distributions", "Community rewards", "Subscription reserves"]
  },
  {
    icon: "grid",
    title: "Experimental Money Behaviors",
    examples: ["AI treasury agents", "Event-triggered unlocks", "Community vaults", "Reputation-based payouts", "Prediction market treasury routing", "Subscription reserve systems"],
    badge: "⭐ High Innovation Potential"
  }
];

const notEligible = [
  "Generic dashboards",
  "Wallet wrappers",
  "UI clones of existing FlowVault demo apps",
  "Simple deposit interfaces",
  "Basic CRUD frontends",
  "Projects with little or no routing logic",
  "Projects that only redesign the user interface",
  "Projects that do not demonstrate meaningful programmable financial behavior"
];

const whatWeCareAbout = [
  "Financial behavior design",
  "Automation",
  "Programmable routing",
  "Composability",
  "Reusable integrations",
  "Ecosystem value"
];

const technicalRequirements = [
  "Public GitHub Repository",
  "Working Demo",
  "Short Demo Video",
  "Explanation of FlowVault Integration",
  "At least one successful testnet transaction",
  "Use of FlowVault SDK or Contracts"
];

const integrationRequirements = [
  "Lock",
  "Split",
  "Hold"
];

const resources = [
  ["doc", "docs.flow-vault.dev", "Developer documentation and guides."],
  ["sdk", "flowvault-sdk", "TypeScript SDK for integration."],
  ["contract", "flowvault-v2", "Production-ready FlowVault contracts."],
  ["demo", "Demo Apps", "Savings Vault, FlowPay reference implementations."],
  ["code", "GitHub", "Source code repository."],
  ["chat", "Support", "Telegram, Email. Builder support and questions."]
];

const prizes = [
  ["1", "First Place", "", "gold", "Most innovative and complete FlowVault integration."],
  ["2", "Second Place", "", "silver", "Strong execution and ecosystem value."],
  ["3", "Third Place", "", "violet", "Promising concept with solid implementation."],
  ["gift", "Builder Contribution Awards", "", "purple", "May be distributed across multiple builders for SDK improvements, docs, feedback, etc."]
];

const judgingCriteria = [
  { title: "Innovation & Financial Behavior Design", weight: "35%", desc: "How novel is the financial behavior being created?" },
  { title: "FlowVault Integration Depth", weight: "30%", desc: "How deeply does the project use FlowVault primitives?" },
  { title: "Technical Execution", weight: "20%", desc: "Code quality, implementation quality, reliability, and UX." },
  { title: "Ecosystem Value", weight: "15%", desc: "Can this project provide value to the broader Stacks ecosystem?" }
];

const timeline = [
  ["rocket", "Registration & Builder Onboarding", "June 12 – June 18, 2026"],
  ["code", "Build Period", "June 19 – June 25, 2026"],
  ["send", "Submission Deadline", "June 25, 2026 (23:59 UTC)"],
  ["chat", "Judging Period", "June 26 – June 27, 2026"],
  ["trophy", "Winner Announcement", "June 28, 2026"]
];

const faqs = [
  { q: "Can I build solo?", a: "Yes." },
  { q: "Can teams participate?", a: "Yes." },
  { q: "Can I use AI tools?", a: "Yes." },
  { q: "Must I deploy on mainnet?", a: "No. Testnet deployments are accepted." },
  { q: "Can I build something not listed in the examples?", a: "Yes. Original ideas are encouraged." },
  { q: "Do I need to use FlowVault?", a: "Yes. FlowVault integration is required." },
  { q: "Can I combine multiple FlowVault primitives?", a: "Yes. Combining multiple primitives is encouraged." }
];

function Icon({ name }: { name: string }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true
  };

  const paths: Record<string, ReactNode> = {
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        <path d="M12 15v2" />
      </>
    ),
    split: (
      <>
        <path d="M7 7h4a4 4 0 0 1 4 4v6" />
        <path d="M18 7l-3-3-3 3" />
        <path d="M7 17h4a4 4 0 0 0 4-4V7" />
        <path d="M18 17l-3 3-3-3" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 6h5a5 5 0 0 1 0 10H9" />
        <path d="M11 13l-3 3 3 3" />
      </>
    ),
    secure: (
      <>
        <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    team: (
      <>
        <path d="M16 20v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="9" r="3" />
        <path d="M4 20v-1a3 3 0 0 1 3-3" />
        <path d="M20 20v-1a3 3 0 0 0-3-3" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M16 8l4-4" />
      </>
    ),
    bank: (
      <>
        <path d="M3 10h18" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
        <path d="M2 18h20" />
        <path d="M12 3l9 5H3l9-5z" />
      </>
    ),
    coin: (
      <>
        <path d="M12 4v16" />
        <path d="M17 7.5C16.2 5.8 14.5 5 12 5c-3 0-5 1.4-5 3.5s2 3.1 5 3.5 5 1.4 5 3.5S15 19 12 19c-2.7 0-4.6-.9-5.4-2.7" />
      </>
    ),
    rocket: <path d="M5 19c2-6 5-10 14-14-4 9-8 12-14 14zm7-7l5 5M4 20l4-1-3-3-1 4z" />,
    code: <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />,
    chat: (
      <>
        <path d="M5 5h14v10H8l-3 3V5z" />
        <path d="M9 9h6M9 12h4" />
      </>
    ),
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
    trophy: (
      <>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M5 6H3a4 4 0 0 0 4 4M19 6h2a4 4 0 0 1-4 4" />
      </>
    ),
    doc: <path d="M7 3h7l4 4v14H7V3zM14 3v5h5M10 13h6M10 17h4" />,
    sdk: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />,
    contract: <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />,
    demo: <path d="M4 7h16v10H4zM8 11h4M16 11h.01M18 11h.01" />,
    help: <path d="M12 18h.01M9.5 9a2.8 2.8 0 1 1 4.3 2.4c-1 .7-1.8 1.2-1.8 2.6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
    gift: (
      <>
        <path d="M12 2L8 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-4l-4-4z" />
        <path d="M12 2v13M9 11h6" />
      </>
    )
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function BountyButton({ children, variant = "primary", href = "#register" }: { children: ReactNode; variant?: "primary" | "dark" | "outline"; href?: string }) {
  return (
    <a className={ounty-button bounty-button-${variant}} href={href}>
      {children}
      {variant !== "outline" && <span>{"->"}</span>}
    </a>
  );
}

function StacksMark() {
  return (
    <a className="bounty-stacks-mark" href="https://stacks.co" target="_blank" rel="noopener noreferrer">
      <Image src={stacksLogo} alt="Stacks" width={28} height={28} unoptimized />
      <span>Stacks</span>
    </a>
  );
}

export default function BountyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SiteHeader />
      <main className="bounty-page">
        {/* SECTION 1 - HERO */}
        <section className="bounty-hero" id="bounty">
          <div className="bounty-hero-copy bounty-reveal">
            <div className="bounty-eyebrow">FlowVault Builder Bounty</div>
            <h2>
              Programmable
              <br />
              Money Flows
              <br />
              on <span>Stacks</span>
            </h2>
            <p className="bounty-hero-sub" style={{ fontSize: '1.25rem', lineHeight: '1.6', marginTop: '1rem' }}>
              Build applications that create new financial behaviors using FlowVault&apos;s programmable routing primitives.
              <br/><br/>
              Use locks, splits, treasury routing, payroll automation, reserve systems, creator payouts, and entirely new programmable money flows.
            </p>
            <div className="bounty-hero-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <BountyButton>Register for Bounty</BountyButton>
              <BountyButton variant="outline" href="https://docs.flow-vault.dev">View Documentation</BountyButton>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="bounty-prize-pool-badge">
                <strong>Prize Pool:</strong> ,000 USDCx
              </div>
              <div className="bounty-built-on">
                <small>Built on</small>
                <StacksMark />
              </div>
            </div>
          </div>

          <div className="bounty-hero-art bounty-reveal">
            <div className="bounty-grid-plane" />
            <Image
              className="bounty-hero-image"
              src="/hero_image.png"
              alt="FlowVault programmable money flow illustration"
              width={900}
              height={600}
              priority
            />
            <div className="bounty-float-card bounty-lock-card">
              <strong>Lock</strong>
              <span>Unlocks in 30 Days</span>
            </div>
            <div className="bounty-float-card bounty-split-card">
              <strong>Split</strong>
              <span>40% Team<br />60% Treasury</span>
            </div>
            <div className="bounty-float-card bounty-route-card">
              <strong>Route</strong>
              <span>Auto-distribute on Deposit</span>
            </div>
          </div>
        </section>

        {/* SECTION 2 - WHY FLOWVAULT */}
        <section className="bounty-why-section" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="bounty-section-copy" style={{ maxWidth: '800px' }}>
            <h2>Why FlowVault?</h2>
            <div style={{ fontSize: '1.25rem', lineHeight: '1.6', color: 'var(--text-muted)', marginTop: '2rem' }}>
              <p style={{ marginBottom: '1.5rem' }}>Most financial applications only move money.</p>
              <p style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}><strong>FlowVault enables developers to define how money behaves after deposit.</strong></p>
              <p style={{ marginBottom: '1.5rem' }}>Builders can combine time-locks, routing rules, treasury allocations, automated payouts, reserve systems, and programmable asset flows to create entirely new financial products on Stacks.</p>
              <p>The purpose of this bounty is to explore and validate these new financial behaviors through real applications.</p>
            </div>
          </div>
        </section>

        {/* SECTION 3 - WHAT WE ARE LOOKING FOR */}
        <section className="bounty-tracks" id="what-to-build">
          <div className="bounty-section-copy">
            <span>What We Are Looking For</span>
            <h2>Build New Financial Behaviors</h2>
            <p>We are especially interested in applications that introduce entirely new financial behaviors rather than simply replicating existing payment flows.</p>
          </div>
          <div className="bounty-track-grid">
            {tracks.map((track) => (
              <article className="bounty-card bounty-track-card" key={track.title} style={track.badge ? { border: '1px solid var(--accent)', boxShadow: '0 0 20px rgba(255, 100, 0, 0.1)' } : {}}>
                <div className="bounty-icon-orb"><Icon name={track.icon} /></div>
                <div>
                  {track.badge && <span className="bounty-badge" style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600, display: 'inline-block', marginBottom: '0.5rem' }}>{track.badge}</span>}
                  <h3>{track.title}</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Examples:</p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                      {track.examples.map(ex => <li key={ex}>{ex}</li>)}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 4 - WHAT WE ARE NOT LOOKING FOR */}
        <section className="bounty-not-looking-for" style={{ padding: '6rem 2rem', backgroundColor: 'rgba(255, 50, 50, 0.03)', borderTop: '1px solid rgba(255, 50, 50, 0.1)', borderBottom: '1px solid rgba(255, 50, 50, 0.1)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>What We Are <span style={{ color: '#ff5555' }}>NOT</span> Looking For</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#ff5555', fontWeight: 600 }}>Not Eligible</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notEligible.map(item => (
                    <li key={item} style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: '#ff5555' }}>❌</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#55ff55', fontWeight: 600 }}>What We Care About</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {whatWeCareAbout.map(item => (
                    <li key={item} style={{ display: 'flex', gap: '1rem', color: 'var(--foreground)' }}>
                      <span style={{ color: '#55ff55' }}>✅</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 - TECHNICAL REQUIREMENTS */}
        <section className="bounty-requirements" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="bounty-section-copy" style={{ marginBottom: '3rem' }}>
            <h2>Technical Requirements</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <div className="bounty-card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Every Submission Must Include</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {technicalRequirements.map(req => (
                  <li key={req} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bounty-card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Integration Requirements</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Projects must integrate at least one FlowVault primitive (or any combination):</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {integrationRequirements.map(req => (
                  <li key={req} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--foreground)', fontWeight: 500 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>✓</div>
                    {req}
                  </li>
                ))}
              </ul>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Projects should execute a real transaction flow on Stacks testnet or mainnet.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8 - JUDGING CRITERIA */}
        <section className="bounty-judging" id="judging" style={{ padding: '6rem 2rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(255,100,0,0.03) 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="bounty-section-copy" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2>How Winners Are Selected</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
              {judgingCriteria.map(criteria => (
                <div key={criteria.title} className="bounty-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', width: '100px', textAlign: 'right' }}>
                    {criteria.weight}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{criteria.title}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{criteria.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 - RESOURCES */}
        <section className="bounty-resources" id="resources" style={{ padding: '6rem 2rem' }}>
          <div className="bounty-section-copy">
            <span>Resources</span>
            <h2>Everything You Need To Build</h2>
            <p>Start building with our complete developer toolkit and documentation.</p>
          </div>
          <div className="bounty-resource-grid">
            {resources.map(([icon, title, text]) => (
              <article className="bounty-card bounty-resource-card" key={title}>
                <div className="bounty-resource-icon"><Icon name={icon} /></div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 7 - PRIZES */}
        <section className="bounty-prizes" id="prizes">
          <span className="bounty-section-label">Prizes</span>
          <h2>,000 USDCx Prize Pool</h2>
          <div className="bounty-prize-grid">
            {prizes.map(([rank, title, amount, tone, desc]) => (
              <article className={ounty-prize-card bounty-prize-${tone}} key={rank}>
                <div className="bounty-medal">{rank === 'gift' ? <Icon name="gift" /> : rank}</div>
                <p>{title}</p>
                <strong>{amount}</strong>
                <span>USDCx</span>
                <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{desc}</p>
              </article>
            ))}
          </div>
          <p className="bounty-note">Additional grants or ecosystem opportunities may be offered to standout builders.</p>
        </section>

        {/* SECTION 9 - TIMELINE */}
        <section className="bounty-timeline" id="timeline">
          <span className="bounty-section-label">Timeline</span>
          <h2>Important Dates</h2>
          <div className="bounty-timeline-track">
            {timeline.map(([icon, title, date]) => (
              <article className="bounty-timeline-item" key={title}>
                <div className="bounty-icon-orb"><Icon name={icon} /></div>
                <h3>{title}</h3>
                <p>{date}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 10 - FAQ */}
        <section className="bounty-faq" id="faq" style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div className="bounty-section-copy" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2>FAQ</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <details key={i} className="bounty-card" style={{ padding: '1.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                <summary style={{ fontSize: '1.125rem', fontWeight: 600, outline: 'none', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>+</span>
                </summary>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bounty-final-cta" id="register" style={{ padding: '8rem 2rem' }}>
          <Image src="/logo.png" alt="" width={112} height={112} />
          <div style={{ maxWidth: '800px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>Build The Future Of Programmable Money</h2>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
              Use FlowVault to create new financial behaviors on Stacks.
              <br/><br/>
              Experiment with treasury automation, programmable savings, creator economies, payroll routing, and entirely new programmable money flows.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <BountyButton>Register Now</BountyButton>
                <BountyButton variant="dark" href="https://docs.flow-vault.dev">View Documentation</BountyButton>
              </div>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                <span>,000 USDCx Prize Pool</span>
                <span>•</span>
                <span>Built on Stacks</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="bounty-footer">
          <div>
            <div className="bounty-footer-brand">
              <Image src="/logo.png" alt="FlowVault logo" width={30} height={30} />
              <strong>FlowVault</strong>
            </div>
            <p>Programmable asset routing layer on Stacks. Build. Route. Automate.</p>
          </div>
          <div className="bounty-footer-links">
            <a href="#bounty">Bounty</a>
            <a href="#what-to-build">Tracks</a>
            <a href="#timeline">Timeline</a>
            <a href="#judging">Judging</a>
            <a href="#faq">FAQ</a>
          </div>
          <StacksMark />
        </footer>
      </main>
    </div>
  );
}
