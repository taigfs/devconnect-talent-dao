import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => Promise<void>;
}

const DepositModal = ({ open, onClose, onDeposit }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState('');

  const handleDeposit = async () => {
    setError('');
    
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > 100000) {
      setError('Amount too large (max: 100,000 USDC)');
      return;
    }

    setIsDepositing(true);
    
    try {
      await onDeposit(numAmount);
      toast.success(`Successfully deposited ${numAmount} USDC!`);
      setAmount('');
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Deposit failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleClose = () => {
    if (!isDepositing) {
      setAmount('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Deposit USDC via Lemon
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add USDC to your balance to post jobs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Info banner */}
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Mock mode for development. In production, this will use Lemon Cash balance.
            </p>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="pl-9 bg-muted border-border"
                disabled={isDepositing}
                min="0"
                step="0.01"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          {/* Quick amounts */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick amounts:</Label>
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={isDepositing}
                  className="flex-1"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Deposit button */}
          <Button
            onClick={handleDeposit}
            disabled={isDepositing || !amount}
            className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold"
          >
            {isDepositing ? 'Processing...' : 'Deposit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;

