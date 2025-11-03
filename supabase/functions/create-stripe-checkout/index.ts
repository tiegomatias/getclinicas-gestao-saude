import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento dos planos para os IDs do Stripe
const STRIPE_PLANS = {
  mensal: {
    productId: 'prod_TMABLR5OuXIAIf',
    priceId: 'price_1SPRrEICb7cdsHyg06wvKvVL',
  },
  semestral: {
    productId: 'prod_TMABN1bgZaj8L6',
    priceId: 'price_1SPRrVICb7cdsHygXMyLx8CF',
  },
  anual: {
    productId: 'prod_TMADuKpCMkikfz',
    priceId: 'price_1SPRtEICb7cdsHygC3bOjBXl',
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep('Stripe key verified');

    // Criar cliente Supabase com SERVICE_ROLE_KEY
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep('No authorization header');
      throw new Error('No authorization header provided');
    }
    logStep('Authorization header found');

    const token = authHeader.replace('Bearer ', '');
    logStep('Authenticating user with token');
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep('Auth error', { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logStep('No user or email');
      throw new Error('User not authenticated or email not available');
    }
    logStep('User authenticated', { userId: user.id, email: user.email });

    const { planId, successUrl, cancelUrl } = await req.json();
    logStep('Request data', { planId, successUrl, cancelUrl });

    // Validar o planId
    const normalizedPlanId = planId.toLowerCase() as keyof typeof STRIPE_PLANS;
    if (!STRIPE_PLANS[normalizedPlanId]) {
      throw new Error(`Plano inválido: ${planId}. Use mensal, semestral ou anual`);
    }

    const plan = STRIPE_PLANS[normalizedPlanId];
    logStep('Using existing Stripe plan', plan);

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });

    // Verificar se o cliente já existe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep('Found existing customer', { customerId });
    } else {
      logStep('No existing customer, will create during checkout');
    }

    // Criar sessão de checkout usando o priceId existente
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR',
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_id: normalizedPlanId,
      }
    });

    logStep('Checkout session created', { 
      sessionId: session.id, 
      productId: plan.productId, 
      priceId: plan.priceId 
    });

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        productId: plan.productId,
        priceId: plan.priceId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in create-checkout', { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});