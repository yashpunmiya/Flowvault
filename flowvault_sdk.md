# FlowVault SDK Specification
## Developer Abstraction Layer for USDCx Routing on Stacks

---

# 1. Overview

The FlowVault SDK is a TypeScript library that abstracts interaction with the FlowVault smart contract on Stacks.

Its purpose is to:
- Hide Clarity-level complexity
- Simplify USDCx routing integration
- Provide clean, composable APIs
- Enable developers to integrate programmable stablecoin flows in minutes

This SDK does NOT:
- Contain business logic
- Modify routing rules
- Replace the FlowVault contract
- Manage private keys

It is purely a developer interface layer.

---

# 2. Core Principles

The SDK must be:

- Minimal
- Typed
- Deterministic
- Network configurable
- Frontend-friendly
- Non-opinionated

Avoid overengineering.

---

# 3. Supported Capabilities

The SDK must fully wrap these FlowVault contract features:

- Set routing rules
- Deposit USDCx
- Withdraw unlocked balance
- Clear routing rules
- Fetch vault state

All interactions must map directly to contract calls.

---

# 4. SDK Architecture

## Folder Structure

flowvault-sdk/
├── src/
│   ├── index.ts
│   ├── FlowVault.ts
│   ├── types.ts
│   ├── errors.ts
│   ├── constants.ts
│   ├── network.ts
│   └── utils.ts
├── docs/
│   ├── architecture.md
│   ├── quick-start.md
│   ├── use-cases.md
│   └── faq.md
├── package.json
├── tsconfig.json
└── README.md

---

# 5. Configuration Model

The SDK must require initialization with:

- network (testnet or mainnet)
- contract address
- contract name
- user session or transaction provider

Example configuration parameters:

- network: string
- contractAddress: string
- contractName: string
- userSession: object

The SDK must not hardcode contract addresses.

---

# 6. Type Definitions

The SDK must define clear types for:

## RoutingRules

- lockAmount: number
- lockUntilBlock: number
- splitAddress: string
- splitAmount: number

## VaultState

- lockedAmount: number
- unlockedAmount: number
- splitAmount: number
- lockExpiryBlock: number

## TransactionResult

- txId: string
- status: string

All numeric amounts must clearly document unit expectations (micro-units vs whole tokens).

---

# 7. FlowVault Class Design

The SDK must expose a single main class:

FlowVault

## Constructor Responsibilities

- Store network configuration
- Store contract metadata
- Store user session
- Validate configuration

---

# 8. Required Public Methods

The FlowVault class must implement:

### setRoutingRules(rules)
- Accept RoutingRules object
- Validate input
- Construct transaction
- Return transaction response

### deposit(amount)
- Accept numeric amount
- Validate amount
- Execute contract call
- Return transaction result

### withdraw(amount)
- Accept numeric amount
- Validate unlocked balance (optional pre-check)
- Execute transaction
- Return result

### clearRoutingRules()
- Reset user configuration

### getVaultState(userAddress)
- Read-only contract call
- Parse Clarity response
- Return typed VaultState

---

# 9. Validation Rules

The SDK must:

- Reject negative values
- Reject invalid Stacks addresses
- Reject zero-value operations where disallowed
- Validate lockUntilBlock > current block

Validation must occur before sending transactions.

---

# 10. Error Handling

Create standardized error classes:

- InvalidAmountError
- InvalidAddressError
- InvalidConfigurationError
- ContractCallError
- NetworkError

Errors must be descriptive and actionable.

---

# 11. Network Layer

The SDK must:

- Support testnet and mainnet
- Allow custom network injection
- Separate network logic into network.ts

Avoid mixing network logic inside business logic.

---

# 12. Utility Layer

Include utility helpers for:

- Unit conversion
- Address validation
- Block comparison
- Response parsing
- Logging (optional)

Keep utilities isolated.

---

# 13. Documentation Requirements

## README.md must include:

- Project description
- Installation instructions
- Basic setup example
- Minimal usage example
- Explanation of routing model
- Network configuration example
- Contract address configuration guide
- Development instructions
- Versioning policy

---

# 14. Quick Start Documentation

docs/quick-start.md must include:

1. Install
2. Initialize SDK
3. Set routing rules
4. Deposit USDCx
5. Read vault state
6. Withdraw

This must be clear enough for a junior developer.

---

# 15. Use Cases Documentation

docs/use-cases.md must explain:

- Escrow model
- DAO treasury flow
- Payroll routing
- Subscription split

Each use case must include:

- Description
- Routing rule configuration
- Expected behavior

---

# 16. Testing Requirements

The SDK must include:

- Unit tests for validation
- Mocked transaction tests
- Parsing tests for read-only calls
- Error case tests

Do not rely only on contract tests.

---

# 17. Versioning Strategy

Use semantic versioning:

- 0.1.0 — Initial public SDK
- 0.2.0 — Feature additions
- 1.0.0 — Stable API

Document breaking changes clearly.

---

# 18. Non-Goals

The SDK will NOT:

- Include backend automation
- Execute scheduled transactions
- Hold custody
- Manage wallets
- Abstract USDCx bridging
- Add new smart contract logic

It is strictly an interface layer.

---

# 19. Completion Criteria

The SDK is complete when:

- All contract functions are wrapped
- All responses are typed
- Validation prevents common mistakes
- Documentation is comprehensive
- Example usage works end-to-end
- Testnet integration confirmed

---

# 20. Long-Term Vision

The FlowVault SDK should become:

- The default developer interface for programmable USDCx routing on Stacks
- A composable financial primitive
- A foundation for higher-level protocols

---

End of Specification