/**
 * WorkNFT Contract Interface
 * 
 * Handles interactions with the WorkNFT ERC721 token on Scroll Sepolia.
 * WorkNFT is minted when a job is completed and approved.
 */

import { publicClient, scrollChain } from './scrollClient';
import { WORK_NFT_ADDRESS } from './constants';
import type { Abi } from 'viem';

/**
 * Minimal WorkNFT ABI - ERC721 enumerable functions
 */
export const workNftAbi: Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenOfOwnerByIndex',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenURI',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'uri', type: 'string' }],
  },
];

/**
 * Interface for NFT metadata (ERC721 standard)
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Interface for Work NFT with token data
 */
export interface WorkNFTData {
  tokenId: bigint;
  tokenUri: string;
  metadata: NFTMetadata | null;
}

/**
 * Fetch NFT metadata from URI (handles IPFS and HTTP)
 * @param tokenUri The token URI from the contract
 * @returns Parsed NFT metadata
 */
export async function fetchNftMetadata(tokenUri: string): Promise<NFTMetadata | null> {
  try {
    let url = tokenUri;
    
    if (url.startsWith('ipfs://')) {
      url = url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    if (url.startsWith('data:application/json;base64,')) {
      const base64Data = url.replace('data:application/json;base64,', '');
      const jsonString = atob(base64Data);
      const parsed = JSON.parse(jsonString);
      return parsed;
    }
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch metadata: ${res.statusText}`);
    }
    
    const metadata = await res.json();
    return metadata;
  } catch (error) {
    console.error('[WorkNFT] Failed to fetch metadata:', error);
    return null;
  }
}

/**
 * Get all Work NFTs owned by a user
 * @param owner The wallet address to query
 * @returns Array of NFT data with metadata
 */
async function getTokenOwner(tokenId: bigint): Promise<`0x${string}` | null> {
  try {
    // @ts-expect-error - viem version compatibility issue
    const owner = await publicClient.readContract({
      address: WORK_NFT_ADDRESS,
      abi: [{
        type: 'function',
        name: 'ownerOf',
        stateMutability: 'view',
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        outputs: [{ name: 'owner', type: 'address' }],
      }] as const,
      functionName: 'ownerOf',
      args: [tokenId],
    });
    return owner as `0x${string}`;
  } catch {
    return null;
  }
}

export async function getUserWorkNfts(owner: `0x${string}`): Promise<WorkNFTData[]> {
  try {
    // @ts-expect-error - viem version compatibility issue
    const balance = await publicClient.readContract({
      address: WORK_NFT_ADDRESS,
      abi: workNftAbi,
      functionName: 'balanceOf',
      args: [owner],
    });

    const count = Number(balance);
    
    if (count === 0) return [];

    const maxTokenId = 100;
    const userTokenIds: bigint[] = [];
    
    for (let i = 1; i <= maxTokenId; i++) {
      const tokenId = BigInt(i);
      const tokenOwner = await getTokenOwner(tokenId);
      
      if (tokenOwner && tokenOwner.toLowerCase() === owner.toLowerCase()) {
        userTokenIds.push(tokenId);
        
        if (userTokenIds.length >= count) {
          break;
        }
      }
    }

    const tokenUris = await Promise.all(
      userTokenIds.map((tokenId) => {
        // @ts-expect-error - viem version compatibility issue
        return publicClient.readContract({
          address: WORK_NFT_ADDRESS,
          abi: workNftAbi,
          functionName: 'tokenURI',
          args: [tokenId],
        });
      }),
    );

    const nftsWithMetadata = await Promise.all(
      userTokenIds.map(async (tokenId, index) => {
        const tokenUri = tokenUris[index] as string;
        const metadata = await fetchNftMetadata(tokenUri);
        
        return {
          tokenId,
          tokenUri,
          metadata,
        };
      }),
    );

    return nftsWithMetadata;
  } catch (error) {
    console.error('[WorkNFT] Failed to fetch user NFTs:', error);
    return [];
  }
}

