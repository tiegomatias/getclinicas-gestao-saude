-- Criar tabela de audit logs para rastreamento de ações
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Apenas master admins podem ver e inserir logs
CREATE POLICY "Master admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'master_admin'::app_role));

CREATE POLICY "Master admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'master_admin'::app_role));

-- Função para limpar logs antigos (manter últimos 90 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$;

-- Comentários para documentação
COMMENT ON TABLE public.audit_logs IS 'Registro de auditoria de todas as ações importantes do sistema';
COMMENT ON COLUMN public.audit_logs.action IS 'Tipo de ação: CREATE, UPDATE, DELETE, VIEW, LOGIN, etc.';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'Tipo de entidade afetada: clinic, user, patient, etc.';
COMMENT ON COLUMN public.audit_logs.details IS 'Detalhes adicionais da ação em formato JSON';