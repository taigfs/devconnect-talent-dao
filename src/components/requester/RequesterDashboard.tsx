import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PostJobModal from './PostJobModal';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import { Plus, DollarSign, Clock } from 'lucide-react';

const RequesterDashboard = () => {
  const { jobs, user } = useApp();
  const [showPostJob, setShowPostJob] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const myJobs = jobs.filter(job => job.requesterWallet === user?.wallet);
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const statusColors = {
    OPEN: 'bg-primary text-primary-foreground',
    IN_PROGRESS: 'bg-yellow-600 text-white',
    SUBMITTED: 'bg-blue-600 text-white',
    COMPLETED: 'bg-primary text-primary-foreground'
  };

  const statusLabels = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    SUBMITTED: 'Submitted',
    COMPLETED: 'Completed'
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
          <div className="space-y-4">
            {myJobs.map(job => (
              <Card
                key={job.id}
                className="bg-card border-border hover:border-primary/50 transition-all p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={statusColors[job.status]}>
                        {statusLabels[job.status]}
                      </Badge>
                      {job.status === 'SUBMITTED' && (
                        <span className="text-sm text-secondary font-semibold">
                          🔔 New Submission!
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-3">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <DollarSign className="w-4 h-4" />
                        {job.reward} USDC
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Due in {job.deadline}
                      </div>
                      <Badge variant="outline" className="border-primary/50">
                        {job.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {job.status === 'SUBMITTED' && (
                      <Button
                        onClick={() => setSelectedJobId(job.id)}
                        className="bg-primary hover:bg-secondary text-primary-foreground glow-effect"
                      >
                        Review Submission
                      </Button>
                    )}
                    {job.status === 'IN_PROGRESS' && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedJobId(job.id)}
                        className="border-primary/50"
                      >
                        View Details
                      </Button>
                    )}
                    {job.status === 'OPEN' && (
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedJobId(job.id)}
                        className="text-muted-foreground"
                      >
                        Manage
                      </Button>
                    )}
                    {job.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedJobId(job.id)}
                        className="border-primary/50"
                      >
                        <span className="text-primary">✓ View</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
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
