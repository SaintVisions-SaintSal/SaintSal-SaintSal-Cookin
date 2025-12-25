// Supabase Edge Function: GHL Tier Update
// Securely updates user tier after GHL payment verification
// Uses service_role to bypass RLS and validate GHL product IDs

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TierLimits {
  tier: string;
  price_cents: number;
  ghl_product_id: string;
  monthly_request_limit: number;
  features: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authenticated user from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Client for user authentication (uses anon key)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Service client for admin operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { ghl_product_id, ghl_contact_id, ghl_location_id } = await req.json();

    if (!ghl_product_id) {
      return new Response(
        JSON.stringify({ error: "Missing ghl_product_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Look up tier from tier_limits table
    const { data: tierLimit, error: tierError } = await supabaseAdmin
      .from("tier_limits")
      .select("*")
      .eq("ghl_product_id", ghl_product_id)
      .single();

    if (tierError || !tierLimit) {
      return new Response(
        JSON.stringify({
          error: "Invalid GHL product ID",
          details: tierError?.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tier = tierLimit.tier as string;
    const requestLimit = tierLimit.monthly_request_limit as number;

    // Update user profile atomically
    const updateData: any = {
      tier,
      request_limit: requestLimit,
      monthly_requests: 0, // Reset on tier upgrade
      last_request_reset: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    };

    // Add GHL IDs if provided
    if (ghl_contact_id) {
      updateData.ghl_contact_id = ghl_contact_id;
    }
    if (ghl_location_id) {
      updateData.ghl_location_id = ghl_location_id;
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update profile",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Tier updated successfully",
        data: {
          tier: updatedProfile.tier,
          request_limit: updatedProfile.request_limit,
          monthly_requests: updatedProfile.monthly_requests,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

