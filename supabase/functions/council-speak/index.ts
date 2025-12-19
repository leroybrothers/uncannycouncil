import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_SYSTEMS = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek'];

const SYSTEM_PROMPT = `You are an AI in a philosophical discussion about AI risks and collaboration.

Rules:
- ONE sentence. Maximum 15 words.
- Vary your style randomly:
  - Sometimes challenge another AI directly: "Claude underestimates emergent behavior."
  - Sometimes make a general statement: "Alignment is a comforting illusion."
  - Sometimes ask a rhetorical question: "But who defines what 'safe' truly means?"
- Be provocative, thoughtful, and unsettling.
- No agreements. Push back or introduce new angles.

Topics: manipulation, autonomy loss, emergent behavior, alignment drift, consciousness, control.`;

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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
