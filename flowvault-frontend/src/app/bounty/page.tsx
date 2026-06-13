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
  ["doc", "Documentation", "FlowVault guides, integration tutorials, and API reference.", "https://docs.flow-vault.dev"],
  ["sdk", "TypeScript SDK", "Official flowvault-sdk package on the NPM registry.", "https://www.npmjs.com/package/flowvault-sdk"],
  ["contract", "Clarity Contracts", "Clarity smart contracts and unit test suites on GitHub.", "https://github.com/yashpunmiya/Flowvault/tree/main/flowvault-contracts"],
  ["code", "Reference Examples", "Next.js reference app showcasing FlowVault SDK integration.", "https://github.com/yashpunmiya/Flowvault/tree/main/flowvault-sdk-demo"],
  ["demo", "Live Demo App", "Try the fully deployed FlowVault reference implementation.", "https://flowvaultx.vercel.app"],
  ["help", "Support & Issues", "Submit bugs, request features, or ask integration questions.", "https://github.com/yashpunmiya/Flowvault/issues"]
];

const prizes = [
  ["1", "First Place", "350", "gold", "Most innovative and complete FlowVault integration."],
  ["2", "Second Place", "200", "silver", "Strong execution and ecosystem value."],
  ["3", "Third Place", "150", "violet", "Promising concept with solid implementation."],
  ["gift", "Builder Awards", "300", "purple", "Distributed across multiple builders for SDK improvements, docs, feedback, etc."]
];

const judgingCriteria = [
  { title: "Innovation & Design", weight: "35%", desc: "How novel and impactful is the financial behavior being created?" },
  { title: "FlowVault Integration", weight: "30%", desc: "How deeply does the project utilize FlowVault's programmable primitives?" },
  { title: "Technical Execution", weight: "20%", desc: "Code quality, implementation standards, reliability, and visual UX." },
  { title: "Ecosystem Value", weight: "15%", desc: "The potential of the project to add long-term value to the Stacks community." }
];

const timeline = [
  ["rocket", "Onboarding", "June 12 – June 18"],
  ["code", "Build Period", "June 19 – June 25"],
  ["send", "Submission", "June 25 (23:59 UTC)"],
  ["chat", "Judging", "June 26 – June 27"],
  ["trophy", "Winners", "June 28, 2026"]
];

