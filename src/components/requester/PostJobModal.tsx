import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useApp, JobCategory } from '@/contexts/AppContext';
import { parseEther } from 'viem';
import { formatWeth } from '@/lib/web3/weth';
import { CheckCircle2 } from 'lucide-react';

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
}

const PostJobModal = ({ open, onClose }: PostJobModalProps) => {
  const { createJobWithScroll, user, wethBalance } = useApp();
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    category: '' as JobCategory | '',
    deadline: ''
  });

  let rewardInWei: bigint | null = null;
  try {
    rewardInWei = formData.reward ? parseEther(formData.reward) : null;
  } catch {
    rewardInWei = null;
  }

  const hasValidReward = rewardInWei !== null && rewardInWei > 0n;
  const insufficientBalance = rewardInWei !== null && wethBalance !== undefined ? rewardInWei > wethBalance : false;
  const isFormValid = formData.title && formData.description && hasValidReward && 
                      formData.category && formData.deadline;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    try {
      await createJobWithScroll({
        title: formData.title,
        description: formData.description,
        reward: formData.reward,
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
      }, 2000);
    } catch (error) {
      setPosting(false);
      // Error toast already shown in createJobWithScroll
    }
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
              <Label htmlFor="reward">Reward (WETH)</Label>
              <Input
                id="reward"
                type="number"
                required
                min="0.000000000000000001"
                step="0.000000000000000001"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="0.01"
                className={`bg-muted border-border ${insufficientBalance ? 'border-destructive' : ''}`}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  Your WETH: {formatWeth(wethBalance)} WETH
                </span>
                {insufficientBalance && (
                  <span className="text-xs text-destructive">
                    Insufficient WETH
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
              className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold text-lg py-6 glow-effect disabled:opacity-50"
            >
              {posting ? 'Creating job on Scroll...' : 'Create Job'}
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
