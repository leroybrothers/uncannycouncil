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
    <div className="flex justify-center pb-4">
      <button
        onClick={handleClick}
        className={cn(
          "text-muted-foreground hover:text-foreground text-sm tracking-wider font-mono",
          "transition-colors duration-300 bg-transparent border-none cursor-pointer",
          "px-4 py-2"
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
