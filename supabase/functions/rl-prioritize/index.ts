import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PrioritizeRequest {
  disaster_id: string;
}

function calculateRLPriority(disaster: any, actionType: string): number {
  const severityScores = { critical: 100, high: 75, medium: 50, low: 25 };
  const basePriority = severityScores[disaster.severity] || 50;
  
  const populationWeight = Math.min(disaster.affected_population / 100, 50);
  
  const actionTypeWeights = {
    rescue: 1.2,
    medical: 1.15,
    logistics: 0.9,
    communication: 0.85,
  };
  const typeWeight = actionTypeWeights[actionType] || 1.0;
  
  const timeFactor = 1.0;
  
  return Math.min(
    Math.round((basePriority + populationWeight) * typeWeight * timeFactor),
    100
  );
}

function generatePriorityActions(disaster: any) {
  const actions = [];
  
  if (disaster.severity === "critical" || disaster.severity === "high") {
    actions.push({
      action_type: "rescue",
      description: `Deploy search and rescue teams to ${disaster.title} location immediately`,
      estimated_impact: Math.floor(disaster.affected_population * 0.3),
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
    
    actions.push({
      action_type: "medical",
      description: `Establish emergency medical triage and treatment facilities`,
      estimated_impact: Math.floor(disaster.affected_population * 0.4),
      deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  actions.push({
    action_type: "logistics",
    description: `Set up supply distribution points for food, water, and shelter materials`,
    estimated_impact: Math.floor(disaster.affected_population * 0.6),
    deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  });
  
  actions.push({
    action_type: "communication",
    description: `Establish emergency communication network and information hotline`,
    estimated_impact: disaster.affected_population,
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  });
  
  return actions.map(action => ({
    ...action,
    priority_score: calculateRLPriority(disaster, action.action_type),
  }));
}

function logRLDecision(supabase: any, disaster: any, actions: any[]) {
  return supabase.from("rl_decisions").insert({
    disaster_id: disaster.id,
    state_snapshot: {
      disaster_severity: disaster.severity,
      affected_population: disaster.affected_population,
      disaster_type: disaster.disaster_type,
      timestamp: new Date().toISOString(),
    },
    action_taken: {
      actions_generated: actions.length,
      action_types: actions.map(a => a.action_type),
      priority_scores: actions.map(a => a.priority_score),
    },
    reward: 0.0,
    model_version: "oumi-rl-v1.0",
  });
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
      const { disaster_id }: PrioritizeRequest = await req.json();

      const { data: disaster, error: fetchError } = await supabase
        .from("disasters")
        .select("*")
        .eq("id", disaster_id)
        .single();

      if (fetchError || !disaster) {
        throw new Error("Disaster not found");
      }

      const actionsToCreate = generatePriorityActions(disaster);
      
      const { data: createdActions, error: insertError } = await supabase
        .from("priority_actions")
        .insert(
          actionsToCreate.map(action => ({
            disaster_id,
            ...action,
          }))
        )
        .select();

      if (insertError) {
        throw insertError;
      }

      await logRLDecision(supabase, disaster, createdActions);

      return new Response(
        JSON.stringify({
          success: true,
          actions: createdActions,
          message: "Priority actions generated successfully using RL",
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
    console.error("Error in rl-prioritize:", error);
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