import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Sparkles, LogOut, DollarSign } from 'lucide-react';

interface NavbarProps {
  currentView: 'board' | 'dashboard';
  onViewChange: (view: 'board' | 'dashboard') => void;
}

const Navbar = ({ currentView, onViewChange }: NavbarProps) => {
  const { user, disconnect, balance } = useApp();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 border-2 border-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">TalentDAO</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {user?.role === 'worker' && (
              <Button
                variant={currentView === 'board' ? 'default' : 'ghost'}
                onClick={() => onViewChange('board')}
                className={currentView === 'board' ? 'bg-primary text-primary-foreground' : ''}
              >
                Job Board
              </Button>
            )}
            {user?.role === 'requester' && (
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onViewChange('dashboard')}
                className={currentView === 'dashboard' ? 'bg-primary text-primary-foreground' : ''}
              >
                My Jobs
              </Button>
            )}
            
            {/* Balance for requesters */}
            {user?.role === 'requester' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded border border-primary/30">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">
                  {balance.toLocaleString()} USDC
                </span>
              </div>
            )}

            {/* Wallet info */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded border border-border">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-mono text-primary">
                {user?.wallet?.slice(0, 6)}...{user?.wallet?.slice(-4)}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="text-muted-foreground hover:text-destructive hover:border-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
