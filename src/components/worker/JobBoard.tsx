import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface JobBoardProps {
  onSwitchToRequester?: () => void;
}

const JobBoard = ({ onSwitchToRequester }: JobBoardProps) => {
  const { jobs, user } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const availableJobs = jobs.filter(job => 
    job.status === 'OPEN' || 
    job.status === 'IN_PROGRESS' || 
    (job.status === 'SUBMITTED' && job.applicantWallet === user?.wallet)
  );

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Available Jobs</h1>
            {onSwitchToRequester && (
              <Button
                onClick={onSwitchToRequester}
                variant="outline"
                size="sm"
                className="bg-secondary/10 border-secondary/30 hover:bg-secondary/20"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Hire Talent
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Job grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>

        {availableJobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No jobs available at the moment
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
