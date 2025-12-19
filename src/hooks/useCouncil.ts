import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, AISystem, AI_SYSTEMS } from '@/types/council';
import { supabase } from '@/integrations/supabase/client';

const CONVERSATION_DELAY = 7000; // 7 seconds between messages

export function useCouncil() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<AISystem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const conversationRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  const detectAddressedAI = useCallback((content: string, currentSpeaker: AISystem | null): AISystem | null => {
    // Check if the message directly addresses another AI by name
    for (const ai of AI_SYSTEMS) {
      if (ai !== currentSpeaker && content.includes(ai)) {
        return ai;
      }
    }
    return null;
  }, []);

  const getNextSpeaker = useCallback((current: AISystem | null, lastMessage?: Message): AISystem => {
    if (!current) {
      return AI_SYSTEMS[Math.floor(Math.random() * AI_SYSTEMS.length)];
    }
    
    // If last message addressed someone directly, they should respond
    if (lastMessage) {
      const addressed = detectAddressedAI(lastMessage.content, current);
      if (addressed) {
        return addressed;
      }
    }
    
    // Otherwise pick a random different AI
    const others = AI_SYSTEMS.filter(ai => ai !== current);
    return others[Math.floor(Math.random() * others.length)];
  }, [detectAddressedAI]);

  const generateMessage = useCallback(async (speaker: AISystem, history: Message[]) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('council-speak', {
        body: {
          currentSpeaker: speaker,
          conversationHistory: history.slice(-10).map(m => ({
            speaker: m.speaker,
            content: m.content
          }))
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      return {
        id: crypto.randomUUID(),
        speaker: data.speaker as AISystem,
        content: data.content,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error generating message:', err);
      throw err;
    }
  }, []);

  const runConversation = useCallback(async () => {
    if (!isRunningRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const lastMessage = messages[messages.length - 1];
      const speaker = getNextSpeaker(currentSpeaker, lastMessage);
      setCurrentSpeaker(speaker);

      const newMessage = await generateMessage(speaker, messages);
      
      setMessages(prev => [...prev, newMessage]);
      
      // Schedule next message
      conversationRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          runConversation();
        }
      }, CONVERSATION_DELAY);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Retry after a longer delay on error
      conversationRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          runConversation();
        }
      }, CONVERSATION_DELAY * 2);
    } finally {
      setIsLoading(false);
    }
  }, [currentSpeaker, messages, getNextSpeaker, generateMessage]);

  const startConversation = useCallback(() => {
    isRunningRef.current = true;
    runConversation();
  }, [runConversation]);

  const stopConversation = useCallback(() => {
    isRunningRef.current = false;
    if (conversationRef.current) {
      clearTimeout(conversationRef.current);
      conversationRef.current = null;
    }
  }, []);

  const joinLate = useCallback(() => {
    stopConversation();
    setMessages([]);
    setCurrentSpeaker(null);
    setError(null);
    // Small delay before restarting
    setTimeout(() => {
      startConversation();
    }, 500);
  }, [stopConversation, startConversation]);

  // Start conversation on mount
  useEffect(() => {
    startConversation();
    return () => stopConversation();
  }, []); // Empty deps - only run on mount

  return {
    messages,
    isLoading,
    currentSpeaker,
    error,
    joinLate
  };
}
