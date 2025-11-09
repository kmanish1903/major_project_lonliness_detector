import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractJSON(content: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) {
    return jsonMatch[1];
  }
  return content.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, emotionTags, currentScore } = await req.json();
    
    if (!text && !emotionTags?.length) {
      return new Response(
        JSON.stringify({ error: "Either text or emotion tags required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare context for AI analysis
    const emotionContext = emotionTags?.length 
      ? `Selected emotions: ${emotionTags.join(", ")}.` 
      : "";
    const scoreContext = currentScore 
      ? `Current mood score: ${currentScore}/10.` 
      : "";

    const systemPrompt = `You are a compassionate mental health AI assistant analyzing mood entries. Your goal is to:
1. Analyze the emotional state from the text and selected emotions
2. Identify any concerning patterns (depression, anxiety, crisis indicators)
3. Provide supportive, actionable insights
4. Detect if immediate crisis intervention is needed

Respond in JSON format with:
{
  "analysis": "Brief compassionate analysis of the mood entry",
  "concernLevel": "low" | "moderate" | "high" | "crisis",
  "suggestedMoodScore": number (1-10),
  "keywords": ["keyword1", "keyword2"],
  "isCrisis": boolean,
  "recommendations": ["action1", "action2"]
}`;

    const userPrompt = `${scoreContext} ${emotionContext}\n\nMood entry: "${text || 'No text provided'}"`;

    console.log("Analyzing mood with AI:", { text, emotionTags, currentScore });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const cleanContent = extractJSON(content);
    const analysis = JSON.parse(cleanContent);

    console.log("Mood analysis complete:", analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-mood:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});