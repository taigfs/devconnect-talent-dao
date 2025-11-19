import React, { createContext, useContext, useState, useEffect } from 'react';

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
  connectWallet: (role: UserRole, wallet: string) => void;
  completeKYC: (data: any) => void;
  addJob: (job: Omit<Job, 'id' | 'status'>) => void;
  applyForJob: (jobId: number) => void;
  submitWork: (jobId: number, link: string) => void;
  approveWork: (jobId: number) => void;
  disconnect: () => void;
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
    }
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(getInitialState);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  const user = state.currentUser ? state.users[state.currentUser] : null;
  const jobs = state.jobs;
  const balance = user ? (state.balances[user.wallet] || 0) : 0;

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
    setState(prev => ({
      ...prev,
      currentUser: wallet,
      users: {
        ...prev.users,
        [wallet]: {
          wallet,
          role,
          kycCompleted: false,
          ...(prev.users[wallet] || {})
        }
      },
      balances: {
        ...prev.balances,
        [wallet]: prev.balances[wallet] || (role === 'requester' ? 10000 : 0)
      }
    }));
  };

  const completeKYC = (data: any) => {
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
  };

  const applyForJob = (jobId: number) => {
    if (!user) return;
    
    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'IN_PROGRESS' as JobStatus, applicantWallet: user.wallet }
          : job
      )
    }));
  };

  const submitWork = (jobId: number, link: string) => {
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
  };

  const approveWork = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !job.applicantWallet) return;

    setState(prev => ({
      ...prev,
      jobs: prev.jobs.map(j => 
        j.id === jobId 
          ? { ...j, status: 'COMPLETED' as JobStatus }
          : j
      ),
      balances: {
        ...prev.balances,
        [job.applicantWallet]: (prev.balances[job.applicantWallet] || 0) + (job.reward * 0.8)
      }
    }));
    
    setShowCompletionAnimation(true);
  };

  const disconnect = () => {
    setState(prev => ({
      ...prev,
      currentUser: null
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      jobs,
      balance,
      connectWallet,
      completeKYC,
      addJob,
      applyForJob,
      submitWork,
      approveWork,
      disconnect,
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
