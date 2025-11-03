# Implementação de Webhooks do Stripe

## Visão Geral

Este sistema implementa webhooks do Stripe para processar eventos de pagamento automaticamente, mantendo o status de assinatura sincronizado em tempo real sem necessidade de polling constante da API do Stripe.

## Arquitetura

### 1. Tabelas do Banco de Dados

#### `subscription_status`
Armazena o status atual de assinatura de cada usuário:
- `user_id`: Referência ao usuário
- `stripe_customer_id`: ID do cliente no Stripe
- `stripe_subscription_id`: ID da assinatura no Stripe
- `product_id`: ID do produto Stripe
- `status`: Status da assinatura (active, canceled, past_due, etc.)
- `current_period_start`: Início do período de cobrança
- `current_period_end`: Fim do período de cobrança
- `cancel_at_period_end`: Se a assinatura será cancelada no fim do período

#### `webhook_logs`
Registra todos os eventos de webhook recebidos para debugging e auditoria:
- `event_id`: ID único do evento do Stripe
- `event_type`: Tipo do evento (checkout.session.completed, etc.)
- `payload`: Payload completo do webhook
- `status`: Status do processamento (success, error, processing)
- `error_message`: Mensagem de erro se houver falha

### 2. Edge Function: stripe-webhook

**URL:** `https://jspfbcnpuojyhjattvrm.supabase.co/functions/v1/stripe-webhook`

**Autenticação:** Pública (verify_jwt = false) mas protegida por validação de assinatura do Stripe

#### Eventos Processados:

1. **checkout.session.completed**
   - Acionado quando um pagamento é concluído
   - Cria ou atualiza registro em `subscription_status`
   - Define status como 'active'
   - Registra IDs do Stripe e datas do período

2. **customer.subscription.updated**
   - Acionado quando uma assinatura é modificada (upgrade/downgrade)
   - Atualiza status, product_id e datas
   - Mantém sincronizado com mudanças no Stripe

3. **customer.subscription.deleted**
   - Acionado quando uma assinatura é cancelada
   - Atualiza status para 'canceled'
   - Mantém histórico no banco

4. **invoice.payment_succeeded**
   - Acionado quando uma cobrança recorrente é bem-sucedida
   - Confirma renovação da assinatura
   - Atualiza datas do novo período
   - Garante status 'active'

5. **invoice.payment_failed**
   - Acionado quando uma cobrança recorrente falha
   - Atualiza status para 'past_due'
   - Permite implementar lógica de notificação ao usuário

#### Segurança

A edge function valida a assinatura do webhook usando `STRIPE_WEBHOOK_SECRET`:

```typescript
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

Isso garante que apenas eventos legítimos do Stripe sejam processados, mesmo sendo um endpoint público.

### 3. Fluxo de Verificação de Assinatura

O `AuthContext` foi atualizado para usar uma estratégia de cache local:

```typescript
const checkSubscription = async () => {
  // 1. Tentar buscar da tabela local primeiro (rápido)
  const localStatus = await supabase
    .from('subscription_status')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (localStatus) {
    // Usa dados locais se disponível
    return localStatus;
  }

  // 2. Fallback para API do Stripe se necessário
  const stripeStatus = await supabase.functions.invoke('check-subscription');
  return stripeStatus;
};
```

**Benefícios:**
- ✅ Performance melhorada (busca local vs API externa)
- ✅ Redução de custos de API do Stripe
- ✅ Dados sempre atualizados via webhooks
- ✅ Fallback automático para garantir confiabilidade

## Configuração no Stripe Dashboard

### 1. Acessar Webhooks
https://dashboard.stripe.com/webhooks

### 2. Adicionar Endpoint
- **URL:** `https://jspfbcnpuojyhjattvrm.supabase.co/functions/v1/stripe-webhook`
- **Eventos a Selecionar:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 3. Copiar Webhook Secret
Após criar o endpoint, copie o "Signing secret" (começa com `whsec_...`) e adicione como secret `STRIPE_WEBHOOK_SECRET` no projeto.

## Monitoramento e Debugging

### Página de Logs de Webhooks

Acesse `/master/webhooks` para visualizar:
- Todos os eventos recebidos do Stripe
- Status de processamento de cada evento
- Payload completo para debugging
- Mensagens de erro detalhadas
- Atualização em tempo real via Realtime do Supabase

### Verificando Logs na Edge Function

Os logs da edge function podem ser visualizados em:
https://supabase.com/dashboard/project/jspfbcnpuojyhjattvrm/functions/stripe-webhook/logs

Cada passo do processamento é logado com detalhes:
```
[STRIPE-WEBHOOK] Webhook received
[STRIPE-WEBHOOK] Webhook signature verified - {"type":"checkout.session.completed","id":"evt_123"}
[STRIPE-WEBHOOK] Subscription created/updated - {"userId":"user-id","subscriptionId":"sub_123"}
```

## Testando a Implementação

### 1. Teste de Checkout
1. Faça um checkout de teste no ambiente de desenvolvimento
2. Use cartão de teste do Stripe: `4242 4242 4242 4242`
3. Verifique se o webhook foi recebido em `/master/webhooks`
4. Confirme que `subscription_status` foi atualizado

### 2. Teste de Webhook Manual
No Stripe Dashboard > Webhooks > [seu endpoint] > "Send test webhook"

### 3. Logs para Verificar
- Edge function logs: Confirmar recebimento e processamento
- Tabela `webhook_logs`: Verificar registro do evento
- Tabela `subscription_status`: Confirmar atualização dos dados

## Troubleshooting

### Webhook não recebe eventos
- ✅ Verifique se a URL está correta
- ✅ Confirme que o `STRIPE_WEBHOOK_SECRET` está configurado
- ✅ Verifique os logs da edge function
- ✅ Teste com "Send test webhook" no Stripe

### Assinatura não atualiza no frontend
- ✅ Verifique a tabela `subscription_status`
- ✅ Confirme que o webhook foi processado com sucesso
- ✅ Recarregue a página ou faça logout/login

### Erro de assinatura inválida
- ✅ Confirme que o `STRIPE_WEBHOOK_SECRET` está correto
- ✅ Verifique se está usando o secret do ambiente correto (test/live)
- ✅ Certifique-se de que o body do webhook não foi modificado

## Vantagens da Implementação

1. **Performance**
   - Cache local reduz latência
   - Menos chamadas à API do Stripe
   - Resposta instantânea no frontend

2. **Confiabilidade**
   - Sincronização automática via webhooks
   - Fallback para API do Stripe
   - Histórico completo de eventos

3. **Segurança**
   - Validação de assinatura do Stripe
   - RLS policies no banco de dados
   - Logs de auditoria completos

4. **Manutenibilidade**
   - Logs detalhados para debugging
   - Interface de monitoramento visual
   - Código bem documentado

## Próximos Passos Sugeridos

1. **Notificações por Email**
   - Enviar email quando pagamento falha
   - Notificar sobre renovação bem-sucedida
   - Alertar sobre cancelamento de assinatura

2. **Retry Logic**
   - Implementar retentativas automáticas para webhooks falhados
   - Queue system para processar eventos em ordem

3. **Métricas e Analytics**
   - Dashboard de conversão de checkout
   - Taxa de cancelamento (churn)
   - MRR (Monthly Recurring Revenue)

4. **Testes Automatizados**
   - Unit tests para processamento de webhooks
   - Integration tests com Stripe mock
