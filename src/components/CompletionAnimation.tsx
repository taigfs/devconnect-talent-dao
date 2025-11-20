import { useEffect, useState } from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';

interface CompletionAnimationProps {
  reward: number;
  onComplete: () => void;
}

const CompletionAnimation = ({ reward, onComplete }: CompletionAnimationProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2500),
      setTimeout(() => onComplete(), 5000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0b]/98 backdrop-blur-md">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3,
              backgroundColor: Math.random() > 0.5 ? '#00D395' : '#00FF88'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-lg px-4">
        {step >= 1 && (
          <div className="animate-scale-in">
            <CheckCircle2 className="w-32 h-32 text-primary mx-auto glow-effect-strong" />
          </div>
        )}
        {step >= 1 && (
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-primary text-glow mb-4">
              Payment Released!
            </h2>
          </div>
        )}
        {step >= 2 && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center justify-between p-4 bg-card border border-primary/30 rounded-lg glow-effect">
              <span className="text-lg">Worker (80%)</span>
              <span className="text-2xl font-bold text-primary">
                {(reward * 0.8).toFixed(8)} WETH
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <span className="text-lg">Social Programs (20%)</span>
              <span className="text-xl font-bold text-muted-foreground">
                {(reward * 0.2).toFixed(8)} WETH
              </span>
            </div>
          </div>
        )}
               {step >= 3 && (
          <div className="animate-scale-in">
            <div className="inline-flex flex-col items-center p-6 bg-card border-2 border-primary rounded-lg glow-effect-strong">
              <Trophy className="w-16 h-16 text-primary mb-3" />
              <p className="text-xl font-bold text-primary">Reputation NFT Minted!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your achievement has been recorded on-chain
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletionAnimation;
