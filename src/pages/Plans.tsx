import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, ArrowLeft } from "lucide-react";
import { SUBSCRIPTION_PLANS, formatPrice } from "@/lib/subscriptionPlans";

// Custom Logo SVG Component
const GetClinicasLogo = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary"
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

const Plans = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    navigate(`/checkout?plan=${planId.charAt(0).toUpperCase() + planId.slice(1)}`);
  };

  const plans = [
    SUBSCRIPTION_PLANS.mensal,
    SUBSCRIPTION_PLANS.semestral,
    SUBSCRIPTION_PLANS.anual
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GetClinicasLogo />
            <h1 className="text-2xl font-bold">GetClinicas</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Escolha seu Plano</h2>
          <p className="text-xl text-muted-foreground">
            Selecione o plano ideal para sua clínica e comece a transformar sua gestão
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const isRecommended = plan.id === 'anual';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isRecommended ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Econômico
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.interval === 'month' ? 'mês' : 'ano'}
                      </span>
                    </div>
                    {plan.discount && (
                      <p className="text-primary font-semibold mt-2">{plan.discount}</p>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full"
                    variant={isRecommended ? "default" : "outline"}
                    size="lg"
                  >
                    Selecionar {plan.name}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="bg-card rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-4 text-center">
            Todos os planos incluem:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Suporte técnico especializado</span>
            </div>
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Atualizações automáticas do sistema</span>
            </div>
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Segurança e backup de dados</span>
            </div>
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Acesso via web de qualquer lugar</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted/50 py-10 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0 gap-2">
              <GetClinicasLogo />
              <span className="text-xl font-bold">GetClinicas</span>
            </div>
            <div className="text-muted-foreground">
              &copy; {new Date().getFullYear()} GetClinicas. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Plans;
