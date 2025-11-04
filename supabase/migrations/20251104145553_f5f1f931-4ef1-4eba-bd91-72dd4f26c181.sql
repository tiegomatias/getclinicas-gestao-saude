-- Deletar FAQs fake
DELETE FROM faqs;

-- Inserir FAQs reais sobre o GetClinicas
INSERT INTO faqs (category, question, answer) VALUES
-- Categoria: Primeiros Passos
('Primeiros Passos', 'O que é o GetClinicas?', 'O GetClinicas é um sistema completo de gestão para clínicas de reabilitação e recuperação. Oferece controle de leitos, gestão de pacientes, prontuário eletrônico, administração de medicamentos, controle financeiro e muito mais, tudo em uma plataforma integrada.'),

('Primeiros Passos', 'Como faço para começar a usar o sistema?', 'Após criar sua conta, você terá acesso ao painel principal. Recomendamos começar configurando os leitos da sua clínica, cadastrando profissionais e depois adicionando os primeiros pacientes. Nossa equipe oferece suporte para implementação inicial.'),

('Primeiros Passos', 'Posso importar dados de outro sistema?', 'Sim! Entre em contato com nosso suporte através do WhatsApp (13) 97404-0377 para auxiliar na migração dos seus dados. Suportamos importação de pacientes, profissionais e histórico de atendimentos.'),

-- Categoria: Gestão de Leitos
('Gestão de Leitos', 'Como gerenciar a ocupação de leitos?', 'No módulo Leitos você pode visualizar todos os leitos, seu status (ocupado, disponível, manutenção) e qual paciente está em cada um. O sistema atualiza automaticamente os indicadores de ocupação no dashboard.'),

('Gestão de Leitos', 'Posso vincular pacientes aos leitos?', 'Sim! Ao cadastrar ou editar um paciente, você pode vinculá-lo a um leito específico. O sistema controla automaticamente as internações e libera o leito quando há alta.'),

-- Categoria: Pacientes e Prontuário
('Pacientes e Prontuário', 'Como funciona o prontuário eletrônico?', 'O prontuário digital permite registrar todas as informações do paciente: dados pessoais, histórico médico, medicações, evoluções clínicas, documentos e contratos. Tudo centralizado e acessível com permissões configuráveis.'),

('Pacientes e Prontuário', 'Posso anexar documentos aos pacientes?', 'Sim! Você pode fazer upload de documentos (RG, CPF, laudos médicos, exames) diretamente no cadastro do paciente. Os arquivos ficam armazenados com segurança na nuvem.'),

('Pacientes e Prontuário', 'Como registrar a admissão de um paciente?', 'Ao cadastrar um novo paciente, selecione o tipo de admissão (voluntária, involuntária ou compulsória). O sistema registra automaticamente a data de admissão e permite vincular a um leito disponível.'),

-- Categoria: Medicamentos
('Medicamentos', 'Como controlar o estoque de medicamentos?', 'O módulo de Medicamentos oferece controle completo do estoque, com alertas de medicamentos próximos ao vencimento e níveis baixos de estoque. Você pode registrar entradas, saídas e ajustes de estoque.'),

('Medicamentos', 'Como fazer prescrições médicas?', 'Na ficha do paciente, acesse Medicamentos > Nova Prescrição. Selecione o medicamento do estoque, defina dosagem, frequência e período de tratamento. O sistema cria automaticamente a agenda de administração.'),

('Medicamentos', 'Como registrar a administração de medicamentos?', 'No módulo de Medicamentos > Administrações, você visualiza todas as medicações programadas. Ao marcar como administrada, registre o horário, dosagem e responsável. Tudo fica documentado no prontuário.'),

-- Categoria: Equipe e Profissionais
('Equipe e Profissionais', 'Como adicionar profissionais ao sistema?', 'Acesse Profissionais > Novo Profissional. Cadastre os dados (nome, profissão, registro profissional) e defina se terá acesso ao sistema. Você pode configurar permissões específicas para cada profissional.'),

('Equipe e Profissionais', 'Posso controlar o que cada profissional acessa?', 'Sim! No cadastro do profissional, você define permissões por módulo: visualizar, editar ou excluir. Assim cada membro da equipe só acessa o necessário para sua função.'),

