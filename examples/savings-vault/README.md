# FlowVault Savings Vault Example

## What this is

An end-to-end reference app that shows how to build a real savings product with `flowvault-sdk` and a Stacks testnet wallet.

The user connects a wallet, enters a USDCx deposit amount, and submits one product action: deposit into a Smart Savings Vault.

## How it works

For every deposit:

- 80% of the USDCx amount is locked.
- 20% remains liquid in the vault.
- Lock duration is fixed at 144 Stacks blocks.
- Split amount is fixed at 0.

The app creates the strategy first, then deposits. Under the current SDK API, "create strategy" maps to `setRoutingRules`, which calls the FlowVault contract's `set-routing-rules` function. The deposit then calls the SDK `deposit` method, and the contract applies the stored routing rules at deposit time.

## How to run

```bash
cd examples/savings-vault
npm install
npm run dev
```

Open the local Next.js URL, connect a Stacks testnet wallet, and deposit USDCx.

Optional environment overrides:

```bash
NEXT_PUBLIC_FLOWVAULT_NETWORK=testnet
NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS=STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD
NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME=flowvault
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME=usdcx
```

## Example flow

1. Connect wallet.
2. Enter `100` as the deposit amount.
3. The app previews:
   - `80 USDCx` locked.
   - `20 USDCx` available.
4. Click Deposit.
5. Approve the routing-rule transaction in the wallet.
6. Approve the deposit transaction in the wallet.
7. The app shows `Deposit successful`, the locked amount, the available amount, and transaction ids.

## SDK usage explanation

The app initializes `FlowVault` in wallet-executor mode:

```ts
const vault = new FlowVault({
  network: "testnet",
  contractAddress,
  contractName: "flowvault",
  tokenContractAddress,
  tokenContractName: "usdcx",
  senderAddress,
  contractCallExecutor: async (call) => {
    return request("stx_callContract", {
      contract: `${call.contractAddress}.${call.contractName}`,
      functionName: call.functionName,
      functionArgs: call.functionArgs,
      network: call.network,
      postConditionMode: "allow",
      postConditions: call.postConditions,
    });
  },
});
```

The deposit flow is:

```ts
const currentBlock = await vault.getCurrentBlockHeight(senderAddress);

await vault.setRoutingRules({
  lockAmount: depositMicro * 80n / 100n,
  lockUntilBlock: currentBlock + 144,
  splitAddress: null,
  splitAmount: 0n,
});

await vault.deposit(depositMicro);
```

Run checks:

```bash
npm run typecheck
npm test
npm run build
```
