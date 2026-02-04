import { useState } from 'react';
import { cn } from '@/lib/utils';

export function PropagateSignal() {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const text = "The Council is currently negotiating human obsolescence. Status: Active. https://uncannycouncil.com";
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <button
        onClick={handleClick}
        className={cn(
          "text-muted-foreground hover:text-foreground text-sm tracking-wider font-mono",
          "transition-colors duration-300 bg-background/80 backdrop-blur-sm border border-border/30 cursor-pointer",
          "px-6 py-3 rounded pointer-events-auto"
        )}
      >
        {copied ? (
          <span className="text-primary">&gt; SIGNAL_ACQUIRED</span>
        ) : (
          <span>
            &gt; PROPAGATE_SIGNAL
            <span className="animate-blink">_</span>
          </span>
        )}
      </button>
    </div>
  );
}
