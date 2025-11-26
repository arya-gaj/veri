# Veriked - Somnia Blockchain Oracle

Simple blockchain assistant for Somnia testnet with Oz Oracle personality.

## Quick Start

```bash
npm install
npm run dev
```

## Test API

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query":"How much I have?","walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"}'
```

## Features

- Natural language blockchain queries with Wicked/Oz theming
- Real-time Somnia testnet data
- Direct answers with actual numbers from blockchain
- Extensive blockchain knowledge base (80+ topics)
- Emerald City themed responses
- Blockchain proof with every wallet query
- Natural typing animations with contextual loading messages
- Smart verification badges: "veriked verified" (green) + "glinda glorified" (pink)
- Intelligent response delays for natural conversation flow

## Query Types

**Wallet Queries** (requires wallet address):
- Balance: "How much I have?"
- Transactions: "Show my transactions"
- NFTs: "What NFTs do I own?"
- Tokens: "Show my token holdings"

**General Knowledge** (extensive coverage):
- Somnia, blockchain, smart contracts, tokens, NFTs, DeFi, wallets, gas fees, consensus, security, transactions, Web3, Layer 2, and advanced topics

## API Endpoints

- `POST /api/query` - Main query endpoint
- `GET /api/stream` - Real-time updates
- `GET /api/somnia-proxy` - Blockchain data proxy

## Response Style

All responses feature Wicked/Oz theming with actual blockchain data. See `.kiro/steering/style.md` for complete style guide.

## Verification Badges

Smart verification system:
- **Veriked Verified** (green checkmark): Blockchain data verified - shown on wallet queries
- **Glinda Glorified** (pink checkmark): Knowledge blessed by the Good Witch - shown on general knowledge queries
