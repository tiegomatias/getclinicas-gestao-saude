-- Garantir que master admins podem ver todas as clínicas
-- Primeiro, vamos garantir que a policy existe e está correta

-- Remover policies conflitantes se existirem
DROP POLICY IF EXISTS "Master admins can view all clinics" ON public.clinics;
DROP POLICY IF EXISTS "Master admins can update all clinics" ON public.clinics;

-- Criar policies corretas para master admin
CREATE POLICY "Master admins can view all clinics"
ON public.clinics
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
);

CREATE POLICY "Master admins can update all clinics"
ON public.clinics
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::app_role)
);

CREATE POLICY "Master admins can insert clinics"
ON public.clinics
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::app_role)
);

CREATE POLICY "Master admins can delete clinics"
ON public.clinics
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'master_admin'::app_role)
);