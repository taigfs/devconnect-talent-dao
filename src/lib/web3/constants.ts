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
 */
export const WETH_ADDRESS =
  (import.meta.env.VITE_WETH_ADDRESS as `0x${string}`) ||
  '0x5300000000000000000000000000000000000004';

/**
 * WorkNFT contract address on Scroll Sepolia
 * This is the ERC721 contract that mints work credential NFTs when jobs are completed
 */
export const WORK_NFT_ADDRESS =
  (import.meta.env.VITE_WORK_NFT_ADDRESS as `0x${string}`) ||
  '0x4EB9476E04fCf26120EA2E3c0acb65F4b394eC01';

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

