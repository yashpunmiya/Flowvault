import { DocPage } from "@/components/docs/DocPage";

export default function ImplementationPage() {
  return (
    <DocPage
      title="Implementation"
      summary="Internal architecture and execution model across contract logic, typed SDK paths, and browser wallet orchestration."
      toc={[
        { id: "layers", label: "System Layers" },
        { id: "state", label: "State Shape" },
        { id: "write-path", label: "Write Path" },
        { id: "read-path", label: "Read Path" },
        { id: "precision", label: "Amount Precision" },
        { id: "reliability", label: "Reliability Notes" },
      ]}
    >
      <section id="layers" className="doc-section-card">
        <h2>System Layers</h2>
        <pre className="doc-code">{`flowvault-contracts  ->  flowvault-sdk  ->  frontend/demo app\n(Clarity)               (typed interface)   (wallet UX)`}</pre>
        <p>
          The architecture intentionally keeps business rules on-chain and
          leaves client layers responsible for validation, UX, and retries.
        </p>
      </section>

      <section id="state" className="doc-section-card">
        <h2>State Shape</h2>
        <p>
          Per-principal state in FlowVault tracks at minimum unlocked balance,
          locked balance, and routing configuration values for split + lock.
        </p>
        <ul>
          <li><code>unlocked</code>: immediately withdrawable amount.</li>
          <li><code>locked</code>: amount subject to <code>lockUntilBlock</code>.</li>
          <li><code>splitAddress</code>: optional recipient for per-deposit split.</li>
          <li><code>splitAmount</code> and <code>lockAmount</code>: deterministic transfer values.</li>
        </ul>
      </section>

      <section id="write-path" className="doc-section-card">
        <h2>Write Path</h2>
        <ol>
          <li>SDK validates amount/address/routing input.</li>
          <li>SDK builds Clarity function arguments.</li>
          <li>SDK executes via senderKey mode or wallet executor mode.</li>
          <li>SDK normalizes tx id and returns TransactionResult.</li>
        </ol>
        <p>
          Wallet mode is recommended for web clients because private keys never
          enter browser runtime.
        </p>
      </section>

      <section id="read-path" className="doc-section-card">
        <h2>Read Path</h2>
        <ol>
          <li>SDK validates target principal address.</li>
          <li>SDK calls read-only contract function.</li>
          <li>SDK parses Clarity values into typed objects.</li>
          <li>Application renders state with clear locked/unlocked values.</li>
        </ol>
        <p>
          This parsing layer prevents UI teams from handling low-level Clarity
          tuple parsing directly.
        </p>
      </section>

      <section id="precision" className="doc-section-card">
        <h2>Amount Precision</h2>
        <p>
          tokenToMicro and microToToken use deterministic string parsing and
          bigint math to avoid floating-point rounding errors in financial
          flows.
        </p>
      </section>

      <section id="reliability" className="doc-section-card">
        <h2>Reliability Notes</h2>
        <ul>
          <li>Use idempotent UI actions with disabled submit during pending tx.</li>
          <li>Handle explorer latency by polling read state after write confirmation.</li>
          <li>Capture tx ids in logs for support and incident debugging.</li>
          <li>Validate STX address selection to avoid accidental BTC-address usage.</li>
        </ul>
      </section>
    </DocPage>
  );
}
