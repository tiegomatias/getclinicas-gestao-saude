-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Update policies that reference auth.users to use profiles table instead
-- First, create a security definer function to check if user is master admin
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND name = 'master@getclinicas.com'
  );
$$;

-- Drop existing policies that reference auth.users
DROP POLICY IF EXISTS "Users can view bed occupation data for their clinics" ON public.clinics;
DROP POLICY IF EXISTS "Usuarios podem atualizar medicamentos em sua clínica" ON public.medication_inventory;
DROP POLICY IF EXISTS "Usuarios podem atualizar prescrições em sua clínica" ON public.medication_prescriptions;
DROP POLICY IF EXISTS "Usuarios podem deletar medicamentos em sua clínica" ON public.medication_inventory;
DROP POLICY IF EXISTS "Usuarios podem ver administrações da sua clínica" ON public.medication_administrations;
DROP POLICY IF EXISTS "Usuarios podem ver histórico de estoque da sua clínica" ON public.medication_stock_history;
DROP POLICY IF EXISTS "Usuarios podem ver medicamentos da sua clínica" ON public.medication_inventory;
DROP POLICY IF EXISTS "Usuarios podem ver prescrições da sua clínica" ON public.medication_prescriptions;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view bed occupation data for their clinics"
ON public.clinics
FOR SELECT
USING (
  (auth.uid() IN (
    SELECT clinic_users.user_id
    FROM clinic_users
    WHERE clinic_users.clinic_id = clinics.id
  )) OR public.is_master_admin()
);

CREATE POLICY "Usuarios podem atualizar medicamentos em sua clínica"
ON public.medication_inventory
FOR UPDATE
USING (is_clinic_member(clinic_id) OR public.is_master_admin());

CREATE POLICY "Usuarios podem atualizar prescrições em sua clínica"
ON public.medication_prescriptions
FOR UPDATE
USING (is_clinic_member(clinic_id) OR public.is_master_admin());

CREATE POLICY "Usuarios podem deletar medicamentos em sua clínica"
ON public.medication_inventory
FOR DELETE
USING (is_clinic_member(clinic_id) OR public.is_master_admin());

CREATE POLICY "Usuarios podem ver administrações da sua clínica"
ON public.medication_administrations
FOR SELECT
USING (is_clinic_member(clinic_id) OR public.is_master_admin());

CREATE POLICY "Usuarios podem ver histórico de estoque da sua clínica"
ON public.medication_stock_history
FOR SELECT
USING (is_clinic_member(clinic_id) OR public.is_master_admin());

CREATE POLICY "Usuarios podem ver medicamentos da sua clínica"
ON public.medication_inventory
FOR SELECT
USING (is_clinic_member(clinic_id) OR public.is_master_admin());

CREATE POLICY "Usuarios podem ver prescrições da sua clínica"
ON public.medication_prescriptions
FOR SELECT
USING (is_clinic_member(clinic_id) OR public.is_master_admin());