import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useApp, JobCategory } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
}

const PostJobModal = ({ open, onClose }: PostJobModalProps) => {
  const { addJob, user, balance } = useApp();
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    category: '' as JobCategory | '',
    deadline: ''
  });

  const rewardAmount = parseInt(formData.reward) || 0;
  const insufficientBalance = rewardAmount > balance;
  const isFormValid = formData.title && formData.description && formData.reward && 
                      formData.category && formData.deadline && !insufficientBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    // Simulate MetaMask popup and transaction
    setTimeout(() => {
      addJob({
        title: formData.title,
        description: formData.description,
        reward: parseInt(formData.reward),
        category: formData.category as JobCategory,
        deadline: formData.deadline,
        requester: user?.company || user?.name || 'Anonymous',
        tags: [formData.category as string]
      });

      setPosting(false);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          title: '',
          description: '',
          reward: '',
          category: '',
          deadline: ''
        });
        onClose();
        toast.success('Job posted successfully!');
      }, 2000);
    }, 2000);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-card border-primary/20 glow-effect">
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-24 h-24 text-primary mb-4 animate-scale-in" />
            <h3 className="text-2xl font-bold text-primary mb-2">Job Posted!</h3>
            <p className="text-muted-foreground">Your job is now live on the board</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-primary/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Post New Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build a React Dashboard"
              className="bg-muted border-border"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work you need done..."
              className="bg-muted border-border min-h-32"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reward">Reward (USDC)</Label>
              <Input
                id="reward"
                type="number"
                required
                min="1"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="500"
                className={`bg-muted border-border ${insufficientBalance ? 'border-destructive' : ''}`}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  Available: {balance.toLocaleString()} USDC
                </span>
                {insufficientBalance && (
                  <span className="text-xs text-destructive">
                    Insufficient balance
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as JobCategory })}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRONTEND">Frontend</SelectItem>
                  <SelectItem value="BACKEND">Backend</SelectItem>
                  <SelectItem value="DESIGN">Design</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              placeholder="e.g., 3 days, 1 week"
              className="bg-muted border-border"
            />
          </div>

          <div className="pt-4 space-y-2">
            <Button
              type="submit"
              disabled={posting || !isFormValid}
              className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold uppercase text-lg py-6 glow-effect disabled:opacity-50"
            >
              {posting ? 'Depositing to Escrow...' : 'Deposit & Post Job'}
            </Button>
            {posting && (
              <p className="text-xs text-center text-muted-foreground">
                Confirm transaction in MetaMask...
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostJobModal;
