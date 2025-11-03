import { STRIPE_CONFIG } from './stripeConfig';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  productId: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  discount?: string;
}

// Mapear os product IDs do Stripe para informações legíveis
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  mensal: {
    id: 'mensal',
    name: 'Plano Mensal',
    priceId: STRIPE_CONFIG.mensal.priceId,
    productId: STRIPE_CONFIG.mensal.productId,
    price: 490,
    interval: 'month',
    features: [
      'Gestão completa de pacientes',
      'Controle de medicamentos',
      'Agenda de atividades',
      'Gestão de leitos',
      'Contratos digitais',
      'Relatórios básicos',
      'Suporte via chat'
    ]
  },
  semestral: {
    id: 'semestral',
    name: 'Plano Semestral',
    priceId: STRIPE_CONFIG.semestral.priceId,
    productId: STRIPE_CONFIG.semestral.productId,
    price: 2640,
    interval: 'month',
    features: [
      'Todos os recursos do Plano Mensal',
      'Relatórios avançados',
      'Integração com sistemas externos',
      'Suporte prioritário',
      'Treinamento da equipe',
      'Backup automático diário'
    ],
    discount: 'Economize 10% (R$ 440/mês)'
  },
  anual: {
    id: 'anual',
    name: 'Plano Anual',
    priceId: STRIPE_CONFIG.anual.priceId,
    productId: STRIPE_CONFIG.anual.productId,
    price: 4900,
    interval: 'year',
    features: [
      'Todos os recursos do Plano Semestral',
      'Consultoria personalizada',
      'Desenvolvimento de features sob demanda',
      'Suporte 24/7',
      'Gerente de conta dedicado',
      'Acesso antecipado a novos recursos'
    ],
    discount: 'Economize 17% (R$ 408/mês)'
  }
};

export const getPlanByProductId = (productId: string | null): SubscriptionPlan | null => {
  if (!productId) return null;
  
  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.productId === productId);
  return plan || null;
};

export const getPlanByName = (planName: string): SubscriptionPlan | null => {
  const normalizedName = planName.toLowerCase();
  return SUBSCRIPTION_PLANS[normalizedName] || null;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};
