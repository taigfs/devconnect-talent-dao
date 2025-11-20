import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onConnect: () => void;
}

const LandingPage = ({ onConnect }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/Logo.png" 
            alt="MintWork Logo" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            MintWork
          </h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 text-glow">
          Decentralized Talent. Verified Work. Social Impact.
        </h2>
        <p className="text-muted-foreground text-lg text-center mb-12 max-w-2xl">
          80% to talent. 20% to social programs. 100% transparent.
        </p>
        <Button
          onClick={onConnect}
          size="lg"
          className="text-lg px-12 py-6 bg-primary hover:bg-secondary text-primary-foreground font-bold uppercase tracking-wider glow-effect hover:glow-effect-strong transition-all"
        >
          Connect Wallet
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">Active Jobs</div>
            </div>
            <div className="h-12 w-px bg-border hidden md:block" />
            <div>
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Verified Workers</div>
            </div>
            <div className="h-12 w-px bg-border hidden md:block" />
            <div>
              <div className="text-2xl font-bold text-primary">2,450</div>
              <div className="text-sm text-muted-foreground">USDC Locked</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
