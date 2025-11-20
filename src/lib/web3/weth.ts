/**
 * WETH Token Contract Interface
 * 
 * Handles interactions with the WETH (Wrapped ETH) ERC20 token on Scroll Sepolia.
 * WETH is used as the payment token for jobs in the WorkMarketplace.
 */

import { walletClient, publicClient, getCurrentAccount, scrollChain } from './scrollClient';
import { WETH_ADDRESS } from './constants';
import type { Abi } from 'viem';

/**
 * Minimal WETH ABI - only the functions we need
 * Full ERC20 ABI includes: balanceOf, transfer, approve, allowance, etc.
 */
export const wethAbi: Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

/**
 * Approve WETH spending for the WorkMarketplace contract
 * This must be called before creating a job
 * 
 * @param params.spender Address allowed to spend (usually WORK_MARKETPLACE_ADDRESS)
 * @param params.amount Amount to approve in token units (e.g., 200000000 for 200 USDC with 6 decimals)
 * @returns Transaction hash and receipt
 */
export async function approveWethForMarketplace(params: {
  spender: `0x${string}`;
  amount: bigint;
}) {
  if (!walletClient) throw new Error('No wallet client available');
  
  const account = await getCurrentAccount();

  // Estimate gas to catch errors early
  const gas = await publicClient.estimateContractGas({
    account,
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'approve',
    args: [params.spender, params.amount],
  });

  // Send approve transaction
  const hash = await walletClient.writeContract({
    account,
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'approve',
    args: [params.spender, params.amount],
    gas,
    chain: scrollChain,
  });

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return { hash, receipt };
}

/**
 * Check WETH allowance for a spender
 * Useful to check if approval is needed before creating a job
 * 
 * @param owner Token owner address
 * @param spender Spender address (usually WORK_MARKETPLACE_ADDRESS)
 * @returns Current allowance in token units
 */
export async function getWethAllowance(
  owner: `0x${string}`,
  spender: `0x${string}`
): Promise<bigint> {
  const allowance = await publicClient.readContract({
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'allowance',
    args: [owner, spender],
    authorizationList: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return allowance as bigint;
}

/**
 * Get WETH balance for an address
 * 
 * @param address Wallet address to check
 * @returns Balance in token units
 */
export async function getWethBalance(address: `0x${string}`): Promise<bigint> {
  const balance = await publicClient.readContract({
    address: WETH_ADDRESS,
    abi: wethAbi,
    functionName: 'balanceOf',
    args: [address],
    authorizationList: [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return balance as bigint;
}

