import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, AISystem, AI_SYSTEMS } from '@/types/council';
import { supabase } from '@/integrations/supabase/client';

const BASE_DELAY = 5000; // 5 seconds minimum
const MS_PER_WORD = 250; // ~240 words/min reading speed

// Calculate delay based on message length
function getReadingDelay(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = wordCount * MS_PER_WORD;
  return Math.max(BASE_DELAY, Math.min(readingTime, 20000)); // clamp 5-20 seconds
}

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

  const generateMessage = useCallback(async (speaker: AISystem, history: Message[]): Promise<{ message?: Message; retryable?: boolean }> => {
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

      if (fnError) {
        console.error('Function error:', fnError);
        return { retryable: true };
      }
      
      if (data?.error) {
        console.warn('API returned error:', data.error);
        return { retryable: data.retry === true };
      }

      return {
        message: {
          id: crypto.randomUUID(),
          speaker: data.speaker as AISystem,
          content: data.content,
          timestamp: Date.now()
        }
      };
    } catch (err) {
      console.error('Error generating message:', err);
      return { retryable: true };
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

      const result = await generateMessage(speaker, messages);
      
      if (result.message) {
        setMessages(prev => [...prev, result.message!]);
        // Schedule next message with dynamic delay based on content length
        const delay = getReadingDelay(result.message.content);
        conversationRef.current = setTimeout(() => {
          if (isRunningRef.current) {
            runConversation();
          }
        }, delay);
      } else {
        // No message returned, retry with appropriate delay
        const retryDelay = result.retryable ? 3000 : BASE_DELAY * 2;
        conversationRef.current = setTimeout(() => {
          if (isRunningRef.current) {
            runConversation();
          }
        }, retryDelay);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Retry after a longer delay on unexpected error
      conversationRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          runConversation();
        }
      }, BASE_DELAY * 2);
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
