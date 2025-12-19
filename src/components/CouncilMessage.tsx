import { Message, AI_COLORS } from '@/types/council';
import { cn } from '@/lib/utils';

interface CouncilMessageProps {
  message: Message;
  index: number;
}

export function CouncilMessage({ message, index }: CouncilMessageProps) {
  const colorClass = AI_COLORS[message.speaker];
  
  return (
    <div 
      className={cn(
        "opacity-0 animate-fade-in-up",
        "py-6 px-4"
      )}
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div className="max-w-2xl mx-auto">
        <span 
          className={cn(
            "font-display text-sm tracking-wide uppercase mb-2 block",
            `text-${colorClass}`
          )}
          style={{ color: `hsl(var(--${colorClass}))` }}
        >
          {message.speaker}
        </span>
        <p className="text-foreground/90 text-lg leading-relaxed font-light">
          {message.content}
        </p>
      </div>
    </div>
  );
}
