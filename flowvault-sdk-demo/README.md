# FlowVault SDK Demo

This is the official minimal example app showing end-to-end usage of flowvault-sdk.

What this demo proves:
- Wallet connection works with @stacks/connect (Leather or Hiro wallet)
- Wallet-signed setRoutingRules works
- Wallet-signed deposit works
- Wallet-signed withdraw works
- flowvault-sdk read calls (getVaultState/getCurrentBlockHeight) work
- one SDK instance can support full app flow in browser via contractCallExecutor

## Stack

- Next.js + TypeScript
- @stacks/connect for wallet connection and wallet-signed writes
- flowvault-sdk for both writes and reads

## Project structure

- src/app/page.tsx: main page
- src/components/FlowVaultDemo.tsx: UI + action handlers
- src/lib/wallet.ts: helper to extract STX address from wallet responses

## Environment setup

1. Copy .env.example to .env.local
2. Fill all NEXT_PUBLIC_FLOWVAULT_* values

Example `.env.local`:

```bash
NEXT_PUBLIC_FLOWVAULT_NETWORK=testnet
NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS=STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD
NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME=flowvault
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME=usdcx
```

Important:
- In this real demo mode, write calls are signed by the connected wallet.
- No server private key is used for set/deposit/withdraw.
- The app initializes FlowVault SDK in the browser and injects wallet execution via `contractCallExecutor`.

## Token units (micro-units)

USDCx uses 6 decimals:
- 1 USDCx = 1000000 micro-units

The UI takes token values as decimal strings and converts them deterministically:
- "1.5" -> "1500000" micro-units (deterministic string conversion in UI)

Wallet write calls pass micro-unit values into SDK as BigInt micro-units.

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
3. Deposit USDCx (wallet signs through SDK executor)
4. Fetch vault state (SDK read)
5. Withdraw unlocked funds (wallet signs)

### lockUntilBlock input behavior

To match the original app behavior, the demo accepts either format:
- Duration mode: input a smaller value like `144` and the app sends `currentBlock + 144`.
- Absolute mode: input a future chain block height directly.

If lock amount is greater than `0`, lockUntilBlock must resolve to a future block.

## Post-conditions

The demo exposes postConditionMode (allow or deny) and passes it into SDK write options.

Example in code:
- src/components/FlowVaultDemo.tsx passes postConditionMode to SDK methods
- SDK forwards write execution to wallet via `contractCallExecutor`

You can extend this demo to pass explicit postConditions arrays as needed.

## Troubleshooting

- InvalidAddressError with `tb1...`:
   Ensure you are connected with an STX account. The demo filters for STX addresses only.
- lockUntilBlock must be in the future:
   Use duration format (for example `144`) or enter an absolute block greater than current chain height.