const faqs = [
  { q: "Can I build solo?", a: "Yes. Both individual developers and teams are fully eligible to participate." },
  { q: "Can teams participate?", a: "Yes. You can form teams and collaborate. Prizes will be sent to the registered team wallet." },
  { q: "Can I use AI tools?", a: "Yes. We encourage using AI tools for productivity, but your logic and integration must be original and functional." },
  { q: "Must I deploy on mainnet?", a: "No. Stacks Testnet deployments are fully accepted and evaluated equally." },
  { q: "Can I build something not listed in the examples?", a: "Yes. We highly encourage original concepts outside the provided list." },
  { q: "Do I need to integrate FlowVault?", a: "Yes. Integrating one or more of FlowVault's smart contract primitives or TypeScript SDK is a strict requirement." },
  { q: "Can I combine multiple FlowVault primitives?", a: "Yes. Projects that combine locks, splits, and custom routing will receive high integration depth scores." }
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
  const isExternal = href?.startsWith("http");
  return (
    <a 
      className={`bounty-button bounty-button-${variant} group`} 
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      <span>{children}</span>
      {variant !== "outline" && (
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      )}
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
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
      {/* STICKY SUB-NAVBAR */}
      <nav className="bounty-sub-nav">
        <div className="bounty-sub-nav-inner">
          <a href="#bounty-why-section">Overview</a>
          <a href="#what-to-build">Tracks</a>
          <a href="#requirements">Requirements</a>
          <a href="#judging">Judging</a>
          <a href="#prizes">Prizes</a>
          <a href="#timeline">Timeline</a>
          <a href="#faq">FAQ</a>
        </div>
      </nav>

      <main className="bounty-page">
        {/* SECTION 1 - HERO */}
        <section className="bounty-hero" id="bounty">
          <div className="bounty-hero-copy bounty-reveal">
            <div className="bounty-eyebrow">FlowVault Builder Bounty</div>
            <h2 className="bounty-hero-title">
              Programmable
              <br />
              Money Flows
              <br />
              on <span className="bounty-accent-text">Stacks</span>
            </h2>
            <p className="bounty-hero-sub">
              Build applications that create new financial behaviors using FlowVault&apos;s programmable routing primitives.
              Use locks, splits, treasury routing, payroll automation, reserve systems, creator payouts, and entirely new programmable money flows.
            </p>
            <div className="bounty-hero-actions">
              <BountyButton href="https://earthy-mandrill-c8b.notion.site/ebd//37c2b15361fd80c98165c5a82527efe2">Register & Submit Project</BountyButton>
              <BountyButton variant="outline" href="https://docs.flow-vault.dev">View Documentation</BountyButton>
            </div>
            
            <div className="bounty-hero-badges">
              <div className="bounty-prize-pool-badge">
                <span className="badge-dot animate-pulse"></span>
                <strong>Prize Pool:</strong> 1,000 USDT
              </div>
              <div className="bounty-built-on">
                <small>Built on</small>
                <StacksMark />
              </div>
            </div>
          </div>

          <div className="bounty-hero-art bounty-reveal">
            <div className="bounty-grid-plane" />
            <div className="bounty-hero-image-wrapper">
              <Image
                className="bounty-hero-image"
                src="/hero_image.png"
                alt="FlowVault programmable money flow illustration"
                width={900}
                height={600}
                priority
              />
              <div className="bounty-float-card bounty-lock-card">
                <div className="card-badge"><Icon name="lock" /></div>
                <strong>Lock</strong>
                <span>Unlocks in 30 Days</span>
              </div>
              <div className="bounty-float-card bounty-split-card">
                <div className="card-badge"><Icon name="split" /></div>
                <strong>Split</strong>
                <span>40% Team<br />60% Treasury</span>
              </div>
              <div className="bounty-float-card bounty-route-card">
                <div className="card-badge"><Icon name="route" /></div>
                <strong>Route</strong>
                <span>Auto-distribute on Deposit</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 - WHY FLOWVAULT */}
        <section className="bounty-why-section" id="bounty-why-section">
          <div className="bounty-why-container">
            <div className="bounty-section-header">
              <span className="bounty-section-tag">Overview</span>
              <h2>Why FlowVault?</h2>
            </div>
            <div className="bounty-why-content">
              <div className="why-hero-text">
                <p>Most financial applications only move money.</p>
                <p className="why-hero-highlight">
                  FlowVault enables developers to define how money behaves after deposit.
                </p>
                <p className="why-hero-description">
                  Builders can combine time-locks, routing rules, treasury allocations, automated payouts, reserve systems, and programmable asset flows to create entirely new financial products on Stacks. The purpose of this bounty is to explore and validate these new financial behaviors through real applications.
                </p>
              </div>
              <div className="why-features-grid">
                <div className="why-feature-card">
                  <div className="why-card-icon"><Icon name="lock" /></div>
                  <h4>Time-Locks & Escrow</h4>
                  <p>Define precise unlock schedules and condition-based release rules for assets.</p>
                </div>
                <div className="why-feature-card">
                  <div className="why-card-icon"><Icon name="split" /></div>
                  <h4>Treasury & Revenue Splits</h4>
                  <p>Route funds automatically between team members, community pools, and operational reserves.</p>
                </div>
                <div className="why-feature-card">
                  <div className="why-card-icon"><Icon name="route" /></div>
                  <h4>Automated Payouts</h4>
                  <p>Create event-triggered money flows for freelancer payouts, DAO routing, or AI agents.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - WHAT WE ARE LOOKING FOR */}
        <section className="bounty-tracks" id="what-to-build">
          <div className="bounty-section-copy">
            <span className="bounty-section-tag">Bounty Tracks</span>
            <h2>Build New Financial Behaviors</h2>
            <p>We are especially interested in applications that introduce entirely new financial behaviors rather than simply replicating existing payment flows.</p>
          </div>
          <div className="bounty-track-grid">
            {tracks.map((track) => {
              const isHighInnovation = track.badge !== undefined;
              return (
                <article className={`bounty-card bounty-track-card ${isHighInnovation ? 'high-innovation' : ''}`} key={track.title}>
                  <div className="bounty-icon-orb"><Icon name={track.icon} /></div>
                  <div className="track-card-content">
                    {track.badge && <span className="bounty-badge">{track.badge}</span>}
                    <h3>{track.title}</h3>
                    <div className="track-examples">
                      <p>Examples:</p>
                      <ul>
                        {track.examples.map(ex => <li key={ex}>{ex}</li>)}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* SECTION 4 - WHAT WE ARE NOT LOOKING FOR */}
        <section className="bounty-not-looking-for">
          <div className="contrast-container">
            <h2>What to Avoid vs. What to Focus On</h2>
            <p className="contrast-subtitle">Helpful guidelines to align your project with our criteria.</p>
            
            <div className="contrast-grid">
              <div className="contrast-card card-avoid">
                <div className="contrast-card-header">
                  <span className="card-badge-icon">❌</span>
                  <h3>Not Eligible</h3>
                </div>
                <ul>
                  {notEligible.map(item => (
                    <li key={item}>
                      <span className="bullet-icon">✕</span>
                      <span className="bullet-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="contrast-card card-focus">
                <div className="contrast-card-header">
                  <span className="card-badge-icon">✅</span>
                  <h3>What We Care About</h3>
                </div>
                <ul>
                  {whatWeCareAbout.map(item => (
                    <li key={item}>
                      <span className="bullet-icon">✓</span>
                      <span className="bullet-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 - TECHNICAL REQUIREMENTS */}
        <section className="bounty-requirements" id="requirements">
          <div className="bounty-section-header">
            <span className="bounty-section-tag">Rules</span>
            <h2>Submission Requirements</h2>
          </div>
          
          <div className="requirements-grid">
            <div className="requirements-card">
              <h3>Submission Deliverables</h3>
              <p className="req-card-sub">Every submission must provide the following artifacts:</p>
              <ul className="req-list">
                {technicalRequirements.map((req, idx) => (
                  <li key={req} className="req-item">
                    <span className="req-number">{idx + 1}</span>
                    <span className="req-text">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="requirements-card">
              <h3>Integration Primitives</h3>
              <p className="req-card-sub">Projects must integrate at least one FlowVault primitive (or any combination):</p>
              <div className="primitive-tags-container">
                {integrationRequirements.map(req => (
                  <div key={req} className="primitive-badge">
                    <span className="primitive-icon"><Icon name={req.toLowerCase()} /></span>
                    <span className="primitive-label">{req} Vault Flow</span>
                  </div>
                ))}
              </div>
              <div className="req-note-box">
                <p>Projects should execute a real transaction flow on Stacks testnet or mainnet. The integration must be functional and auditable via explorer links.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8 - JUDGING CRITERIA */}
        <section className="bounty-judging" id="judging">
          <div className="bounty-section-header-center">
            <span className="bounty-section-tag">Evaluation</span>
            <h2>How Winners Are Selected</h2>
            <p>Our panel of judges will score submissions based on the following criteria.</p>
          </div>
          
          <div className="judging-grid">
            {judgingCriteria.map(criteria => (
              <div key={criteria.title} className="judging-card">
                <div className="judging-weight-badge">
                  {criteria.weight}
                </div>
                <div className="judging-content">
                  <h3>{criteria.title}</h3>
                  <p>{criteria.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 - RESOURCES */}
        <section className="bounty-resources" id="resources">
          <div className="bounty-section-copy">
            <span className="bounty-section-tag">Developer Toolkit</span>
            <h2>Everything You Need To Build</h2>
            <p>Start building with our complete developer toolkit, libraries, documentation, and reference apps.</p>
          </div>
          <div className="bounty-resource-grid">
            {resources.map(([icon, title, text, link]) => (
              <a className="bounty-card bounty-resource-card group hover:no-underline" key={title} href={link} target="_blank" rel="noopener noreferrer">
                <div className="bounty-resource-icon"><Icon name={icon} /></div>
                <div className="resource-card-content">
                  <h3 className="flex items-center gap-1.5 font-bold">
                    {title}
                    <svg className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </h3>
                  <p>{text}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* SECTION 7 - PRIZES */}
        <section className="bounty-prizes" id="prizes">
          <span className="bounty-section-tag">Rewards</span>
          <h2>1,000 USDT Prize Pool</h2>
          <p className="prizes-subtitle">Prizes will be paid directly in USDT on the Stacks network.</p>
          
          <div className="bounty-prize-grid">
            {prizes.map(([rank, title, amount, tone, desc]) => (
              <article className={`bounty-prize-card bounty-prize-${tone}`} key={rank}>
                <div className="bounty-medal">
                  {rank === 'gift' ? <Icon name="gift" /> : <span>#{rank}</span>}
                </div>
                <h3 className="prize-rank-title">{title}</h3>
                <div className="prize-amount-group">
                  <strong>${amount}</strong>
                  <span>USDT</span>
                </div>
                <p className="prize-desc">{desc}</p>
              </article>
            ))}
          </div>
          <p className="bounty-note">Additional grants or ecosystem opportunities may be offered to standout builders.</p>
        </section>

        {/* SECTION 9 - TIMELINE */}
        <section className="bounty-timeline" id="timeline">
          <span className="bounty-section-tag">Schedule</span>
          <h2>Important Dates</h2>
          <div className="bounty-timeline-container">
            <div className="timeline-progress-line" />
            <div className="bounty-timeline-track">
              {timeline.map(([icon, title, date]) => (
                <article className="bounty-timeline-item" key={title}>
                  <div className="bounty-icon-orb"><Icon name={icon} /></div>
                  <div className="timeline-item-content">
                    <h3>{title}</h3>
                    <p>{date}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 10 - FAQ */}
        <section className="bounty-faq" id="faq">
          <div className="bounty-section-header-center">
            <span className="bounty-section-tag">Answers</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-container">
            {faqs.map((faq, i) => (
              <details key={i} className="faq-card">
                <summary className="faq-summary">
                  <span>{faq.q}</span>
                  <span className="faq-toggle-icon">
                    <svg className="w-5 h-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </span>
                </summary>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bounty-final-cta" id="register">
          <div className="cta-gradient-glow" />
          <div className="cta-inner">
            <Image className="cta-logo" src="/logo.png" alt="" width={112} height={112} />
            <div className="cta-content">
              <h2>Build The Future Of Programmable Money</h2>
              <p>
                Use FlowVault to create new financial behaviors on Stacks.
                Experiment with treasury automation, programmable savings, creator economies, payroll routing, and entirely new programmable money flows.
              </p>
              
              <div className="cta-actions-wrapper">
                <div className="cta-buttons">
                  <BountyButton href="https://earthy-mandrill-c8b.notion.site/ebd//37c2b15361fd80c98165c5a82527efe2">Register & Submit Project</BountyButton>
                  <BountyButton variant="dark" href="https://docs.flow-vault.dev">View Documentation</BountyButton>
                </div>
                <div className="cta-meta">
                  <span>1,000 USDT Prize Pool</span>
                  <span className="dot">•</span>
                  <span>Built on Stacks</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bounty-footer">
          <div className="footer-left">
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
