import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Receipt } from 'lucide-react';
import TransactionHistory from '@/components/TransactionHistory';
import { useApp } from '@/contexts/AppContext';

interface TransactionHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

const TransactionHistoryModal = ({ open, onClose }: TransactionHistoryModalProps) => {
  const { transactions, user } = useApp();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            Transaction History
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View all your transactions on MintWork
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <TransactionHistory transactions={transactions} user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistoryModal;

