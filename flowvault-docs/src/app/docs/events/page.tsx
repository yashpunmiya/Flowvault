import { DocPage } from "@/components/docs/DocPage";

export default function EventsDocPage() {
  return (
    <DocPage
      title="Event Documentation"
      summary="On-chain print event structures emitted by FlowVault contracts for real-time tracking, indexing, and transactional audits."
      audience="DeFi builders and data indexer teams"
      mode="Reference"
      toc={[
        { id: "overview", label: "Overview" },
        { id: "deposit", label: "Deposit Event" },
        { id: "withdraw", label: "Withdraw Event" },
        { id: "strategy", label: "Strategy Configurations" },
      ]}
    >
      <section id="overview" className="doc-section-card">
        <h2>Overview</h2>
        <p>
          FlowVault uses Clarity's native <code>print</code> command to emit
          structured events for state-changing operations. External indexers (such as Hiro API indexer, Subquery, or custom chain monitors) parse these print events to track user deposit history and routing logs.
        </p>
      </section>

      <section id="deposit" className="doc-section-card">
        <h2>Deposit Event</h2>
        <p>
          Emitted when a user submits a deposit transaction. It includes the complete routing breakdown detailing splits, locked amounts, and held balances as configured in their active strategy.
        </p>
        <h3>Event Payload Schema</h3>
        <div className="doc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Clarity Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>event</code></td>
                <td><code>(string-ascii 7)</code></td>
                <td>Always set to <code>"deposit"</code>.</td>
              </tr>
              <tr>
                <td><code>depositor</code></td>
                <td><code>principal</code></td>
                <td>Address of the depositor principal.</td>
              </tr>
              <tr>
                <td><code>amount</code></td>
                <td><code>uint</code></td>
                <td>Total deposit amount in micro-units.</td>
              </tr>
              <tr>
                <td><code>split-amount</code></td>
                <td><code>uint</code></td>
                <td>The portion routed to the split address.</td>
              </tr>
              <tr>
                <td><code>split-to</code></td>
                <td><code>(optional principal)</code></td>
                <td>Optional recipient address of the split amount.</td>
              </tr>
              <tr>
                <td><code>lock-amount</code></td>
                <td><code>uint</code></td>
                <td>The portion locked until lock-until block.</td>
              </tr>
              <tr>
                <td><code>lock-until</code></td>
                <td><code>uint</code></td>
                <td>Absolute block height at which lock expires.</td>
              </tr>
              <tr>
                <td><code>hold-amount</code></td>
                <td><code>uint</code></td>
                <td>Remaining portion kept in user's liquid vault balance.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Example Payload</h3>
        <pre className="doc-code">{`{
  event: "deposit",
  depositor: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5,
  amount: u1000000,
  split-amount: u200000,
  split-to: (some 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG),
  lock-amount: u300000,
  lock-until: u103,
  hold-amount: u800000
}`}</pre>
      </section>

      <section id="withdraw" className="doc-section-card">
        <h2>Withdraw Event</h2>
        <p>
          Emitted when a user withdraws unlocked funds from their vault.
        </p>
        <h3>Event Payload Schema</h3>
        <div className="doc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Clarity Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>event</code></td>
                <td><code>(string-ascii 8)</code></td>
                <td>Always set to <code>"withdraw"</code>.</td>
              </tr>
              <tr>
                <td><code>withdrawer</code></td>
                <td><code>principal</code></td>
                <td>Address of the withdrawer principal.</td>
              </tr>
              <tr>
                <td><code>amount</code></td>
                <td><code>uint</code></td>
                <td>Withdrawn amount in micro-units.</td>
              </tr>
              <tr>
                <td><code>remaining-balance</code></td>
                <td><code>uint</code></td>
                <td>User's new total vault balance (liquid + locked).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Example Payload</h3>
        <pre className="doc-code">{`{
  event: "withdraw",
  withdrawer: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG,
  amount: u300000,
  remaining-balance: u700000
}`}</pre>
      </section>

      <section id="strategy" className="doc-section-card">
        <h2>Strategy Configurations</h2>
        <p>
          Note that setting or clearing routing rules (via <code>set-routing-rules</code> and <code>clear-routing-rules</code>) updates the internal contract data maps directly without printing events to minimize network execution gas costs.
        </p>
        <p>
          The updated strategy rules are implicitly reflected in the next <code>deposit</code> print event.
        </p>
      </section>
    </DocPage>
  );
}
