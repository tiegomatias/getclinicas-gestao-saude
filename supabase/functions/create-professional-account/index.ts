import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateAccountRequest {
  email: string;
  password: string;
  professionalName: string;
  clinicId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, professionalName, clinicId }: CreateAccountRequest = await req.json();

    // Validate required fields
    if (!email || !password || !professionalName || !clinicId) {
      return new Response(
        JSON.stringify({ error: 'Email, password, professional name, and clinic ID are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Creating user account for professional:', professionalName, 'with email:', email);

    // Create the user account
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: professionalName,
        role: 'professional'
      },
      email_confirm: true // Auto-confirm email for professional accounts
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user account', 
          details: createUserError.message 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('User created successfully:', userData.user?.id);

    // Create clinic_users association
    const { error: clinicUserError } = await supabaseAdmin
      .from('clinic_users')
      .insert({
        clinic_id: clinicId,
        user_id: userData.user.id,
        role: 'professional'
      });

    if (clinicUserError) {
      console.error('Error creating clinic_users association:', clinicUserError);
      // Note: We don't return error here as the user was created successfully
      // The association can be created manually if needed
    } else {
      console.log('Clinic_users association created successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userData.user.id,
        message: 'Professional account created successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in create-professional-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);