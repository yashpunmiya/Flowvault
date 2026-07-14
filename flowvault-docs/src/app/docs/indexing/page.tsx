import { DocPage } from "@/components/docs/DocPage";

export default function IndexingDocPage() {
  return (
    <DocPage
      title="Historical Indexing"
      summary="Guide for retrieving and indexing historical FlowVault events using Stacks node APIs, Hiro API, and chain event streaming."
      audience="Data engineers and backend developers"
      mode="Reference"
      toc={[
        { id: "overview", label: "Overview" },
        { id: "hiro-explorer", label: "Hiro Explorer" },
        { id: "hiro-api", label: "Hiro API Endpoint" },
        { id: "indexing-workflow", label: "Recommended Indexing Workflow" },
      ]}
    >
      <section id="overview" className="doc-section-card">
        <h2>Overview</h2>
        <p>
          Since Stacks does not maintain public SQL databases of transaction event logs by default, developers query transaction state and logs through Hiro's public API or by tracking print events on local Stacks nodes.
        </p>
      </section>

      <section id="hiro-explorer" className="doc-section-card">
        <h2>Hiro Explorer</h2>
        <p>
          For manual verification, search for the deployed FlowVault contract principal <code>STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault-v2</code> in the <a href="https://explorer.hiro.so/?chain=testnet" target="_blank" rel="noopener noreferrer">Hiro Explorer</a>. Under the <strong>Transactions</strong> tab, you can view all deposit and withdrawal events. Selecting an individual transaction displays the emitted print events and their payload keys.
        </p>
      </section>

      <section id="hiro-api" className="doc-section-card">
        <h2>Hiro API Endpoint</h2>
        <p>
          To programmatically retrieve historical events, query the Hiro API's transactions endpoint. This endpoint returns the execution results and raw events for contract calls.
        </p>
        <h3>Request URL</h3>
        <pre className="doc-code">{`GET https://api.testnet.hiro.so/extended/v1/address/STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault-v2/transactions`}</pre>
        <h3>Filtering Events</h3>
        <p>
          Iterate through the returned transaction list and check for transaction objects matching:
        </p>
        <ul>
          <li><code>tx_status</code>: <code>"success"</code></li>
          <li><code>events</code>: An array containing objects where <code>event_type</code> is <code>"smart_contract_log"</code>.</li>
        </ul>
        <p>
          Inside the contract log event, the payload is serialized as a hex Cl-value inside the <code>value.hex</code> field. The SDK can parse this value back into standard JSON objects.
        </p>
      </section>

      <section id="indexing-workflow" className="doc-section-card">
        <h2>Recommended Indexing Workflow</h2>
        <ol>
          <li>
            <strong>Initial Sync:</strong> Query all historical transactions for the contract address using pagination.
          </li>
          <li>
            <strong>Event Decoding:</strong> Parse the event hex values to filter by event name (e.g. <code>"deposit"</code> or <code>"withdraw"</code>).
          </li>
          <li>
            <strong>Database Storage:</strong> Store the depositor, locked amount, hold amount, unlock blocks, and transaction IDs into your relational database.
          </li>
          <li>
            <strong>Real-time Streaming:</strong> Integrate WebSockets or a chain-event stream listener (such as Hiro's Chainhook) to listen for new block transactions and update your dashboard database in real-time.
          </li>
        </ol>
      </section>
    </DocPage>
  );
}
