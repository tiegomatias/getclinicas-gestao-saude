import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Verificar se o usuário é master admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRoles || userRoles.role !== 'master_admin') {
      throw new Error("Unauthorized: Only master admins can access this");
    }

    // Obter clinic_id do corpo da requisição
    const { clinicId } = await req.json();
    if (!clinicId) throw new Error("Clinic ID is required");

    // Buscar usuários da clínica
    const { data: clinicUsers, error: clinicUsersError } = await supabaseClient
      .from("clinic_users")
      .select("id, user_id, role, created_at")
      .eq("clinic_id", clinicId);

    if (clinicUsersError) throw clinicUsersError;

    // Buscar informações dos usuários usando admin client
    const usersWithDetails = await Promise.all(
      (clinicUsers || []).map(async (cu) => {
        // Buscar profile
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("name")
          .eq("id", cu.user_id)
          .single();

        // Buscar email do auth.users usando admin
        const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(
          cu.user_id
        );

        return {
          ...cu,
          email: authUser?.email || "N/A",
          name: profile?.name || "N/A",
        };
      })
    );

    return new Response(JSON.stringify({ users: usersWithDetails }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
