"use client";

const demoApps = [
  {
    name: "FlowPay",
    href: "https://flowpay.flow-vault.dev/",
    description: "Salary-style routing with savings, recipient payout, and liquid balance.",
    markerClass: "demo-menu-mark-flowpay",
  },
  {
    name: "Savings-Vault",
    href: "https://savings.flow-vault.dev/",
    description: "Locked savings reference flow with available balance tracking.",
    markerClass: "demo-menu-mark-savings",
  },
];

export function DemoAppsDropdown() {
  return (
    <div className="demo-dropdown">
      <button className="demo-trigger" type="button" aria-haspopup="true">
        <span>Demos</span>
        <svg
          aria-hidden="true"
          className="demo-trigger-icon"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5.5 7.5L10 12l4.5-4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      <div className="demo-menu" role="menu">
        <div className="demo-menu-header">
          <span>Reference apps</span>
          <strong>Live FlowVault demos</strong>
        </div>
        <div className="demo-menu-list">
          {demoApps.map((app) => (
            <a
              className="demo-menu-item"
              href={app.href}
              key={app.name}
              rel="noopener noreferrer"
              role="menuitem"
              target="_blank"
            >
              <span>
                <strong>{app.name}</strong>
                <small>{app.description}</small>
              </span>
              <span className="demo-menu-arrow" aria-hidden="true">
                -&gt;
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
