import { useState } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
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
  const [currentView, setCurrentView] = useState<'board' | 'dashboard'>('board');
  const [showConnectModal, setShowConnectModal] = useState(true);
  
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

  const handleConnect = () => {
    setShowConnectModal(true);
  };

  const handleWalletConnected = (role: 'worker' | 'requester', walletAddress: string) => {
    connectWallet(role, walletAddress);
    completeKYC({});
    setShowConnectModal(false);
  };

  const completedJob = jobs.find(j => j.status === 'COMPLETED');

  if (!user) {
    return (
      <>
        <LandingPage onConnect={handleConnect} />
        <ConnectWalletModal
          open={showConnectModal}
          onOpenChange={setShowConnectModal}
          onConnect={handleWalletConnected}
        />
      </>
    );
  }

  const handleDemoSwitch = () => {
    const DEMO_WORKER = '0xAAA...111';
    const DEMO_REQUESTER = '0xBBB...222';
    const targetWallet = user?.role === 'worker' ? DEMO_REQUESTER : DEMO_WORKER;
    const targetRole = user?.role === 'worker' ? 'requester' : 'worker';
    
    // Switch to the other demo account
    connectWallet(targetRole, targetWallet);
  };

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

      {/* Demo mode switcher */}
      {isDemoMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleDemoSwitch}
            variant="outline"
            size="sm"
            className="bg-card border-primary/30 text-xs"
          >
            Switch to {user?.role === 'worker' ? 'Requester' : 'Worker'}
          </Button>
        </div>
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
