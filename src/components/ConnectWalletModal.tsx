import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserRole } from '@/contexts/AppContext';
import { useAppWallet } from '@/hooks/useAppWallet';

interface ConnectWalletModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConnect: (role: UserRole, walletAddress: string) => void;
}

const ConnectWalletModal = ({ open, onOpenChange, onConnect }: ConnectWalletModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const { connect, isConnecting, error, isWebView } = useAppWallet();

  // Reseta o selectedRole quando o modal abrir
  useEffect(() => {
    if (open) {
      setSelectedRole(null);
    }
  }, [open]);

  const handleConnect = async (role: UserRole) => {
    setSelectedRole(role);
    
    try {
      const walletAddress = await connect();
      if (walletAddress) {
        onConnect(role, walletAddress);
      }
    } catch (err) {
      const error = err as { code?: number; message?: string };
      // Ignora erro se usuário cancelou a conexão
      if (error?.code !== 4001) {
        console.error('Erro na conexão:', err);
      }
    }
  };

  const walletLabel = isWebView ? 'Lemon Wallet' : 'MetaMask (Dev)';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-card border-primary/20 glow-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">
            Select Your Role
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose how you want to participate in the TalentDAO marketplace
          </DialogDescription>
        </DialogHeader>
        {!isWebView && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Modo desenvolvimento: usando MetaMask. No app Lemon, a Lemon Wallet será usada automaticamente.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
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
                  onClick={() => handleConnect('worker')}
                  disabled={isConnecting}
                  className="w-full bg-primary hover:bg-secondary text-primary-foreground"
                >
                  {isConnecting && selectedRole === 'worker' ? 'Connecting...' : `Connect with ${walletLabel}`}
                </Button>
              </div>
            </div>
          </div>
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
                  onClick={() => handleConnect('requester')}
                  disabled={isConnecting}
                  className="w-full bg-primary hover:bg-secondary text-primary-foreground"
                >
                  {isConnecting && selectedRole === 'requester' ? 'Connecting...' : `Connect with ${walletLabel}`}
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
