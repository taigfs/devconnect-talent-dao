import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import AnimatedCounter from './AnimatedCounter';
import successAnimation from '@/assets/animations/success.json';

interface CompletionAnimationProps {
  reward: number;
  onComplete: () => void;
}

const CompletionAnimation = ({ reward, onComplete }: CompletionAnimationProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),    // Success checkmark appears faster
      setTimeout(() => setStep(2), 1200),   // Payment breakdown with coins
      setTimeout(() => setStep(3), 2400),   // Trophy NFT
      setTimeout(() => onComplete(), 5500)  // Hold trophy longer before exit
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a0a0b] via-[#0d1f1a] to-[#0a0a0b] backdrop-blur-md">
      {/* Animated gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center space-y-6 max-w-2xl px-4">
        {/* Step 1: Success Checkmark */}
        {step >= 1 && (
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 mb-4 drop-shadow-2xl">
              <Lottie
                animationData={successAnimation}
                loop={false}
                className="w-full h-full"
              />
            </div>
            <h2 className="text-3xl font-bold text-primary text-glow mb-2 animate-fade-in">
              Payment Released!
            </h2>
            <p className="text-xl text-primary/80 animate-fade-in">
              Transaction confirmed on-chain
            </p>
          </div>
        )}

        {/* Step 2: Payment Breakdown with Coins Animation */}
        {step >= 2 && (
          <div className="relative animate-slide-up space-y-4 pt-6">
            {/* Worker Payment Card */}
            <div className="relative z-10 transform transition-all hover:scale-105 duration-300">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-card via-card/95 to-card border-2 border-primary/50 rounded-xl shadow-2xl glow-effect-strong backdrop-blur-sm">
                <div className="flex flex-col items-start">
                  <span className="text-sm text-primary/70 font-medium mb-1">Worker Share</span>
                  <span className="text-2xl font-bold text-primary">80%</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-bold text-primary tabular-nums tracking-tight">
                    <AnimatedCounter value={reward * 0.8} duration={1200} decimals={8} />
                  </span>
                  <span className="text-sm text-primary/70 mt-1">WETH</span>
                </div>
              </div>
            </div>

            {/* Social Programs Card */}
            <div className="relative z-10 transform transition-all hover:scale-105 duration-300">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-card via-card/90 to-card border border-primary/20 rounded-xl shadow-xl backdrop-blur-sm">
                <div className="flex flex-col items-start">
                  <span className="text-sm text-muted-foreground font-medium mb-1">Social Programs</span>
                  <span className="text-xl font-bold text-primary/60">20%</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-muted-foreground tabular-nums tracking-tight">
                    <AnimatedCounter value={reward * 0.2} duration={1200} decimals={8} />
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">WETH</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Trophy NFT Minted */}
        {step >= 3 && (
          <div className="animate-scale-in pt-4">
            <div className="inline-flex flex-col items-center p-8 bg-gradient-to-b from-card/80 to-card border-2 border-primary/40 rounded-2xl shadow-2xl glow-effect-strong backdrop-blur-md">
              <p className="text-2xl font-bold text-primary mb-2">
                Reputation NFT Minted!
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm text-primary/80">
                  Achievement recorded on Scroll
                </p>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletionAnimation;
