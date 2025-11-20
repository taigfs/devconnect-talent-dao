import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { DollarSign, Clock, Building2, FileText, Tag, Layers } from 'lucide-react';
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
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    
    try {
      await applyForJob(job.id);
      // Success - close modal after job is taken
      onClose();
    } catch (error) {
      // Error handling is done in AppContext (toast notifications)
      // Don't close modal if transaction failed or was rejected
    } finally {
      setIsApplying(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionLink.trim()) {
      toast.error('Please enter a submission link');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitWork(job.id, submissionLink);
      // Success - close modal after work is submitted
      onClose();
    } catch (error) {
      // Error handling is done in AppContext (toast notifications)
      // Don't close modal if transaction failed or was rejected
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Job Header */}
          <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50">
            <div className="flex items-start gap-3 mb-4">
              <Badge className={
                job.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                job.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                job.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                'bg-primary/10 text-primary border-primary/20'
              }>
                {job.status === 'OPEN' ? 'Open' :
                 job.status === 'IN_PROGRESS' ? 'In Progress' :
                 job.status === 'SUBMITTED' ? 'Submitted' :
                 'Completed'}
              </Badge>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-primary font-bold bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                <DollarSign className="w-4 h-4" />
                <span>{job.reward} WETH</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground bg-background/50 px-3 py-2 rounded-lg border border-border/50">
                <Clock className="w-4 h-4" />
                <span>Due in {job.deadline}</span>
              </div>
            </div>

            {/* Category, Requester & Job ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Job ID: #{job.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Posted by:</span>
                <span className="font-medium">{job.requester}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Description</h4>
            </div>
            <p className="text-muted-foreground leading-relaxed pl-6">
              {job.description}
            </p>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Required Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {job.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Submission form for in-progress jobs */}
          {canSubmit && (
            <div className="relative space-y-5 p-6 pt-0 bg-gradient-to-br from-amber-500/8 via-orange-500/5 to-amber-500/8 border border-amber-500/20 rounded-2xl overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.06),transparent_70%)]" />

              <div className="relative space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-base text-amber-700 dark:text-amber-300 mb-1">
                      Submit Your Work
                    </h4>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                      Share a link to your completed work for review
                    </p>
                  </div>
                </div>

                {/* Input field */}
                <div>
                  <Input
                    id="submission"
                    placeholder="https://github.com/your-repo or https://figma.com/..."
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    className="h-12 bg-background/70 border-amber-500/20 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-muted-foreground/40 rounded-lg"
                  />
                </div>

                {/* Submit button */}
                <div className="space-y-2.5">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-700 hover:via-amber-600 hover:to-orange-600 text-white font-semibold text-base h-12 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2.5">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting on Scroll...</span>
                      </span>
                    ) : (
                      'Submit Work for Review'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground/70">
                    Your submission will be recorded on the blockchain
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submitted status */}
          {isSubmitted && (
            <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">Work Submitted</h4>
                  <p className="text-xs text-muted-foreground">Awaiting requester review</p>
                </div>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Your Submission</span>
                <a
                  href={job.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all font-medium block"
                >
                  {job.submissionLink}
                </a>
              </div>
              
              <p className="text-sm text-center text-muted-foreground mt-4">
                The requester will review your work soon
              </p>
            </div>
          )}

          {/* Apply button */}
          {canApply && (
            <div className="space-y-3">
              <Button
                onClick={handleApply}
                disabled={isApplying}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Taking Job on Scroll...</span>
                  </span>
                ) : (
                  'Apply for Job'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                This will register your application on the blockchain
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
