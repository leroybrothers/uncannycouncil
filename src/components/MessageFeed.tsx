import { useRef, useEffect } from 'react';
import { Message } from '@/types/council';
import { CouncilMessage } from './CouncilMessage';

interface MessageFeedProps {
  messages: Message[];
}

export function MessageFeed({ messages }: MessageFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div 
      ref={feedRef}
      className="flex-1 overflow-y-auto scrollbar-hide"
      style={{ 
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
      }}
    >
      <div className="min-h-full flex flex-col justify-end py-32">
        {messages.map((message, index) => (
          <CouncilMessage 
            key={message.id} 
            message={message} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
