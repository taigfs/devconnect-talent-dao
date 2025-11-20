# Work NFTs - Blockchain Credentials

## Overview

The **Work NFTs** feature allows workers to receive on-chain credentials (ERC721 NFTs) when they successfully complete jobs. These NFTs serve as proof of work and skill verification on the Scroll Sepolia blockchain.

## How It Works

### 1. NFT Minting Flow

1. **Job Creation**: A requester creates a job using the WorkMarketplace contract
2. **Job Completion**: A worker takes the job and submits their work
3. **Job Approval**: The requester approves the work
4. **NFT Minting**: The WorkMarketplace automatically mints a Work Credential NFT to the worker's wallet

### 2. NFT Dashboard (`/nfts/my-nfts`)

Workers can view all their Work Credential NFTs in a dedicated dashboard that displays:
- **NFT Cards**: Visual representation with company logos and category badges
- **Statistics**: Total NFTs and breakdown by category
- **Metadata**: Job title, description, delivery date, and more
- **Company Detection**: Automatically detects and displays company logos from job descriptions

## Technical Integration

### Contract Details

**Network**: Scroll Sepolia Testnet  
**Chain ID**: 534351  
**WorkNFT Address**: `0x4EB9476E04fCf26120EA2E3c0acb65F4b394eC01`  
**WorkMarketplace Address**: `0xaaED8af8c304A5ed29f862b9237070F3C99CdD26`

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
├─────────────────────────────────────────────────────────────┤
│  MyNFTs Page  →  useMyWorkNfts Hook  →  workNft.ts          │
│                                           ↓                   │
│                                    viem publicClient          │
│                                           ↓                   │
│                                   Scroll Sepolia RPC          │
│                                           ↓                   │
│                               WorkNFT Contract (ERC721)       │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

#### 1. Contract Integration (`src/lib/web3/workNft.ts`)

Handles all blockchain interactions:
- `getUserWorkNfts()`: Fetches all NFTs owned by a wallet
- `fetchNftMetadata()`: Retrieves and parses NFT metadata (supports IPFS and data URIs)
- Uses ERC721 Enumerable functions: `balanceOf`, `tokenOfOwnerByIndex`, `tokenURI`

#### 2. React Hook (`src/hooks/useMyWorkNfts.ts`)

React Query hook for easy data fetching:
```typescript
const { data, isLoading, error } = useMyWorkNfts();
```

- Automatically fetches NFTs for the connected wallet
- Handles loading and error states
- Caches results and refetches on window focus

#### 3. NFT Dashboard (`src/pages/MyNFTs.tsx`)

Main UI component that:
- Shows loading state while fetching from blockchain
- Displays error messages if fetch fails
- Shows empty state for wallets with no NFTs
- Renders NFT cards in a responsive grid
- Includes back button to return to job board

#### 4. Company Detection (`src/types/nft.ts`)

Intelligent logo detection system:
```typescript
detectCompaniesFromText(title + description) 
// Returns: [{ name: 'Coinbase', logo: 'https://...' }]
```

Supported companies:
- **Web3**: Coinbase, Scroll, Base, Chainlink, Aave, Uniswap
- **LatAm**: Nubank, MercadoLibre, Rappi, Globant

## Demo Mode

### Test Data Generation

When creating a job with `?test=true` in the URL, the "Fill Dummy Data" button automatically:

1. Generates realistic job titles and descriptions
2. **Injects company names** into descriptions (e.g., "This is a partnership with Coinbase")
3. When the job is completed and NFT is minted, company logos appear automatically

**Implementation**: `src/utils/testDataGenerator.ts`

```typescript
// Automatically injects companies into dummy descriptions
const description = `Looking for a developer for this ${company} project...`;
```

This creates a seamless demo experience where:
- Job descriptions mention real companies
- NFT metadata preserves these mentions
- `detectCompaniesFromText()` finds the companies
- Logos display automatically in the NFT dashboard

## Environment Variables

Add to your `.env` file:

