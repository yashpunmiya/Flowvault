# FlowVault 🔐

A programmable routing vault for USDCx on the Stacks blockchain. FlowVault enables users to automate their stablecoin flows with customizable routing rules including time-locked savings and automatic payment splits.

![Stacks](https://img.shields.io/badge/Stacks-Blockchain-purple)
![Clarity](https://img.shields.io/badge/Clarity-v3-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

## 🌟 Features

- **🔒 Time-Locked Savings**: Lock a portion of your deposits until a specific block height
- **✂️ Auto-Split Deposits**: Automatically route a portion of deposits to another address
- **💰 USDCx Support**: Built for the USDCx stablecoin on Stacks
- **📊 Vault State Viewer**: Real-time view of your vault balances and routing rules

## 🏗️ Architecture

```
flowvault/
├── flowvault-contracts/     # Clarity smart contracts
│   ├── contracts/
│   │   ├── sip-010-trait.clar   # SIP-010 token standard trait
│   │   ├── mock-usdcx.clar      # Mock USDCx token for testing
│   │   └── flowvault.clar       # Main vault contract
│   └── tests/
│       ├── flowvault.test.ts    # Vault contract tests
│       └── mock-usdcx.test.ts   # Token tests
│
└── flowvault-frontend/      # Next.js frontend
    └── src/
        ├── app/                 # Next.js app router
        ├── components/          # React components
        ├── context/             # Wallet context
        ├── hooks/               # Custom hooks
        └── lib/                 # Utilities
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Clarinet](https://github.com/hirosystems/clarinet) v3.13+
- A Stacks wallet (Leather, Xverse, etc.)
- Testnet STX tokens (from [Stacks Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet))

### ⚠️ Important: Deployment Required

Before using the frontend, you must **deploy the contracts to testnet**. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick deployment:**
```bash
cd flowvault-contracts
# Add your mnemonic to settings/Testnet.toml
clarinet deployments generate --testnet --medium-cost
clarinet deployments apply --testnet
# Update frontend with your deployed contract addresses
```

### Smart Contracts

```bash
# Navigate to contracts directory
cd flowvault-contracts

# Install dependencies
npm install

# Check contracts for errors
clarinet check

# Run tests
npm test

# Open interactive console
clarinet console
```

### Frontend

```bash
# Navigate to frontend directory
cd flowvault-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Smart Contract Functions

### Core Functions

| Function | Description |
|----------|-------------|
| `set-routing-rules` | Configure lock amount, lock duration, split address, and split amount |
| `deposit` | Deposit USDCx into the vault (applies routing rules) |
| `withdraw` | Withdraw unlocked funds from the vault |
| `clear-routing-rules` | Reset all routing rules to defaults |
| `get-vault-state` | View vault balances and current routing configuration |

### Routing Rules

When you set routing rules, each deposit is processed as follows:

1. **Split Check**: If `split-amount > 0`, that amount is sent directly to `split-address`
2. **Lock Check**: If `lock-amount > 0`, that amount is locked until `lock-until-block`
3. **Hold**: Remaining funds are held as unlocked balance

## 🧪 Testing

The project includes comprehensive tests covering:

- ✅ Routing rule configuration
- ✅ Deposit with no routing rules (hold all)
- ✅ Deposit with lock rules
- ✅ Deposit with split rules
- ✅ Deposit with combined lock + split rules
- ✅ Lock enforcement (cannot withdraw locked funds)
- ✅ Withdrawal after lock expiration
- ✅ Edge cases and error handling

```bash
cd flowvault-contracts
npm test
```

## 🌐 Contract Addresses

### Testnet

| Contract | Address |
|----------|---------|
| FlowVault | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.flowvault` |
| Mock USDCx | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-usdcx` |

### Mainnet

| Contract | Address |
|----------|---------|
| USDCx | `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx` |

## 💡 Use Cases

1. **Savings Account**: Lock 80% of each deposit for 1000 blocks (~1 week)
2. **Auto-Pay**: Split 10% of each deposit to a recurring payment address
3. **Investment Strategy**: Lock and split to create automated DCA
4. **Escrow**: Lock full deposits until a future date

## 🔧 Development

### Contract Development

```bash
# Check syntax
clarinet check

# Interactive console
clarinet console

# Deploy to testnet
clarinet deployments apply --testnet
```

### Frontend Development

```bash
# Development mode with hot reload
npm run dev

# Type checking
npm run build

# Linting
npm run lint
```

## 📚 Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language Reference](https://docs.stacks.co/reference/clarity)
- [SIP-010 Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Stacks Connect](https://docs.stacks.co/stacks-connect)
- [Clarinet SDK](https://docs.hiro.so/stacks/clarinet-js-sdk)

## 🤝 Why USDCx?

USDCx is a wrapped USDC token on Stacks that provides:
- Stablecoin reliability (1:1 USD peg)
- Full SIP-010 compatibility
- Seamless integration with Stacks DeFi

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ on [Stacks](https://stacks.co)
