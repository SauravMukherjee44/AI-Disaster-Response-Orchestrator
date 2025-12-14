import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DisasterWebhookPayload {
  title: string;
  description: string;
  disaster_type: string;
  severity: string;
  latitude: number;
  longitude: number;
  affected_population?: number;
  metadata?: Record<string, any>;
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
      const payload: DisasterWebhookPayload = await req.json();

      const { data: disaster, error: insertError } = await supabase
        .from("disasters")
        .insert({
          title: payload.title,
          description: payload.description,
          disaster_type: payload.disaster_type,
          severity: payload.severity || "medium",
          latitude: payload.latitude,
          longitude: payload.longitude,
          affected_population: payload.affected_population || 0,
          status: "active",
          metadata: payload.metadata || {},
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          disaster,
          message: "Disaster event created successfully",
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

    if (req.method === "GET") {
      const { data: disasters, error } = await supabase
        .from("disasters")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, disasters }),
        {
          status: 200,
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
    console.error("Error in kestra-webhook:", error);
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