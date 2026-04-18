import { DocPage } from "@/components/docs/DocPage";

export default function GettingStartedPage() {
  return (
    <DocPage
      title="Getting Started"
      summary="Production onboarding path for FlowVault, from first install to validated deposit flow, including a handoff format for AI-assisted implementation."
      audience="Web3 engineers and AI coding agents"
      mode="Implementation"
      toc={[
        { id: "overview", label: "Overview" },
        { id: "architecture", label: "Workspace Architecture" },
        { id: "prerequisites", label: "Prerequisites" },
        { id: "quick-path", label: "Quick Path" },
        { id: "env", label: "Environment Setup" },
        { id: "smoke", label: "Smoke Test" },
        { id: "handoff", label: "AI Handoff Packet" },
      ]}
    >
      <section id="overview" className="doc-section-card">
        <h2>Overview</h2>
        <p>
          FlowVault combines Clarity contracts with a typed TypeScript SDK and
          wallet-first frontend architecture. Every write operation is executed
          on-chain and client layers are responsible for validation and UX.
        </p>
        <div className="doc-callout">
          <strong>Goal:</strong> complete one verified cycle: configure routing
          rules, deposit, read state, and withdraw unlocked balance.
        </div>
      </section>

      <section id="architecture" className="doc-section-card">
        <h2>Workspace Architecture</h2>
        <div className="doc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Responsibility</th>
                <th>Entry Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>flowvault-contracts</td>
                <td>On-chain routing behavior, lock mechanics, transfer invariants.</td>
                <td><code>clarinet check</code> and <code>npm test</code></td>
              </tr>
              <tr>
                <td>flowvault-sdk</td>
                <td>Typed interface for write/read calls and parsing of Clarity values.</td>
                <td><code>npm run build</code> and integration tests</td>
              </tr>
              <tr>
                <td>flowvault-frontend</td>
                <td>Wallet connection, transaction approval UX, and state polling.</td>
                <td><code>npm run dev</code> with testnet env vars</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The stack is split into three independently deployable packages:
          <code>flowvault-contracts</code>, <code>flowvault-sdk</code>, and
          <code>flowvault-frontend</code>. This separation lets you upgrade UI
          logic without changing on-chain behavior.
        </p>
      </section>

      <section id="prerequisites" className="doc-section-card">
        <h2>Prerequisites</h2>
        <ul>
          <li>Node.js 18+</li>
          <li>Clarinet 3.13+</li>
          <li>Stacks wallet (Leather, Xverse, Hiro)</li>
          <li>Testnet STX and USDCx test liquidity</li>
          <li>A deployment account with sufficient STX for fees</li>
        </ul>
      </section>

      <section id="quick-path" className="doc-section-card">
        <h2>Quick Path</h2>
        <h3>1) Contract workspace</h3>
        <pre className="doc-code">{`cd flowvault-contracts\nnpm install\nclarinet check\nnpm test`}</pre>
        <p>
          Ensure all tests pass before deployment. Failed tests usually mean
          routing math or lock timing logic changed.
        </p>

        <h3>2) Frontend workspace</h3>
        <pre className="doc-code">{`cd flowvault-frontend\nnpm install\nnpm run dev`}</pre>
        <p>
          Start in development mode first so you can verify wallet connection
          and read-only calls before sending transactions.
        </p>

        <h3>3) SDK workspace</h3>
        <pre className="doc-code">{`cd flowvault-sdk\nnpm install\nnpm test\nnpm run build`}</pre>
        <p>
          Keep SDK and frontend versions aligned. If frontend behavior differs
          from docs, check your installed SDK version.
        </p>
      </section>

      <section id="env" className="doc-section-card">
        <h2>Environment Setup</h2>
        <pre className="doc-code">{`NEXT_PUBLIC_FLOWVAULT_NETWORK=testnet\nNEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS=STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD\nNEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME=flowvault\nNEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM\nNEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME=usdcx`}</pre>
        <p>
          For mainnet migration, switch both contract principals together.
          Mixed environments are the most common source of failed transfers.
        </p>
        <div className="doc-callout">
          <strong>Rule:</strong> keep contract and token principals from the
          same network. Mixed testnet/mainnet pairs are invalid.
        </div>
      </section>

      <section id="smoke" className="doc-section-card">
        <h2>Smoke Test</h2>
        <ol>
          <li>Connect wallet and confirm an STX address is detected.</li>
          <li>Call read methods: <code>getVaultState</code> and <code>getRoutingRules</code>.</li>
          <li>Set routing rules with no split and a short lock duration.</li>
          <li>Deposit a small amount and confirm tx id is returned.</li>
          <li>Refresh state and verify unlocked or locked balances changed.</li>
        </ol>
      </section>

      <section id="handoff" className="doc-section-card">
        <h2>AI Handoff Packet</h2>
        <p>
          When delegating implementation to an AI assistant, provide this
          minimum context package in one message.
        </p>
        <pre className="doc-code">{`Project: FlowVault integration
Network: testnet
Contract: STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault
Token: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx
Wallet mode: @stacks/connect request("stx_callContract")
Required flows: setRoutingRules, deposit, getVaultState, withdraw
Validation: enforce STX address only, future lock block, split rules
Output required: TS code, env config, and runbook commands`}</pre>
      </section>
    </DocPage>
  );
}
