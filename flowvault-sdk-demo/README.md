# FlowVault SDK Demo

This is the official minimal example app showing end-to-end usage of flowvault-sdk.

What this demo proves:
- Wallet connection works with @stacks/connect (Leather or Hiro wallet)
- Wallet-signed setRoutingRules works
- Wallet-signed deposit works
- Wallet-signed withdraw works
- flowvault-sdk read calls (getVaultState/getCurrentBlockHeight) work

## Stack

- Next.js + TypeScript
- @stacks/connect for wallet connection and wallet-signed writes
- @stacks/transactions for Clarity arg builders on client writes
- flowvault-sdk for read-only contract interaction via API route

## Project structure

- src/app/page.tsx: main page
- src/components/FlowVaultDemo.tsx: UI + action handlers
- src/app/api/flowvault/route.ts: read-only server API that calls flowvault-sdk
- src/lib/wallet.ts: helper to extract STX address from wallet responses

## Environment setup

1. Copy .env.example to .env.local
2. Fill all NEXT_PUBLIC_FLOWVAULT_* values
3. Optionally fill FLOWVAULT_* values (server fallback for read route)

Important:
- In this real demo mode, write calls are signed by the connected wallet.
- No server private key is used for set/deposit/withdraw.
- The API route is read-only and uses SDK for getVaultState/getCurrentBlockHeight.

## Token units (micro-units)

USDCx uses 6 decimals:
- 1 USDCx = 1000000 micro-units

The UI takes token values as decimal strings and converts them deterministically:
- "1.5" -> "1500000" micro-units (deterministic string conversion in UI)

Wallet write calls pass micro-unit values as Clarity uint arguments.

## Run locally

1. Install dependencies:
   npm install

2. Start development server:
   npm run dev

3. Open:
   http://localhost:3000

## Demo flow

1. Connect wallet
2. Set routing rules (wallet signs)
3. Deposit USDCx (wallet signs)
4. Fetch vault state (SDK read)
5. Withdraw unlocked funds (wallet signs)

## Post-conditions

The demo exposes postConditionMode (allow or deny) and passes it to wallet-signed write calls.

Example in code:
- src/components/FlowVaultDemo.tsx sends postConditionMode in request("stx_callContract", ...)

You can extend this demo to pass explicit postConditions arrays as needed.
