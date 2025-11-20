import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTransaction } from '@/types/Transaction';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { approveWethForMarketplace } from '@/lib/web3/weth';
import { createJobOnChain, approveWorkOnChain, getAllJobsBasic, OnChainJobBasic, OnChainJobStatus } from '@/lib/web3/workMarketplace';
import { WORK_MARKETPLACE_ADDRESS, getScrollscanTxUrl } from '@/lib/web3/constants';
import { formatUnits } from 'viem';

export type UserRole = 'worker' | 'requester' | null;
export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';
export type JobCategory = 'FRONTEND' | 'BACKEND' | 'DESIGN' | 'MARKETING';

export interface Job {
  id: number;
  title: string;
  description: string;
  reward: number;
  status: JobStatus;
  category: JobCategory;
  requester: string;
  requesterWallet?: string;
  deadline: string;
  tags: string[];
  applicantWallet?: string;
  submissionLink?: string;
  submittedAt?: string;
}

export interface User {
  wallet: string;
  role: UserRole;
  email?: string;
  name?: string;
  company?: string;
  website?: string;
  skills?: string[];
  kycCompleted: boolean;
}

interface AppContextType {
  user: User | null;
  jobs: Job[];
  balance: number;
  transactions: AppTransaction[];
  connectWallet: (role: UserRole, wallet: string) => void;
  completeKYC: (data: Partial<User>) => void;
  addJob: (job: Omit<Job, 'id' | 'status'>) => void;
  createJobWithScroll: (params: {
    title: string;
    description: string;
    reward: number;
    deadline: string;
    category: JobCategory;
    requester: string;
    tags: string[];
  }) => Promise<void>;
  syncJobsFromChain: () => Promise<void>;
  applyForJob: (jobId: number) => void;
  submitWork: (jobId: number, link: string) => void;
  approveWork: (jobId: number) => Promise<void>;
  depositWithLemon: (amount: number) => Promise<void>;
  logout: () => void;
  showCompletionAnimation: boolean;
  setShowCompletionAnimation: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'talentDAOState';

// Demo accounts
const DEMO_WORKER_WALLET = '0xAAA...111';
const DEMO_REQUESTER_WALLET = '0xBBB...222';

const getInitialState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with demo data
  return {
    currentUser: null,
    users: {
      [DEMO_WORKER_WALLET]: {
        wallet: DEMO_WORKER_WALLET,
        role: 'worker' as UserRole,
        kycCompleted: true,
        name: 'Bob the Developer',
        email: 'bob@developer.com',
        skills: ['Frontend', 'Backend'],
        balance: 1234
      },
      [DEMO_REQUESTER_WALLET]: {
        wallet: DEMO_REQUESTER_WALLET,
        role: 'requester' as UserRole,
        kycCompleted: true,
        company: 'TechCorp Inc.',
        email: 'hiring@techcorp.com',
        website: 'https://techcorp.com',
        balance: 10000
      }
    },
    jobs: [
      {
        id: 1,
        title: "Smart Contract Audit Review",
        description: "Review and audit our DeFi smart contracts for security vulnerabilities. Requires Solidity expertise and security best practices knowledge.",
        reward: 800,
        status: "OPEN",
        category: "BACKEND",
        requester: "DeFi Protocol Inc",
        requesterWallet: DEMO_REQUESTER_WALLET,
        deadline: "3 days",
        tags: ["Solidity", "Security"]
      },
      {
        id: 2,
        title: "Landing Page Redesign",
        description: "Design a modern, Web3-themed landing page for our crypto startup. Should include hero section, features, and call-to-action.",
        reward: 500,
        status: "SUBMITTED",
        category: "DESIGN",
        requester: "TechCorp Inc.",
        requesterWallet: DEMO_REQUESTER_WALLET,
        deadline: "5 days",
        tags: ["Figma", "Web3"],
        applicantWallet: DEMO_WORKER_WALLET,
        submissionLink: "https://figma.com/demo/landing-page-redesign",
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 3,
        title: "React Component Library",
        description: "Build a comprehensive React component library with TypeScript. Must include documentation and Storybook integration.",
        reward: 1200,
        status: "IN_PROGRESS",
        category: "FRONTEND",
        requester: "TechCorp Inc.",
        requesterWallet: DEMO_REQUESTER_WALLET,
        deadline: "1 week",
        tags: ["React", "TypeScript"],
        applicantWallet: DEMO_WORKER_WALLET
      },
      {
        id: 4,
        title: "Marketing Campaign Strategy",
        description: "Create a comprehensive marketing strategy for our NFT launch. Include social media plan, influencer outreach, and content calendar.",
        reward: 600,
        status: "OPEN",
        category: "MARKETING",
        requester: "NFT Collective",
        deadline: "4 days",
        tags: ["Marketing", "NFT", "Social"]
      }
    ],
    balances: {
      [DEMO_WORKER_WALLET]: 1234,
      [DEMO_REQUESTER_WALLET]: 7700 // 10000 - 800 - 500 - 1200 + 200 (reserved for open job)
    },
    transactions: []
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(getInitialState);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  const user = state.currentUser ? state.users[state.currentUser] : null;
  const jobs = state.jobs;
  const balance = user ? (state.balances[user.wallet] || 0) : 0;
  const transactions = state.transactions || [];

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const connectWallet = (role: UserRole, wallet: string) => {
    setState(prev => {
      const existingUser = prev.users[wallet];
      const existingBalance = prev.balances[wallet];
      
      // CORREÇÃO: Só definir saldo inicial se a wallet ainda não tem saldo registrado
      // Se já existe saldo (de depósitos anteriores), mantém ele
      const initialBalance = existingBalance !== undefined 
        ? existingBalance  // Mantém saldo existente
        : (role === 'requester' ? 10000 : 0);  // Saldo inicial apenas para wallets novas
      
      return {
        ...prev,
        currentUser: wallet,
        users: {
          ...prev.users,
          [wallet]: {
            ...(prev.users[wallet] || {}),
            wallet,
            role,
            kycCompleted: true
          }
        },
        balances: {
          ...prev.balances,
          [wallet]: initialBalance
        }
      };
    });
  };

  const completeKYC = (data: Partial<User>) => {
    if (!state.currentUser) return;
    
    setState(prev => ({
      ...prev,
      users: {
        ...prev.users,
        [state.currentUser!]: {
          ...prev.users[state.currentUser!],
          ...data,
          kycCompleted: true
        }
      }
    }));
  };

  const addTransaction = (tx: Omit<AppTransaction, 'id' | 'timestamp'>) => {
    const transaction: AppTransaction = {
      ...tx,
      id: uuidv4(),
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      transactions: [transaction, ...(prev.transactions || [])]
    }));

