import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useApp, JobCategory } from '@/contexts/AppContext';
import { parseEther } from 'viem';
import { formatWeth } from '@/lib/web3/weth';
import { CheckCircle2, FlaskConical } from 'lucide-react';
import { generateRandomJobData } from '@/utils/testDataGenerator';

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
}

const PostJobModal = ({ open, onClose }: PostJobModalProps) => {
  const { createJobWithScroll, user, wethBalance } = useApp();
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    category: '' as JobCategory | '',
    deadline: ''
  });

  // Check for test mode on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsTestMode(searchParams.get('test') === 'true');
  }, []);

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

  const handleFillTestData = () => {
    const testData = generateRandomJobData();
    setFormData(testData);
  };

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
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card/95 via-card to-card/95 border-primary/30 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <CheckCircle2 className="relative w-24 h-24 text-primary mb-4 animate-in zoom-in duration-500" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              Job Posted Successfully!
            </h3>
            <p className="text-muted-foreground text-center">Your job is now live and visible to workers</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-card/95 via-card to-card/95 border-border/50 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Post New Job
            </DialogTitle>
            {isTestMode && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleFillTestData}
                className="ml-4 text-xs"
              >
                <FlaskConical className="w-3 h-3 mr-1" />
                Fill Test Data
              </Button>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Job Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build a React Dashboard"
              className="bg-muted/50 border-border/50 focus:border-primary/50 transition-colors h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work you need done..."
              className="bg-muted/50 border-border/50 focus:border-primary/50 transition-colors min-h-32 resize-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward" className="text-sm font-semibold">Reward (WETH)</Label>
              <Input
                id="reward"
                type="number"
                required
                min="0.000000000000000001"
                step="0.000000000000000001"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder="0.01"
                className={`bg-muted/50 border-border/50 focus:border-primary/50 transition-colors h-11 ${
                  insufficientBalance ? 'border-destructive focus:border-destructive' : ''
                }`}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">
                  Balance: {formatWeth(wethBalance)} WETH
                </span>
                {insufficientBalance && (
                  <span className="text-xs text-destructive font-medium">
                    Insufficient balance
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as JobCategory })}
              >
                <SelectTrigger className="bg-muted/50 border-border/50 focus:border-primary/50 h-11">
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

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-semibold">Deadline</Label>
            <Input
              id="deadline"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              placeholder="e.g., 3 days, 1 week"
              className="bg-muted/50 border-border/50 focus:border-primary/50 transition-colors h-11"
            />
          </div>

          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={posting || !isFormValid || insufficientBalance}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating on Scroll...
                </span>
              ) : (
                'Create Job on Scroll'
              )}
            </Button>
            {posting && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                Please confirm the transaction in your wallet...
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostJobModal;
