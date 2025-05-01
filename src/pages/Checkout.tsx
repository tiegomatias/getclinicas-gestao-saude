
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type PlanDetails = {
  name: string;
  price: string;
  period: string;
  discount?: string;
  features: string[];
};

const plans: Record<string, PlanDetails> = {
  "Mensal": {
    name: "Plano Mensal",
    price: "R$ 990",
    period: "mês",
    features: [
      "Acesso completo ao sistema",
      "Geração ilimitada de contratos",
      "Suporte por e-mail",
      "Atualizações do sistema"
    ]
  },
  "Semestral": {
    name: "Plano Semestral",
    price: "R$ 5.346",
    period: "semestre",
    discount: "Economia de 10%",
    features: [
      "Acesso completo ao sistema",
      "Geração ilimitada de contratos",
      "Suporte prioritário",
      "Atualizações do sistema",
      "Treinamento da equipe"
    ]
  },
  "Anual": {
    name: "Plano Anual",
    price: "R$ 10.454,40",
    period: "ano",
    discount: "Economia de 12%",
    features: [
      "Acesso completo ao sistema",
      "Geração ilimitada de contratos",
      "Suporte VIP 24/7",
      "Atualizações prioritárias",
      "Treinamento completo da equipe",
      "Personalização de modelos"
    ]
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get the plan from the URL query parameter
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    
    if (plan && plan in plans) {
      setSelectedPlan(plan);
    } else {
      toast.error("Plano não encontrado");
      navigate("/");
    }
  }, [location.search, navigate]);

  const handleCheckout = () => {
    setLoading(true);
    // Simulate checkout process
    setTimeout(() => {
      toast.success("Redirecionando para pagamento...");
      navigate("/login");
      setLoading(false);
    }, 1500);
  };
  
  const handleBackToPlans = () => {
    navigate("/");
  };

  if (!selectedPlan || !(selectedPlan in plans)) {
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

  const planDetails = plans[selectedPlan];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="h-10 w-10 mr-2" />
            <h1 className="text-2xl font-bold text-getclinicas-dark">GetClinics</h1>
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
                <h3 className="text-xl font-bold">{planDetails.name}</h3>
                <span className="text-xl font-bold">{planDetails.price}</span>
              </div>
              
              <p className="text-gray-500">
                Período: {planDetails.period}
                {planDetails.discount && (
                  <span className="block text-getclinicas-primary">{planDetails.discount}</span>
                )}
              </p>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-semibold">O que está incluído:</h4>
                <ul className="space-y-2">
                  {planDetails.features.map((feature, index) => (
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
              <p>
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
                {loading ? "Processando..." : "Prosseguir para Pagamento"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/placeholder.svg" alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">GetClinics</span>
            </div>
            <div className="text-gray-600">
              &copy; {new Date().getFullYear()} GetClinics. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
