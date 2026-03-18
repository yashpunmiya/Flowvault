# Quick Start

Get up and running with FlowVault SDK in five minutes.

## 1. Install

```bash
npm install flowvault-sdk
```

## 2. Initialise the SDK

```ts
import { FlowVault, DEFAULT_CONTRACTS } from "flowvault-sdk";

const { contractAddress, contractName, tokenContractAddress, tokenContractName } =
  DEFAULT_CONTRACTS.testnet;

const vault = new FlowVault({
  network: "testnet",
  contractAddress,
  contractName,
  tokenContractAddress,
  tokenContractName,
  senderKey: process.env.STACKS_PRIVATE_KEY!, // your Stacks private key
});
```

## 3. Set Routing Rules

Configure how future deposits are routed:

```ts
import { tokenToMicro } from "flowvault-sdk";

const tx = await vault.setRoutingRules({
  lockAmount: tokenToMicro("100"), // Lock 100 USDCx
  lockUntilBlock: 210000,          // Until block 210,000
  splitAddress: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
  splitAmount: tokenToMicro("50"), // Send 50 USDCx to the split address
});

console.log("Set rules tx:", tx.txId);
```

For dynamic lock windows, compute from current chain height:

```ts
const currentBlock = await vault.getCurrentBlockHeight(
  "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
);

await vault.setRoutingRules({
  lockAmount: tokenToMicro("100"),
  lockUntilBlock: currentBlock + 144,
  splitAddress: null,
  splitAmount: tokenToMicro("0"),
});
```

`lockUntilBlock` must resolve to a future block whenever `lockAmount > 0`.

## 4. Deposit USDCx

```ts
const depositTx = await vault.deposit(tokenToMicro("500"));
console.log("Deposit tx:", depositTx.txId);
// Routing executes: 100 locked, 50 split, 350 held
```

## 5. Read Vault State

```ts
const state = await vault.getVaultState(
  "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
);

console.log("Total balance:", state.totalBalance);
console.log("Locked:", state.lockedBalance);
console.log("Available:", state.unlockedBalance);
console.log("Lock expires at block:", state.lockUntilBlock);
console.log("Current block:", state.currentBlock);
```

## 6. Withdraw Unlocked Funds

```ts
const withdrawTx = await vault.withdraw(tokenToMicro("200"));
console.log("Withdraw tx:", withdrawTx.txId);
```

## 7. Clear Routing Rules

```ts
await vault.clearRoutingRules();
// Future deposits will go entirely to unlocked balance
```

---

## Read-Only Usage (No Private Key)

If you only need to read data, you can omit `senderKey`:

```ts
const reader = new FlowVault({
  network: "testnet",
  contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
  contractName: "flowvault",
  tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  tokenContractName: "usdcx",
});

const state = await reader.getVaultState("ST...");
const rules = await reader.getRoutingRules("ST...");
const height = await reader.getCurrentBlockHeight("ST...");
```

Calling a state-changing method without `senderKey` or `contractCallExecutor` throws `InvalidConfigurationError`.

---

## Browser Wallet Usage (No Private Key)

Use a wallet executor when private keys are not available in the app runtime:

```ts
import { request } from "@stacks/connect";

const walletVault = new FlowVault({
  network: "testnet",
  contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
  contractName: "flowvault",
  tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  tokenContractName: "usdcx",
  senderAddress: "ST...connected-wallet-address", // required for proper sender context
  contractCallExecutor: async (call) => {
    return request("stx_callContract", {
      contract: `${call.contractAddress}.${call.contractName}`,
      functionName: call.functionName,
      functionArgs: call.functionArgs,
      network: call.network,
      postConditionMode:
        String(call.postConditionMode ?? "allow").toLowerCase().includes("deny")
          ? "deny"
          : "allow",
      postConditions: call.postConditions,
    });
  },
});

await walletVault.deposit(tokenToMicro("50"));
```
