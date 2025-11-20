import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import { Button } from '@/components/ui/button';
import { Building2, RefreshCw, Briefcase, Filter, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface JobBoardProps {
  onSwitchToRequester?: () => void;
}

const JobBoard = ({ onSwitchToRequester }: JobBoardProps) => {
  const { jobs, user, syncJobsFromChain } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Sync jobs from blockchain on mount
  useEffect(() => {
    const syncJobs = async () => {
      try {
        await syncJobsFromChain();
      } catch (error) {
        console.error('Failed to sync jobs from chain:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };
    syncJobs();
  }, [syncJobsFromChain]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncJobsFromChain(true); // force=true to bypass cooldown
      toast.success('Jobs refreshed from blockchain!');
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
      toast.error('Failed to refresh jobs', {
        description: 'Please try again later'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const availableJobs = jobs.filter(job =>
    job.status === 'OPEN' ||
    job.status === 'IN_PROGRESS' ||
    (job.status === 'SUBMITTED' && job.applicantWallet === user?.wallet)
  );

  const openJobs = availableJobs.filter(job => job.status === 'OPEN');
  const inProgressJobs = availableJobs.filter(job => job.status === 'IN_PROGRESS');
  const totalRewards = availableJobs.reduce((sum, job) => sum + job.reward, 0);

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Hero Header */}
      <div className="border-b border-border/40 bg-gradient-to-r from-card/80 via-card/60 to-card/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col gap-6">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Available Opportunities
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Find your next Web3 project
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="h-9 gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sync</span>
                </Button>

                {onSwitchToRequester && (
                  <Button
                    onClick={onSwitchToRequester}
                    size="sm"
                    className="h-9 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Hire Talent</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">{openJobs.length} Open Positions</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{inProgressJobs.length} In Progress</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/5 border border-secondary/10">
                <span className="text-sm font-medium text-secondary">
                  ${totalRewards.toLocaleString()} Total Rewards
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {availableJobs.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-muted-foreground">
                  {availableJobs.length} {availableJobs.length === 1 ? 'Job' : 'Jobs'} Available
                </h2>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {availableJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="animate-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <JobCard
                    job={job}
                    onClick={() => setSelectedJobId(job.id)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No jobs available</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Check back soon for new opportunities or try refreshing to sync with the blockchain
            </p>
            <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Jobs
            </Button>
          </div>
        )}
      </div>

      {/* Job details modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          open={!!selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
};

export default JobBoard;
