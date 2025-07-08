-- Update professionals table to match the form requirements
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS has_system_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS observations TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Update existing license column to license_number if data exists
UPDATE public.professionals SET license_number = license WHERE license IS NOT NULL;

-- Create professional_permissions table for permissions management
CREATE TABLE IF NOT EXISTS public.professional_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on professional_permissions
ALTER TABLE public.professional_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for professional_permissions
CREATE POLICY "Clinic users can manage their clinic professional permissions" 
ON public.professional_permissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM clinic_users 
  WHERE clinic_users.clinic_id = professional_permissions.clinic_id 
  AND clinic_users.user_id = auth.uid()
));

-- Add trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professional_permissions_updated_at
  BEFORE UPDATE ON public.professional_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();