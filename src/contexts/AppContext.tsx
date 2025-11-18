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

const STORAGE_KEY = 'talentdao_data';

const mockJobs: Job[] = [
  {
    id: 1,
    title: "Smart Contract Audit Review",
    description: "Review and audit our DeFi smart contracts for security vulnerabilities. Requires Solidity expertise and security best practices knowledge.",
    reward: 800,
    status: "OPEN",
    category: "BACKEND",
    requester: "DeFi Protocol Inc",
    deadline: "3 days",
    tags: ["Solidity", "Security"]
  },
  {
    id: 2,
    title: "Landing Page Redesign",
    description: "Design a modern, Web3-themed landing page for our crypto startup. Should include hero section, features, and call-to-action.",
    reward: 500,
    status: "OPEN",
    category: "DESIGN",
    requester: "CryptoStartup",
    deadline: "5 days",
    tags: ["Figma", "Web3"]
  },
  {
    id: 3,
    title: "React Component Library",
    description: "Build a comprehensive React component library with TypeScript. Must include documentation and Storybook integration.",
    reward: 1200,
    status: "OPEN",
    category: "FRONTEND",
    requester: "TechDAO",
    deadline: "1 week",
    tags: ["React", "TypeScript"]
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
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setUser(data.user);
      setJobs(data.jobs || mockJobs);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, jobs }));
    }
  }, [user, jobs]);

  const connectWallet = (role: UserRole, wallet: string) => {
    setUser({
      wallet,
      role,
      kycCompleted: false
    });
  };

  const completeKYC = (data: any) => {
    if (user) {
      setUser({
        ...user,
        ...data,
        kycCompleted: true
      });
    }
  };

  const addJob = (job: Omit<Job, 'id' | 'status'>) => {
    const newJob: Job = {
      ...job,
      id: Date.now(),
      status: 'OPEN',
      requesterWallet: user?.wallet
    };
    setJobs([newJob, ...jobs]);
  };

  const applyForJob = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, status: 'IN_PROGRESS', applicantWallet: user?.wallet }
        : job
    ));
  };

  const submitWork = (jobId: number, link: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, status: 'SUBMITTED', submissionLink: link }
        : job
    ));
  };

  const approveWork = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, status: 'COMPLETED' }
        : job
    ));
    setShowCompletionAnimation(true);
  };

  const disconnect = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppContext.Provider value={{
      user,
      jobs,
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
