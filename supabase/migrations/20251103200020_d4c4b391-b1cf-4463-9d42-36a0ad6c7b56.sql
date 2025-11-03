-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create support_ticket_responses table
CREATE TABLE IF NOT EXISTS public.support_ticket_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create system_announcements table
CREATE TABLE IF NOT EXISTS public.system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create backup_logs table
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'in_progress')),
  type TEXT NOT NULL DEFAULT 'automatic' CHECK (type IN ('manual', 'automatic')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all new tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Master admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (is_master_admin());

CREATE POLICY "Master admins can insert tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (is_master_admin());

CREATE POLICY "Master admins can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (is_master_admin());

CREATE POLICY "Clinic users can view their clinic tickets"
  ON public.support_tickets FOR SELECT
  USING (is_clinic_member(clinic_id));

CREATE POLICY "Clinic users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (is_clinic_member(clinic_id));

-- RLS Policies for support_ticket_responses
CREATE POLICY "Master admins can view all responses"
  ON public.support_ticket_responses FOR SELECT
  USING (is_master_admin());

CREATE POLICY "Master admins can insert responses"
  ON public.support_ticket_responses FOR INSERT
  WITH CHECK (is_master_admin());

CREATE POLICY "Clinic users can view responses for their tickets"
  ON public.support_ticket_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = support_ticket_responses.ticket_id
    AND is_clinic_member(support_tickets.clinic_id)
  ));

-- RLS Policies for faqs
CREATE POLICY "Anyone can view FAQs"
  ON public.faqs FOR SELECT
  USING (true);

CREATE POLICY "Master admins can manage FAQs"
  ON public.faqs FOR ALL
  USING (is_master_admin());

-- RLS Policies for system_announcements
CREATE POLICY "Anyone can view active announcements"
  ON public.system_announcements FOR SELECT
  USING (active = true);

CREATE POLICY "Master admins can manage announcements"
  ON public.system_announcements FOR ALL
  USING (is_master_admin());

-- RLS Policies for backup_logs
CREATE POLICY "Master admins can view all backup logs"
  ON public.backup_logs FOR SELECT
  USING (is_master_admin());

CREATE POLICY "Master admins can insert backup logs"
  ON public.backup_logs FOR INSERT
  WITH CHECK (is_master_admin());

CREATE POLICY "Master admins can update backup logs"
  ON public.backup_logs FOR UPDATE
  USING (is_master_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_clinic_id ON public.support_tickets(clinic_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_ticket_responses_ticket_id ON public.support_ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON public.system_announcements(active);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);

-- Create trigger for updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on faqs
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on system_announcements
CREATE TRIGGER update_system_announcements_updated_at
  BEFORE UPDATE ON public.system_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();