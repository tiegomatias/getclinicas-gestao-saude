import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Lock, Sparkles } from "lucide-react";

export default function SubscriptionRequired() {
  const navigate = useNavigate();
  const { isMasterAdmin } = useAuth();

  // Master admin não precisa de assinatura, redirecionar para dashboard
  useEffect(() => {
    if (isMasterAdmin) {
      navigate("/dashboard");
    }
  }, [isMasterAdmin, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[600px] p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Recurso Premium</CardTitle>
          <CardDescription className="text-base">
            Esta funcionalidade está disponível apenas para assinantes ativos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Benefícios da Assinatura:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Acesso completo a todos os recursos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Relatórios avançados e analytics</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Atualizações e novos recursos</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1" 
              onClick={() => navigate('/checkout?plan=Mensal')}
            >
              Ver Planos
            </Button>
            <Button 
              variant="outline"
              className="flex-1" 
              onClick={() => navigate('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Planos a partir de R$ 490/mês • Cancele quando quiser
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
