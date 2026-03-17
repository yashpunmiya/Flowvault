# FAQ

## General

### What is FlowVault SDK?

A TypeScript library that wraps the FlowVault Clarity smart contract on
Stacks, providing typed methods for deposits, withdrawals, routing-rule
management, and state queries.

### Does the SDK hold funds or manage wallets?

No. The SDK is a stateless interface layer. Funds are held by the on-chain
contract. Private keys stay on your machine and are only used to sign
transactions.

### Which networks are supported?

**Testnet** and **Mainnet**. Pass `"testnet"` or `"mainnet"` to the
constructor.

---

## Amounts & Units

### What unit are amounts in?

All amounts in the SDK are in **micro-units** (1 USDCx = 1,000,000 micro).
Use the `tokenToMicro()` and `microToToken()` helpers to convert. Prefer
string inputs like `tokenToMicro("1.5")` to avoid float precision issues.

### Why micro-units instead of whole tokens?

Clarity (`uint`) and the SIP-010 standard operate on integer micro-units.
Using them directly avoids floating-point rounding errors.

---

## Routing Rules

### When are routing rules applied?

Rules are executed **at deposit time**. Setting rules alone does not move
funds — they take effect the next time `.deposit()` is called.

### Can I change rules between deposits?

Yes. Call `.setRoutingRules()` with new values before the next deposit.
The latest rules overwrite previous ones.

### What happens if I deposit without setting rules?

The entire deposit goes to your unlocked balance (the HOLD bucket).

---

## Errors

### How do I handle contract errors?

Catch `ContractCallError` — it includes a `code` property mapping to the
on-chain error:

```ts
import { ContractCallError } from "flowvault-sdk";

try {
  await vault.deposit(amount);
} catch (err) {
  if (err instanceof ContractCallError) {
    console.log("Contract error code:", err.code);
    console.log("Message:", err.message);
  }
}
```

### What if the RPC is down?

The SDK throws a `NetworkError` with the underlying cause. Implement
retries or fallback logic in your application.

---

## Security

### Is my private key safe?

The SDK never stores, logs, or transmits your private key anywhere other
than to `@stacks/transactions` for local transaction signing. We strongly
recommend loading keys from environment variables.

### Are there post-conditions?

The SDK defaults to `postConditionMode: "allow"` for backward compatibility,
but you can supply post-conditions globally (config) or per call to protect
user assets.

---

## Contributing

Pull requests are welcome. Please ensure:

1. All existing tests pass (`npm test`).
2. New features include tests.
3. TypeScript compiles without errors (`npm run build`).
