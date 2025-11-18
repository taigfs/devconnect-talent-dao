import { useState } from 'react';
import { useApp, JobCategory } from '@/contexts/AppContext';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import { Button } from '@/components/ui/button';

const JobBoard = () => {
  const { jobs, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'ALL'>('ALL');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const categories: (JobCategory | 'ALL')[] = ['ALL', 'FRONTEND', 'BACKEND', 'DESIGN', 'MARKETING'];

  const filteredJobs = jobs.filter(job => {
    if (selectedCategory === 'ALL') return true;
    return job.category === selectedCategory;
  });

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Available Jobs</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono text-primary">{user?.wallet}</span>
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-bold text-primary">1,234 USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className={selectedCategory === cat 
                ? 'bg-primary text-primary-foreground hover:bg-secondary' 
                : 'border-primary/50 hover:bg-primary/10'}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Job grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No jobs found in this category
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
