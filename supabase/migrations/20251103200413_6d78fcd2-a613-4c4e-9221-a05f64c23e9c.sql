-- Insert initial FAQs
INSERT INTO public.faqs (category, question, answer) VALUES
('Conta e Acesso', 'Como redefinir minha senha?', 'Para redefinir sua senha, clique em "Esqueci minha senha" na tela de login e siga as instruções enviadas para seu email.'),
('Conta e Acesso', 'Como adicionar novos usuários à clínica?', 'Acesse Configurações > Profissionais, clique em "Novo Profissional" e marque a opção "Conceder acesso ao sistema".'),
('Funcionalidades', 'Como gerenciar leitos?', 'Acesse o menu Leitos para visualizar, adicionar e atualizar o status dos leitos da sua clínica.'),
('Funcionalidades', 'Como criar um relatório financeiro?', 'Vá para Financeiro > Relatórios e selecione o período desejado. Você pode exportar em PDF ou Excel.'),
('Pagamentos', 'Quais são os planos disponíveis?', 'Oferecemos três planos: Mensal (R$ 299/mês), Semestral (R$ 499/6 meses) e Anual (R$ 999/ano) com descontos progressivos.'),
('Pagamentos', 'Como alterar meu plano?', 'Acesse Configurações > Planos e Assinaturas para visualizar e alterar seu plano atual.'),
('Técnico', 'O sistema está lento, o que fazer?', 'Tente limpar o cache do navegador, verificar sua conexão com a internet ou entrar em contato com o suporte.'),
('Técnico', 'Posso usar o sistema em dispositivos móveis?', 'Sim! O sistema é totalmente responsivo e funciona em tablets e smartphones.')
ON CONFLICT DO NOTHING;