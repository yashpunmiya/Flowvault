# FlowVault SDK — Implementation Plan

## 1. Project Understanding

### Contract Functions (deployed on testnet)
**Contract:** `STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault`
**USDCx:** `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx`

#### Public Functions (state-changing, need signing)
1. `set-routing-rules(lock-amount uint, lock-until-block uint, split-address (optional principal), split-amount uint)` → `(ok true)`
2. `deposit(token <sip-010-trait>, amount uint)` → `(ok { deposited, held, split, locked })`
3. `withdraw(token <sip-010-trait>, amount uint)` → `(ok { withdrawn, remaining })`
4. `clear-routing-rules()` → `(ok true)`

#### Read-Only Functions (no signing needed)
1. `get-vault-state(user principal)` → tuple { total-balance, locked-balance, unlocked-balance, lock-until-block, current-block, routing-rules }
2. `get-routing-rules(user principal)` → optional tuple { lock-amount, lock-until-block, split-address, split-amount }
3. `has-locked-funds(user principal)` → bool
4. `get-current-block-height()` → uint

#### Error Codes
- u1000: NOT-AUTHORIZED
- u1001: INVALID-AMOUNT
- u1002: INSUFFICIENT-BALANCE
- u1003: FUNDS-LOCKED
- u1004: ROUTING-EXCEEDS-DEPOSIT
- u1005: TRANSFER-FAILED
- u1006: NO-VAULT-CONFIG
- u1007: INVALID-SPLIT-ADDRESS
- u1008: INVALID-LOCK-BLOCK
- u1009: ARITHMETIC-OVERFLOW
- u1010: LOCK-EXCEEDS-HOLD
- u1011: SPLIT-TO-SELF

### SDK Approach
The SDK is a **pure TypeScript interface layer** that:
- Uses `@stacks/transactions` for read-only calls (`fetchCallReadOnlyFunction`, CV builders)
- Uses `@stacks/transactions` for building contract call transactions (`makeContractCall`, `broadcastTransaction`)
- Does NOT use `@stacks/connect` (that's for wallet-connected frontends; SDK is for backend/programmatic use)
- Accepts a private key (`senderKey`) for signing transactions
- Returns typed results

## 2. Dependencies
- `@stacks/transactions` ^7.x — CV builders, makeContractCall, broadcastTransaction, fetchCallReadOnlyFunction, validateStacksAddress
- `@stacks/network` ^7.x — network configuration (STACKS_TESTNET, STACKS_MAINNET)

## 3. File Structure
```
flowvault-sdk/
├── src/
│   ├── index.ts          — Re-exports everything
│   ├── FlowVault.ts      — Main class
│   ├── types.ts           — RoutingRules, VaultState, TransactionResult, Config
│   ├── errors.ts          — Custom error classes
│   ├── constants.ts       — Default contract addresses, error code map
│   ├── network.ts         — Network helper (testnet/mainnet resolution)
│   └── utils.ts           — Address validation, unit conversion, CV parsing
├── tests/
│   ├── validation.test.ts — Input validation tests
│   ├── parsing.test.ts    — CV response parsing tests
│   ├── errors.test.ts     — Error class tests
│   ├── utils.test.ts      — Utility function tests
│   └── flowvault.test.ts  — Integration tests (mocked)
├── docs/
│   ├── architecture.md
│   ├── quick-start.md
│   ├── use-cases.md
│   └── faq.md
├── package.json
├── tsconfig.json
└── README.md
```

## 4. Implementation Sequence

### Step 1: Project Setup
- Create package.json with dependencies
- Create tsconfig.json for ESM + CJS output
- Setup vitest for testing

### Step 2: types.ts
- `FlowVaultConfig` — network, contractAddress, contractName, senderKey
- `RoutingRules` — lockAmount, lockUntilBlock, splitAddress?, splitAmount
- `VaultState` — totalBalance, lockedBalance, unlockedBalance, lockUntilBlock, currentBlock, routingRules
- `TransactionResult` — txId, status
- `DepositResult` — deposited, held, split, locked
- `WithdrawResult` — withdrawn, remaining

### Step 3: errors.ts
- `FlowVaultError` (base)
- `InvalidAmountError`
- `InvalidAddressError`
- `InvalidConfigurationError`
- `ContractCallError`  (maps contract error codes)
- `NetworkError`

### Step 4: constants.ts
- Default testnet/mainnet addresses
- Error code to message map
- USDCx contract identifiers

### Step 5: network.ts
- `resolveNetwork(network: string)` → returns proper network string
- Network validation

### Step 6: utils.ts
- `validateStacksAddress(address)` — uses @stacks/transactions
- `microToToken(micro)` / `tokenToMicro(token)` — unit conversion (6 decimals)
- `parseVaultState(cv)` — parse Clarity value to VaultState
- `parseRoutingRules(cv)` — parse Clarity value to RoutingRules
- `isBlockInFuture(block, currentBlock)` — block comparison

### Step 7: FlowVault.ts (Main Class)
Constructor: validates config, stores network/contract/key

Methods:
- `setRoutingRules(rules: RoutingRules)` → TransactionResult
- `deposit(amount: number)` → TransactionResult
- `withdraw(amount: number)` → TransactionResult
- `clearRoutingRules()` → TransactionResult
- `getVaultState(userAddress: string)` → VaultState

### Step 8: index.ts
- Re-export FlowVault class, types, errors, utils

### Step 9: Tests
- Validation tests (invalid amounts, addresses, configs)
- Parsing tests (mock Clarity values → typed objects)
- Error class tests
- Mocked contract call tests

### Step 10: Documentation
- README.md with full examples
- docs/architecture.md
- docs/quick-start.md
- docs/use-cases.md
- docs/faq.md

## 5. API Reference

### Constructor
```ts
const vault = new FlowVault({
  network: 'testnet',
  contractAddress: 'STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD',
  contractName: 'flowvault',
  senderKey: 'your-private-key',
  tokenContractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  tokenContractName: 'usdcx',
});
```

### Read-Only (no key needed)
```ts
const state = await vault.getVaultState('ST...');
const rules = await vault.getRoutingRules('ST...');
const hasLocked = await vault.hasLockedFunds('ST...');
const blockHeight = await vault.getCurrentBlockHeight();
```

### State-Changing (needs senderKey)
```ts
const result = await vault.setRoutingRules({
  lockAmount: 500,
  lockUntilBlock: 190000,
  splitAddress: 'ST...',
  splitAmount: 200,
});

const depositResult = await vault.deposit(1000);
const withdrawResult = await vault.withdraw(300);
const clearResult = await vault.clearRoutingRules();
```

## 6. Key Design Decisions
- All amounts in **micro-units** (1 USDCx = 1,000,000 micro-units) to match contract
- SDK validates inputs BEFORE sending transactions
- Network string ('testnet' | 'mainnet') instead of complex objects
- Uses `makeContractCall` + `broadcastTransaction` for state-changing calls
- Uses `fetchCallReadOnlyFunction` for read-only calls
- senderKey is optional — if not provided, state-changing methods throw
- Read-only methods work without senderKey (just need a senderAddress for the API)
