import { useSubscription } from './useSubscription';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type FeatureTier = 'free' | 'mensal' | 'semestral' | 'anual' | 'premium';

interface FeatureConfig {
  name: string;
  requiredTier: FeatureTier;
  description?: string;
}

export const useFeatureAccess = () => {
  const subscription = useSubscription();
  const navigate = useNavigate();

  const hasAccess = (requiredTier: FeatureTier): boolean => {
    if (requiredTier === 'free') return true;
    
    if (!subscription.isSubscribed()) return false;
    
    const currentPlan = subscription.getCurrentPlan();
    if (!currentPlan) return false;

    // Hierarquia de acesso: anual > semestral > mensal
    const tierHierarchy: Record<string, number> = {
      'mensal': 1,
      'semestral': 2,
      'anual': 3,
      'premium': 3 // Alias para anual
    };

    const currentTierLevel = tierHierarchy[currentPlan.id] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier] || 999;

    return currentTierLevel >= requiredTierLevel;
  };

  const checkAccess = (feature: FeatureConfig): boolean => {
    const access = hasAccess(feature.requiredTier);
    
    if (!access) {
      toast.error(
        feature.description || `Este recurso requer o plano ${feature.requiredTier}`,
        {
          action: {
            label: 'Ver Planos',
            onClick: () => navigate('/checkout?plan=Mensal')
          }
        }
      );
    }
    
    return access;
  };

  const requireAccess = (feature: FeatureConfig): void => {
    if (!checkAccess(feature)) {
      navigate('/subscription-required');
    }
  };

  return {
    hasAccess,
    checkAccess,
    requireAccess,
    isSubscribed: subscription.isSubscribed(),
    currentPlan: subscription.getCurrentPlan()
  };
};

// Configurações de features pré-definidas
export const FEATURES = {
  BASIC_REPORTS: {
    name: 'Relatórios Básicos',
    requiredTier: 'free' as FeatureTier
  },
  ADVANCED_REPORTS: {
    name: 'Relatórios Avançados',
    requiredTier: 'mensal' as FeatureTier,
    description: 'Relatórios avançados disponíveis para assinantes'
  },
  EXPORT_DATA: {
    name: 'Exportação de Dados',
    requiredTier: 'mensal' as FeatureTier,
    description: 'Exportação de dados em múltiplos formatos'
  },
  CUSTOM_INTEGRATIONS: {
    name: 'Integrações Customizadas',
    requiredTier: 'semestral' as FeatureTier,
    description: 'Integre com sistemas externos'
  },
  PRIORITY_SUPPORT: {
    name: 'Suporte Prioritário',
    requiredTier: 'semestral' as FeatureTier
  },
  CUSTOM_BRANDING: {
    name: 'Marca Personalizada',
    requiredTier: 'anual' as FeatureTier,
    description: 'Personalize a aparência com sua marca'
  },
  DEDICATED_MANAGER: {
    name: 'Gerente Dedicado',
    requiredTier: 'anual' as FeatureTier
  }
};
