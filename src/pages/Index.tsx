import { useState } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import LandingPage from '@/components/LandingPage';
import ConnectWalletModal from '@/components/ConnectWalletModal';
import KYCModal from '@/components/KYCModal';
import JobBoard from '@/components/worker/JobBoard';
import RequesterDashboard from '@/components/requester/RequesterDashboard';
import CompletionAnimation from '@/components/CompletionAnimation';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';

const AppContent = () => {
  const { user, connectWallet, completeKYC, showCompletionAnimation, setShowCompletionAnimation, jobs } = useApp();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [currentView, setCurrentView] = useState<'board' | 'dashboard'>('board');

  const handleConnect = () => {
    setShowConnectModal(true);
  };

  const handleWalletConnected = (role: 'worker' | 'requester') => {
    const mockWallet = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    connectWallet(role, mockWallet);
    setShowConnectModal(false);
    setShowKYCModal(true);
  };

  const handleKYCComplete = (data: any) => {
    completeKYC(data);
    setShowKYCModal(false);
  };

  const completedJob = jobs.find(j => j.status === 'COMPLETED');

  if (!user) {
    return (
      <>
        <LandingPage onConnect={handleConnect} />
        <ConnectWalletModal
          open={showConnectModal}
          onConnect={handleWalletConnected}
        />
      </>
    );
  }

  if (!user.kycCompleted) {
    return (
      <KYCModal
        open={showKYCModal}
        role={user.role}
        onComplete={handleKYCComplete}
      />
    );
  }

  return (
    <>
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      {user.role === 'worker' && <JobBoard />}
      {user.role === 'requester' && <RequesterDashboard />}
      
      {showCompletionAnimation && completedJob && (
        <CompletionAnimation
          reward={completedJob.reward}
          onComplete={() => setShowCompletionAnimation(false)}
        />
      )}
    </>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
      <Toaster 
        theme="dark" 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </AppProvider>
  );
};

export default Index;
