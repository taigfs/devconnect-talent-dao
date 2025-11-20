import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppTransaction } from '@/types/Transaction';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { parseEther, formatEther, formatUnits } from 'viem';
import { approveWethForMarketplace, getWethBalance, getWethAllowance } from '@/lib/web3/weth';
import { createJobOnChain, approveWorkOnChain, getAllJobsBasic, OnChainJobBasic, OnChainJobStatus, takeJobOnChain, submitWorkOnChain } from '@/lib/web3/workMarketplace';
import { WORK_MARKETPLACE_ADDRESS, getScrollscanTxUrl } from '@/lib/web3/constants';

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
  wethBalance: bigint;
  transactions: AppTransaction[];
  connectWallet: (role: UserRole, wallet: string) => void;
  completeKYC: (data: Partial<User>) => void;
  addJob: (job: Omit<Job, 'id' | 'status'>) => void;
  createJobWithScroll: (params: {
    title: string;
    description: string;
    reward: string;
    deadline: string;
    category: JobCategory;
    requester: string;
    tags: string[];
  }) => Promise<void>;
  syncJobsFromChain: (force?: boolean) => Promise<void>;
  applyForJob: (jobId: number) => Promise<void>;
  submitWork: (jobId: number, link: string) => Promise<void>;
  approveWork: (jobId: number) => Promise<void>;
  depositWithLemon: (amount: number) => Promise<void>;
  refreshWethBalance: () => Promise<void>;
  logout: () => void;
  showCompletionAnimation: boolean;
  setShowCompletionAnimation: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'talentDAOState';
const STORAGE_VERSION_KEY = 'talentDAOStateVersion';
const CURRENT_VERSION = '2.0'; // Bumped to clear demo data

