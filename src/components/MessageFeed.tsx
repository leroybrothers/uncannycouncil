import { Message } from '@/types/council';
import { CouncilMessage } from './CouncilMessage';

interface MessageFeedProps {
  messages: Message[];
}

export function MessageFeed({ messages }: MessageFeedProps) {
  // Reverse to show newest at top
  const reversedMessages = [...messages].reverse();

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
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
