import { useRef } from 'react';
import { Message, AI_COLORS } from '@/types/council';
import { cn } from '@/lib/utils';
interface CouncilMessageProps {
  message: Message;
  index: number;
}

export function CouncilMessage({ message, index }: CouncilMessageProps) {
  const colorClass = AI_COLORS[message.speaker];
  const delayRef = useRef<number | null>(null);

  // Keep the initial stagger delay stable per message so re-ordering the list
  // doesn't restart animations and leave older messages invisible.
  if (delayRef.current === null) {
    delayRef.current = Math.min(index, 12) * 80; // cap stagger for long sessions
  }

  return (
    <article
      className={cn(
        "py-6 px-4",
        "motion-safe:animate-fade-in"
      )}
      style={{
        animationDelay: `${delayRef.current}ms`,
        animationFillMode: 'both',
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
    </article>
  );
}
