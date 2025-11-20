/**
 * ABI barrel export for Scroll contracts
 * 
 * This file imports the contract ABIs and exports them in a standardized format.
 * Some JSONs come as { abi, bytecode }, others as just the ABI array.
 */

import WorkMarketplaceJson from './WorkMarketplace.json';
import WorkNFTJson from './WorkNFT.json';
import IWorkNFTJson from './IWorkNFT.json';

// Fallback to handle both formats: { abi: [...] } or just [...]
export const workMarketplaceAbi = (WorkMarketplaceJson as any).abi ?? WorkMarketplaceJson;
export const workNftAbi = (WorkNFTJson as any).abi ?? WorkNFTJson;
export const iWorkNftAbi = (IWorkNFTJson as any).abi ?? IWorkNFTJson;

