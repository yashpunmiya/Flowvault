import type { ReactNode } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";

const stacksLogo =
  "https://cdn.prod.website-files.com/618b0aafa4afde65f2fe38fe/65dbdd6c87cf20baca9ac049_stacks-logo-navbar.svg";

const features = [
  ["lock", "Lock", "Time-lock funds until conditions are met."],
  ["split", "Split", "Automatically split funds across multiple recipients."],
  ["route", "Route", "Automate complex payment flows with simple rules."],
  ["secure", "Secure", "Built on Clarity. Reliable. Non-custodial."],
  ["grid", "Composable", "Build new financial primitives and stack powerful use cases."]
];

const tracks = [
  ["team", "Payroll & Payments", "Automate salary splits, freelancer payouts, and recurring payments."],
  ["target", "Savings & Goals", "Build goal-based savings, lock funds, and reward consistency."],
  ["bank", "Treasury Automation", "DAO treasuries, budget routing, reserves, and operational flows."],
  ["coin", "Creator & Revenue Flows", "Route creator earnings, protocol fees, and revenue shares."]
];

const prizes = [
  ["2", "Second Place", "$2,000", "silver"],
  ["1", "First Place", "$4,000", "gold"],
  ["3", "Third Place", "$1,000", "violet"]
];

const timeline = [
  ["rocket", "Bounty Launch", "May 24, 2025"],
  ["code", "Build Period Starts", "May 24, 2025"],
  ["chat", "Midpoint Check-in", "June 14, 2025"],
  ["send", "Submission Deadline", "June 28, 2025"],
  ["trophy", "Winners Announced", "July 5, 2025"]
];

const resources = [
  ["doc", "Documentation", "Guides & tutorials"],
  ["sdk", "SDK", "TypeScript SDK"],
  ["contract", "Contracts", "Clarity Contracts"],
  ["example", "Examples", "Reference Apps"],
  ["demo", "Demo Apps", "Live Examples"],
  ["help", "Support", "Ask & connect"]
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
    example: <path d="M7 7h10v10H7zM4 4h5M15 4h5M4 15v5M20 15v5" />,
    demo: <path d="M4 7h16v10H4zM8 11h4M16 11h.01M18 11h.01" />,
    help: <path d="M12 18h.01M9.5 9a2.8 2.8 0 1 1 4.3 2.4c-1 .7-1.8 1.2-1.8 2.6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function BountyButton({ children, variant = "primary" }: { children: ReactNode; variant?: "primary" | "dark" }) {
  return (
    <a className={`bounty-button bounty-button-${variant}`} href="#register">
      {children}
      <span>{"->"}</span>
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
            <p>
              Build the future of programmable finance. Create innovative applications using FlowVault&apos;s routing primitives to automate how money moves.
            </p>
            <div className="bounty-hero-actions">
              <BountyButton>Register Now</BountyButton>
            </div>
            <div className="bounty-built-on">
              <small>Built on</small>
              <StacksMark />
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

        <section className="bounty-feature-strip">
          {features.map(([icon, title, text]) => (
            <article className="bounty-feature" key={title}>
              <div className="bounty-icon-orb"><Icon name={icon} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="bounty-tracks" id="tracks">
          <div className="bounty-section-copy">
            <span>Build Innovative Use Cases</span>
            <h2>Explore New Financial Behaviors</h2>
            <p>We&apos;re looking for creative builders who want to push the boundaries of programmable money. Some ideas to get you started:</p>
            <a href="#tracks">View all tracks {"->"}</a>
          </div>
          <div className="bounty-track-grid">
            {tracks.map(([icon, title, text]) => (
              <article className="bounty-card bounty-track-card" key={title}>
                <div className="bounty-icon-orb"><Icon name={icon} /></div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bounty-idea-banner">
          <div className="bounty-idea-icon"><Icon name="help" /></div>
          <div>
            <h3>Have a unique idea?</h3>
            <p>We love original and experimental builds that showcase new financial behaviors on Stacks.</p>
          </div>
          <BountyButton variant="dark">Share Your Idea</BountyButton>
        </section>

        <section className="bounty-prizes" id="prizes">
          <span className="bounty-section-label">Prizes</span>
          <h2>$USDCX Rewards</h2>
          <div className="bounty-prize-grid">
            {prizes.map(([rank, title, amount, tone]) => (
              <article className={`bounty-prize-card bounty-prize-${tone}`} key={rank}>
                <div className="bounty-medal">{rank}</div>
                <p>{title}</p>
                <strong>{amount}</strong>
                <span>USDCX</span>
              </article>
            ))}
          </div>
          <p className="bounty-note">Additional rewards and grants may be awarded to standout builds.</p>
        </section>

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

        <section className="bounty-resources" id="resources">
          <div className="bounty-section-copy">
            <span>Resources</span>
            <h2>Everything You Need to Build</h2>
            <p>Start building with our complete developer toolkit and documentation.</p>
            <a href="#resources">Explore Resources {"->"}</a>
          </div>
          <div className="bounty-resource-grid">
            {resources.map(([icon, title, text]) => (
              <article className="bounty-card bounty-resource-card" key={title}>
                <div className="bounty-resource-icon"><Icon name={icon} /></div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bounty-final-cta" id="register">
          <Image src="/logo.png" alt="" width={112} height={112} />
          <div>
            <h2>Ready to build the future of programmable finance?</h2>
            <p>Join the FlowVault builder bounty and start building today.</p>
          </div>
          <BountyButton>Register Now</BountyButton>
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
            <a href="#tracks">Tracks</a>
            <a href="#timeline">Timeline</a>
            <a href="#prizes">Prizes</a>
          </div>
          <StacksMark />
        </footer>
      </main>
    </div>
  );
}
