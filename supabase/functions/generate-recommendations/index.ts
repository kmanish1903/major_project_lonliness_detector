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
    const { moodScore, emotionTags, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const emotionContext = emotionTags?.length 
      ? `Emotions: ${emotionTags.join(", ")}` 
      : "";

    const systemPrompt = `You are a mental health wellness AI providing personalized activity recommendations. Based on the user's mood and emotions, suggest activities that can improve their mental well-being.

Provide recommendations for:
- Social connection activities
- Physical exercises
- Mindfulness practices
- Content (music, videos, podcasts)
- Self-care activities

Respond in JSON format with:
{
  "recommendations": [
    {
      "type": "social" | "exercise" | "mindfulness" | "content" | "self-care",
      "title": "Activity title",
      "description": "Brief description",
      "duration": "Estimated time",
      "benefit": "How it helps",
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

    const userPrompt = `Mood score: ${moodScore}/10. ${emotionContext}. ${context || ""}\n\nGenerate personalized wellness recommendations.`;

    console.log("Generating recommendations:", { moodScore, emotionTags });

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
        temperature: 0.8,
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
    const result = JSON.parse(cleanContent);

    console.log("Recommendations generated:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});