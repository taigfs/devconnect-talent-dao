import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PostJobModal from './PostJobModal';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import { Plus, DollarSign, Clock, Sparkles, Eye } from 'lucide-react';

const RequesterDashboard = () => {
  const { jobs, user } = useApp();
  const [showPostJob, setShowPostJob] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Case-insensitive wallet comparison
  const myJobs = jobs.filter(job => 
    job.requesterWallet?.toLowerCase() === user?.wallet?.toLowerCase()
  );
  
  console.log('[RequesterDashboard] User wallet:', user?.wallet);
  console.log('[RequesterDashboard] All jobs:', jobs);
  console.log('[RequesterDashboard] My jobs:', myJobs);
  
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
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">My Posted Jobs</h1>
            <Button
              onClick={() => setShowPostJob(true)}
              className="bg-primary hover:bg-secondary text-primary-foreground font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {myJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
            <Button
              onClick={() => setShowPostJob(true)}
              className="bg-primary hover:bg-secondary text-primary-foreground"
            >
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myJobs.map(job => {
              const config = statusConfig[job.status];
              return (
                <Card 
                  key={job.id}
                  className="group relative bg-gradient-to-br from-card via-card to-card/50 border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 p-6 space-y-4 overflow-hidden"
                >
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold group/btn transition-all duration-300 glow-effect"
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
              );
            })}
          </div>
        )}
      </div>

      <PostJobModal
        open={showPostJob}
        onClose={() => setShowPostJob(false)}
      />

      {selectedJob && (
        <ReviewSubmissionModal
          job={selectedJob}
          open={!!selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />
      )}
    </div>
  );
};

export default RequesterDashboard;
