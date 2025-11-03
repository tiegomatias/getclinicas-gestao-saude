import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Get the Stripe signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No stripe-signature header");
      return new Response(JSON.stringify({ error: "No signature provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get the raw body for signature verification
    const body = await req.text();
    
    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      logStep("ERROR: Missing Stripe credentials");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type, id: event.id });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Log the webhook event
    const { error: logError } = await supabaseAdmin
      .from("webhook_logs")
      .insert({
        event_id: event.id,
        event_type: event.type,
        payload: event as any,
        status: "processing",
      });

    if (logError) {
      logStep("WARNING: Failed to log webhook event", { error: logError.message });
    }

    // Process different event types
    let processingError: string | null = null;

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          logStep("Processing checkout.session.completed");
          const session = event.data.object as Stripe.Checkout.Session;
          
          if (session.mode === "subscription" && session.customer && session.subscription) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const productId = subscription.items.data[0]?.price.product as string;
            
            // Find user by email
            const customerEmail = session.customer_details?.email || session.customer_email;
            if (!customerEmail) {
              throw new Error("No customer email found");
            }

            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
            if (userError) throw userError;

            const user = userData.users.find(u => u.email === customerEmail);
            if (!user) {
              throw new Error(`User not found for email: ${customerEmail}`);
            }

            // Upsert subscription status
            const { error: upsertError } = await supabaseAdmin
              .from("subscription_status")
              .upsert({
                user_id: user.id,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                product_id: productId,
                status: "active",
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: "user_id",
              });

            if (upsertError) throw upsertError;
            
            logStep("Subscription created/updated", { 
              userId: user.id, 
              subscriptionId: session.subscription,
              productId 
            });
          }
          break;
        }

        case "customer.subscription.updated": {
          logStep("Processing customer.subscription.updated");
          const subscription = event.data.object as Stripe.Subscription;
          
          // Find user by stripe customer ID
          const { data: subStatus, error: findError } = await supabaseAdmin
            .from("subscription_status")
            .select("user_id")
            .eq("stripe_customer_id", subscription.customer as string)
            .single();

          if (findError || !subStatus) {
            throw new Error("Subscription status not found for customer");
          }

          const productId = subscription.items.data[0]?.price.product as string;

          // Update subscription status
          const { error: updateError } = await supabaseAdmin
            .from("subscription_status")
            .update({
              stripe_subscription_id: subscription.id,
              product_id: productId,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", subStatus.user_id);

          if (updateError) throw updateError;
          
          logStep("Subscription updated", { 
            userId: subStatus.user_id,
            status: subscription.status,
            productId 
          });
          break;
        }

        case "customer.subscription.deleted": {
          logStep("Processing customer.subscription.deleted");
          const subscription = event.data.object as Stripe.Subscription;
          
          // Update subscription status to canceled
          const { error: updateError } = await supabaseAdmin
            .from("subscription_status")
            .update({
              status: "canceled",
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", subscription.customer as string);

          if (updateError) throw updateError;
          
          logStep("Subscription canceled", { customerId: subscription.customer });
          break;
        }

        case "invoice.payment_succeeded": {
          logStep("Processing invoice.payment_succeeded");
          const invoice = event.data.object as Stripe.Invoice;
          
          if (invoice.subscription) {
            // Get subscription details
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            
            // Update subscription with new period dates
            const { error: updateError } = await supabaseAdmin
              .from("subscription_status")
              .update({
                status: "active",
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_customer_id", invoice.customer as string);

            if (updateError) throw updateError;
            
            logStep("Payment succeeded, subscription renewed", { 
              customerId: invoice.customer 
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          logStep("Processing invoice.payment_failed");
          const invoice = event.data.object as Stripe.Invoice;
          
          // Update subscription status to past_due
          const { error: updateError } = await supabaseAdmin
            .from("subscription_status")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", invoice.customer as string);

          if (updateError) throw updateError;
          
          logStep("Payment failed, subscription marked as past_due", { 
            customerId: invoice.customer 
          });
          break;
        }

        default:
          logStep("Unhandled event type", { type: event.type });
      }
    } catch (err) {
      processingError = err.message;
      logStep("ERROR processing event", { error: err.message });
    }

    // Update webhook log with final status
    await supabaseAdmin
      .from("webhook_logs")
      .update({
        status: processingError ? "error" : "success",
        error_message: processingError,
      })
      .eq("event_id", event.id);

    return new Response(
      JSON.stringify({ 
        received: true,
        eventType: event.type,
        status: processingError ? "error" : "success" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: processingError ? 500 : 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("FATAL ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
