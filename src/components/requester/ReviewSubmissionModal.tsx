import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { ExternalLink, DollarSign, Clock, User } from 'lucide-react';
import { useState } from 'react';

interface ReviewSubmissionModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

const ReviewSubmissionModal = ({ job, open, onClose }: ReviewSubmissionModalProps) => {
  const { approveWork, user } = useApp();
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    
    try {
      await approveWork(job.id);
      // Success - close modal after approval completes
      onClose();
    } catch (error) {
      // Error handling is done in AppContext (toast notifications)
      // Don't close modal if transaction failed or was rejected
    } finally {
      setApproving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-primary text-primary-foreground';
      case 'IN_PROGRESS': return 'bg-yellow-600 text-white';
      case 'SUBMITTED': return 'bg-blue-600 text-white';
      case 'COMPLETED': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Open';
      case 'IN_PROGRESS': return 'In Progress';
      case 'SUBMITTED': return 'Submitted';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return '';
    const now = new Date();
    const submitted = new Date(timestamp);
    const hours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Less than an hour ago';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Job Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-lg flex-1">{job.title}</h3>
              <Badge className={getStatusColor(job.status)}>
                {getStatusLabel(job.status)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-primary font-bold">
                <DollarSign className="w-4 h-4" />
                {job.reward} WETH
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Due in {job.deadline}
              </div>
            </div>
          </div>
          {job.status === 'OPEN' && (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground mt-1">Your job is live on the board</p>
            </div>
          )}

          {job.status === 'IN_PROGRESS' && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold">Worker Assigned</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Wallet: <span className="font-mono text-foreground">{job.applicantWallet}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">Awaiting submission...</p>
            </div>
          )}

          {job.status === 'SUBMITTED' && (
            <>
              <div className="p-4 bg-muted rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  Submitted Work
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Link:</span>
                    <a
                      href={job.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2 break-all mt-1"
                    >
                      {job.submissionLink}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Worker: </span>
                    <span className="text-sm font-mono">{job.applicantWallet}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Submitted: </span>
                    <span className="text-sm">{getTimeAgo(job.submittedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <h4 className="font-semibold mb-3">Payment Breakdown</h4>
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Worker (80%)</span>
                    <span className="font-bold text-primary">{(job.reward * 0.8).toFixed(4)} WETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social Programs (20%)</span>
                    <span className="font-bold text-muted-foreground">{(job.reward * 0.2).toFixed(4)} WETH</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">{job.reward} WETH</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleApprove}
                disabled={approving}
                className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold uppercase text-lg py-6 glow-effect-strong"
              >
                {approving ? 'Releasing Payment...' : 'Approve & Release Payment'}
              </Button>
            </>
          )}

          {job.status === 'COMPLETED' && (
            <div className="p-6 bg-primary/10 rounded-lg border border-primary/30 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="font-bold text-primary text-lg">Payment Released</p>
              <p className="text-sm text-muted-foreground mt-2">
                This job has been completed successfully
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewSubmissionModal;
