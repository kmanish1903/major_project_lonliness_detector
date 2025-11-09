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
    const { moodScore, recentMoods, healthConditions } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const moodContext = recentMoods?.length 
      ? `Recent mood pattern: ${recentMoods.join(", ")}/10` 
      : `Current mood: ${moodScore}/10`;
    
    const healthContext = healthConditions?.length
      ? `Health conditions: ${healthConditions.join(", ")}`
      : "";

    const systemPrompt = `You are a supportive mental health AI creating personalized daily goals. Generate 3-5 achievable goals based on the user's current mental state and health conditions.

Goals should be:
- Specific and actionable
- Appropriate for their current mood level
- Evidence-based for mental health improvement
- Varied (social, exercise, mindfulness, self-care)

Respond in JSON format with:
{
  "goals": [
    {
      "title": "Goal title",
      "description": "Brief description",
      "category": "social" | "exercise" | "mindfulness" | "self-care",
      "difficulty": "easy" | "medium" | "hard",
      "rationale": "Why this goal helps"
    }
  ]
}`;

    const userPrompt = `${moodContext}. ${healthContext}\n\nGenerate personalized daily goals for mental wellness.`;

    console.log("Generating goals with AI:", { moodScore, recentMoods, healthConditions });

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

    console.log("Goals generated:", result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-goals:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});