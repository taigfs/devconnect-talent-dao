import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { ExternalLink, DollarSign, Clock, User, FileText, Tag, Layers, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getJobDetails, OnChainJobFull } from '@/lib/web3/workMarketplace';

interface ReviewSubmissionModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

const ReviewSubmissionModal = ({ job, open, onClose }: ReviewSubmissionModalProps) => {
  const { approveWork, user } = useApp();
  const [approving, setApproving] = useState(false);
  const [onChainJob, setOnChainJob] = useState<OnChainJobFull | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch full job details from blockchain when modal opens
  useEffect(() => {
    if (open && job.id !== undefined) {
      const fetchJobDetails = async () => {
        setLoadingDetails(true);
        try {
          const details = await getJobDetails(job.id);
          setOnChainJob(details);
        } catch (error) {
          console.error('Failed to fetch job details:', error);
          // Fallback to local job data
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchJobDetails();
    }
  }, [open, job.id]);

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
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-card/95 via-card to-card/95 border-border/50 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Job Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Header */}
          <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50">
            <div className="flex items-start gap-3 mb-4">
              <h3 className="font-bold text-xl flex-1 leading-tight">{job.title}</h3>
              <Badge className={getStatusColor(job.status)}>
                {getStatusLabel(job.status)}
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

            {/* Category & Job ID */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium">{job.category}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Job ID: #{job.id}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Description</h4>
              {loadingDetails && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </div>
            {loadingDetails ? (
              <div className="pl-6 space-y-2">
                <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-4/6" />
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed pl-6">
                {onChainJob?.description || job.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Tags</h4>
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
          {/* Status-Specific Content */}
          {job.status === 'OPEN' && (
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Job is Live!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Waiting for workers to apply
              </p>
            </div>
          )}

          {job.status === 'IN_PROGRESS' && (
            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-700 dark:text-amber-400">Worker Assigned</h4>
                  <p className="text-xs text-muted-foreground">Work in progress</p>
                </div>
              </div>
              <div className="space-y-2 bg-background/50 p-3 rounded-lg">
                <div className="text-sm">
                  <span className="text-muted-foreground">Wallet Address:</span>
                  <p className="font-mono text-xs mt-1 break-all">{job.applicantWallet}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                ⏳ Awaiting work submission...
              </p>
            </div>
          )}

          {job.status === 'SUBMITTED' && (
            <>
              {/* Submission Details */}
              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">Work Submitted</h4>
                    <p className="text-xs text-muted-foreground">Ready for review</p>
                  </div>
                </div>

                <div className="space-y-3 bg-background/50 p-4 rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Submission Link</span>
                    {loadingDetails ? (
                      <div className="h-5 bg-muted/50 rounded animate-pulse w-full mt-1.5" />
                    ) : (
                      <a
                        href={onChainJob?.deliveryUrl || job.submissionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 break-all mt-1.5 font-medium"
                      >
                        {onChainJob?.deliveryUrl || job.submissionLink}
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      </a>
                    )}
                  </div>
                  
                  <div className="h-px bg-border" />
                  
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Worker Address</span>
                    {loadingDetails ? (
                      <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4 mt-1.5" />
                    ) : (
                      <p className="font-mono text-xs mt-1.5 break-all">{onChainJob?.worker || job.applicantWallet}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Payment Breakdown */}
              <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-xl">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Payment Distribution
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-primary/10">
                    <div>
                      <span className="text-sm font-medium">Worker Payment</span>
                      <p className="text-xs text-muted-foreground">80% of total reward</p>
                    </div>
                    <span className="font-bold text-lg text-primary">{(job.reward * 0.8).toFixed(8)} WETH</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Social Programs</span>
                      <p className="text-xs text-muted-foreground">20% platform fee</p>
                    </div>
                    <span className="font-bold text-muted-foreground">{(job.reward * 0.2).toFixed(8)} WETH</span>
                  </div>
                  
                  <div className="h-px bg-border my-2" />
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-base">Total Escrowed</span>
                    <span className="font-bold text-xl text-primary">{job.reward.toFixed(8)} WETH</span>
                  </div>
                </div>
              </div>

              {/* Approve Button */}
              <Button
                onClick={handleApprove}
                disabled={approving}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-base h-14 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {approving ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing on Scroll...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Approve & Release Payment</span>
                  </span>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-3">
                This will release {(job.reward * 0.8).toFixed(8)} WETH to the worker and mint a reputation NFT
              </p>
            </>
          )}

          {job.status === 'COMPLETED' && (
            <div className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-xl border-2 border-primary/20 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className="text-4xl">✓</div>
              </div>
              <p className="font-bold text-primary text-xl mb-2">Job Completed!</p>
              <p className="text-sm text-muted-foreground mb-4">
                Payment has been released to the worker
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-primary/20">
                <span className="text-xs text-muted-foreground">Worker received:</span>
                <span className="font-bold text-primary">{(job.reward * 0.8).toFixed(8)} WETH</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewSubmissionModal;

