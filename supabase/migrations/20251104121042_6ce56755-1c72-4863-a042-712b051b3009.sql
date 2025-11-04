-- Adicionar papel de master_admin para o usuário tiego@getclinicas.com
INSERT INTO user_roles (user_id, role)
VALUES ('70ace865-4f19-4dd7-ac36-614c1a348fdb', 'master_admin')
ON CONFLICT (user_id, role) DO NOTHING;