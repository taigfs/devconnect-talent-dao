import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { DollarSign, Clock, Building2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface JobDetailsModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

const JobDetailsModal = ({ job, open, onClose }: JobDetailsModalProps) => {
  const { applyForJob, submitWork, user } = useApp();
  const [submissionLink, setSubmissionLink] = useState('');

  const handleApply = () => {
    applyForJob(job.id);
    toast.success('Applied successfully! Job is now in progress.');
    onClose();
  };

  const handleSubmit = () => {
    if (!submissionLink.trim()) {
      toast.error('Please enter a submission link');
      return;
    }
    submitWork(job.id, submissionLink);
    toast.success('Work submitted! Awaiting approval...');
    onClose();
  };

  const isMyJob = job.applicantWallet?.toLowerCase() === user?.wallet?.toLowerCase();
  const canApply = job.status === 'OPEN' && !isMyJob;
  const canSubmit = job.status === 'IN_PROGRESS' && isMyJob;
  const isSubmitted = job.status === 'SUBMITTED' && isMyJob;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-card/95 via-card to-card/95 border-border/50 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {job.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status badge */}
          <Badge className={
            job.status === 'OPEN' ? 'bg-primary text-primary-foreground' :
            job.status === 'IN_PROGRESS' ? 'bg-yellow-600 text-white' :
            job.status === 'SUBMITTED' ? 'bg-blue-600 text-white' :
            'bg-primary text-primary-foreground'
          }>
            {job.status === 'OPEN' ? 'Open' :
             job.status === 'IN_PROGRESS' ? 'In Progress' :
             job.status === 'SUBMITTED' ? 'Submitted' :
             'Completed'}
          </Badge>

          {/* Job meta */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Reward</div>
                <div className="font-bold text-primary">{job.reward} WETH</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Deadline</div>
                <div className="font-bold">Due in {job.deadline}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Requester</div>
                <div className="font-bold">{job.requester}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Proficiency in required technologies</li>
              <li>Portfolio or work samples</li>
              <li>Good communication skills</li>
              <li>Ability to meet deadline</li>
            </ul>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {job.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full border border-primary/30"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Submission form for in-progress jobs */}
          {canSubmit && (
            <div className="border-t border-border pt-6 space-y-4">
              <Label htmlFor="submission" className="text-sm font-semibold">Submission Link</Label>
              <Input
                id="submission"
                placeholder="https://github.com/... or https://figma.com/..."
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                className="bg-muted/50 border-border/50 focus:border-primary/50 transition-colors h-11"
              />
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all"
              >
                Submit Work
              </Button>
            </div>
          )}

          {/* Submitted status */}
          {isSubmitted && (
            <div className="border-t border-border pt-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Your submission:</p>
                <a
                  href={job.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {job.submissionLink}
                </a>
                <p className="text-sm text-secondary mt-4 font-semibold">
                  ⏳ Awaiting approval...
                </p>
              </div>
            </div>
          )}

          {/* Apply button */}
          {canApply && (
            <Button
              onClick={handleApply}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all"
            >
              Apply for Job
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
