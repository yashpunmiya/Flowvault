import { DocPage } from "@/components/docs/DocPage";

export default function SdkPage() {
  return (
    <DocPage
      title="FlowVault SDK"
      summary="Typed client for FlowVault write/read operations with strict validation and wallet-safe execution options."
      toc={[
        { id: "install", label: "Installation" },
        { id: "init", label: "Initialization" },
        { id: "write", label: "Write Calls" },
        { id: "read", label: "Read Calls" },
        { id: "practices", label: "Production Practices" },
        { id: "errors", label: "Error Handling" },
      ]}
    >
      <section id="install" className="doc-section-card">
        <h2>Installation</h2>
        <pre className="doc-code">npm install flowvault-sdk@0.1.1</pre>
        <p>
          Pin exact version in production apps when contract interfaces are
          tightly controlled, then upgrade intentionally after testnet checks.
        </p>
      </section>

      <section id="init" className="doc-section-card">
        <h2>Initialization</h2>
        <h3>Backend signer mode</h3>
        <pre className="doc-code">{`import { FlowVault } from "flowvault-sdk";\n\nconst vault = new FlowVault({\n  network: "testnet",\n  contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",\n  contractName: "flowvault",\n  tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",\n  tokenContractName: "usdcx",\n  senderKey: process.env.STACKS_PRIVATE_KEY,\n});`}</pre>

        <h3>Browser wallet mode</h3>
        <pre className="doc-code">{`import { request } from "@stacks/connect";\nimport { FlowVault } from "flowvault-sdk";\n\nconst walletVault = new FlowVault({\n  network: "testnet",\n  contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",\n  contractName: "flowvault",\n  tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",\n  tokenContractName: "usdcx",\n  senderAddress: "ST...",\n  contractCallExecutor: async (call) => request("stx_callContract", {\n    contract: call.contractAddress + "." + call.contractName,\n    functionName: call.functionName,\n    functionArgs: call.functionArgs,\n    network: call.network,\n    postConditionMode: "allow",\n    postConditions: call.postConditions,\n  }),\n});`}</pre>
      </section>

      <section id="write" className="doc-section-card">
        <h2>Write Calls</h2>
        <pre className="doc-code">{`await vault.setRoutingRules({\n  lockAmount: "1000000",\n  lockUntilBlock: 3905000,\n  splitAddress: null,\n  splitAmount: "0",\n});\n\nawait vault.deposit("5000000");\nawait vault.withdraw("1000000");\nawait vault.clearRoutingRules();`}</pre>
        <p>
          All writes return normalized transaction result data, including tx id,
          so callers can immediately link to explorer state or queue retries.
        </p>
      </section>

      <section id="read" className="doc-section-card">
        <h2>Read Calls</h2>
        <pre className="doc-code">{`const state = await vault.getVaultState("ST...");\nconst rules = await vault.getRoutingRules("ST...");\nconst hasLock = await vault.hasLockedFunds("ST...");\nconst block = await vault.getCurrentBlockHeight("ST...");`}</pre>
        <p>
          Read methods parse Clarity values into stable TypeScript shapes, which
          avoids duplicated parsing logic in UI components.
        </p>
      </section>

      <section id="practices" className="doc-section-card">
        <h2>Production Practices</h2>
        <ul>
          <li>Validate network and contract principals at process startup.</li>
          <li>Use wallet executor mode for browser clients, never sender keys.</li>
          <li>Poll read-only state after writes until expected balance transition appears.</li>
          <li>Surface typed SDK errors directly for better support diagnostics.</li>
          <li>Store token amounts as strings or bigint, never floating numbers.</li>
        </ul>
      </section>

      <section id="errors" className="doc-section-card">
        <h2>Error Handling</h2>
        <p>
          SDK exposes typed errors: InvalidAmountError, InvalidAddressError,
          InvalidRoutingRuleError, InvalidConfigurationError, ContractCallError,
          NetworkError, and ParsingError.
        </p>
        <pre className="doc-code">{`try {
  await vault.deposit("250000");
} catch (error) {
  if (error?.name === "InvalidAddressError") {
    // prompt user to reconnect wallet and fetch STX principal again
  }
  throw error;
}`}</pre>
      </section>
    </DocPage>
  );
}
