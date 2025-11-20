import { AppTransaction } from '@/types/Transaction';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  Briefcase, 
  UserPlus, 
  Send, 
  CheckCircle, 
  Banknote,
  Sparkles
} from 'lucide-react';
import { User } from '@/contexts/AppContext';

interface TransactionHistoryProps {
  transactions: AppTransaction[];
  user: User | null;
}

const TransactionHistory = ({ transactions, user }: TransactionHistoryProps) => {

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please connect your wallet to view transactions</p>
      </div>
    );
  }

  // Filtrar transações do usuário atual (case-insensitive)
  const userTransactions = transactions.filter(tx => 
    tx.user?.toLowerCase() === user.wallet?.toLowerCase()
  );

  if (userTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Banknote className="w-12 h-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No transactions yet</p>
        <p className="text-sm text-muted-foreground/70">Your transaction history will appear here</p>
      </div>
    );
  }

  const getTransactionIcon = (type: AppTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return <DollarSign className="w-4 h-4" />;
      case 'job_creation':
        return <Briefcase className="w-4 h-4" />;
      case 'job_application':
        return <UserPlus className="w-4 h-4" />;
      case 'job_submission':
        return <Send className="w-4 h-4" />;
      case 'job_approval':
        return <CheckCircle className="w-4 h-4" />;
      case 'payment_release':
        return <Banknote className="w-4 h-4" />;
      case 'nft_mint':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: AppTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'job_creation':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'job_application':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'job_submission':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'job_approval':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'payment_release':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'nft_mint':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTransactionLabel = (type: AppTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'job_creation':
        return 'Job Created';
      case 'job_application':
        return 'Applied to Job';
      case 'job_submission':
        return 'Work Submitted';
      case 'job_approval':
        return 'Work Approved';
      case 'payment_release':
        return 'Payment Received';
      case 'nft_mint':
        return 'NFT Minted';
      default:
        return type;
    }
  };

  const getAmountDisplay = (tx: AppTransaction) => {
    if (!tx.amount) return null;

    const isCredit = tx.type === 'deposit' || tx.type === 'payment_release';
    const sign = isCredit ? '+' : '-';
    const color = isCredit ? 'text-green-500' : 'text-red-500';

    return (
      <span className={`font-bold font-mono ${color}`}>
        {sign}${tx.amount.toLocaleString()} WETH
      </span>
    );
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {userTransactions.map((tx, index) => (
          <div key={tx.id}>
            <Card className="p-4 bg-card/50 border-border hover:bg-card/80 transition-colors">
              <div className="flex items-start justify-between gap-4">
                {/* Left side: Icon, type, and metadata */}
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full border ${getTransactionColor(tx.type)}`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTransactionColor(tx.type)}`}
                      >
                        {getTransactionLabel(tx.type)}
                      </Badge>
                      {tx.jobId && (
                        <span className="text-xs text-muted-foreground font-mono">
                          Job #{tx.jobId}
                        </span>
                      )}
                    </div>
                    
                    {tx.metadata?.title && (
                      <p className="text-sm text-foreground/90 truncate mb-1">
                        {String(tx.metadata.title)}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Right side: Amount */}
                {getAmountDisplay(tx) && (
                  <div className="text-right">
                    {getAmountDisplay(tx)}
                  </div>
                )}
              </div>
            </Card>
            
            {index < userTransactions.length - 1 && (
              <Separator className="my-3 bg-border/50" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TransactionHistory;

