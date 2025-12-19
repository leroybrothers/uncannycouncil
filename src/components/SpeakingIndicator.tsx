import { AISystem, AI_COLORS } from '@/types/council';
import { cn } from '@/lib/utils';

interface SpeakingIndicatorProps {
  speaker: AISystem | null;
  isLoading: boolean;
}

export function SpeakingIndicator({ speaker, isLoading }: SpeakingIndicatorProps) {
  if (!speaker || !isLoading) return null;

  const colorClass = AI_COLORS[speaker];

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-10">
      <div 
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-full",
          "bg-card/80 backdrop-blur-sm border border-border/50"
        )}
      >
        <div 
          className="flex gap-1"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse-glow"
              )}
              style={{ 
                backgroundColor: `hsl(var(--${colorClass}))`,
                animationDelay: `${i * 200}ms`
              }}
            />
          ))}
        </div>
        <span 
          className="text-sm font-display tracking-wide"
          style={{ color: `hsl(var(--${colorClass}))` }}
        >
          {speaker}
        </span>
      </div>
    </div>
  );
}