    console.log('[TRANSACTION REGISTERED]', transaction);
  };

  const addJob = (job: Omit<Job, 'id' | 'status'>) => {
    if (!user) return;
    
    const newJob: Job = {
      ...job,
      id: Date.now(),
      status: 'OPEN',
      requesterWallet: user.wallet
    };

    setState(prev => ({
      ...prev,
      jobs: [newJob, ...prev.jobs],
      balances: {
        ...prev.balances,
        [user.wallet]: prev.balances[user.wallet] - job.reward
      }
    }));

    // Registrar transação
    addTransaction({
      user: user.wallet,
      type: 'job_creation',
      amount: job.reward,
      jobId: newJob.id,
      metadata: { title: job.title }
    });
  };

  const applyForJob = (jobId: number) => {
    if (!user) return;
    
    const job = jobs.find(j => j.id === jobId);
    
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'IN_PROGRESS' as JobStatus, applicantWallet: user.wallet }
          : job
      )
    }));

    // Registrar transação
    if (job) {
      addTransaction({
        user: user.wallet,
        type: 'job_application',
        jobId,
        metadata: { title: job.title }
      });
    }
  };

  const submitWork = (jobId: number, link: string) => {
    if (!user) return;
    
    const job = jobs.find(j => j.id === jobId);
    
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: 'SUBMITTED' as JobStatus, 
              submissionLink: link,
              submittedAt: new Date().toISOString()
            }
          : job
      )
    }));

    // Registrar transação
    if (job) {
      addTransaction({
        user: user.wallet,
        type: 'job_submission',
        jobId,
        metadata: { title: job.title, link }
      });
    }
  };

  /**
   * Map on-chain job status to UI job status
   */
  const mapOnChainStatusToUI = (
    onChainStatus: OnChainJobStatus,
    worker: string
  ): JobStatus => {
    // 0 = Created
    if (onChainStatus === 0) {
      // If no worker, it's OPEN. If worker exists, it's IN_PROGRESS
      return worker === '0x0000000000000000000000000000000000000000' ? 'OPEN' : 'IN_PROGRESS';
    }
    // 1 = Submitted
    if (onChainStatus === 1) return 'SUBMITTED';
    // 2 = Paid (completed)
    if (onChainStatus === 2) return 'COMPLETED';
    // 3 = Cancelled - treat as OPEN for UI purposes (or could be hidden)
    return 'OPEN';
  };

  /**
   * Sync jobs from Scroll blockchain
   * Fetches all on-chain jobs and merges with local state
   */
  const syncJobsFromChain = async () => {
    try {
      const onChainJobs = await getAllJobsBasic();
      
      if (onChainJobs.length === 0) {
        console.log('[Scroll] No on-chain jobs found');
        return;
      }

      // Map on-chain jobs to UI format
      const mappedJobs: Job[] = onChainJobs.map((onChainJob) => {
        const reward = parseFloat(formatUnits(onChainJob.reward, 6)); // Assuming 6 decimals
        const deadlineDate = new Date(Number(onChainJob.deadline) * 1000);
        const deadlineStr = deadlineDate.toLocaleDateString();

        return {
          id: Number(onChainJob.id),
          title: onChainJob.title,
          description: 'On-chain job - view details on Scroll', // Description not stored on-chain for gas optimization
          reward,
          status: mapOnChainStatusToUI(onChainJob.status, onChainJob.worker),
          category: 'BACKEND' as JobCategory, // Default category (not stored on-chain)
          requester: 'On-chain Requester', // Simplified (could map wallet to name)
          requesterWallet: onChainJob.requester,
          deadline: deadlineStr,
          tags: ['On-chain'],
          applicantWallet: onChainJob.worker !== '0x0000000000000000000000000000000000000000' 
            ? onChainJob.worker 
            : undefined,
        };
      });

      // Merge with existing jobs (prefer on-chain data)
      setState(prev => {
        const localJobs = prev.jobs.filter(
          job => !mappedJobs.find(onChainJob => onChainJob.id === job.id)
        );
        
        return {
          ...prev,
          jobs: [...mappedJobs, ...localJobs],
        };
      });

      console.log(`[Scroll] Synced ${mappedJobs.length} jobs from chain`);
      
    } catch (error) {
      console.error('[Scroll] Failed to sync jobs:', error);
      // Don't throw - keep local jobs if sync fails
    }
  };

  const createJobWithScroll = async (params: {
    title: string;
    description: string;
    reward: number;
    deadline: string;
    category: JobCategory;
    requester: string;
    tags: string[];
  }) => {
    if (!user) throw new Error('No user connected');

    try {
      // 1. Convert reward to token units (assuming 6 decimals for USDC/WETH)
      const rewardInTokens = parseUnits(params.reward.toString(), 6);

      // 2. Convert deadline string to timestamp (simplified: add 7 days from now)
      // TODO: Parse deadline string properly (e.g., "3 days", "1 week")
      const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

      // 3. Approve WETH -> Marketplace
      toast.info('Approving WETH...', { description: 'Please confirm in MetaMask' });
      
      const approveResult = await approveWethForMarketplace({
        spender: WORK_MARKETPLACE_ADDRESS,
        amount: rewardInTokens,
      });

      toast.success('WETH Approved!', {
        description: `Tx: ${approveResult.hash.slice(0, 10)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(getScrollscanTxUrl(approveResult.hash), '_blank'),
        },
      });

      // 4. Create job on-chain
      toast.info('Creating job on Scroll...', { description: 'Please confirm in MetaMask' });

      const createResult = await createJobOnChain({
        rewardInTokens,
        deadline: deadlineTimestamp,
        title: params.title,
        description: params.description,
      });

      toast.success('Job created on Scroll!', {
        description: `Job ID: ${createResult.jobId}`,
        action: {
          label: 'View on ScrollScan',
          onClick: () => window.open(getScrollscanTxUrl(createResult.hash), '_blank'),
        },
      });

      // 5. Add job to local state (for UI consistency)
      const newJob: Job = {
        id: createResult.jobId || Date.now(),
        title: params.title,
        description: params.description,
        reward: params.reward,
        status: 'OPEN',
        category: params.category,
        requester: params.requester,
        requesterWallet: user.wallet,
        deadline: params.deadline,
        tags: params.tags,
      };

      setState(prev => ({
        ...prev,
        jobs: [newJob, ...prev.jobs],
        balances: {
          ...prev.balances,
          [user.wallet]: prev.balances[user.wallet] - params.reward,
        },
      }));

      // 6. Register transaction
      addTransaction({
        user: user.wallet,
        type: 'job_creation',
        amount: params.reward,
        jobId: newJob.id,
        metadata: { title: params.title, onChain: true, txHash: createResult.hash },
      });

    } catch (error: unknown) {
      console.error('[Scroll] createJob failed', error);
      
      const errorObj = error as { message?: string; code?: number };
      
      // User rejected transaction
      if (errorObj?.message?.includes('User rejected') || errorObj?.code === 4001) {
        toast.error('Transaction cancelled', { description: 'You rejected the transaction' });
      } else {
        toast.error('Failed to create job on Scroll', {
          description: errorObj?.message || 'Please try again',
        });
      }
      
      throw error;
    }
  };

  const approveWork = async (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !job.applicantWallet || !user) return;

    const paymentAmount = job.reward * 0.8;

    try {
      // 1. Approve work on-chain (releases WETH payment + mints NFT)
      toast.info('Approving work on Scroll...', { description: 'Please confirm in MetaMask' });

      const { hash } = await approveWorkOnChain(jobId);

      toast.success('Work approved on Scroll!', {
        description: 'Payment released + NFT minted',
        action: {
          label: 'View on ScrollScan',
          onClick: () => window.open(getScrollscanTxUrl(hash), '_blank'),
        },
      });

      // 2. Update local state (after on-chain success)
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => 
          j.id === jobId 
            ? { ...j, status: 'COMPLETED' as JobStatus }
            : j
        ),
        balances: {
          ...prev.balances,
          [job.applicantWallet]: (prev.balances[job.applicantWallet] || 0) + paymentAmount
        }
      }));
      
      // 3. Register transactions
      addTransaction({
        user: user.wallet,
        type: 'job_approval',
        jobId,
        metadata: { title: job.title, worker: job.applicantWallet, onChain: true, txHash: hash }
      });

      addTransaction({
        user: job.applicantWallet,
        type: 'payment_release',
        amount: paymentAmount,
        jobId,
        metadata: { title: job.title, reward: job.reward, onChain: true, txHash: hash }
      });
      
      setShowCompletionAnimation(true);

    } catch (error: unknown) {
      console.error('[Scroll] approveWork failed', error);
      
      const errorObj = error as { message?: string; code?: number };
      
      // User rejected transaction
      if (errorObj?.message?.includes('User rejected') || errorObj?.code === 4001) {
        toast.error('Transaction cancelled', { description: 'You rejected the transaction' });
      } else {
        toast.error('Failed to approve work on Scroll', {
          description: errorObj?.message || 'Please try again',
        });
      }
      
      throw error;
    }
  };

  const depositWithLemon = async (amount: number) => {
    if (!user) {
      throw new Error('No user connected');
    }

    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    // MOCK: simula delay da transação
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('[MOCK] DepositWithLemon', { 
      wallet: user.wallet, 
      amount,
      timestamp: new Date().toISOString()
    });

    // FUTURO: substituir por chamada real ao Lemon SDK
    // const result = await depositReal(amount);
    // if (!result.success) throw new Error('Deposit failed');

    setState(prev => ({
      ...prev,
      balances: {
        ...prev.balances,
        [user.wallet]: (prev.balances[user.wallet] || 0) + amount
      }
    }));

    // Registrar transação
    addTransaction({
      user: user.wallet,
      type: 'deposit',
      amount
    });
  };

  const logout = () => {
    setState(prev => ({
      ...prev,
      currentUser: null
    }));
  };

  // Optional: Sync jobs from chain when user connects
  // useEffect(() => {
  //   if (user) {
  //     syncJobsFromChain().catch(console.error);
  //   }
  // }, [user]);

  return (
    <AppContext.Provider value={{
      user,
      jobs,
      balance,
      transactions,
      connectWallet,
      completeKYC,
      addJob,
      createJobWithScroll,
      syncJobsFromChain,
      applyForJob,
      submitWork,
      approveWork,
      depositWithLemon,
      logout,
      showCompletionAnimation,
      setShowCompletionAnimation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
