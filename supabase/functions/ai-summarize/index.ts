import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SummarizeRequest {
  disaster_id: string;
}

function generateAISummary(disaster: any): {
  summary: string;
  key_insights: string[];
  recommended_actions: string[];
  confidence_score: number;
} {
  const severityMultiplier = {
    critical: 1.0,
    high: 0.8,
    medium: 0.6,
    low: 0.4,
  }[disaster.severity] || 0.5;

  const populationFactor = Math.min(disaster.affected_population / 10000, 1.0);
  const confidence = 0.7 + (severityMultiplier * 0.2) + (populationFactor * 0.1);

  const summary = `${disaster.disaster_type.toUpperCase()} EVENT: ${disaster.title}. ` +
    `Severity: ${disaster.severity.toUpperCase()}. Location: [${disaster.latitude.toFixed(4)}, ${disaster.longitude.toFixed(4)}]. ` +
    `Estimated ${disaster.affected_population.toLocaleString()} people affected. ` +
    `${disaster.description} Immediate response required.`;

  const key_insights = [
    `Disaster type: ${disaster.disaster_type} with ${disaster.severity} severity level`,
    `Geographic impact zone centered at coordinates [${disaster.latitude}, ${disaster.longitude}]`,
    `Population at risk: approximately ${disaster.affected_population.toLocaleString()} individuals`,
    `Status: ${disaster.status} - requires immediate attention and resource allocation`,
  ];

  const recommended_actions = [];
  
  if (disaster.severity === "critical" || disaster.severity === "high") {
    recommended_actions.push("Deploy rescue teams immediately to affected areas");
    recommended_actions.push("Establish emergency medical triage centers");
    recommended_actions.push("Activate emergency communication protocols");
  }
  
  if (disaster.affected_population > 1000) {
    recommended_actions.push("Set up temporary shelters and supply distribution points");
    recommended_actions.push("Coordinate mass evacuation if necessary");
  }
  
  recommended_actions.push("Monitor situation continuously and adjust response as needed");
  recommended_actions.push("Establish command center for coordinated response");

  return {
    summary,
    key_insights,
    recommended_actions,
    confidence_score: confidence,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "POST") {
      const { disaster_id }: SummarizeRequest = await req.json();

      const { data: disaster, error: fetchError } = await supabase
        .from("disasters")
        .select("*")
        .eq("id", disaster_id)
        .single();

      if (fetchError || !disaster) {
        throw new Error("Disaster not found");
      }

      const aiResult = generateAISummary(disaster);

      const { data: summary, error: insertError } = await supabase
        .from("ai_summaries")
        .insert({
          disaster_id,
          summary: aiResult.summary,
          key_insights: aiResult.key_insights,
          recommended_actions: aiResult.recommended_actions,
          confidence_score: aiResult.confidence_score,
          model_used: "cline-ai-v1",
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          summary,
          message: "AI summary generated successfully",
        }),
        {
          status: 201,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in ai-summarize:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});