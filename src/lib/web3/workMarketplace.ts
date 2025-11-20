/**
 * WorkMarketplace Contract Interface
 * 
 * Handles all interactions with the WorkMarketplace escrow contract on Scroll Sepolia.
 * Includes functions for:
 * - Reading job data (multicall for efficiency)
 * - Creating jobs on-chain
 * - Taking jobs (worker accepts)
 * - Submitting work
 * - Approving work (releases payment + mints NFT)
 */

import { publicClient, walletClient, getCurrentAccount, scrollChain } from './scrollClient';
import { workMarketplaceAbi } from '@/abi';
import { WORK_MARKETPLACE_ADDRESS } from './constants';
import { parseUnits, type Log } from 'viem';

/**
 * On-chain job status enum
 * 0 = Created (open or in progress)
 * 1 = Submitted (work submitted, awaiting approval)
 * 2 = Paid (completed, payment released, NFT minted)
 * 3 = Cancelled (job was cancelled)
 */
export type OnChainJobStatus = 0 | 1 | 2 | 3;

/**
 * Basic job information from the blockchain
 * This matches the structure returned by getJobBasicInfo()
 */
export interface OnChainJobBasic {
  id: bigint;
  requester: `0x${string}`;
  worker: `0x${string}`;
  reward: bigint;
  deadline: bigint;
  title: string;
  status: OnChainJobStatus;
}

/**
 * Full job information from the blockchain
 * This matches the structure returned by getJob()
 */
export interface OnChainJobFull {
  jobId: bigint;
  requester: `0x${string}`;
  worker: `0x${string}`;
  reward: bigint;
  deadline: bigint;
  title: string;
  description: string;
  deliveryUrl: string;
  status: OnChainJobStatus;
}

/**
 * Get the next job ID (total count of jobs created)
 * @returns Number of jobs created so far
 */
export async function getJobCount(): Promise<number> {
  const result = await publicClient.readContract({
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'nextJobId',
  });
  return Number(result);
}

/**
 * Get full job details from the blockchain
 * This includes description and delivery URL (submission link)
 * @param jobId The job ID to fetch
 * @returns Full job information
 */
export async function getJobDetails(jobId: number): Promise<OnChainJobFull> {
  const result = await publicClient.readContract({
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'getJob',
    args: [BigInt(jobId)],
  });

  // Handle result as either array or object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobData = Array.isArray(result) ? result : Object.values(result as any);
  const [jobIdBig, requester, worker, reward, deadline, title, description, deliveryUrl, status] = jobData;

  return {
    jobId: jobIdBig as bigint,
    requester: requester as `0x${string}`,
    worker: worker as `0x${string}`,
    reward: reward as bigint,
    deadline: deadline as bigint,
    title: title as string,
    description: description as string,
    deliveryUrl: deliveryUrl as string,
    status: Number(status) as OnChainJobStatus,
  };
}

/**
 * Fetch all jobs from the blockchain using multicall for efficiency
 * This reads all jobs in a single RPC call
 * @returns Array of job basic info
 */