const getInitialState = () => {
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  
  // Clear old data if version mismatch (migration)
  if (storedVersion !== CURRENT_VERSION) {
    console.log('[Storage] Version mismatch, clearing demo data...');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Always clear jobs from storage - they should come from blockchain
    return {
      ...parsed,
      jobs: []
    };
  }

  // Initialize with empty state - jobs will come from blockchain
  return {
    currentUser: null,
    users: {},
    jobs: [],
    balances: {},
    transactions: []
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(getInitialState);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [wethBalance, setWethBalance] = useState<bigint>(0n);
  const lastSyncTimeRef = React.useRef<number>(0);
  const SYNC_COOLDOWN_MS = 30000; // 30 seconds between syncs

  const user = state.currentUser ? state.users[state.currentUser] : null;
  const jobs = state.jobs;
  const balance = user ? (state.balances[user.wallet] || 0) : 0;
  const transactions = state.transactions || [];

  const refreshWethBalance = useCallback(async () => {
    if (!user?.wallet) return;
    try {
      const balance = await getWethBalance(user.wallet as `0x${string}`);
      setWethBalance(balance);
    } catch (error) {
      setWethBalance(0n);
    }
  }, [user?.wallet]);

  useEffect(() => {
    refreshWethBalance();
  }, [refreshWethBalance]);

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

  const applyForJob = async (jobId: number) => {
    if (!user) {
      throw new Error('No user connected');
    }
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    try {
      // 1. Apply for job on-chain (takeJob transaction)
      toast.info('Taking job on Scroll...', { description: 'Please confirm in MetaMask' });

      const { hash } = await takeJobOnChain(jobId);

      toast.success('Job accepted on blockchain!', {
        description: 'You can now start working on it',
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
            ? { ...j, status: 'IN_PROGRESS' as JobStatus, applicantWallet: user.wallet }
            : j
        )
      }));

      // 3. Register transaction
      addTransaction({
        user: user.wallet,
        type: 'job_application',
        jobId,
        metadata: { title: job.title, onChain: true, txHash: hash }
      });

    } catch (error: unknown) {
      console.error('[Scroll] applyForJob failed', error);
      
      const errorObj = error as { message?: string; code?: number };
      
      // User rejected transaction
      if (errorObj?.message?.includes('User rejected') || errorObj?.code === 4001) {
        toast.error('Transaction cancelled', { description: 'You rejected the transaction' });
      } else {
        toast.error('Failed to apply for job on Scroll', {
          description: errorObj?.message || 'Please try again',
        });
      }
      
      throw error;
    }
  };

  const submitWork = async (jobId: number, link: string) => {
    if (!user) {
      throw new Error('No user connected');
    }
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    try {
      // 1. Submit work on-chain
      toast.info('Submitting work on Scroll...', { description: 'Please confirm in MetaMask' });

      const { hash } = await submitWorkOnChain(jobId, link);

      toast.success('Work submitted on blockchain!', {
        description: 'Awaiting requester approval',
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
            ? { 
                ...j, 
                status: 'SUBMITTED' as JobStatus, 
                submissionLink: link,
                submittedAt: new Date().toISOString()
              }
            : j
        )
      }));

      // 3. Register transaction
      addTransaction({
        user: user.wallet,
        type: 'job_submission',
        jobId,
        metadata: { title: job.title, link, onChain: true, txHash: hash }
      });

    } catch (error: unknown) {
      console.error('[Scroll] submitWork failed', error);
      
      const errorObj = error as { message?: string; code?: number };
      
      // User rejected transaction
      if (errorObj?.message?.includes('User rejected') || errorObj?.code === 4001) {
        toast.error('Transaction cancelled', { description: 'You rejected the transaction' });
      } else {
        toast.error('Failed to submit work on Scroll', {
          description: errorObj?.message || 'Please try again',
        });
      }
      
      throw error;
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
  const syncJobsFromChain = useCallback(async (force = false) => {
    // Rate limiting: prevent syncing too frequently
    const now = Date.now();
    if (!force && now - lastSyncTimeRef.current < SYNC_COOLDOWN_MS) {
      console.log('[Scroll] Skipping sync (cooldown active)');
      return;
    }
    
    lastSyncTimeRef.current = now;
    
    try {
      console.log('[Scroll] Syncing jobs from blockchain...');
      const onChainJobs = await getAllJobsBasic();
      
      console.log('[Scroll] Found', onChainJobs.length, 'on-chain jobs:', onChainJobs);
      
      if (onChainJobs.length === 0) {
        console.log('[Scroll] No on-chain jobs found');
        toast.info('No jobs on blockchain yet', {
          description: 'Post the first job to get started!'
        });
        // Clear any local jobs since we only want blockchain jobs
        setState(prev => ({
          ...prev,
          jobs: []
        }));
        return;
      }

      // Map on-chain jobs to UI format
      const mappedJobs: Job[] = onChainJobs.map((onChainJob) => {
        const reward = parseFloat(formatUnits(onChainJob.reward, 18)); // WETH has 18 decimals
        const deadlineDate = new Date(Number(onChainJob.deadline) * 1000);
        const now = new Date();
        const diffMs = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const deadlineStr = diffDays > 0 ? `${diffDays} days` : 'Expired';

        // Extract category from title using [CATEGORY:XXX] tag
        const categoryMatch = onChainJob.title.match(/\[CATEGORY:(FRONTEND|BACKEND|DESIGN|MARKETING)\]/i);
        const extractedCategory = categoryMatch ? categoryMatch[1].toUpperCase() as JobCategory : 'BACKEND';

        // Clean title (remove category tag if present)
        const cleanTitle = onChainJob.title.replace(/\[CATEGORY:(FRONTEND|BACKEND|DESIGN|MARKETING)\]/gi, '').trim();

        return {
          id: Number(onChainJob.id),
          title: cleanTitle,
          description: 'On-chain job - view details for more info', // Description not stored on-chain for gas optimization
          reward,
          status: mapOnChainStatusToUI(onChainJob.status, onChainJob.worker),
          category: extractedCategory,
          requester: 'On-chain Requester', // Simplified (could map wallet to name)
          requesterWallet: onChainJob.requester,
          deadline: deadlineStr,
          tags: ['On-chain', 'Blockchain'],
          applicantWallet: onChainJob.worker !== '0x0000000000000000000000000000000000000000' 
            ? onChainJob.worker 
            : undefined,
        };
      });

      console.log('[Scroll] Mapped jobs:', mappedJobs);

      // Replace all jobs with on-chain jobs (no local jobs)
      setState(prev => ({
        ...prev,
        jobs: mappedJobs,
      }));

      toast.success(`Loaded ${onChainJobs.length} job(s) from blockchain!`);
      
    } catch (error) {
      console.error('[Scroll] Failed to sync jobs from chain:', error);
      toast.error('Failed to sync jobs from blockchain', {
        description: 'Showing local jobs only'
      });
      // Silently fail - keep local jobs if sync fails
    }
  }, []);

  const createJobWithScroll = async (params: {
    title: string;
    description: string;
    reward: string; // human-readable WETH
    deadline: string;
    category: JobCategory;
    requester: string;
    tags: string[];
  }) => {
    if (!user) throw new Error('No user connected');

    try {
      const rewardInWei = parseEther(params.reward);
      const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

      // Verify WETH balance
      const balance = await getWethBalance(user.wallet as `0x${string}`);
      
      if (balance < rewardInWei) {
        const errorMsg = `Saldo de WETH insuficiente! Você tem ${formatEther(balance)} WETH, mas precisa de ${params.reward} WETH`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Approve WETH (10x to avoid precision issues)
      const approveAmount = rewardInWei * 10n;
      toast.info('Aprovando WETH...', { description: 'Please confirm in MetaMask' });
      
      const approveResult = await approveWethForMarketplace(approveAmount);

      toast.success('WETH Approved!', {
        description: `Tx: ${approveResult.hash.slice(0, 10)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(getScrollscanTxUrl(approveResult.hash), '_blank'),
        },
      });

      // Verify allowance
      const allowance = await getWethAllowance(
        user.wallet as `0x${string}`,
        WORK_MARKETPLACE_ADDRESS
      );
      
      if (allowance < rewardInWei) {
        toast.error('Erro no approve. Tente novamente.');
        throw new Error('Insufficient allowance');
      }

      // 4. Create job on-chain
      toast.info('Creating job on Scroll...', { description: 'Please confirm in MetaMask' });

      // Include category as a tag in the title for on-chain storage
      const titleWithCategory = `${params.title} [CATEGORY:${params.category}]`;
      
      const createResult = await createJobOnChain({
        rewardInTokens: rewardInWei,
        deadline: deadlineTimestamp,
        title: titleWithCategory,
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
        reward: Number(params.reward),
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
      }));

      // 6. Register transaction
      addTransaction({
        user: user.wallet,
        type: 'job_creation',
        amount: Number(params.reward),
        jobId: newJob.id,
        metadata: { title: params.title, onChain: true, txHash: createResult.hash },
      });

      // 7. Refresh WETH balance
      await refreshWethBalance();

    } catch (error: unknown) {
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

    // Mock deposit implementation

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
  //   }
  // }, [user]);

  return (
    <AppContext.Provider value={{
      user,
      jobs,
      balance,
      wethBalance,
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
      refreshWethBalance,
      logout,
      showCompletionAnimation,
      setShowCompletionAnimation
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
