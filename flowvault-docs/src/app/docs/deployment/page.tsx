import { DocPage } from "@/components/docs/DocPage";

export default function DeploymentPage() {
  return (
    <DocPage
      title="Deployment"
      summary="Repeatable deployment runbook for contracts, frontend, and docs with validation checkpoints at each stage."
      toc={[
        { id: "preflight", label: "Preflight" },
        { id: "contracts", label: "Contracts" },
        { id: "frontend", label: "Frontend" },
        { id: "docs", label: "Docs Host" },
        { id: "release", label: "Tagged Release" },
        { id: "verify", label: "Verification" },
      ]}
    >
      <section id="preflight" className="doc-section-card">
        <h2>Preflight</h2>
        <ul>
          <li>Confirm target network: <code>testnet</code> or <code>mainnet</code>.</li>
          <li>Verify deployer wallet has enough STX for contract fees.</li>
          <li>Run all local tests in contracts and SDK before deploy.</li>
          <li>Prepare updated env vars for frontend and demo app.</li>
        </ul>
      </section>

      <section id="contracts" className="doc-section-card">
        <h2>Contracts</h2>
        <pre className="doc-code">{`cd flowvault-contracts\nclarinet deployments generate --testnet --medium-cost\nclarinet deployments apply --testnet`}</pre>
        <p>
          After deployment, store resulting principal identifiers in your
          release notes. These identifiers are runtime dependencies for every
          client build.
        </p>
      </section>

      <section id="frontend" className="doc-section-card">
        <h2>Frontend</h2>
        <pre className="doc-code">{`cd flowvault-frontend\nnpm install\nnpm run build`}</pre>
        <p>
          Ensure these are set in deployment environment:
          <code>NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS</code>,
          <code>NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME</code>,
          <code>NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS</code>, and
          <code>NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME</code>.
        </p>
      </section>

      <section id="docs" className="doc-section-card">
        <h2>Docs Host (docs.flow-vault.dev)</h2>
        <pre className="doc-code">{`cd flowvault-docs\nnpm install\nnpm run build`}</pre>
        <p>
          Deploy the built app to your host and map docs.flow-vault.dev as a
          custom domain.
        </p>
      </section>

      <section id="release" className="doc-section-card">
        <h2>Tagged Release (Core Routing Patterns)</h2>
        <p>
          Create a release tag after validating the three core behaviors:
          <code>time-lock</code>, <code>split</code>, and <code>hold</code>.
        </p>
        <pre className="doc-code">{`# 1) ensure main is up to date
git checkout main
git pull origin main

# 2) verify contracts + sdk tests
cd flowvault-contracts && npm test
cd ../flowvault-sdk && npm test

# 3) create annotated tag
git tag -a v0.2.0 -m "FlowVault core routing release: time-lock, split, hold"

# 4) push branch + tag
git push origin main
git push origin v0.2.0`}</pre>
        <div className="doc-callout">
          <strong>Recommended release notes:</strong> include tested scenarios,
          contract principal, SDK version, and any migration instructions.
        </div>
      </section>

      <section id="verify" className="doc-section-card">
        <h2>Verification</h2>
        <ol>
          <li>Open frontend and connect wallet.</li>
          <li>Call read methods and confirm no network or parsing errors.</li>
          <li>Create a small deposit and inspect tx result in explorer.</li>
          <li>Check docs routes for all pages and active sidebar state.</li>
          <li>Record release version, commit hash, and deployed contract principal.</li>
        </ol>
      </section>
    </DocPage>
  );
}
