import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { UserRole } from '@/contexts/AppContext';

interface KYCModalProps {
  open: boolean;
  role: UserRole;
  onComplete: (data: any) => void;
}

const KYCModal = ({ open, role, onComplete }: KYCModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    website: '',
    skills: [] as string[]
  });
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const skills = ['Frontend', 'Backend', 'Design', 'Marketing'];

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      setTimeout(() => {
        onComplete(formData);
      }, 1500);
    }, 2000);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 glow-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Verify Your Identity
          </DialogTitle>
        </DialogHeader>

        {!verified ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-muted border-border"
              />
            </div>

            {role === 'worker' ? (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Skills</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <label
                          htmlFor={skill}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={verifying}
              className="w-full bg-primary hover:bg-secondary text-primary-foreground font-bold uppercase"
            >
              {verifying ? 'Verifying...' : 'Verify Identity'}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-20 h-20 text-primary mb-4 animate-scale-in" />
            <p className="text-lg font-semibold text-primary">Verification Complete!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KYCModal;
