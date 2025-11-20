import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PostJobModal from './PostJobModal';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import { Plus, DollarSign, Clock, Sparkles, Eye, Briefcase, TrendingUp, AlertCircle, CheckCircle, Users } from 'lucide-react';

interface RequesterDashboardProps {
  onSwitchToWorker?: () => void;
}

const RequesterDashboard = ({ onSwitchToWorker }: RequesterDashboardProps) => {
  const { jobs, user } = useApp();
  const [showPostJob, setShowPostJob] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Case-insensitive wallet comparison
  const myJobs = jobs.filter(job =>
    job.requesterWallet?.toLowerCase() === user?.wallet?.toLowerCase()
  );

  const openJobs = myJobs.filter(job => job.status === 'OPEN');
  const inProgressJobs = myJobs.filter(job => job.status === 'IN_PROGRESS');
  const submittedJobs = myJobs.filter(job => job.status === 'SUBMITTED');
  const completedJobs = myJobs.filter(job => job.status === 'COMPLETED');
  const totalInvested = myJobs.reduce((sum, job) => sum + job.reward, 0);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const statusConfig = {
    OPEN: {
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      label: 'Open',
      icon: true
    },
    IN_PROGRESS: {
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      label: 'In Progress',
      icon: true
    },
    SUBMITTED: {
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      label: 'Submitted - Review!',
      icon: true,
      highlight: true
    },
    COMPLETED: {
      color: 'bg-primary/10 text-primary border-primary/20',
      label: 'Completed',
      icon: false
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Hero Header */}
      <div className="border-b border-border/40 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-6">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    My Job Postings
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your talent requests
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {onSwitchToWorker && (
                  <Button
                    onClick={onSwitchToWorker}
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Find Work</span>
                  </Button>
                )}
                <Button
                  onClick={() => setShowPostJob(true)}
                  size="sm"
                  className="h-9 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Job</span>
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            {myJobs.length > 0 && (
              <TooltipProvider>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 cursor-default">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium">{openJobs.length}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 cursor-default">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">{inProgressJobs.length}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>In Progress</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10 cursor-default">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{submittedJobs.length}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Need Review</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 cursor-default">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{completedJobs.length}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Completed</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/5 border border-secondary/10 cursor-default">
                        <DollarSign className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-secondary">
                          {totalInvested.toFixed(6)} WETH
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{totalInvested.toFixed(6)} WETH Invested</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Job Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {myJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start building your team by posting your first job opportunity
            </p>
            <Button
              onClick={() => setShowPostJob(true)}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Post Your First Job
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-muted-foreground">
                {myJobs.length} {myJobs.length === 1 ? 'Job' : 'Jobs'} Posted
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {myJobs.map((job, index) => {
                const config = statusConfig[job.status];
                return (
                  <div
                    key={job.id}
                    className="animate-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="group relative bg-gradient-to-br from-card via-card to-card/50 border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6 space-y-4 overflow-hidden">
                      {/* Subtle background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <Badge className={`${config.color} border font-medium px-3 py-1`}>
                            <span className="flex items-center gap-1.5">
                              {config.icon && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                              {config.label}
                            </span>
                          </Badge>
                          {job.status === 'SUBMITTED' && (
                            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>

                        {/* Reward & Deadline */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.reward} WETH</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{job.deadline}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {job.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2.5 py-1 bg-muted/50 text-muted-foreground rounded-md border border-border/50 hover:border-primary/30 transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                          {job.tags.length > 3 && (
                            <span className="text-xs px-2.5 py-1 text-muted-foreground">
                              +{job.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        {job.status === 'SUBMITTED' && (
                          <Button
                            onClick={() => setSelectedJobId(job.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold group/btn transition-all duration-300"
                          >
                            <span>Review Submission</span>
                            <Eye className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                          </Button>
                        )}
                        {job.status === 'IN_PROGRESS' && (
                          <Button
                            onClick={() => setSelectedJobId(job.id)}
                            variant="outline"
                            className="w-full border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 group/btn transition-all duration-300"
                          >
                            <span>View Details</span>
                            <Eye className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        )}
                        {job.status === 'OPEN' && (
                          <Button
                            onClick={() => setSelectedJobId(job.id)}
                            variant="outline"
                            className="w-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary group/btn transition-all duration-300"
                          >
                            <span>View Details</span>
                            <Eye className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        )}
                        {job.status === 'COMPLETED' && (
                          <Button
                            onClick={() => setSelectedJobId(job.id)}
                            variant="outline"
                            className="w-full border-primary/30 hover:bg-primary/10 group/btn transition-all duration-300"
                          >
                            <span className="text-primary font-bold">✓ Completed</span>
                            <Eye className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <PostJobModal
        open={showPostJob}
        onClose={() => setShowPostJob(false)}
      />

      {selectedJob && (
        <ReviewSubmissionModal
          job={selectedJob}
          open={selectedJobId !== null}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
};

export default RequesterDashboard;
