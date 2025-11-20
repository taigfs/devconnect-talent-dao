import { useState, useEffect } from 'react';
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

type ViewType = 'worker_main' | 'requester_main';

const AppContent = () => {
  const { user, connectWallet, completeKYC, showCompletionAnimation, setShowCompletionAnimation, jobs } = useApp();
  const [currentView, setCurrentView] = useState<ViewType>('worker_main');
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

  const handleConnect = () => {
    setShowConnectModal(true);
  };

  const handleWalletConnected = (walletAddress: string) => {
    connectWallet('worker', walletAddress);
    completeKYC({});
    setShowConnectModal(false);
    setCurrentView('worker_main');
  };

  const handleSwitchToRequester = () => {
    if (user) {
      connectWallet('requester', user.wallet);
      setCurrentView('requester_main');
    }
  };

  // Sincronizar view com role - apenas quando role mudar, não quando view mudar
  useEffect(() => {
    if (user) {
      if (user.role === 'worker' && currentView !== 'worker_main') {
        setCurrentView('worker_main');
      } else if (user.role === 'requester' && currentView !== 'requester_main') {
        setCurrentView('requester_main');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

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
  
    connectWallet(targetRole, targetWallet);
  };

  return (
    <>
      <Navbar />
      
      {currentView === 'worker_main' ? (
        <JobBoard onSwitchToRequester={handleSwitchToRequester} />
      ) : (
        <RequesterDashboard />
      )}
      
      {showCompletionAnimation && completedJob && (
        <CompletionAnimation
          reward={completedJob.reward}
          onComplete={() => setShowCompletionAnimation(false)}
        />
      )}

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
