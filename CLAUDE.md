# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MintWork is a decentralized Web3 gig marketplace built on Scroll Sepolia testnet. It enables workers and requesters to interact through an escrow-based job system where 80% goes to workers and 20% to social programs, with full transparency through blockchain integration.

## Development Commands

### Core Commands
```bash
# Start development server (runs on http://[::]:8080)
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### State Management Architecture
The app uses a centralized context-based state management system:

- **AppContext** ([src/contexts/AppContext.tsx](src/contexts/AppContext.tsx)) - Central state manager for:
  - User authentication and role management (worker/requester)
  - Job lifecycle (creation, application, submission, approval)
  - Balance management (mock balances + WETH balances)
  - Transaction history
  - localStorage persistence and cross-tab synchronization
  - Blockchain integration (job creation, work approval)

### Wallet Integration
Two-tier wallet connection system:

1. **Lemon Wallet** (primary) - via `@lemoncash/mini-app-sdk` for WebView environments
2. **MetaMask** (fallback) - for local development and non-WebView environments

Implementation in [src/hooks/useAppWallet.ts](src/hooks/useAppWallet.ts) handles detection and connection flow automatically.

### Blockchain Integration (Scroll Sepolia)

The app integrates with Scroll Sepolia testnet through smart contracts:

- **WorkMarketplace Contract** - Main escrow contract for job management
  - Address: `0x88498F482EA125f326b03Df57e3F49e247426e2f` (configurable via `VITE_WORK_MARKETPLACE_ADDRESS`)
  - Functions: createJob, takeJob, submitWork, approveWork, cancelJob

- **WETH Token** - Payment token for jobs
  - Address: `0x5300000000000000000000000000000000000004` (canonical Scroll WETH)
  - Note: Current deployed contract uses wrong WETH address (see [src/lib/web3/constants.ts:19-29](src/lib/web3/constants.ts#L19-L29))

**Key Web3 Files:**
- [src/lib/web3/scrollClient.ts](src/lib/web3/scrollClient.ts) - Viem client configuration (publicClient, walletClient)
- [src/lib/web3/workMarketplace.ts](src/lib/web3/workMarketplace.ts) - Contract interaction functions
- [src/lib/web3/weth.ts](src/lib/web3/weth.ts) - WETH token operations (balance, approve)
- [src/lib/web3/constants.ts](src/lib/web3/constants.ts) - Contract addresses and explorer URLs
- [src/abi/](src/abi/) - Contract ABIs (WorkMarketplace, WorkNFT, IWorkNFT)

### Component Architecture

**Two-Role System:**
- **Worker View** - Browse jobs, apply, submit work ([src/components/worker/](src/components/worker/))
- **Requester View** - Post jobs, review submissions ([src/components/requester/](src/components/requester/))

**Shared Components:**
- [src/components/ConnectWalletModal.tsx](src/components/ConnectWalletModal.tsx) - Role selection + wallet connection
- [src/components/Navbar.tsx](src/components/Navbar.tsx) - Balance display, transaction history, wallet dropdown
- [src/components/TransactionHistoryModal.tsx](src/components/TransactionHistoryModal.tsx) - Transaction log viewer
- [src/components/ui/](src/components/ui/) - shadcn/ui component library

### Job Lifecycle Flow

1. **Job Creation** (Requester):
   - Approve WETH → Create job on-chain → Store in local state
   - Implementation: [AppContext.createJobWithScroll](src/contexts/AppContext.tsx#L426-L538)

2. **Job Application** (Worker):
   - Apply → Status changes to IN_PROGRESS
   - Implementation: [AppContext.applyForJob](src/contexts/AppContext.tsx#L298-L321)

3. **Work Submission** (Worker):
   - Submit link → Status changes to SUBMITTED
   - Implementation: [AppContext.submitWork](src/contexts/AppContext.tsx#L323-L351)

4. **Work Approval** (Requester):
   - Approve on-chain → WETH transferred + NFT minted → Status COMPLETED
   - Implementation: [AppContext.approveWork](src/contexts/AppContext.tsx#L540-L608)

### Data Synchronization

**Hybrid State Model:**
- Local state (localStorage) for UI consistency and demo data
- On-chain state for production transactions
- Sync function available: [AppContext.syncJobsFromChain](src/contexts/AppContext.tsx#L377-L424)

**Job Status Mapping:**
- On-chain: `0=Created, 1=Submitted, 2=Paid, 3=Cancelled`
- UI: `OPEN, IN_PROGRESS, SUBMITTED, COMPLETED`
- Mapping logic: [AppContext.mapOnChainStatusToUI](src/contexts/AppContext.tsx#L356-L371)

## Configuration

### Environment Variables
Create `.env` file in root:
```env
VITE_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
VITE_WETH_ADDRESS=0x5300000000000000000000000000000000000004
VITE_WORK_MARKETPLACE_ADDRESS=0x88498F482EA125f326b03Df57e3F49e247426e2f
```

### TypeScript Configuration
- Path alias: `@/*` → `./src/*`
- Strict mode is relaxed (see [tsconfig.json](tsconfig.json#L9-L14))
- No implicit any, unused parameters, and strict null checks are disabled

### Demo Mode
Add `?demo=true` to URL to enable role-switching button for testing both worker/requester flows.

## Key Technical Decisions

1. **Viem over ethers.js** - Used for all blockchain interactions
2. **shadcn/ui** - Component library built on Radix UI primitives
3. **localStorage persistence** - State survives page refreshes, cross-tab sync via storage events
4. **Optimistic UI updates** - Local state updates immediately, blockchain sync follows
5. **Multicall for efficiency** - Batch reads when fetching multiple jobs ([workMarketplace.getAllJobsBasic](src/lib/web3/workMarketplace.ts#L61-L98))

## Known Issues

- Deployed WorkMarketplace contract uses incorrect WETH address (see [src/lib/web3/constants.ts:19-29](src/lib/web3/constants.ts#L19-L29))
- TypeScript strict mode partially disabled to accommodate rapid prototyping
- ESLint configured to ignore unused variables (`@typescript-eslint/no-unused-vars: off`)