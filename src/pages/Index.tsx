import { useCouncil } from '@/hooks/useCouncil';
import { CouncilHeader } from '@/components/CouncilHeader';
import { MessageFeed } from '@/components/MessageFeed';
import { SpeakingIndicator } from '@/components/SpeakingIndicator';
import { PropagateSignal } from '@/components/PropagateSignal';

const Index = () => {
  const { messages, isLoading, currentSpeaker } = useCouncil();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card opacity-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ai-gemini/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ai-claude/5 rounded-full blur-3xl" />
      </div>

      <CouncilHeader />
      
      <main className="flex-1 flex flex-col relative z-0 pt-24 pb-20">
        <MessageFeed messages={messages} />
      </main>

      <PropagateSignal />

      <SpeakingIndicator speaker={currentSpeaker} isLoading={isLoading} />
    </div>
  );
};

export default Index;
