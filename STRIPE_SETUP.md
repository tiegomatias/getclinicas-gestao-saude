# 🔐 Configuração do Stripe - Sistema de Assinaturas

## ⚠️ IMPORTANTE: Configuração Obrigatória

Para que o sistema de assinaturas funcione corretamente, você **PRECISA** criar os produtos no Stripe e atualizar os IDs no código.

---

## 📋 Passo a Passo

### 1️⃣ Criar Produtos no Stripe Dashboard

Acesse: https://dashboard.stripe.com/products

#### Produto 1: Plano Mensal
- **Nome**: Plano Mensal - GetClinicas
- **Preço**: R$ 490,00
- **Tipo**: Recurring (Recorrente)
- **Intervalo**: Monthly (Mensal)
- **Moeda**: BRL (Real Brasileiro)

#### Produto 2: Plano Semestral
- **Nome**: Plano Semestral - GetClinicas
- **Preço**: R$ 2.640,00
- **Tipo**: Recurring (Recorrente)
- **Intervalo**: Monthly (Mensal) com 6 meses de duração
- **Moeda**: BRL (Real Brasileiro)

#### Produto 3: Plano Anual
- **Nome**: Plano Anual - GetClinicas
- **Preço**: R$ 4.900,00
- **Tipo**: Recurring (Recorrente)
- **Intervalo**: Yearly (Anual)
- **Moeda**: BRL (Real Brasileiro)

---

### 2️⃣ Copiar os IDs Gerados

Após criar cada produto, o Stripe irá gerar:
- **Product ID** (ex: `prod_RabcdefGHIJKL`)
- **Price ID** (ex: `price_1QabcdefGHIJKLMN`)

⚠️ **Copie estes IDs com cuidado!**

---

### 3️⃣ Atualizar o Arquivo de Configuração

Abra o arquivo: `src/lib/stripeConfig.ts`

Substitua os valores placeholder pelos IDs reais:

```typescript
export const STRIPE_CONFIG = {
  mensal: {
    productId: 'prod_SEU_ID_AQUI',  // ← Cole o Product ID do Plano Mensal
    priceId: 'price_SEU_ID_AQUI',   // ← Cole o Price ID do Plano Mensal
  },
  semestral: {
    productId: 'prod_SEU_ID_AQUI',  // ← Cole o Product ID do Plano Semestral
    priceId: 'price_SEU_ID_AQUI',   // ← Cole o Price ID do Plano Semestral
  },
  anual: {
    productId: 'prod_SEU_ID_AQUI',  // ← Cole o Product ID do Plano Anual
    priceId: 'price_SEU_ID_AQUI',   // ← Cole o Price ID do Plano Anual
  },
};
```

---

### 4️⃣ Configurar o Customer Portal (Opcional mas Recomendado)

Para permitir que usuários gerenciem suas assinaturas:

1. Acesse: https://dashboard.stripe.com/settings/billing/portal
2. Clique em "Activate test mode" ou "Activate"
3. Configure as opções de cancelamento e alteração de plano
4. Salve as configurações

---

## ✅ Verificação

Após configurar, teste o sistema:

1. **Teste o Checkout**
   - Vá em `/checkout?plan=Mensal`
   - Complete um pagamento de teste
   - Use o cartão de teste: `4242 4242 4242 4242`

2. **Verifique a Assinatura**
   - Faça login
   - Vá em Configurações > Assinatura
   - Confirme que o status aparece como "Ativa"

3. **Teste o Portal de Gerenciamento**
   - Em Configurações > Assinatura
   - Clique em "Gerenciar Assinatura"
   - Verifique se o portal do Stripe abre corretamente

---

## 🔍 Troubleshooting

### Erro: "Product not found"
- Verifique se os IDs foram copiados corretamente
- Confirme que está usando a chave API correta (test vs live)

### Checkout não funciona
- Verifique se a chave secreta do Stripe está configurada
- Confirme que os produtos estão ativos no Stripe

### Portal não abre
- Certifique-se de que o Customer Portal está ativado
- Verifique se há uma assinatura ativa para o usuário

---

## 📞 Suporte

Para mais informações, consulte:
- [Documentação do Stripe](https://stripe.com/docs)
- [API do Stripe](https://stripe.com/docs/api)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

---

**Última atualização**: Janeiro 2025
