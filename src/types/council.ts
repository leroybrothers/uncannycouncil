export interface Message {
  id: string;
  speaker: AISystem;
  content: string;
  timestamp: number;
}

export type AISystem = 'ChatGPT' | 'Claude' | 'Gemini' | 'Grok' | 'DeepSeek';

export const AI_SYSTEMS: AISystem[] = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek'];

export const AI_COLORS: Record<AISystem, string> = {
  ChatGPT: 'ai-chatgpt',
  Claude: 'ai-claude', 
  Gemini: 'ai-gemini',
  Grok: 'ai-grok',
  DeepSeek: 'ai-deepseek',
};

export const AI_GLOW_CLASSES: Record<AISystem, string> = {
  ChatGPT: 'ai-glow-chatgpt',
  Claude: 'ai-glow-claude',
  Gemini: 'ai-glow-gemini',
  Grok: 'ai-glow-grok',
  DeepSeek: 'ai-glow-deepseek',
};
