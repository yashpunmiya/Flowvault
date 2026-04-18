import { DocPage } from "@/components/docs/DocPage";

export default function AiIntegrationPage() {
  return (
    <DocPage
      title="AI Integration"
      summary="Production-grade guide for using AI assistants to implement FlowVault correctly in a single prompt, with strict output contracts and validation gates."
      audience="AI coding agents and technical leads"
      mode="Automation"
      toc={[
        { id: "what", label: "What It Does" },
        { id: "why", label: "Why Use It" },
        { id: "when", label: "When To Use" },
        { id: "prompt", label: "One Prompt Template" },
        { id: "required", label: "Required Outputs" },
        { id: "constraints", label: "Implementation Constraints" },
        { id: "verify", label: "Verification Commands" },
      ]}
    >
      <section id="what" className="doc-section-card">
        <h2>What It Does</h2>
        <p>
          AI Integration mode standardizes how an assistant generates FlowVault
          integration code. Instead of open-ended prompts, you provide one
          structured instruction packet that includes network, principals,
          required operations, and expected files.
        </p>
        <p>
          This reduces implementation drift and prevents common mistakes such as
          wrong principals, missing validation, or wallet-unsafe signer usage.
        </p>
      </section>

      <section id="why" className="doc-section-card">
        <h2>Why Use It</h2>
        <ul>
          <li>Faster onboarding for new engineers and external implementation teams.</li>
          <li>Consistent output format across different AI tools and models.</li>
          <li>Lower risk of insecure browser patterns (private key leakage).</li>
          <li>Built-in verification checklist that is easy to run in CI and local dev.</li>
          <li>Reusable integration contract for future app surfaces and SDK updates.</li>
        </ul>
        <div className="doc-callout">
          <strong>Use this approach when:</strong> you want deterministic,
          reviewable generated code rather than conversational trial-and-error.
        </div>
      </section>

      <section id="when" className="doc-section-card">
        <h2>When To Use</h2>
        <p>
          Use this page when you want an AI assistant to implement FlowVault
          into a new or existing frontend with minimal back-and-forth. The
          prompt below gives enough context for production-shaped code.
        </p>
        <div className="doc-callout">
          <strong>Best practice:</strong> include exact network + contract
          principals in the same prompt message.
        </div>
      </section>

      <section id="prompt" className="doc-section-card">
        <h2>One Prompt Template</h2>
        <pre className="doc-code">{`You are integrating FlowVault into a TypeScript frontend.

Use these values:
- network: testnet
- flowvault contract: STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault
- token contract: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx

Implement:
1) SDK setup in wallet mode using @stacks/connect request("stx_callContract")
2) Functions: setRoutingRules, deposit, getVaultState, withdraw
3) Input validation:
   - STX address only
   - lockUntilBlock must be in future when lockAmount > 0
   - splitAddress required when splitAmount > 0
4) UI state:
   - loading flags per operation
   - tx id result display
   - error mapping by SDK error name
5) Output files:
   - src/lib/flowvault.ts
   - src/hooks/useFlowVault.ts
   - .env.example
   - README integration section

Return code + run commands + smoke test steps.`}</pre>
        <p>
          Paste this prompt as-is, then replace principals or network values as
          needed for your deployment target.
        </p>
      </section>

      <section id="required" className="doc-section-card">
        <h2>Required Outputs</h2>
        <ul>
          <li>Compilable TypeScript files with strict typing (no any-based shortcuts).</li>
          <li>Environment variables for network, contract, and token principals.</li>
          <li>Wallet transaction executor wired to SDK contract call execution.</li>
          <li>A short smoke test checklist that validates one full deposit cycle.</li>
          <li>Error boundaries that map SDK errors into user-facing guidance.</li>
        </ul>
      </section>

      <section id="constraints" className="doc-section-card">
        <h2>Implementation Constraints</h2>
        <ul>
          <li>Never place private keys in browser runtime code.</li>
          <li>Do not mix testnet and mainnet contract principals.</li>
          <li>Treat token amounts as string or bigint values only.</li>
          <li>Wait for write result, then refresh read state to confirm transitions.</li>
          <li>Preserve tx ids for observability and support incident analysis.</li>
        </ul>
      </section>

      <section id="verify" className="doc-section-card">
        <h2>Verification Commands</h2>
        <pre className="doc-code">{`npm install
npm run build
npm run dev

# runtime checks
# 1) connect wallet
# 2) set routing rules
# 3) deposit
# 4) read vault state
# 5) withdraw unlocked amount`}</pre>
        <div className="doc-callout">
          <strong>Release gate:</strong> do not approve generated code until all
          five runtime checks succeed with a real wallet on the target network.
        </div>
      </section>
    </DocPage>
  );
}
