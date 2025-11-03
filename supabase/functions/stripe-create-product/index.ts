import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CREATE-PRODUCT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email || user.email !== 'master@getclinicas.com') {
      throw new Error("Unauthorized: Only master admin can create products");
    }

    logStep("User authenticated", { userId: user.id });

    const { productName, productDescription, priceAmount, priceCurrency, recurringInterval } = await req.json();

    if (!productName || !priceAmount) {
      throw new Error("Missing required fields: productName and priceAmount");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    logStep("Creating product in Stripe", { productName });

    // Create product
    const product = await stripe.products.create({
      name: productName,
      description: productDescription || '',
      active: true,
    });

    logStep("Product created", { productId: product.id });

    // Create price
    const priceData: any = {
      product: product.id,
      unit_amount: Math.round(parseFloat(priceAmount) * 100), // Convert to cents
      currency: priceCurrency || 'brl',
      active: true,
    };

    if (recurringInterval) {
      priceData.recurring = {
        interval: recurringInterval,
      };
    }

    const price = await stripe.prices.create(priceData);

    logStep("Price created", { priceId: price.id });

    // Update product with default price
    await stripe.products.update(product.id, {
      default_price: price.id,
    });

    return new Response(JSON.stringify({
      product,
      price
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
