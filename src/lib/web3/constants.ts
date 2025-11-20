/**
 * Scroll Contract Addresses and Explorer URLs
 * 
 * Configure these addresses in your .env file or use the defaults below.
 */

/**
 * WorkMarketplace contract address on Scroll Sepolia
 * This is the main escrow contract that manages jobs and payments
 */
export const WORK_MARKETPLACE_ADDRESS =
  (import.meta.env.VITE_WORK_MARKETPLACE_ADDRESS as `0x${string}`) ||
  '0x88498F482EA125f326b03Df57e3F49e247426e2f';

/**
 * WETH (Wrapped ETH) token address on Scroll Sepolia
 * This is the ERC20 token used for job payments
 * 
 * ⚠️ CRITICAL: The deployed WorkMarketplace was deployed with WRONG WETH address!
 * 
 * The contract at 0x88498F482EA125f326b03Df57e3F49e247426e2f uses 0x06eF...3A4
 * which is NOT a valid WETH contract (balanceOf fails).
 * 
 * SOLUTION: Re-deploy WorkMarketplace with the canonical Scroll WETH:
 * 0x5300000000000000000000000000000000000004
 * 
 * For now, using canonical WETH to at least show balance in UI.
 * But createJob WILL FAIL until contract is re-deployed!
 */
export const WETH_ADDRESS =
  (import.meta.env.VITE_WETH_ADDRESS as `0x${string}`) ||
  '0x5300000000000000000000000000000000000004';

/**
 * ScrollScan base URL for transaction explorer
 * Default: Scroll Sepolia testnet explorer
 */
export const SCROLLSCAN_BASE_URL =
  import.meta.env.VITE_SCROLLSCAN_BASE_URL || 'https://sepolia.scrollscan.com';

/**
 * Helper function to generate ScrollScan transaction URL
 * @param hash Transaction hash
 * @returns Full URL to view transaction on ScrollScan
 */
export function getScrollscanTxUrl(hash: `0x${string}`): string {
  return `${SCROLLSCAN_BASE_URL}/tx/${hash}`;
}

/**
 * Helper function to generate ScrollScan address URL
 * @param address Contract or wallet address
 * @returns Full URL to view address on ScrollScan
 */
export function getScrollscanAddressUrl(address: `0x${string}`): string {
  return `${SCROLLSCAN_BASE_URL}/address/${address}`;
}

