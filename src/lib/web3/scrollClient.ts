/**
 * Scroll Sepolia Client Configuration
 * 
 * Sets up viem public and wallet clients for interacting with Scroll Sepolia testnet.
 */

import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { scrollSepolia } from 'viem/chains';

// Scroll Sepolia chain configuration
export const scrollChain = scrollSepolia;

// Read RPC URL from environment (optional, viem has defaults)
const SCROLL_RPC_URL = import.meta.env.VITE_SCROLL_RPC_URL;

/**
 * Public client for reading blockchain state
 * Used for: contract reads, multicalls, transaction receipts, etc.
 */
export const publicClient = createPublicClient({
  chain: scrollChain,
  transport: http(SCROLL_RPC_URL || undefined),
});

/**
 * Wallet client for signing transactions
 * Uses window.ethereum (MetaMask, etc.) when available
 * Returns null in SSR or when no wallet is available
 */
export const walletClient =
  typeof window !== 'undefined' && (window as any).ethereum
    ? createWalletClient({
        chain: scrollChain,
        transport: custom((window as any).ethereum),
      })
    : null;

/**
 * Helper function to get the current connected account
 * @throws Error if no wallet or account is connected
 * @returns The connected wallet address
 */
export async function getCurrentAccount(): Promise<`0x${string}`> {
  if (!walletClient) {
    throw new Error('No wallet client available. Please connect your wallet (MetaMask, etc.)');
  }

  const [account] = await walletClient.getAddresses();
  
  if (!account) {
    throw new Error('No account connected. Please connect your wallet.');
  }

  return account;
}

