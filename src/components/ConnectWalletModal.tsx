import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2 } from 'lucide-react';
import { useState } from 'react';
import { UserRole } from '@/contexts/AppContext';

interface ConnectWalletModalProps {
  open: boolean;
  onConnect: (role: UserRole) => void;
}

const ConnectWalletModal = ({ open, onConnect }: ConnectWalletModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = (role: UserRole, wallet: 'metamask' | 'rabby') => {
    setSelectedRole(role);
    setConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      onConnect(role);
      setConnecting(false);
    }, 1500);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-4xl bg-card border-primary/20 glow-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Select Your Role
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Worker Card */}
          <div className="border border-border bg-muted/20 rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Work as Talent</h3>
              <p className="text-sm text-muted-foreground">
                Find verified gigs, submit work, earn crypto
              </p>
              <div className="space-y-2 w-full pt-4">
                <Button
                  onClick={() => handleConnect('worker', 'metamask')}
                  disabled={connecting}
                  className="w-full bg-primary hover:bg-secondary text-primary-foreground"
                >
                  {connecting && selectedRole === 'worker' ? 'Connecting...' : 'Connect with MetaMask'}
                </Button>
                <Button
                  onClick={() => handleConnect('worker', 'rabby')}
                  disabled={connecting}
                  variant="outline"
                  className="w-full border-primary/50 hover:bg-primary/10"
                >
                  Connect with Rabby
                </Button>
              </div>
            </div>
          </div>

          {/* Requester Card */}
          <div className="border border-border bg-muted/20 rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Hire Talent</h3>
              <p className="text-sm text-muted-foreground">
                Post jobs, review work, pay with escrow
              </p>
              <div className="space-y-2 w-full pt-4">
                <Button
                  onClick={() => handleConnect('requester', 'metamask')}
                  disabled={connecting}
                  className="w-full bg-primary hover:bg-secondary text-primary-foreground"
                >
                  {connecting && selectedRole === 'requester' ? 'Connecting...' : 'Connect with MetaMask'}
                </Button>
                <Button
                  onClick={() => handleConnect('requester', 'rabby')}
                  disabled={connecting}
                  variant="outline"
                  className="w-full border-primary/50 hover:bg-primary/10"
                >
                  Connect with Rabby
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
