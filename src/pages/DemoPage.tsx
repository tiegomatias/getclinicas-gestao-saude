
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";

const DemoPage = () => {
  const navigate = useNavigate();

  // Updated function to correctly navigate to the plans section
  const navigateToPlans = () => {
    navigate("/");
    // Give the page some time to load before scrolling
    setTimeout(() => {
      const plansSection = document.getElementById("plans-section");
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white">
      <header className="container mx-auto py-4 px-4 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-base"
          >
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Demonstração do GetClinics</h2>
          
          <div className="aspect-w-16 aspect-h-9 mb-8 bg-gray-100 rounded-md overflow-hidden">
            <iframe 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=_5VrQqIZScLu0WcV" 
              title="GetClinics Demo Video" 
              className="w-full h-full"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Sistema completo para clínicas de recuperação</h3>
              <p className="text-gray-600">
                Nesta demonstração, você pode conhecer todas as funcionalidades do GetClinics, 
                o sistema completo para gestão de clínicas de recuperação. 
                Desde o gerenciamento de pacientes até relatórios detalhados.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Principais recursos demonstrados:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Dashboard completo com indicadores em tempo real</li>
                <li>Gestão de pacientes e histórico médico</li>
                <li>Sistema de controle de leitos</li>
                <li>Agenda integrada para profissionais</li>
                <li>Geração de contratos e documentos</li>
                <li>Módulo financeiro integrado</li>
                <li>Relatórios gerenciais customizáveis</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              onClick={navigateToPlans}
              size="lg"
              className="bg-getclinicas-primary hover:bg-getclinicas-dark"
            >
              Conheça Planos
            </Button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Logo size="sm" />
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              &copy; {new Date().getFullYear()} GetClinics. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DemoPage;
