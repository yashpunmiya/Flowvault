const toc = [
  { id: "introduction", label: "Introduction" },
  { id: "architecture", label: "Architecture" },
  { id: "quickstart", label: "Quick Start" },
  { id: "contracts", label: "Smart Contracts" },
  { id: "sdk", label: "FlowVault SDK" },
  { id: "api", label: "SDK API Reference" },
  { id: "frontend", label: "Frontend Integration" },
  { id: "deployment", label: "Deployment" },
  { id: "operations", label: "Troubleshooting" },
];

const navSections = [
  {
    group: "Getting Started",
    links: [
      "Introduction",
      "Quick Start",
      "Deployment",
      "Frontend Integration",
    ],
  },
  {
    group: "FlowVault SDK",
    links: [
      "SDK Installation",
      "SDK Configuration",
      "SDK Write Calls",
      "SDK Read Calls",
      "SDK Error Handling",
    ],
  },
  {
    group: "Contracts",
    links: [
      "Core Functions",
      "Routing Rules",
      "Token Contracts",
      "Mainnet/Testnet Addresses",
    ],
  },
];

export default function Page() {
  return (
    <div className="docs-shell">
      <aside className="sidebar" aria-label="Sidebar navigation">
        <div className="brand" style={{ marginBottom: 16 }}>
          <span className="brand-dot" />
          <span>FlowVault Docs</span>
        </div>
        {navSections.map((section) => (
          <div key={section.group} style={{ marginBottom: 16 }}>
            <h3>{section.group}</h3>
            <ul className="nav-list">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <main className="main">
        <section className="hero" id="introduction">
          <h1>FlowVault Documentation</h1>
          <p>
            Official technical documentation for FlowVault smart contracts,
            FlowVault SDK, and frontend integration on Stacks. This guide is
            designed for builders shipping production apps on
            docs.flow-vault.dev.
          </p>
          <div className="quick-grid">
            <div className="quick-card">
              <strong>Contracts</strong>
              <span>Programmable USDCx routing with lock, split, and hold.</span>
            </div>
            <div className="quick-card">
              <strong>SDK</strong>
              <span>Typed TypeScript SDK for read and write operations.</span>
            </div>
            <div className="quick-card">
              <strong>Wallet Mode</strong>
              <span>
                Browser-friendly execution with contractCallExecutor support.
              </span>
            </div>
          </div>
        </section>

        <section className="doc-section" id="architecture">
          <h2>Architecture</h2>
          <p>
            FlowVault consists of three layers: Clarity contracts for on-chain
            state transitions, a TypeScript SDK for clean integration, and a
            frontend experience that delegates transaction signing to user
            wallets.
          </p>
          <div className="code">
{`flowvault/
├── flowvault-contracts/
│   ├── contracts/
│   │   ├── flowvault.clar
│   │   ├── mock-usdcx.clar
│   │   └── sip-010-trait.clar
│   └── tests/
├── flowvault-sdk/
│   ├── src/FlowVault.ts
│   ├── src/utils.ts
│   └── tests/
├── flowvault-frontend/
└── flowvault-sdk-demo/`}
          </div>
          <div className="note">
            Routing is deterministic and applied at deposit time: split first,
            lock second, hold remainder as unlocked balance.
          </div>
        </section>

        <section className="doc-section" id="quickstart">
          <h2>Quick Start</h2>
          <h3>Prerequisites</h3>
          <ul>
            <li>Node.js 18+</li>
            <li>Clarinet v3.13+</li>
            <li>Stacks wallet (Leather, Xverse, Hiro)</li>
            <li>Testnet STX and USDCx test funds</li>
          </ul>

          <h3>Install and run contracts</h3>
          <div className="code">
{`cd flowvault-contracts
npm install
clarinet check
npm test`}
          </div>

          <h3>Install and run frontend</h3>
          <div className="code">
{`cd flowvault-frontend
npm install
npm run dev`}
          </div>
        </section>

        <section className="doc-section" id="contracts">
          <h2>Smart Contracts</h2>
          <h3>Core contract functions</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Function</th>
                  <th>Purpose</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>set-routing-rules</td>
                  <td>
                    Configure lock amount, lock block, split address, split
                    amount.
                  </td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>deposit</td>
                  <td>Deposit SIP-010 token and apply routing rules.</td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>withdraw</td>
                  <td>Withdraw only unlocked funds.</td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>clear-routing-rules</td>
                  <td>Reset user rules back to default no-routing mode.</td>
                  <td>Public</td>
                </tr>
                <tr>
                  <td>get-vault-state</td>
                  <td>Read current balances, lock status, and rules.</td>
                  <td>Read-only</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Canonical addresses</h3>
          <ul>
            <li>FlowVault testnet: STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault</li>
            <li>USDCx testnet: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx</li>
            <li>Mainnet USDCx: SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx</li>
          </ul>
        </section>

        <section className="doc-section" id="sdk">
          <h2>FlowVault SDK</h2>
          <p>
            FlowVault SDK is a typed integration layer that wraps contract
            operations with deterministic validation and parse-safe outputs.
          </p>

          <h3>Install</h3>
          <div className="code">npm install flowvault-sdk@0.1.1</div>

          <h3>Basic initialization</h3>
          <div className="code">
{`import { FlowVault } from "flowvault-sdk";

const vault = new FlowVault({
  network: "testnet",
  contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
  contractName: "flowvault",
  tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  tokenContractName: "usdcx",
  senderKey: process.env.STACKS_PRIVATE_KEY,
});`}
          </div>

          <h3>Wallet executor mode (browser-safe)</h3>
          <div className="code">
{`import { request } from "@stacks/connect";
import { FlowVault } from "flowvault-sdk";

const walletVault = new FlowVault({
  network: "testnet",
  contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
  contractName: "flowvault",
  tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  tokenContractName: "usdcx",
  senderAddress: "ST...",
  contractCallExecutor: async (call) => request("stx_callContract", {
    contract: call.contractAddress + "." + call.contractName,
    functionName: call.functionName,
    functionArgs: call.functionArgs,
    network: call.network,
    postConditionMode: "allow",
    postConditions: call.postConditions,
  }),
});`}
          </div>
        </section>

        <section className="doc-section" id="api">
          <h2>SDK API Reference</h2>
          <h3>State-changing methods</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Arguments</th>
                  <th>Returns</th>
                  <th>Contract function</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>setRoutingRules</td>
                  <td>rules, options?</td>
                  <td>Promise&lt;TransactionResult&gt;</td>
                  <td>set-routing-rules</td>
                </tr>
                <tr>
                  <td>deposit</td>
                  <td>amount, options?</td>
                  <td>Promise&lt;TransactionResult&gt;</td>
                  <td>deposit</td>
                </tr>
                <tr>
                  <td>withdraw</td>
                  <td>amount, options?</td>
                  <td>Promise&lt;TransactionResult&gt;</td>
                  <td>withdraw</td>
                </tr>
                <tr>
                  <td>clearRoutingRules</td>
                  <td>options?</td>
                  <td>Promise&lt;TransactionResult&gt;</td>
                  <td>clear-routing-rules</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Read methods</h3>
          <ul>
            <li>getVaultState(userAddress): Promise&lt;VaultState&gt;</li>
            <li>getRoutingRules(userAddress): Promise&lt;RoutingRules | null&gt;</li>
            <li>hasLockedFunds(userAddress): Promise&lt;boolean&gt;</li>
            <li>getCurrentBlockHeight(senderAddress): Promise&lt;number&gt;</li>
          </ul>

          <h3>Conversion utilities</h3>
          <ul>
            <li>tokenToMicro("1.5") =&gt; 1500000n</li>
            <li>microToToken(1500000) =&gt; "1.5"</li>
          </ul>
          <p>
            Utilities use string parsing + bigint arithmetic to avoid floating
            point precision errors.
          </p>
        </section>

        <section className="doc-section" id="frontend">
          <h2>Frontend Integration</h2>
          <p>
            Use the connected wallet address as senderAddress and keep all
            writes delegated through contractCallExecutor. This aligns with
            production wallet security and avoids private key exposure.
          </p>

          <h3>Recommended environment variables</h3>
          <div className="code">
{`NEXT_PUBLIC_FLOWVAULT_NETWORK=testnet
NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS=STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD
NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME=flowvault
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME=usdcx`}
          </div>

          <h3>Lock behavior note</h3>
          <div className="note">
            If lockAmount &gt; 0, lockUntilBlock must be greater than the current
            chain block. In UI, prefer duration-based input and compute current
            + duration.
          </div>
        </section>

        <section className="doc-section" id="deployment">
          <h2>Deployment</h2>
          <h3>Contracts</h3>
          <div className="code">
{`cd flowvault-contracts
clarinet deployments generate --testnet --medium-cost
clarinet deployments apply --testnet`}
          </div>

          <h3>Frontend app</h3>
          <div className="code">
{`cd flowvault-frontend
npm run build`}
          </div>

          <h3>Docs app</h3>
          <div className="code">
{`cd flowvault-docs
npm install
npm run build`}
          </div>

          <p>
            Deploy this docs app to your hosting provider and map the domain
            docs.flow-vault.dev to the deployment target.
          </p>
        </section>

        <section className="doc-section" id="operations">
          <h2>Troubleshooting</h2>
          <h3>InvalidAddressError with tb1...</h3>
          <p>
            Ensure wallet integration selects STX addresses (ST/SP/SM/SN), not
            Bitcoin addresses.
          </p>

          <h3>lockUntilBlock must be in the future</h3>
          <p>
            Use current block + buffer. Do not send stale or past absolute
            heights.
          </p>

          <h3>Publish/version mismatch</h3>
          <p>
            Always bump package version intentionally (patch/minor/major), then
            publish after authentication.
          </p>
        </section>
      </main>

      <aside className="toc" aria-label="Table of contents">
        <h3>On this page</h3>
        <ul className="toc-list">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
