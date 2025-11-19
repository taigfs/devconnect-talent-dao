import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';

const JobBoard = () => {
  const { jobs } = useApp();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const availableJobs = jobs.filter(job => job.status === 'OPEN' || job.status === 'IN_PROGRESS');

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Available Jobs</h1>
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
