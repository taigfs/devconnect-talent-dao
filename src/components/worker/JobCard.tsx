import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/contexts/AppContext';
import { Clock, DollarSign } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  const statusColors = {
    OPEN: 'bg-primary text-primary-foreground',
    IN_PROGRESS: 'bg-secondary text-secondary-foreground',
    SUBMITTED: 'bg-muted text-muted-foreground',
    COMPLETED: 'bg-primary text-primary-foreground'
  };

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all hover:glow-effect p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Badge className={statusColors[job.status]}>
          {job.status.replace('_', ' ')}
        </Badge>
        {job.status === 'IN_PROGRESS' && (
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        )}
      </div>

      <h3 className="text-lg font-bold line-clamp-2">{job.title}</h3>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-primary font-bold">
          <DollarSign className="w-4 h-4" />
          {job.reward} USDC
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-4 h-4" />
          Due in {job.deadline}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.tags.map(tag => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      <Button
        onClick={onClick}
        variant="outline"
        className="w-full border-primary/50 hover:bg-primary/10"
      >
        VIEW DETAILS
      </Button>
    </Card>
  );
};

export default JobCard;