```env
VITE_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
VITE_WORK_NFT_ADDRESS=0x4EB9476E04fCf26120EA2E3c0acb65F4b394eC01
VITE_WORK_MARKETPLACE_ADDRESS=0xaaED8af8c304A5ed29f862b9237070F3C99CdD26
VITE_WETH_ADDRESS=0x5300000000000000000000000000000000000004
```

## Testing Guide

### Quick Test Flow

1. **Connect Wallet**
   - Click "Connect Wallet" on landing page
   - Connect MetaMask to Scroll Sepolia
   - Ensure you have some Scroll Sepolia ETH

2. **Create a Test Job** (Optional - if no NFTs exist yet)
   - Add `?test=true` to the URL
   - Click "Post Job" and then "Fill Dummy Data"
   - Note the description mentions a company (e.g., "Coinbase", "Scroll")
   - Submit the job (requires WETH approval)

3. **Complete the Job** (Requires another wallet or contract interaction)
   - Take the job
   - Submit work
   - Approve work (this mints the NFT)

4. **View Your NFTs**
   - Navigate to `/nfts/my-nfts`
   - Wait for blockchain data to load
   - See your Work Credential NFT with:
     - Job title and description
     - Company logo (detected from description)
     - Category badge
     - Beautiful card design with animations

### Expected Behavior

**No Wallet Connected:**
- Shows "Connect Your Wallet" message
- Button to return to home

**Wallet Connected, Loading:**
- Shows loading spinner
- Message: "Loading your NFTs from blockchain..."

**Wallet Connected, No NFTs:**
- Shows empty state
- Message: "No Work Credentials Yet"
- Button: "Browse Available Jobs"

**Wallet Connected, Has NFTs:**
- Displays NFT cards in grid
- Shows statistics (total, by category)
- Cards show company logos and category badges
- Click card to view details

## Troubleshooting

### NFTs Not Showing

1. **Check Network**: Ensure MetaMask is on Scroll Sepolia (Chain ID 534351)
2. **Check RPC**: Verify `VITE_SCROLL_RPC_URL` is set correctly
3. **Check Contract**: Confirm `VITE_WORK_NFT_ADDRESS` matches deployed contract
4. **Console Logs**: Open browser console and look for `[WorkNFT]` logs

### Company Logos Not Appearing

1. **Check Description**: Ensure job description contains company name (case-insensitive)
2. **Supported Companies**: Verify company is in `COMPANY_LOGOS` mapping
3. **Detection**: Test `detectCompaniesFromText()` with your description

### Metadata Not Loading

1. **IPFS**: If using IPFS URIs, check gateway is accessible
2. **CORS**: Ensure metadata server allows cross-origin requests
3. **Format**: Verify metadata follows ERC721 standard (name, description, image)

## Future Enhancements

- [ ] Filter NFTs by category or company
- [ ] Search functionality
- [ ] Download NFT certificate as PDF
- [ ] Share NFT on social media
- [ ] Display rarity traits
- [ ] Show NFT transfer history
- [ ] Support for other chains (via bridge)

## API Reference

### `getUserWorkNfts(owner: Address): Promise<WorkNFTData[]>`

Fetches all Work NFTs for a given wallet address.

**Parameters:**
- `owner`: Ethereum address (0x...)

**Returns:**
```typescript
[
  {
    tokenId: 1n,
    tokenUri: "ipfs://...",
    metadata: {
      name: "React Developer",
      description: "Built app for Coinbase",
      image: "https://...",
      attributes: [...]
    }
  }
]
```

### `detectCompaniesFromText(text: string): CompanyData[]`

Detects company names from text and returns their logos.

**Parameters:**
- `text`: Combined string (usually title + description)

**Returns:**
```typescript
[
  {
    tag: "coinbase",
    name: "Coinbase",
    logo: "https://logo.clearbit.com/coinbase.com"
  }
]
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify all environment variables are set
3. Ensure wallet is connected to Scroll Sepolia
4. Check ScrollScan for transaction status

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Network**: Scroll Sepolia Testnet

