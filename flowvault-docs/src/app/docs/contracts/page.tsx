import { DocPage } from "@/components/docs/DocPage";

export default function ContractsPage() {
  return (
    <DocPage
      title="Contracts"
      summary="FlowVault smart contract surface, execution order, safety invariants, and canonical contract identifiers."
      toc={[
        { id: "functions", label: "Core Functions" },
        { id: "rules", label: "Rule Model" },
        { id: "routing", label: "Routing Mechanics" },
        { id: "invariants", label: "Safety Invariants" },
        { id: "addresses", label: "Network Addresses" },
      ]}
    >
      <section id="functions" className="doc-section-card">
        <h2>Core Functions</h2>
        <div className="doc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Function</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>set-routing-rules</td>
                <td>Set lock amount, lock-until block, split principal, and split amount.</td>
              </tr>
              <tr>
                <td>deposit</td>
                <td>Transfer SIP-010 token into vault and execute routing pipeline.</td>
              </tr>
              <tr>
                <td>withdraw</td>
                <td>Withdraw only unlocked vault balance owned by caller principal.</td>
              </tr>
              <tr>
                <td>clear-routing-rules</td>
                <td>Reset routing to default hold behavior.</td>
              </tr>
              <tr>
                <td>get-vault-state</td>
                <td>Return locked/unlocked balances and currently active routing values.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="rules" className="doc-section-card">
        <h2>Rule Model</h2>
        <p>
          Routing rules are principal-scoped. Each wallet configures its own
          values and deposits are evaluated against that caller state only.
        </p>
        <ul>
          <li><code>lockAmount</code>: portion that moves to locked balance each deposit.</li>
          <li><code>lockUntilBlock</code>: absolute chain height when locked amount unlocks.</li>
          <li><code>splitAddress</code>: optional principal receiving the split transfer.</li>
          <li><code>splitAmount</code>: fixed per-deposit transfer amount.</li>
        </ul>
      </section>

      <section id="routing" className="doc-section-card">
        <h2>Routing Mechanics</h2>
        <p>Deposit processing order is deterministic and always evaluated in this sequence:</p>
        <ol>
          <li>Split amount is sent to split-address (if configured).</li>
          <li>Lock amount is moved to locked balance until lockUntilBlock.</li>
          <li>Remaining amount stays unlocked in the user vault.</li>
        </ol>
        <p>
          If split + lock exceed deposit value, the transaction aborts rather
          than partially applying state.
        </p>
      </section>

      <section id="invariants" className="doc-section-card">
        <h2>Safety Invariants</h2>
        <ul>
          <li>Users cannot withdraw from locked balance before unlock height.</li>
          <li>Principal ownership is enforced for all mutable vault operations.</li>
          <li>Rule clearing always returns to hold-all default behavior.</li>
          <li>Read methods never mutate state and are safe for polling.</li>
        </ul>
      </section>

      <section id="addresses" className="doc-section-card">
        <h2>Network Addresses</h2>
        <ul>
          <li>FlowVault testnet: <code>STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault</code></li>
          <li>USDCx testnet: <code>ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx</code></li>
          <li>Mainnet USDCx: <code>SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx</code></li>
        </ul>
        <p>
          Use testnet values only in development. Never ship a frontend build
          with testnet token principal in production environment variables.
        </p>
      </section>
    </DocPage>
  );
}
