import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumFeatureProps {
  children: ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export const PremiumFeature = ({ 
  children, 
  className,
  showOverlay = true 
}: PremiumFeatureProps) => {
  const subscription = useSubscription();
  const navigate = useNavigate();

  if (subscription.isSubscribed()) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-4 p-6">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Recurso Premium</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Faça upgrade para acessar este recurso
              </p>
            </div>
            <Button 
              onClick={() => navigate('/checkout?plan=Mensal')}
              size="sm"
            >
              Ver Planos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
