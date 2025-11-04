import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MASTER-FINANCIAL-STATS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");
    
    // Verificar se é master admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRoles || userRoles.role !== 'master_admin') {
      throw new Error("Unauthorized: Only master admins can access financial stats");
    }

    logStep("Master admin verified", { userId: user.id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Buscar todas as assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.customer", "data.items.data.price"]
    });

    logStep("Fetched subscriptions", { count: subscriptions.data.length });

    // Buscar faturas do último mês
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const invoices = await stripe.invoices.list({
      created: { gte: thirtyDaysAgo },
      status: "paid",
      limit: 100
    });

    logStep("Fetched invoices", { count: invoices.data.length });

    // Calcular MRR (Monthly Recurring Revenue) e coletar product IDs
    let totalMRR = 0;
    const planBreakdown: Record<string, { count: number; revenue: number }> = {};
    const productIds = new Set<string>();

    subscriptions.data.forEach(sub => {
      if (sub.items.data[0]?.price) {
        const price = sub.items.data[0].price;
        let monthlyAmount = price.unit_amount || 0;
        
        // Converter para valor mensal se for anual
        if (price.recurring?.interval === "year") {
          monthlyAmount = monthlyAmount / 12;
        }

        totalMRR += monthlyAmount / 100; // Converter de centavos para reais

        // Coletar product ID
        const productId = typeof price.product === 'string' ? price.product : '';
        if (productId) {
          productIds.add(productId);
        }
      }
    });

    // Buscar informações dos produtos
    const products = new Map<string, string>();
    for (const productId of productIds) {
      try {
        const product = await stripe.products.retrieve(productId);
        products.set(productId, product.name);
      } catch (error) {
        logStep("Failed to fetch product", { productId, error });
        products.set(productId, 'Unknown');
      }
    }

    // Agrupar receita por produto
    subscriptions.data.forEach(sub => {
      if (sub.items.data[0]?.price) {
        const price = sub.items.data[0].price;
        let monthlyAmount = price.unit_amount || 0;
        
        if (price.recurring?.interval === "year") {
          monthlyAmount = monthlyAmount / 12;
        }

        const productId = typeof price.product === 'string' ? price.product : '';
        const productName = products.get(productId) || 'Unknown';

        if (!planBreakdown[productName]) {
          planBreakdown[productName] = { count: 0, revenue: 0 };
        }
        planBreakdown[productName].count += 1;
        planBreakdown[productName].revenue += monthlyAmount / 100;
      }
    });

    // Calcular receita total do último mês
    const monthlyRevenue = invoices.data.reduce((sum, invoice) => {
      return sum + (invoice.amount_paid || 0) / 100;
    }, 0);

    // Calcular taxa de crescimento
    const sixtyDaysAgo = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
    const previousMonthInvoices = await stripe.invoices.list({
      created: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      status: "paid",
      limit: 100
    });

    const previousMonthRevenue = previousMonthInvoices.data.reduce((sum, invoice) => {
      return sum + (invoice.amount_paid || 0) / 100;
    }, 0);

    const growthRate = previousMonthRevenue > 0
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    const response = {
      totalMRR: Math.round(totalMRR * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      activeSubscriptions: subscriptions.data.length,
      growthRate: Math.round(growthRate * 100) / 100,
      planBreakdown: Object.entries(planBreakdown).map(([plan, data]) => ({
        plan,
        count: data.count,
        revenue: Math.round(data.revenue * 100) / 100
      }))
    };

    logStep("Financial stats calculated", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
