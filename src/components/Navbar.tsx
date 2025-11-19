import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useAppWallet } from '@/hooks/useAppWallet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, DollarSign, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NavbarProps {
  currentView: 'board' | 'dashboard';
  onViewChange: (view: 'board' | 'dashboard') => void;
}

const Navbar = ({ currentView, onViewChange }: NavbarProps) => {
  const { user, logout, balance } = useApp();
  const { disconnect } = useAppWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!user?.wallet) return;
    
    try {
      await navigator.clipboard.writeText(user.wallet);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleLogout = () => {
    disconnect();
    logout();
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/Logo.png" 
              alt="TalentDAO Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold">TalentDAO</span>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'requester' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded border border-primary/30">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">
                  {balance.toLocaleString()} USDC
                </span>
              </div>
            )}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted hover:bg-muted/80 border border-border cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-mono text-primary">
                      {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                    <p className="text-sm font-mono break-all">{user.wallet}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleCopyAddress}
                    className="cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Address
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
