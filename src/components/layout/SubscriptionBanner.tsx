import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard } from 'lucide-react';

export const SubscriptionBanner = () => {
  const subscription = useSubscription();
  const { isMasterAdmin } = useAuth();
  const navigate = useNavigate();

  // Master admin não precisa ver o banner
  if (isMasterAdmin) {
    return null;
  }

  // Não mostra nada se a assinatura está ativa e não expira em breve
  if (!subscription.isExpiringSoon() && !subscription.isExpired() && subscription.isSubscribed()) {
    return null;
  }

  // Sem assinatura
  if (!subscription.isSubscribed()) {
    return (
      <Alert className="mb-6">
        <CreditCard className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Você está usando a versão de teste. Assine para ter acesso completo.
          </span>
          <Button 
            size="sm" 
            variant="default"
            onClick={() => navigate('/checkout')}
          >
            Ver Planos
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Expirando em breve
  if (subscription.isExpiringSoon()) {
    const days = subscription.daysUntilRenewal();
    return (
      <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between text-yellow-800">
          <span>
            Sua assinatura expira em {days} {days === 1 ? 'dia' : 'dias'}.
          </span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/configuracoes?tab=assinatura')}
          >
            Gerenciar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Expirada
  if (subscription.isExpired()) {
    return (
      <Alert className="mb-6 border-red-500/50 bg-red-500/10">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between text-red-800">
          <span>
            Sua assinatura expirou. Renove para continuar usando todos os recursos.
          </span>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => navigate('/checkout')}
          >
            Renovar Agora
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