export async function getAllJobsBasic(): Promise<OnChainJobBasic[]> {
  const total = await getJobCount();
  if (total === 0) return [];

  const jobIds = Array.from({ length: total }, (_, i) => BigInt(i));

  const contracts = jobIds.map((id) => ({
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'getJobBasicInfo' as const,
    args: [id] as [bigint],
  }));

  const multicallResult = await publicClient.multicall({ 
    contracts,
    allowFailure: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  return multicallResult
    .map((res, index) => {
      if (res.status !== 'success') return null;

      const result = res.result as readonly [string, string, bigint, bigint, string, bigint];
      const [requester, worker, reward, deadline, title, status] = result;

      return {
        id: jobIds[index],
        requester,
        worker,
        reward,
        deadline,
        title,
        status: Number(status) as OnChainJobStatus,
      };
    })
    .filter(Boolean) as OnChainJobBasic[];
}

/**
 * Create a new job on-chain
 * This will:
 * 1. Transfer WETH from requester to contract (must approve first!)
 * 2. Create job record on-chain
 * 3. Emit JobCreated event
 * 
 * @param params Job creation parameters
 * @returns Transaction hash, jobId (from event), and receipt
 */
export async function createJobOnChain(params: {
  rewardInTokens: bigint;   // Amount in token units (e.g., 1000000000000000000 for 1 WETH with 18 decimals)
  deadline: bigint;          // Unix timestamp
  title: string;
  description: string;
}) {
  if (!walletClient) throw new Error('No wallet client available');

  const currentChainId = await walletClient.getChainId();
  if (currentChainId !== scrollChain.id) {
    await walletClient.switchChain({ id: scrollChain.id });
  }

  const account = await getCurrentAccount();

  const gas = await publicClient.estimateContractGas({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'createJob',
    args: [params.rewardInTokens, params.deadline, params.title, params.description],
  });

  const hash = await walletClient.writeContract({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'createJob',
    args: [params.rewardInTokens, params.deadline, params.title, params.description],
    gas,
    chain: scrollChain,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  let jobId: number | null = null;
  if (receipt.logs && Array.isArray(receipt.logs) && receipt.logs.length > 0) {
    const event = receipt.logs[0] as Log<bigint, number, false>;
    if ('topics' in event && event.topics && Array.isArray(event.topics) && event.topics.length > 1) {
      const topic = event.topics[1];
      if (typeof topic === 'string') {
        jobId = Number(BigInt(topic));
      }
    }
  }

  return { hash, jobId, receipt };
}

/**
 * Take a job (worker accepts the job)
 * This changes the job status and assigns the worker
 * 
 * @param jobId On-chain job ID
 * @returns Transaction hash and receipt
 */
export async function takeJobOnChain(jobId: number) {
  if (!walletClient) throw new Error('No wallet client available');

  const currentChainId = await walletClient.getChainId();
  if (currentChainId !== scrollChain.id) {
    await walletClient.switchChain({ id: scrollChain.id });
  }

  const account = await getCurrentAccount();
  const jobIdBigInt = BigInt(jobId);

  const gas = await publicClient.estimateContractGas({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'takeJob',
    args: [jobIdBigInt],
  });

  const hash = await walletClient.writeContract({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'takeJob',
    args: [jobIdBigInt],
    gas,
    chain: scrollChain,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return { hash, receipt };
}

/**
 * Submit work for a job
 * Worker provides proof of work (link, description)
 * 
 * @param jobId On-chain job ID
 * @param proofLink Link to submitted work (e.g., GitHub, Figma, etc.)
 * @returns Transaction hash and receipt
 */
export async function submitWorkOnChain(jobId: number, proofLink: string) {
  if (!walletClient) throw new Error('No wallet client available');

  const currentChainId = await walletClient.getChainId();
  if (currentChainId !== scrollChain.id) {
    await walletClient.switchChain({ id: scrollChain.id });
  }

  const account = await getCurrentAccount();
  const jobIdBigInt = BigInt(jobId);

  const gas = await publicClient.estimateContractGas({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'submitWork',
    args: [jobIdBigInt, proofLink],
  });

  const hash = await walletClient.writeContract({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'submitWork',
    args: [jobIdBigInt, proofLink],
    gas,
    chain: scrollChain,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return { hash, receipt };
}

/**
 * Approve work and release payment
 * This will:
 * 1. Transfer WETH to worker
 * 2. Mint NFT to worker as proof of completion
 * 3. Mark job as completed
 * 
 * @param jobId On-chain job ID
 * @returns Transaction hash and receipt
 */
export async function approveWorkOnChain(jobId: number) {
  if (!walletClient) throw new Error('No wallet client available');

  const currentChainId = await walletClient.getChainId();
  if (currentChainId !== scrollChain.id) {
    await walletClient.switchChain({ id: scrollChain.id });
  }

  const account = await getCurrentAccount();
  const jobIdBigInt = BigInt(jobId);

  const gas = await publicClient.estimateContractGas({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'approveWork',
    args: [jobIdBigInt],
  });

  const hash = await walletClient.writeContract({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'approveWork',
    args: [jobIdBigInt],
    gas,
    chain: scrollChain,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return { hash, receipt };
}

/**
 * Cancel a job (only requester, only if no worker assigned)
 * This refunds the WETH to the requester
 * 
 * @param jobId On-chain job ID
 * @returns Transaction hash and receipt
 */
export async function cancelJobOnChain(jobId: number) {
  if (!walletClient) throw new Error('No wallet client available');

  const account = await getCurrentAccount();
  const jobIdBigInt = BigInt(jobId);

  const gas = await publicClient.estimateContractGas({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'cancelJob',
    args: [jobIdBigInt],
  });

  const hash = await walletClient.writeContract({
    account,
    address: WORK_MARKETPLACE_ADDRESS,
    abi: workMarketplaceAbi,
    functionName: 'cancelJob',
    args: [jobIdBigInt],
    gas,
    chain: scrollChain,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return { hash, receipt };
}

