import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY não configurada');
      throw new Error('Configuração do Stripe não encontrada');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const { planName, priceAmount, interval, successUrl, cancelUrl } = await req.json();

    console.log('Criando checkout com dados:', { planName, priceAmount, interval });

    // Criar produto no Stripe
    const product = await stripe.products.create({
      name: planName,
      description: `Assinatura ${planName} - GetClinicas`,
    });

    console.log('Produto criado:', product.id);

    // Criar preço recorrente
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceAmount,
      currency: 'brl',
      recurring: {
        interval: interval,
      },
    });

    console.log('Preço criado:', price.id);

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR',
    });

    console.log('Sessão de checkout criada:', session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});