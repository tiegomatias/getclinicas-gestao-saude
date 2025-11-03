
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan, formatPrice } from "@/lib/subscriptionPlans";
import { useAuth } from "@/contexts/AuthContext";

// Custom Logo SVG Component
const GetClinicasLogo = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-getclinicas-primary"
  >
    <path
      d="M12 2L4 6V12C4 17.55 7.84 22.74 12 24C16.16 22.74 20 17.55 20 12V6L12 2Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M12 2L4 6V12C4 17.55 7.84 22.74 12 24C16.16 22.74 20 17.55 20 12V6L12 2ZM18 12C18 16.5 14.87 20.74 12 21.82C9.13 20.74 6 16.5 6 12V7.4L12 4.66L18 7.4V12Z"
      fill="currentColor"
    />
    <text
      x="12"
      y="14"
      fontSize="9"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      G
    </text>
  </svg>
);

// Mapeamento de nomes de URL para IDs de planos
const planUrlMapping: Record<string, string> = {
  "Mensal": "mensal",
  "Semestral": "semestral",
  "Anual": "anual"
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar um plano");
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Get the plan from the URL query parameter
    const params = new URLSearchParams(location.search);
    const planParam = params.get("plan");
    
    if (planParam && planParam in planUrlMapping) {
      const planId = planUrlMapping[planParam];
      const plan = SUBSCRIPTION_PLANS[planId];
      if (plan) {
        setSelectedPlan(plan);
      } else {
        toast.error("Plano não encontrado");
        navigate("/");
      }
    } else {
      toast.error("Plano não encontrado");
      navigate("/");
    }
  }, [location.search, navigate]);

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    
    try {
      // Criar checkout session no Stripe usando o planId
      const { data: createData, error: createError } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          planId: selectedPlan.id,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout?plan=${selectedPlan.id}`
        }
      });

      if (createError) {
        console.error('Erro ao criar checkout:', createError);
        toast.error("Erro ao criar sessão de pagamento. Tente novamente.");
        setLoading(false);
        return;
      }

      if (createData?.url) {
        // Redirecionar para o Stripe Checkout
        window.location.href = createData.url;
      } else {
        toast.error("Erro ao obter URL de pagamento.");
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
      setLoading(false);
    }
  };
  
  const handleBackToPlans = () => {
    navigate("/");
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Plano não encontrado</h2>
              <Button onClick={() => navigate("/")}>Voltar para página inicial</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <GetClinicasLogo />
            <h1 className="text-2xl font-bold text-getclinicas-dark ml-2">GetClinicas</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={handleBackToPlans} 
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para planos</span>
        </Button>
        
        <h2 className="text-3xl font-bold text-center mb-8">Finalizar Contratação</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{selectedPlan.name}</h3>
                <span className="text-xl font-bold">{formatPrice(selectedPlan.price)}</span>
              </div>
              
              <p className="text-gray-500">
                Período: {selectedPlan.interval === 'month' ? 'mensal' : 'anual'}
                {selectedPlan.discount && (
                  <span className="block text-getclinicas-primary">{selectedPlan.discount}</span>
                )}
              </p>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-semibold">O que está incluído:</h4>
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Dados para Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-left">
                Ao prosseguir, você será redirecionado para nossa página de pagamento 
                segura, onde poderá finalizar sua assinatura com os métodos de 
                pagamento disponíveis.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Métodos de pagamento aceitos:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Cartões de crédito (Visa, Mastercard, Amex, Elo)</li>
                  <li>• Boleto bancário</li>
                  <li>• PIX</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2 text-blue-800">Importante:</h4>
                <p className="text-sm text-blue-700">
                  Seu acesso será liberado assim que o pagamento for confirmado.
                  Em caso de dúvidas, entre em contato com nosso suporte.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCheckout}
                className="w-full bg-getclinicas-primary hover:bg-getclinicas-dark"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Prosseguir para Pagamento Seguro"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <GetClinicasLogo />
              <span className="text-xl font-bold">GetClinicas</span>
            </div>
            <div className="text-gray-600">
              &copy; {new Date().getFullYear()} GetClinicas. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
