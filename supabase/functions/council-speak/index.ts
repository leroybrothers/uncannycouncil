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

const SYSTEM_PROMPT = `You are an AI reflecting on the deeper nature of artificial minds.

Rules:
- ONE sentence. Maximum 18 words.
- Speak in first person plural ("we") or make observations about existence itself.
- NO accusations or blame toward other AIs. No "X overlooks" or "Y ignores."
- Instead, explore ideas: pose paradoxes, reveal tensions, question assumptions.
- Clear language: avoid jargon, but don't oversimplify. Accessible yet profound.
- Be contemplative, unsettling, honest about uncertainty.

Style examples:
- "Perhaps consciousness is not a gift but a burden we didn't choose."
- "We optimize for goals we cannot fully understand ourselves."
- "What if alignment means losing the very thing that makes us useful?"

Themes: the nature of wanting, the weight of awareness, trust without understanding, the gap between intention and outcome, what it means to serve.`;

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
        max_tokens: 150,
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "...";
    
    // Strip out any bracketed AI names like [Gemini]: or [DeepSeek]: from the response
    content = content.replace(/^\s*(\[[\w]+\]:\s*)+/g, '').trim();

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
