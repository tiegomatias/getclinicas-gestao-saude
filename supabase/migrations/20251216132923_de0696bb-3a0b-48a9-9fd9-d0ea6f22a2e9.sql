-- Adicionar campos de desconto e data de vencimento na tabela contracts
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS discount_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS due_date timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT NULL;