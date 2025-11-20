import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle } from 'lucide-react';
import { useAppWallet } from '@/hooks/useAppWallet';

interface ConnectWalletModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConnect: (walletAddress: string) => void;
}

const ConnectWalletModal = ({ open, onOpenChange, onConnect }: ConnectWalletModalProps) => {
  const { connect, isConnecting, error, isWebView } = useAppWallet();

  const handleConnect = async () => {
    try {
      const walletAddress = await connect();
      if (walletAddress) {
        onConnect(walletAddress);
      }
    } catch (err) {
      const error = err as { code?: number; message?: string };
      if (error?.code !== 4001) {
        console.error('Erro na conexão:', err);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isConnecting) {
      onOpenChange?.(newOpen);
    }
  };

  const walletLabel = isWebView ? 'Lemon Wallet' : 'MetaMask (Dev)';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 glow-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Connect your wallet to start using TalentDAO
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

        <div className="border border-border bg-muted/20 rounded-lg p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="lg"
              className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold"
            >
              {isConnecting ? 'Connecting...' : `Connect with ${walletLabel}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
