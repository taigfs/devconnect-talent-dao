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

  const walletLabel = isWebView ? 'Lemon Wallet' : 'MetaMask';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 glow-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Connect your wallet to start using MintWork
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="border border-border bg-muted/20 rounded-lg p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="lg"
              className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold flex items-center justify-center gap-2"
            >
              <svg width="24" height="24" viewBox="0 0 212 189" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M199.415 0L116.317 60.5425L131.751 23.8395L199.415 0Z" fill="#E17726"/>
                <path d="M12.5432 0L95.0303 61.0897L80.2084 23.8395L12.5432 0Z" fill="#E27625"/>
                <path d="M170.025 136.644L148.525 167.733L194.665 180.406L207.751 137.328L170.025 136.644Z" fill="#E27625"/>
                <path d="M4.29364 137.328L17.3369 180.406L63.4336 167.733L41.9767 136.644L4.29364 137.328Z" fill="#E27625"/>
                <path d="M60.8539 82.6437L47.5107 102.542L93.2626 104.636L91.7626 55.1531L60.8539 82.6437Z" fill="#E27625"/>
                <path d="M151.104 82.6437L119.78 54.6059L118.324 104.636L164.447 102.542L151.104 82.6437Z" fill="#E27625"/>
                <path d="M63.4336 167.733L91.3519 153.947L67.4444 137.602L63.4336 167.733Z" fill="#E27625"/>
                <path d="M120.606 153.947L148.525 167.733L144.514 137.602L120.606 153.947Z" fill="#E27625"/>
                <path d="M148.525 167.733L120.606 153.947L122.791 172.012L122.516 179.859L148.525 167.733Z" fill="#D5BFB2"/>
                <path d="M63.4336 167.733L89.4426 179.859L89.2103 172.012L91.3519 153.947L63.4336 167.733Z" fill="#D5BFB2"/>
                <path d="M89.7427 126.199L66.6714 119.25L82.6518 111.949L89.7427 126.199Z" fill="#233447"/>
                <path d="M122.216 126.199L129.307 111.949L145.33 119.25L122.216 126.199Z" fill="#233447"/>
                <path d="M63.4336 167.733L67.5712 136.644L41.9767 137.328L63.4336 167.733Z" fill="#CC6228"/>
                <path d="M144.388 136.644L148.525 167.733L170.025 137.328L144.388 136.644Z" fill="#CC6228"/>
                <path d="M164.447 102.542L118.324 104.636L122.259 126.199L129.35 111.949L145.373 119.25L164.447 102.542Z" fill="#CC6228"/>
                <path d="M66.6714 119.25L82.6945 111.949L89.7427 126.199L93.7215 104.636L47.5107 102.542L66.6714 119.25Z" fill="#CC6228"/>
                <path d="M47.5107 102.542L67.4444 137.602L66.6714 119.25L47.5107 102.542Z" fill="#E27525"/>
                <path d="M145.373 119.25L144.514 137.602L164.447 102.542L145.373 119.25Z" fill="#E27525"/>
                <path d="M93.7215 104.636L89.7427 126.199L94.7534 150.758L95.9107 117.029L93.7215 104.636Z" fill="#E27525"/>
                <path d="M118.324 104.636L116.177 116.987L117.205 150.758L122.259 126.199L118.324 104.636Z" fill="#E27525"/>
                <path d="M122.259 126.199L117.205 150.758L120.606 153.947L144.514 137.602L145.373 119.25L122.259 126.199Z" fill="#F5841F"/>
                <path d="M66.6714 119.25L67.4444 137.602L91.3519 153.947L94.7534 150.758L89.7427 126.199L66.6714 119.25Z" fill="#F5841F"/>
                <path d="M122.516 179.859L122.791 172.012L120.779 170.234H91.1796L89.2103 172.012L89.4426 179.859L63.4336 167.733L72.9819 175.538L90.9689 188.211H121.032L139.061 175.538L148.525 167.733L122.516 179.859Z" fill="#C0AC9D"/>
                <path d="M120.606 153.947L117.205 150.758H94.7534L91.3519 153.947L89.2103 172.012L91.1796 170.234H120.779L122.791 172.012L120.606 153.947Z" fill="#161616"/>
                <path d="M202.642 64.0472L211.958 20.8853L199.415 0L120.606 58.4053L151.104 82.6437L193.292 94.2733L203.127 82.6011L198.6 79.2849L207.495 71.1223L201.826 66.6899L210.721 59.6575L202.642 64.0472Z" fill="#763E1A"/>
                <path d="M0 20.8853L9.31636 64.0472L1.15217 59.6575L10.0904 66.6899L4.42121 71.1223L13.3168 79.2849L8.83228 82.6011L18.6245 94.2733L60.8539 82.6437L91.3519 58.4053L12.5432 0L0 20.8853Z" fill="#763E1A"/>
                <path d="M193.292 94.2733L151.104 82.6437L164.447 102.542L144.514 137.602L170.025 137.328H207.751L193.292 94.2733Z" fill="#F5841F"/>
                <path d="M60.8539 82.6437L18.6245 94.2733L4.29364 137.328H41.9767L67.4444 137.602L47.5107 102.542L60.8539 82.6437Z" fill="#F5841F"/>
                <path d="M118.324 104.636L120.606 58.4053L131.794 23.8395H80.2084L91.3519 58.4053L93.7215 104.636L94.6692 117.071L94.7534 150.758H117.205L117.29 117.071L118.324 104.636Z" fill="#F5841F"/>
              </svg>
              {isConnecting ? 'Connecting...' : `Connect with ${walletLabel}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
