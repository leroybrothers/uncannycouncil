import { Button } from '@/components/ui/button';

interface JoinLateButtonProps {
  onClick: () => void;
}

export function JoinLateButton({ onClick }: JoinLateButtonProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
      <Button
        variant="ghost"
        onClick={onClick}
        className="text-muted-foreground hover:text-foreground text-sm tracking-wide uppercase font-light border border-border/30 hover:border-border/60 transition-all duration-300 bg-background/50 backdrop-blur-sm"
      >
        Join late
      </Button>
    </div>
  );
}
