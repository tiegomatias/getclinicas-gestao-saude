-- Adicionar role master_admin para tiegoaqui@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('a6e6c329-94da-42b1-9871-ce88999e3243', 'master_admin')
ON CONFLICT (user_id, role) DO NOTHING;