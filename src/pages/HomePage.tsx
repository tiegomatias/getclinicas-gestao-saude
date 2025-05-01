
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, CheckIcon, DollarSign, UserIcon } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

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
                onClick={() => navigate("/login")}
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

