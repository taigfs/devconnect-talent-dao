import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/contexts/AppContext';
import { Clock, DollarSign, ArrowRight, Sparkles } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
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
      label: 'Submitted',
      icon: false
    },
    COMPLETED: {
      color: 'bg-primary/10 text-primary border-primary/20',
      label: 'Completed',
      icon: false
    }
  };

  const config = statusConfig[job.status];

  return (
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
          {job.status === 'OPEN' && (
            <Sparkles className="w-4 h-4 text-primary/40 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
          {job.title}
        </h3>

        {/* Company/Requester */}
        <p className="text-sm text-muted-foreground">
          {job.requester}
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

        {/* View Details Button */}
        <Button
          onClick={onClick}
          variant="outline"
          className="w-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary group/btn transition-all duration-300"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
