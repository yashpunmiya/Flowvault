# FlowVault SDK

> TypeScript SDK for **FlowVault** — Programmable USDCx Routing on Stacks.

FlowVault SDK wraps every [FlowVault smart-contract](../flowvault-contracts/contracts/flowvault.clar) function into a clean, typed TypeScript API so developers can integrate programmable stablecoin flows in minutes.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [setRoutingRules](#setroutingrules)
  - [deposit](#deposit)
  - [withdraw](#withdraw)
  - [clearRoutingRules](#clearroutingrules)
  - [getVaultState](#getvaultstate)
  - [getRoutingRules](#getroutingrules)
  - [hasLockedFunds](#haslockedfunds)
  - [getCurrentBlockHeight](#getcurrentblockheight)
- [Routing Model](#routing-model)
- [Utilities](#utilities)
- [Error Handling](#error-handling)
- [Network Configuration](#network-configuration)
- [Development](#development)
- [Versioning](#versioning)

---

## Features

- **Minimal** — zero opinions, pure interface layer.
- **Typed** — full TypeScript types for every input & output.
- **Deterministic** — inputs are validated before any network call.
- **Network configurable** — `"testnet"` or `"mainnet"` with one string.
- **Frontend-friendly** — works in Node.js, bundlers, and browser runtimes.

---

## Installation

```bash
npm install flowvault-sdk
# or
yarn add flowvault-sdk
```

The SDK depends on `@stacks/transactions` and `@stacks/network` (peer-level — installed automatically).

---

## Quick Start

```ts
import { FlowVault, tokenToMicro } from "flowvault-sdk";

// 1. Initialise
const vault = new FlowVault({
  network: "testnet",
  contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
  contractName: "flowvault",
  tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  tokenContractName: "usdcx",
  senderKey: process.env.STACKS_PRIVATE_KEY!,
});

// 2. Set routing rules
await vault.setRoutingRules({
  lockAmount: tokenToMicro(100),   // lock 100 USDCx
  lockUntilBlock: 210000,          // until block 210 000
  splitAddress: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
  splitAmount: tokenToMicro(50),   // send 50 USDCx to split address
});

// 3. Deposit USDCx (routing rules execute automatically)
await vault.deposit(tokenToMicro(500));

// 4. Read vault state
const state = await vault.getVaultState(
  "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
);
console.log("Locked:", state.lockedBalance);
console.log("Available:", state.unlockedBalance);

// 5. Withdraw unlocked funds
await vault.withdraw(tokenToMicro(200));
```

---

## Configuration

| Parameter               | Type     | Required | Description                              |
| ----------------------- | -------- | -------- | ---------------------------------------- |
| `network`               | `string` | Yes      | `"testnet"` or `"mainnet"`               |
| `contractAddress`       | `string` | Yes      | FlowVault deployer address               |
| `contractName`          | `string` | Yes      | FlowVault contract name                  |
| `tokenContractAddress`  | `string` | Yes      | USDCx token deployer address             |
| `tokenContractName`     | `string` | Yes      | USDCx token contract name                |
| `senderKey`             | `string` | No*      | Private key for signing transactions     |

\* Required for state-changing methods (`deposit`, `withdraw`, `setRoutingRules`, `clearRoutingRules`). Read-only methods work without it.

### Default Testnet Addresses

```ts
import { DEFAULT_CONTRACTS } from "flowvault-sdk";

console.log(DEFAULT_CONTRACTS.testnet);
// {
//   contractAddress: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD",
//   contractName: "flowvault",
//   tokenContractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
//   tokenContractName: "usdcx",
// }
```

---

## API Reference

### Constructor

```ts
const vault = new FlowVault(config: FlowVaultConfig);
```

Validates configuration and stores network / contract metadata. Throws `InvalidConfigurationError` if required fields are missing.

---

### setRoutingRules

```ts
await vault.setRoutingRules(rules: RoutingRules): Promise<TransactionResult>
```

Configure routing rules that execute automatically on the next deposit.

**Parameters (all in micro-units):**

| Field            | Type             | Description                                     |
| ---------------- | ---------------- | ----------------------------------------------- |
| `lockAmount`     | `number`         | Amount to lock (0 = no lock)                    |
| `lockUntilBlock` | `number`         | Block height for lock expiry                    |
| `splitAddress`   | `string \| null` | Recipient of split amount                       |
| `splitAmount`    | `number`         | Amount forwarded to split address (0 = no split)|

**Validation:** Rejects negative values, invalid addresses, zero split-address with positive split-amount, and self-splits.

---

### deposit

```ts
await vault.deposit(amount: number): Promise<TransactionResult>
```

Deposit USDCx into the vault. Routing rules (lock / split / hold) are applied automatically.

- `amount` — positive integer in micro-units.

---

### withdraw

```ts
await vault.withdraw(amount: number): Promise<TransactionResult>
```

Withdraw unlocked USDCx. Fails on-chain if amount exceeds unlocked balance.

---

### clearRoutingRules

```ts
await vault.clearRoutingRules(): Promise<TransactionResult>
```

Delete all routing rules for the caller. Future deposits go straight to unlocked balance.

---

### getVaultState

```ts
await vault.getVaultState(userAddress: string): Promise<VaultState>
```

Read-only. Returns the complete vault state including balances and active routing rules.

```ts
interface VaultState {
  totalBalance: number;
  lockedBalance: number;
  unlockedBalance: number;
  lockUntilBlock: number;
  currentBlock: number;
  routingRules: RoutingRules;
}
```

---

### getRoutingRules

```ts
await vault.getRoutingRules(userAddress: string): Promise<RoutingRules | null>
```

Read-only. Returns the user's routing rules, or `null` if none are configured.

---

### hasLockedFunds

```ts
await vault.hasLockedFunds(userAddress: string): Promise<boolean>
```

Read-only. Returns `true` if the user has locked funds that haven't expired.

---

### getCurrentBlockHeight

```ts
await vault.getCurrentBlockHeight(senderAddress: string): Promise<number>
```

Read-only. Returns the current Stacks block height. Useful for calculating `lockUntilBlock` values.

---

## Routing Model

FlowVault executes three routing operations **at deposit time**:

1. **LOCK** — A fixed amount is locked until a specific block height. Locked funds cannot be withdrawn until the lock expires.
2. **SPLIT** — A fixed amount is immediately forwarded to another Stacks principal.
3. **HOLD** — The remainder stays in the vault as unlocked balance, available for withdrawal at any time.

```
Deposit 1000 USDCx
  ├─ LOCK  200 (until block 200000)
  ├─ SPLIT 300 → ST2CY5V39NHDP...
  └─ HOLD  500 (available immediately)
```

---

## Utilities

```ts
import {
  tokenToMicro,     // 1.5 → 1_500_000
  microToToken,     // 1_500_000 → 1.5
  isValidAddress,   // "ST..." → true/false
  isBlockInFuture,  // (target, current) → boolean
} from "flowvault-sdk";
```

---

## Error Handling

All SDK errors extend `FlowVaultError`:

| Error Class                 | When                                          |
| --------------------------- | --------------------------------------------- |
| `InvalidAmountError`        | Negative, NaN, or non-integer amount           |
| `InvalidAddressError`       | Bad Stacks address format                      |
| `InvalidConfigurationError` | Missing config fields or bad network           |
| `ContractCallError`         | On-chain rejection (includes error code)       |
| `NetworkError`              | RPC unreachable, timeouts                      |

`ContractCallError` includes a `code` property mapping to FlowVault contract errors:

| Code | Meaning                                    |
| ---- | ------------------------------------------ |
| 1001 | Invalid amount                             |
| 1002 | Insufficient balance                       |
| 1003 | Funds are locked                           |
| 1004 | Routing amounts exceed deposit             |
| 1007 | Split address required                     |
| 1008 | Lock block must be in the future           |
| 1010 | Lock exceeds hold                          |
| 1011 | Cannot split to yourself                   |

---

## Network Configuration

```ts
// Testnet (default for development)
const vault = new FlowVault({ network: "testnet", ... });

// Mainnet
const vault = new FlowVault({ network: "mainnet", ... });
```

The SDK passes the network string directly to `@stacks/transactions` which handles RPC endpoint resolution internally.

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode
npx vitest

# Build
npm run build
```

### Project Structure

```
flowvault-sdk/
├── src/
│   ├── index.ts          — Public re-exports
│   ├── FlowVault.ts      — Main SDK class
│   ├── types.ts           — TypeScript interfaces
│   ├── errors.ts          — Error classes
│   ├── constants.ts       — Defaults & error map
│   ├── network.ts         — Network helpers
│   └── utils.ts           — Validation, conversion, parsing
├── tests/                 — Vitest test suites (86 tests)
├── docs/                  — Extended documentation
├── dist/                  — Compiled output (generated)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Versioning

Follows [Semantic Versioning](https://semver.org/):

| Version | Meaning                        |
| ------- | ------------------------------ |
| `0.1.0` | Initial public SDK             |
| `0.2.0` | Feature additions              |
| `1.0.0` | Stable, production-ready API   |

Breaking changes will be documented in release notes.

---

## License

MIT
