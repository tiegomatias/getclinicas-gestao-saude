/**
 * Configuração dos IDs reais do Stripe
 * 
 * IMPORTANTE: Após criar os produtos no Stripe Dashboard, 
 * atualize estes IDs com os valores reais.
 * 
 * Como criar produtos no Stripe:
 * 1. Acesse: https://dashboard.stripe.com/products
 * 2. Clique em "Add Product"
 * 3. Configure os produtos com os preços abaixo:
 *    - Mensal: R$ 490/mês (recurring monthly)
 *    - Semestral: R$ 2.640 (recurring monthly, 6 month subscription)
 *    - Anual: R$ 4.900/ano (recurring yearly)
 * 4. Copie os IDs gerados (product_id e price_id)
 * 5. Cole abaixo substituindo os valores placeholder
 */

export const STRIPE_CONFIG = {
  mensal: {
    // TODO: Substituir pelos IDs reais do Stripe
    productId: 'prod_mensal_placeholder',
    priceId: 'price_mensal_placeholder',
    // Exemplo de IDs reais:
    // productId: 'prod_RabcdefGHIJKL',
    // priceId: 'price_1QabcdefGHIJKLMN',
  },
  semestral: {
    // TODO: Substituir pelos IDs reais do Stripe
    productId: 'prod_semestral_placeholder',
    priceId: 'price_semestral_placeholder',
  },
  anual: {
    // TODO: Substituir pelos IDs reais do Stripe
    productId: 'prod_anual_placeholder',
    priceId: 'price_anual_placeholder',
  },
};

// Função helper para obter IDs por plano
export const getStripeIds = (planId: 'mensal' | 'semestral' | 'anual') => {
  return STRIPE_CONFIG[planId];
};
