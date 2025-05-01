import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, CheckIcon, DollarSign, UserIcon, FileText, FileIcon } from "lucide-react";
import { toast } from "sonner";

const HomePage = () => {
  const navigate = useNavigate();

  const handleDemoAccess = () => {
    toast.info("Acessando demonstração...");
    navigate("/login");
  };

  const handleContractButton = () => {
    toast.info("Funcionalidade em desenvolvimento");
    navigate("/login");
  };

  const handlePricingButton = (plan: string) => {
    toast.success(`Plano ${plan} selecionado. Prosseguindo para checkout...`);
    navigate(`/checkout?plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/placeholder.svg" alt="Logo" className="h-10 w-10 mr-2" />
            <h1 className="text-2xl font-bold text-getclinicas-dark">GetClinics</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="bg-white hover:bg-gray-50"
          >
            Acessar Sistema
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-getclinicas-dark">
            Sistema de Gestão para Clínicas de Recuperação
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A solução completa para gerenciamento de pacientes, leitos, profissionais, 
            agendamentos e controle financeiro para clínicas de recuperação.
          </p>
          <Button 
            className="bg-getclinicas-primary hover:bg-getclinicas-dark text-lg px-8 py-6 h-auto"
            onClick={() => navigate("/login")}
          >
            Começar Agora
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-t-4 border-t-getclinicas-primary shadow-md">
            <CardContent className="pt-6">
              <div className="rounded-full bg-getclinicas-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <UserIcon className="h-6 w-6 text-getclinicas-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão de Pacientes</h3>
              <p className="text-gray-600">
                Cadastro completo de pacientes, histórico clínico, documentos e acompanhamento de evolução.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-getclinicas-primary shadow-md">
            <CardContent className="pt-6">
              <div className="rounded-full bg-getclinicas-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <CalendarIcon className="h-6 w-6 text-getclinicas-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Agendamentos</h3>
              <p className="text-gray-600">
                Controle de agenda de profissionais, consultas, terapias e atividades em grupo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-getclinicas-primary shadow-md">
            <CardContent className="pt-6">
              <div className="rounded-full bg-getclinicas-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-getclinicas-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão Financeira</h3>
              <p className="text-gray-600">
                Controle financeiro, faturamento, convênios e relatórios gerenciais para sua clínica.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Nova seção de geração de contratos */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">Geração de Contratos Simplificada</h3>
              <p className="text-gray-600 mb-4">
                Crie contratos profissionais em segundos com nosso sistema intuitivo. 
                Personalize modelos pré-aprovados para cada paciente e imprima ou 
                envie por e-mail diretamente da plataforma.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Modelos de contratos personalizáveis</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Preenchimento automático de dados</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Exportação para PDF e impressão</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Seguro e em conformidade com a LGPD</span>
                </li>
              </ul>
              <Button 
                variant="outline"
                className="border-getclinicas-primary text-getclinicas-primary hover:bg-getclinicas-primary hover:text-white"
                onClick={handleContractButton}
              >
                Experimente Agora
              </Button>
            </div>
            <div className="md:w-1/2">
              <div className="relative bg-gray-100 rounded-lg p-4 shadow-md">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="pt-4">
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 text-getclinicas-primary mr-2" />
                    <h4 className="font-semibold">Contrato de Prestação de Serviços</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-11/12"></div>
                    <div className="h-3 bg-gray-300 rounded w-10/12"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-9/12"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-11/12"></div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <div className="h-8 w-20 bg-getclinicas-primary rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nova seção de planos */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Escolha o Plano Ideal para sua Clínica</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Plano Mensal */}
            <Card className="border shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-getclinicas-light/20">
                <CardTitle className="text-center">Plano Mensal</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold">R$ 990</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Acesso completo ao sistema</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Geração ilimitada de contratos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte por e-mail</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Atualizações do sistema</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-getclinicas-primary hover:bg-getclinicas-dark"
                  onClick={() => handlePricingButton("Mensal")}
                >
                  Contratar
                </Button>
              </CardFooter>
            </Card>
            
            {/* Plano Semestral */}
            <Card className="border shadow-lg hover:shadow-xl transition-shadow relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-getclinicas-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                Mais Popular
              </div>
              <CardHeader className="bg-getclinicas-primary/20">
                <CardTitle className="text-center">Plano Semestral</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold">R$ 5.346</span>
                  <span className="text-gray-500">/semestre</span>
                  <p className="text-sm text-getclinicas-primary mt-1">Economia de 10%</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Acesso completo ao sistema</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Geração ilimitada de contratos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Atualizações do sistema</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Treinamento da equipe</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-getclinicas-primary hover:bg-getclinicas-dark"
                  onClick={() => handlePricingButton("Semestral")}
                >
                  Contratar
                </Button>
              </CardFooter>
            </Card>
            
            {/* Plano Anual */}
            <Card className="border shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-getclinicas-light/20">
                <CardTitle className="text-center">Plano Anual</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold">R$ 10.454,40</span>
                  <span className="text-gray-500">/ano</span>
                  <p className="text-sm text-getclinicas-primary mt-1">Economia de 12%</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Acesso completo ao sistema</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Geração ilimitada de contratos</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Suporte VIP 24/7</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Atualizações prioritárias</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Treinamento completo da equipe</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Personalização de modelos</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-getclinicas-primary hover:bg-getclinicas-dark"
                  onClick={() => handlePricingButton("Anual")}
                >
                  Contratar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">Simplifique a gestão da sua clínica</h3>
              <p className="text-gray-600 mb-4">
                O GetClinics foi desenvolvido especificamente para clínicas de recuperação 
                e dependência química, com foco em usabilidade e funcionalidades essenciais 
                para o dia a dia da sua operação.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Prontuário eletrônico completo</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Controle de leitos e ocupação</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Gestão de medicamentos</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Relatórios e indicadores</span>
                </li>
              </ul>
              <Button 
                variant="outline"
                className="border-getclinicas-primary text-getclinicas-primary hover:bg-getclinicas-primary hover:text-white"
                onClick={handleDemoAccess}
              >
                Acessar Demonstração
              </Button>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/placeholder.svg" 
                alt="Dashboard" 
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          </div>
        </div>
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
