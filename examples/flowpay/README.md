# FlowPay

FlowPay is a production-quality reference app for salary-style USDCx automation on Stacks testnet.

The user enters a total deposit, a savings percentage, a recipient address, and a recipient split percentage. One product action then:

- creates a FlowVault strategy with `createStrategy()`
- deposits the full USDCx amount with `deposit()`
- locks the savings portion for 144 Stacks blocks
- transfers the recipient split immediately
- leaves the remainder available in the vault

This is not a mock. The app uses `flowvault-sdk`, Stacks Connect wallet signing, and the deployed FlowVault + USDCx testnet contracts.

## How It Works

For a `100 USDCx` deposit with `30%` savings and `20%` recipient split:

- `30 USDCx` is saved and locked in FlowVault.
- `20 USDCx` is transferred to the recipient wallet during the deposit transaction.
- `50 USDCx` remains available in the sender's vault.

The strategy transaction maps to the FlowVault contract's `set-routing-rules` function. The SDK exposes the product-facing `createStrategy()` alias so the app code reads like the user flow while still using the real deployed contract.

## Run Locally

```bash
cd examples/flowpay
npm install
npm run dev
```

Open the local Next.js URL, connect a Stacks testnet wallet, enter a recipient testnet address, and submit the flow.

Optional environment overrides:

```bash
NEXT_PUBLIC_FLOWVAULT_NETWORK=testnet
NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS=STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD
NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME=flowvault-v2
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME=usdcx
```

## Verification

Run local checks:

```bash
npm run typecheck
npm test
npm run build
```

Manual testnet checks:

- Submit multiple deposits with different percentages.
- Open the Hiro explorer links shown after success.
- Confirm the recipient receives the split amount from the deposit transaction.
- Confirm the saved amount is reported as locked until the displayed unlock block.
