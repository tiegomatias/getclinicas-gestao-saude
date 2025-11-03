-- Create subscription_status table
CREATE TABLE IF NOT EXISTS public.subscription_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  product_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_subscription_status_user_id ON public.subscription_status(user_id);
CREATE INDEX idx_subscription_status_stripe_customer_id ON public.subscription_status(stripe_customer_id);
CREATE INDEX idx_subscription_status_stripe_subscription_id ON public.subscription_status(stripe_subscription_id);

-- Enable RLS
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription status"
  ON public.subscription_status
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription status"
  ON public.subscription_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription status"
  ON public.subscription_status
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Master admins can view all subscription statuses"
  ON public.subscription_status
  FOR SELECT
  USING (is_master_admin());

CREATE POLICY "Master admins can update all subscription statuses"
  ON public.subscription_status
  FOR UPDATE
  USING (is_master_admin());

-- Trigger to update updated_at
CREATE TRIGGER update_subscription_status_updated_at
  BEFORE UPDATE ON public.subscription_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create webhook_logs table for debugging and auditing
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  UNIQUE(event_id)
);

-- Create index for webhook logs
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_processed_at ON public.webhook_logs(processed_at DESC);

-- Enable RLS on webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only master admins can view webhook logs
CREATE POLICY "Master admins can view webhook logs"
  ON public.webhook_logs
  FOR SELECT
  USING (is_master_admin());