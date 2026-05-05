import { DocPage } from "@/components/docs/DocPage";

export default function DemoAppPage() {
  return (
    <DocPage
      title="Demo App"
      summary="Reference browser implementation of wallet-connected FlowVault flows, including user-state refresh and transaction feedback."
      toc={[
        { id: "purpose", label: "Purpose" },
        { id: "reference-implementations", label: "Reference Implementations" },
        { id: "flow", label: "User Flow" },
        { id: "ui", label: "UI Responsibilities" },
        { id: "integration", label: "SDK Integration" },
        { id: "checks", label: "Validation Rules" },
      ]}
    >
      <section id="purpose" className="doc-section-card">
        <h2>Purpose</h2>
        <p>
          The demo app proves production-like wallet behavior: users sign
          transactions in-wallet while SDK handles argument building, validation,
          and response normalization.
        </p>
        <p>
          It also acts as an integration baseline to validate updates in wallet
          adapters, contract names, or SDK releases.
        </p>
      </section>

      <section id="reference-implementations" className="doc-section-card">
        <h2>Reference implementations available:</h2>
        <p>
          These hosted examples are small, focused applications built against
          the FlowVault SDK. Use them to compare wallet behavior, strategy
          setup, deposit submission, and post-transaction feedback without
          reading the full frontend first.
        </p>

        <div className="reference-app-grid">
          <a
            className="reference-app-card reference-app-savings"
            href="https://savings.flow-vault.dev/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="reference-app-kicker">Savings</span>
            <strong>Savings-Vault</strong>
            <p>
              Demonstrates a fixed savings strategy: deposit USDCx, lock the
              savings allocation for the configured block window, and keep the
              remainder available for withdrawal.
            </p>
            <small>Open savings.flow-vault.dev</small>
          </a>

          <a
            className="reference-app-card reference-app-flowpay"
            href="https://flowpay.flow-vault.dev/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="reference-app-kicker">FlowPay</span>
            <strong>FlowPay</strong>
            <p>
              Demonstrates a payroll-style route: one deposit is split between
              locked savings, a recipient payout, and the sender&apos;s liquid
              balance before the wallet signs.
            </p>
            <small>Open flowpay.flow-vault.dev</small>
          </a>
        </div>
      </section>

      <section id="flow" className="doc-section-card">
        <h2>User Flow</h2>
        <ol>
          <li>Connect wallet and resolve STX sender address.</li>
          <li>Set routing rules (lock and split).</li>
          <li>Deposit USDCx with wallet signature.</li>
          <li>Read vault state for balances and active rules.</li>
          <li>Withdraw unlocked funds.</li>
        </ol>
      </section>

      <section id="ui" className="doc-section-card">
        <h2>UI Responsibilities</h2>
        <ul>
          <li>Display active network and contract principal pair.</li>
          <li>Prevent submits while wallet request is in-flight.</li>
          <li>Show transaction ids and links to explorer for every write.</li>
          <li>Refresh vault state after each successful confirmation.</li>
          <li>Render locked and unlocked balances with micro-unit precision.</li>
        </ul>
      </section>

      <section id="integration" className="doc-section-card">
        <h2>SDK Integration</h2>
        <pre className="doc-code">{`const flowVault = new FlowVault({\n  network,\n  contractAddress,\n  contractName,\n  tokenContractAddress,\n  tokenContractName,\n  senderAddress: walletAddress,\n  contractCallExecutor: async (call) => request("stx_callContract", {\n    contract: call.contractAddress + "." + call.contractName,\n    functionName: call.functionName,\n    functionArgs: call.functionArgs,\n    network: call.network,\n    postConditionMode: "allow",\n    postConditions: call.postConditions,\n  }),\n});`}</pre>
      </section>

      <section id="checks" className="doc-section-card">
        <h2>Validation Rules</h2>
        <ul>
          <li>Wallet address must be STX format (not BTC tb1 format).</li>
          <li>lockUntilBlock must resolve to a future chain block when lockAmount {'>'} 0.</li>
          <li>splitAddress is required when splitAmount {'>'} 0.</li>
        </ul>
      </section>
    </DocPage>
  );
}
