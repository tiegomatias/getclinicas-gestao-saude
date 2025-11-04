import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requirePlan?: string[]; // IDs dos planos que dão acesso
}

export const SubscriptionGuard = ({ 
  children, 
  fallback,
  requirePlan 
}: SubscriptionGuardProps) => {
  const subscription = useSubscription();
  const { isMasterAdmin } = useAuth();
  const navigate = useNavigate();

  // Master admin sempre tem acesso
  if (isMasterAdmin) {
    return <>{children}</>;
  }

  // Se não precisa de plano específico, só verifica se tem assinatura ativa
  if (!requirePlan && subscription.isSubscribed()) {
    return <>{children}</>;
  }

  // Se precisa de plano específico, verifica se o plano atual está na lista
  if (requirePlan) {
    const currentPlan = subscription.getCurrentPlan();
    if (currentPlan && requirePlan.includes(currentPlan.id)) {
      return <>{children}</>;
    }
  }

  // Se tem fallback customizado, usa ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // Fallback padrão
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Recurso Premium</CardTitle>
          <CardDescription>
            Este recurso está disponível apenas para assinantes.
            {requirePlan && requirePlan.length > 0 && (
              <span className="block mt-2">
                Planos necessários: {requirePlan.join(', ')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Faça upgrade do seu plano para ter acesso a este e outros recursos exclusivos.
          </p>
          <Button 
            className="w-full" 
            onClick={() => navigate('/checkout')}
          >
            Ver Planos Disponíveis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
