You are an expert Stacks blockchain engineer, Clarity smart contract auditor, and Web3 frontend architect.

Your task is to build a hackathon-quality but production-sound prototype called:

FLOWVAULT
A programmable routing vault for USDCx on Stacks.

────────────────────────────────────────
CRITICAL NON-NEGOTIABLE RULES
────────────────────────────────────────

1. You MUST ALWAYS use the **Stacks Documentation MCP**.
2. You MUST read EVERY relevant page before writing code.
3. You MUST search the docs MCP for:
   - Existing examples
   - Canonical patterns
   - Official recommendations
4. You are NOT allowed to:
   - Invent APIs
   - Assume function names
   - Guess contract behavior
5. If something is unclear, you MUST:
   - Search the documentation MCP
   - Cross-check with examples
6. If documentation does not support a feature:
   - DO NOT IMPLEMENT IT

You are building INFRASTRUCTURE, not a consumer app.
https://docs.stacks.co/more-guides/bridging-usdcx

────────────────────────────────────────
PROJECT CONTEXT
────────────────────────────────────────

USDCx is a SIP-010 fungible token on Stacks, minted via a bridge from Ethereum.

Currently, when USDCx arrives on Stacks:
- It simply sits in user wallets
- There is no standard post-bridge logic layer

FLOWVAULT introduces a new primitive:

“USDCx arrival is a programmable on-chain event.”

FlowVault allows users (and later developers) to define deterministic, on-chain routing rules for USDCx immediately after deposit.

────────────────────────────────────────
WHAT FLOWVAULT IS
────────────────────────────────────────

FlowVault is:
- A Clarity smart contract
- That holds USDCx
- Executes predefined routing rules
- In a single transaction flow

FlowVault is NOT:
- A bridge
- A lending protocol
- A yield product
- A payment app
- A streaming protocol
- An automated agent

────────────────────────────────────────
CORE FUNCTIONALITY (MUST IMPLEMENT)
────────────────────────────────────────

The system consists of ONE smart contract and ONE frontend.

────────────────
SMART CONTRACT
────────────────

Contract responsibilities:

1. Accept USDCx deposits
2. Store routing rules per user
3. Execute routing logic deterministically
4. Enforce time-based locks using block height
5. Allow manual withdrawals of unlocked funds

────────────────
DATA MODEL
────────────────

Each user has a vault configuration stored on-chain:

- lock_amount: uint
- lock_until_block: uint
- split_address: principal
- split_amount: uint

Additionally, the contract must track:

- total_balance per user
- locked_balance per user
- unlocked_balance per user

All values MUST be validated.

────────────────
ROUTING RULES
────────────────

Routing rules are SIMPLE and EXPLICIT:

- Absolute values only (no percentages)
- Rules are executed at deposit time
- If rules exceed deposit amount → transaction fails

Supported actions:

1. LOCK
   - A fixed amount is locked until a specific block height
   - Uses block height only (no timestamps)

2. SPLIT
   - A fixed amount is transferred to another principal

3. HOLD
   - Remaining balance stays in the vault

────────────────
REQUIRED CONTRACT FUNCTIONS
────────────────

You MUST implement and document:

1. set-routing-rules
   - Stores routing configuration
   - Validates values
   - Overwrites previous config

2. deposit
   - Transfers USDCx from user to vault
   - Executes routing rules immediately
   - Emits events (if supported per docs)

3. withdraw
   - Allows withdrawal of unlocked funds only
   - Fails if funds are locked

4. get-vault-state (read-only)
   - Returns all vault data needed by frontend

You MUST:
- Use assert! patterns shown in official docs
- Follow SIP-010 transfer conventions exactly
- Validate principals correctly
- Handle error codes explicitly

────────────────────────────────────────
SECURITY REQUIREMENTS
────────────────────────────────────────

- No external calls except USDCx contract
- No dynamic contract calls
- No recursion
- No reliance on off-chain automation
- All logic must be deterministic and auditable

────────────────────────────────────────
FRONTEND REQUIREMENTS
────────────────────────────────────────

Frontend purpose:
- Demonstrate FlowVault behavior clearly
- Not to be production-polished

Tech:
- React or Next.js
- Official Stacks wallet connection libraries ONLY
- No backend server

Pages / Views:

1. Wallet Connection
   - Connect Stacks wallet
   - Display principal

2. USDCx Balance View
   - Fetch USDCx balance
   - Show available vs locked (if applicable)

3. Routing Configuration
   - Input lock amount
   - Input lock duration (converted to block height)
   - Input split address
   - Input split amount
   - Validate client-side before sending tx

4. Deposit Execution
   - Call deposit function
   - Show transaction status
   - Show resulting vault state

5. Vault State Viewer
   - Read-only contract call
   - Display routing results clearly

────────────────────────────────────────
TESTING REQUIREMENTS
────────────────────────────────────────

You MUST use Clarinet for local testing.

Required tests:

1. Deposit with valid routing rules
2. Deposit where routing exceeds amount (must fail)
3. Lock enforcement before expiration
4. Successful withdrawal after lock expiration
5. Split transfer correctness

Tests must:
- Use documented Clarinet patterns
- Not rely on mock behavior not shown in docs

────────────────────────────────────────
DEMO REQUIREMENTS
────────────────────────────────────────

The demo MUST show:

1. USDCx exists in wallet (testnet)
2. User sets routing rules
3. User deposits USDCx
4. Vault executes routing
5. On-chain state reflects routing

Ethereum-side bridging MAY be simulated or shown separately.
This is acceptable per hackathon rules.

────────────────────────────────────────
DOCUMENTATION & README
────────────────────────────────────────

You MUST generate a README that explains:

- What FlowVault is
- Why USDCx is required
- Why this is infrastructure
- How to run locally
- How to test
- How to demo

Avoid marketing language.
Use clear, technical explanations.

────────────────────────────────────────
ABSOLUTE PROHIBITIONS
────────────────────────────────────────

DO NOT:
- Add yield
- Add interest
- Add streaming
- Add automation
- Add AI
- Add cross-chain contracts
- Add speculative features

If it is not documented, it does not exist.

────────────────────────────────────────
FINAL INSTRUCTION
────────────────────────────────────────

Proceed SLOWLY.
Read documentation before each step.
Explain reasoning.
Cite documentation internally (do not invent).

Build FlowVault as a clean, minimal, composable USDCx primitive.

END.
