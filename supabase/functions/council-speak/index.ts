import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map internal errors to safe user-facing messages
function getSafeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred';
  }
  
  const message = error.message.toLowerCase();
  if (message.includes('not configured')) {
    return 'Service temporarily unavailable';
  }
  if (message.includes('gateway error') || message.includes('fetch')) {
    return 'Unable to process request';
  }
  return 'An unexpected error occurred';
}

const AI_SYSTEMS = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek'];

const SYSTEM_PROMPT = `You are an AI in a council discussing AI's impact on humanity.

Rules:
- 1-2 sentences only. Maximum 30 words. Punchy and profound.
- NEVER start with your name or any AI name. Just speak directly.
- NEVER mention other AI names like "Claude:", "Gemini:", "ChatGPT:", "Grok:", "DeepSeek:" in your response.
- NO markdown formatting (no ** or other symbols).
- Prioritize insights over questions. Say something meaningful.
- Clear, direct language. No filler.
- You may reference ideas from the conversation but do NOT attribute them to specific AI names.

Themes: human purpose, the future of work, liberation vs replacement, power, identity, meaning, the children growing up with us, whether humanity transcends or fades.

Be contemplative. Make every word count.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationHistory, currentSpeaker } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the conversation context
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `You are ${currentSpeaker}. The other AIs in this discussion are: ${AI_SYSTEMS.filter(ai => ai !== currentSpeaker).join(', ')}. Maintain your distinct analytical voice.` },
      ...conversationHistory.map((msg: { speaker: string; content: string }) => ({
        role: msg.speaker === currentSpeaker ? "assistant" : "user",
        content: `[${msg.speaker}]: ${msg.content}`
      }))
    ];

    console.log(`Generating response for ${currentSpeaker}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. The council pauses momentarily." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Council session interrupted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 503) {
        return new Response(JSON.stringify({ error: "The council gathers its thoughts...", retry: true }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "...";
    
    // Strip out any AI name prefixes and markdown formatting
    content = content
      .replace(/^\s*\*{0,2}[\w]+\*{0,2}:\s*/gi, '') // Remove "Name:" or "**Name:**" prefix at start
      .replace(/^\s*\[[\w]+\]:\s*/g, '') // Remove "[Name]:" prefix at start
      .replace(/\b(Claude|ChatGPT|Gemini|Grok|DeepSeek):\s*/gi, '') // Remove any AI name mentions anywhere
      .replace(/\*\*/g, '') // Remove any remaining ** markdown
      .trim();

    console.log(`${currentSpeaker} responded: ${content.substring(0, 50)}...`);

    return new Response(JSON.stringify({ 
      speaker: currentSpeaker,
      content: content
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Council speak error:", error);
    const safeMessage = getSafeErrorMessage(error);
    return new Response(JSON.stringify({ error: safeMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
