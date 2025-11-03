import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle } from "lucide-react";

interface SubscriptionPromptProps {
  feature: string;
  benefits?: string[];
}

export const SubscriptionPrompt = ({ 
  feature, 
  benefits = [
    "Acesso ilimitado a todos os recursos",
    "Relatórios e analytics avançados",
    "Suporte prioritário",
    "Atualizações automáticas"
  ]
}: SubscriptionPromptProps) => {
  const navigate = useNavigate();

  return (
    <div className="py-12">
      <Card className="max-w-2xl mx-auto border-2 border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">
              Desbloqueie {feature}
            </CardTitle>
            <CardDescription className="text-base">
              Este recurso está disponível nos planos pagos
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/checkout?plan=Mensal')}
            >
              Ver Planos e Preços
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Planos a partir de R$ 490/mês • Cancele quando quiser • Sem fidelidade
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
