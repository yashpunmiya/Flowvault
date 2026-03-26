import { DocPage } from "@/components/docs/DocPage";

export default function TroubleshootingPage() {
  return (
    <DocPage
      title="Troubleshooting"
      summary="Production-focused troubleshooting guide for wallet, routing, build, and release issues."
      toc={[
        { id: "wallet", label: "Wallet Address Issues" },
        { id: "lock", label: "Lock Block Validation" },
        { id: "publish", label: "SDK Publish/Version" },
        { id: "matrix", label: "Symptom Matrix" },
      ]}
    >
      <section id="wallet" className="doc-section-card">
        <h2>Wallet Address Issues</h2>
        <p>
          If you see InvalidAddressError with tb1..., your app is likely reading
          a Bitcoin address. Ensure you extract STX addresses only.
        </p>
        <pre className="doc-code">{`// good: ST... or SP...
const stxAddress = wallet.accounts?.[0]?.stxAddress;
if (!stxAddress) throw new Error("No STX address found");`}</pre>
      </section>

      <section id="lock" className="doc-section-card">
        <h2>Lock Block Validation</h2>
        <p>
          lockUntilBlock must be greater than the current chain block when
          lockAmount {'>'} 0. Prefer duration-based UI and compute current +
          duration.
        </p>
        <pre className="doc-code">{`const current = await vault.getCurrentBlockHeight(sender);
const lockUntil = current + durationBlocks;`}</pre>
      </section>

      <section id="publish" className="doc-section-card">
        <h2>SDK Publish/Version</h2>
        <p>
          Use explicit semantic version bumps (patch/minor/major), then publish
          after npm authentication and verify with npm view.
        </p>
        <pre className="doc-code">{`npm version patch
npm publish --access public
npm view flowvault-sdk version`}</pre>
      </section>

      <section id="matrix" className="doc-section-card">
        <h2>Symptom Matrix</h2>
        <div className="doc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Likely Cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Read call returns parsing error</td>
                <td>Contract principal mismatch with deployed network</td>
                <td>Verify env vars and redeploy client with correct principal</td>
              </tr>
              <tr>
                <td>Deposit tx fails immediately</td>
                <td>split + lock amount exceeds deposit value</td>
                <td>Validate routing values before send and surface clear UI error</td>
              </tr>
              <tr>
                <td>Withdraw fails despite previous deposits</td>
                <td>Funds still locked by lock-until block</td>
                <td>Poll current block height and retry after unlock height</td>
              </tr>
              <tr>
                <td>Build succeeds but runtime points to wrong token</td>
                <td>Stale environment variables in deployment target</td>
                <td>Check host env configuration and trigger clean redeploy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocPage>
  );
}