('Equipe e Profissionais', 'Como registrar atividades e atendimentos?', 'No módulo Agenda você pode criar atividades terapêuticas, consultas e atendimentos. Vincule profissionais e pacientes, defina horários e o sistema gera automaticamente a agenda da clínica.'),

-- Categoria: Financeiro
('Financeiro', 'Como gerenciar o financeiro da clínica?', 'O módulo Financeiro permite registrar receitas (mensalidades, convênios) e despesas (fornecedores, salários). Gere relatórios por período, categoria ou paciente para controle completo do fluxo de caixa.'),

('Financeiro', 'Posso gerar boletos para mensalidades?', 'Atualmente o sistema registra as receitas, mas a geração de boletos está em desenvolvimento. Entre em contato para saber sobre integrações com sistemas de pagamento.'),

('Financeiro', 'Como funcionam os contratos?', 'No módulo Contratos você cria e gerencia contratos de internação, define valores mensais e vincula ao paciente. O sistema gera o documento em PDF para assinatura e acompanhamento.'),

-- Categoria: Alimentação
('Alimentação', 'Como funciona o controle de alimentação?', 'O módulo Alimentação gerencia o estoque de alimentos (dispensa), lista de compras de supermercado e registros de refeições dos pacientes. Ideal para controle nutricional e planejamento de cardápio.'),

('Alimentação', 'Posso registrar as refeições dos pacientes?', 'Sim! Registre cada refeição (café da manhã, almoço, jantar) com os alimentos consumidos. O histórico fica disponível para análise nutricional e acompanhamento.'),

-- Categoria: Relatórios
('Relatórios', 'Que tipos de relatórios posso gerar?', 'O sistema oferece relatórios de ocupação de leitos, lista de pacientes ativos, histórico de admissões e altas, consumo de medicamentos, relatórios financeiros e muito mais. Todos exportáveis em PDF e Excel.'),

('Relatórios', 'Como exportar dados do sistema?', 'Na maioria dos módulos você encontra o botão "Exportar" que permite baixar os dados em formato Excel (.xlsx) ou PDF, facilitando análises externas e auditorias.'),

-- Categoria: Planos e Pagamento
('Planos e Pagamento', 'Quais são os planos disponíveis?', 'Oferecemos três planos: Mensal (R$ 490/mês), Semestral (R$ 440/mês faturado semestralmente) e Anual (R$ 408/mês faturado anualmente). Todos incluem todos os módulos e suporte técnico.'),

('Planos e Pagamento', 'Posso testar o sistema antes de assinar?', 'Sim! Entre em contato pelo WhatsApp (13) 97404-0377 para agendar uma demonstração personalizada. Mostraremos todas as funcionalidades e como o GetClinicas pode otimizar sua clínica.'),

('Planos e Pagamento', 'Como funciona o cancelamento?', 'Você pode cancelar a qualquer momento sem multas. No plano mensal, cancele até 5 dias antes do vencimento. Nos planos semestral e anual, o cancelamento vale para o próximo período.'),

-- Categoria: Suporte e Segurança
('Suporte e Segurança', 'Como entro em contato com o suporte?', 'Nosso suporte está disponível pelo WhatsApp (13) 97404-0377 em horário comercial. Também pode abrir tickets diretamente pelo sistema no menu Suporte.'),

('Suporte e Segurança', 'Meus dados estão seguros?', 'Sim! Utilizamos criptografia de ponta a ponta, backups automáticos diários e servidores em nuvem de alta disponibilidade. Seguimos todas as normas da LGPD para proteção de dados sensíveis.'),

('Suporte e Segurança', 'O sistema está em conformidade com a LGPD?', 'Sim! O GetClinicas foi desenvolvido seguindo todas as diretrizes da Lei Geral de Proteção de Dados. Você tem controle total sobre os dados, com logs de auditoria e permissões granulares.'),

('Suporte e Segurança', 'Posso acessar de qualquer lugar?', 'Sim! O GetClinicas é 100% online e responsivo. Acesse de qualquer computador, tablet ou smartphone com internet, a qualquer hora e de qualquer lugar.');
