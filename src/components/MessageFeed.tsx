import { Message } from '@/types/council';
import { CouncilMessage } from './CouncilMessage';

interface MessageFeedProps {
  messages: Message[];
}

export function MessageFeed({ messages }: MessageFeedProps) {
  // Reverse to show newest at top
  const reversedMessages = [...messages].reverse();

  return (
    <div 
      className="flex-1 overflow-y-auto scrollbar-hide"
      style={{ 
        maskImage: 'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)'
      }}
    >
      <div className="py-32">
        {reversedMessages.map((message, index) => (
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
