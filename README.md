# TalentDAO - Web3 Gig Marketplace

Decentralized talent marketplace. 80% to workers, 20% to social programs. 100% transparent.

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd devconnect-talent-dao

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## 🛠️ Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **@lemoncash/mini-app-sdk** - Lemon Cash Mini App integration

## 📦 Features

- 🔐 Wallet connection (Lemon Wallet + MetaMask fallback)
- 👥 Role-based access (Worker / Requester)
- 💼 Job marketplace with escrow system
- 💰 USDC balance management (mock for development)
- ✅ KYC verification flow
- 📊 Dashboard for both roles

## 🌐 Deployment

This project can be deployed to:

- **Vercel** - Recommended for Vite projects
- **Netlify** - Alternative option
- Any static hosting service

### Deploy to Vercel

```sh
npm install -g vercel
vercel
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
VITE_WETH_ADDRESS=0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4
VITE_WORK_MARKETPLACE_ADDRESS=0x88498F482EA125f326b03Df57e3F49e247426e2f
```

## 📝 License

MIT
