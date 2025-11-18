import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Job } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { ExternalLink, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface ReviewSubmissionModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

const ReviewSubmissionModal = ({ job, open, onClose }: ReviewSubmissionModalProps) => {
  const { approveWork } = useApp();
  const [approving, setApproving] = useState(false);

  const handleApprove = () => {
    setApproving(true);
    
    // Simulate approval transaction
    setTimeout(() => {
      approveWork(job.id);
      setApproving(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Review Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job info */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-bold text-lg mb-2">{job.title}</h3>
            <div className="flex items-center gap-2 text-primary font-bold">
              <DollarSign className="w-5 h-5" />
              {job.reward} USDC
            </div>
          </div>

          {/* Submission */}
          <div>
            <h4 className="font-semibold mb-3">Submitted Work</h4>
            <div className="p-4 bg-muted rounded-lg border border-border">
              <a
                href={job.submissionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-2 break-all"
              >
                {job.submissionLink}
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="border-t border-border pt-6">
            <h4 className="font-semibold mb-3">Payment Breakdown</h4>
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Worker (80%)</span>
                <span className="font-bold text-primary">{job.reward * 0.8} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DAO Treasury (20%)</span>
                <span className="font-bold text-muted-foreground">{job.reward * 0.2} USDC</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{job.reward} USDC</span>
              </div>
            </div>
          </div>

          {/* Approve button */}
          <Button
            onClick={handleApprove}
            disabled={approving}
            className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold uppercase text-lg py-6 glow-effect-strong"
          >
            {approving ? 'Releasing Payment...' : 'Approve & Release Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewSubmissionModal;
