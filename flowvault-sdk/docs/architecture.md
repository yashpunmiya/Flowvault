# Architecture

## Overview

The FlowVault SDK is a **pure interface layer** between developers and the
FlowVault Clarity smart contract on Stacks. It does not contain business
logic, modify routing rules on its own, or manage private keys beyond
transaction signing.

## Layer Diagram

```
┌───────────────────────────────────┐
│          Your Application         │
└──────────────┬────────────────────┘
               │
┌──────────────▼────────────────────┐
│         FlowVault SDK             │
│  ┌──────────┐  ┌───────────────┐  │
│  │ FlowVault│  │  Utilities    │  │
│  │  Class   │  │  (validation, │  │
│  │          │  │   parsing,    │  │
│  │          │  │   conversion) │  │
│  └────┬─────┘  └───────────────┘  │
│       │                           │
│  ┌────▼─────────────────────────┐ │
│  │  @stacks/transactions        │ │
│  │  (CV builders, contract      │ │
│  │   calls, broadcast, fetch)   │ │
│  └────┬─────────────────────────┘ │
└───────┼───────────────────────────┘
        │
┌───────▼───────────────────────────┐
│  Stacks Blockchain (RPC)          │
│  ┌────────────────────────────┐   │
│  │  FlowVault Contract        │   │
│  │  (flowvault.clar)          │   │
│  ├────────────────────────────┤   │
│  │  USDCx Token Contract      │   │
│  │  (SIP-010 compliant)       │   │
│  └────────────────────────────┘   │
└───────────────────────────────────┘
```

## Module Responsibilities

| Module         | Responsibility                                          |
| -------------- | ------------------------------------------------------- |
| `FlowVault.ts` | Orchestrates config, validation, transaction lifecycle  |
| `types.ts`     | Shared TypeScript interfaces (no runtime code)          |
| `errors.ts`    | Typed error hierarchy for precise catch handling        |
| `constants.ts` | Default addresses, error code map, USDCx decimals       |
| `network.ts`   | Network name validation and RPC endpoint resolution     |
| `utils.ts`     | Address/amount validation, unit conversion, CV parsing  |
| `index.ts`     | Public barrel exports                                   |

## Data Flow

### State-Changing Call (deposit / withdraw / setRoutingRules)

1. SDK validates inputs (amounts, addresses).
2. SDK builds Clarity value arguments (`uintCV`, `principalCV`, etc.).
3. SDK uses one of two signer paths:
  - `senderKey` path: `makeContractCall` + `broadcastTransaction`
  - `contractCallExecutor` path: delegates execution to your wallet adapter
4. SDK returns `{ txId, status }` or throws a typed error.

### Read-Only Call (getVaultState / getRoutingRules)

1. SDK validates the queried address.
2. SDK calls `fetchCallReadOnlyFunction` (no signing needed).
3. SDK parses the Clarity response into a typed JS object.
4. SDK returns the typed result or throws `NetworkError`.

## Design Decisions

- **Amounts are always micro-units** to match the on-chain representation
  and avoid floating-point issues. Utility helpers convert to/from whole
  tokens when needed.
- **Validation happens before network calls** to fail fast and provide
  clear, actionable error messages.
- **Network is a plain string** (`"testnet"` | `"mainnet"`) — the SDK
  delegates endpoint resolution to `@stacks/transactions` v7.
- **Signer abstraction is optional** — you can use `senderKey` for backend
  automation or `contractCallExecutor` for browser wallet signing.
- **Post-conditions are optional** and can be provided globally (config)
  or per call to protect token movement.
- **Parsing is strict** — malformed contract responses throw `ParsingError`
  instead of silently defaulting values.
