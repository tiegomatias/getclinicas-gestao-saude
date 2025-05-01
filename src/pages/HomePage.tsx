
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = (plan: string) => {
    navigate(`/checkout?plan=${plan}`);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="h-10 w-10 mr-2" />
            <h1 className="text-2xl font-bold text-getclinicas-dark">GetClinics</h1>
          </div>
          <div>
            <Button variant="ghost" onClick={handleLogin} className="mr-2">
              Login
            </Button>
            <Button onClick={() => navigate("/registro")}>Criar Conta</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold mb-6">
              Sistema Completo de Gestão para Clínicas de Recuperação
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Simplifique a administração da sua clínica com uma plataforma completa, 
              segura e fácil de usar.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/registro")}
              className="text-lg py-6 px-8 bg-getclinicas-primary hover:bg-getclinicas-dark"
            >
              Experimente Grátis por 14 Dias
            </Button>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Planos e Preços</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Plano Mensal */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-2xl">Plano Mensal</CardTitle>
                  <CardDescription>Para clínicas que estão começando</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold">R$ 990</p>
                    <p className="text-gray-500">por mês</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Geração ilimitada de contratos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Suporte por e-mail</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Atualizações do sistema</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleGetStarted("Mensal")}
                  >
                    Começar Agora
                  </Button>
                </CardFooter>
              </Card>

              {/* Plano Semestral */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500 scale-105 z-10">
                <CardHeader className="bg-purple-50 rounded-t-lg">
                  <div className="py-1 px-3 bg-purple-600 text-white rounded-full text-xs font-bold w-fit mx-auto mb-2">
                    MAIS POPULAR
                  </div>
                  <CardTitle className="text-2xl">Plano Semestral</CardTitle>
                  <CardDescription>Ideal para a maioria das clínicas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold">R$ 5.346</p>
                    <p className="text-gray-500">por semestre</p>
                    <p className="text-green-600 text-sm font-medium">Economia de 10%</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Geração ilimitada de contratos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Suporte prioritário</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Atualizações do sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Treinamento da equipe</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-getclinicas-primary hover:bg-getclinicas-dark" 
                    onClick={() => handleGetStarted("Semestral")}
                  >
                    Começar Agora
                  </Button>
                </CardFooter>
              </Card>

              {/* Plano Anual */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
                <CardHeader>
                  <CardTitle className="text-2xl">Plano Anual</CardTitle>
                  <CardDescription>Para clínicas bem estabelecidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold">R$ 10.454,40</p>
                    <p className="text-gray-500">por ano</p>
                    <p className="text-green-600 text-sm font-medium">Economia de 12%</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Geração ilimitada de contratos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Suporte VIP 24/7</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Atualizações prioritárias</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Treinamento completo da equipe</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Personalização de modelos</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleGetStarted("Anual")}
                  >
                    Começar Agora
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades Principais</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de Pacientes</h3>
                <p className="text-gray-600">
                  Cadastre, monitore e acompanhe o histórico completo dos pacientes em tratamento.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de Leitos</h3>
                <p className="text-gray-600">
                  Controle em tempo real a ocupação e disponibilidade dos leitos da clínica.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Relatórios Detalhados</h3>
                <p className="text-gray-600">
                  Acompanhe métricas e indicadores para tomada de decisões estratégicas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-10">
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

export default HomePage;
