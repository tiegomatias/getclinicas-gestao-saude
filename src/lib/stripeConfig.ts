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
 *    - Semestral: R$ 2.640 a cada 6 meses (recurring every 6 months)
 *    - Anual: R$ 4.900/ano (recurring yearly)
 * 4. Copie os IDs gerados (product_id e price_id)
 * 5. Cole abaixo substituindo os valores placeholder
 */

export const STRIPE_CONFIG = {
  mensal: {
    productId: 'prod_TMABLR5OuXIAIf',
    priceId: 'price_1SPRrEICb7cdsHyg06wvKvVL',
  },
  semestral: {
    productId: 'prod_TMABN1bgZaj8L6',
    priceId: 'price_1SPRrVICb7cdsHygXMyLx8CF',
  },
  anual: {
    productId: 'prod_TMADuKpCMkikfz',
    priceId: 'price_1SPRtEICb7cdsHygC3bOjBXl',
  },
};

// Função helper para obter IDs por plano
export const getStripeIds = (planId: 'mensal' | 'semestral' | 'anual') => {
  return STRIPE_CONFIG[planId];
};
