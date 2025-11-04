import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, Menu, Star, Users, CircleCheck, FilePen, FileText, UserRound, CookingPot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [countdown, setCountdown] = useState({ days: 3, hours: 12, minutes: 45, seconds: 30 });
  const [visibleSection, setVisibleSection] = useState("");

  // Format numbers without cents
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  };

  // Custom Logo SVG Component
  const GetClinicasLogo = () => (
    <svg
      width="28"
      height="28"
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

  // Animação para seções conforme scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero-section", "plans-section", "features-section", "testimonials-section"];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= window.innerHeight * 0.25) {
            setVisibleSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Simula contagem regressiva para criar urgência
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = (plan: string) => {
    setSelectedPlan(plan);
    toast.success(`Plano ${plan} selecionado!`);
    navigate(`/checkout?plan=${plan}`);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleViewDemo = () => {
    // Demo removed - redirect to registration
    navigate("/registro");
  };

  const scrollToPlans = () => {
    document.getElementById('plans-section')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  const testimonials = [
    {
      name: "Dra. Carla Mendes",
      role: "Diretora Clínica",
      image: "/placeholder.svg",
      comment: "GetClinicas transformou completamente a gestão da nossa clínica. Economizamos 5 horas por semana em tarefas administrativas."
    },
    {
      name: "Dr. Roberto Alves",
      role: "Proprietário de Clínica",
      image: "/placeholder.svg",
      comment: "Desde que implementamos o GetClinicas, nossa ocupação de leitos aumentou em 30% e a satisfação dos pacientes melhorou significativamente."
    },
    {
      name: "Camila Silveira",
      role: "Gerente Administrativa",
      image: "/placeholder.svg",
      comment: "A facilidade de gerar relatórios e controlar os leitos nos ajudou a melhorar nossa tomada de decisões. Simplesmente indispensável!"
    }
  ];

  const features = [
    {
      icon: <CookingPot className="h-8 w-8 text-primary" />,
      title: "Gestão de Alimentação",
      description: "Controle completo de estoque de alimentos, listas de supermercado e planejamento nutricional para seus pacientes."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Gestão de Pacientes",
      description: "Cadastre, monitore e acompanhe o histórico completo dos pacientes em tratamento."
    },
    {
      icon: <CircleCheck className="h-8 w-8 text-primary" />,
      title: "Gestão de Leitos",
      description: "Controle em tempo real a ocupação e disponibilidade dos leitos da clínica."
    },
    {
      icon: <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      title: "Relatórios Detalhados",
      description: "Acompanhe métricas e indicadores para tomada de decisões estratégicas."
    },
    {
      icon: <UserRound className="h-8 w-8 text-primary" />,
      title: "Gestão de Profissionais",
      description: "Organize as equipes de saúde, escalas de trabalho e acompanhe o desempenho dos profissionais da sua clínica."
    },
    {
      icon: <FilePen className="h-8 w-8 text-primary" />,
      title: "Geração Rápida de Contratos",
      description: "Crie contratos padronizados em segundos, personalizáveis para cada paciente e situação."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-getclinicas-light to-white overflow-x-hidden">
      <header className="container mx-auto py-4 px-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <GetClinicasLogo />
            <h1 className="text-xl font-bold text-getclinicas-dark ml-2">GetClinicas</h1>
          </div>
          
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogin}>
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={scrollToPlans}>
                  Escolher Plano
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleLogin} className="text-base px-4">
                Login
              </Button>
              <Button onClick={scrollToPlans} className="text-base px-4">
                Escolher Plano
              </Button>
            </div>
          )}
        </div>
      </header>

      <main>
        <section id="hero-section" className={`py-10 md:py-20 px-4 transition-opacity duration-700 ${visibleSection === "hero-section" ? "opacity-100" : "opacity-70"}`}>
          <div className="container mx-auto max-w-4xl text-center">
            <span className="inline-block bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full text-sm mb-4">
              Solução Completa para Clínicas
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-getclinicas-dark to-getclinicas-primary bg-clip-text text-transparent">
              Sistema Completo de Gestão para Clínicas de Recuperação
            </h1>
            <p className="text-md md:text-xl text-gray-600 mb-6 md:mb-10 max-w-2xl mx-auto">
              Simplifique a administração da sua clínica com uma plataforma completa, 
              segura e fácil de usar. <span className="font-semibold text-getclinicas-primary">Aumente sua eficiência em até 50%</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mb-8">
              <Button 
                size={isMobile ? "default" : "lg"}
                onClick={scrollToPlans}
                className={`text-base md:text-lg ${isMobile ? 'py-4 px-6' : 'py-6 px-8'} bg-getclinicas-primary hover:bg-getclinicas-dark`}
              >
                Comece Agora
              </Button>
              <Button 
                variant="outline"
                size={isMobile ? "default" : "lg"}
                onClick={() => {
                  const message = encodeURIComponent("Olá! Gostaria de conhecer melhor o GetClinicas e agendar uma demonstração para minha clínica.");
                  window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
                }}
                className="text-base md:text-lg"
              >
                Falar com Especialista
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm mt-10 md:mt-16">
              <p className="text-sm font-medium text-gray-800 mb-2">Utilizado por mais de 200+ clínicas em todo o Brasil</p>
              <div className="flex justify-center items-center gap-6 flex-wrap">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <span className="ml-2 text-sm font-medium">4.9/5 (124 avaliações)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contador regressivo para criar urgência */}
        <div className="bg-getclinicas-dark text-white py-4 text-center">
          <div className="container mx-auto">
            <p className="font-medium mb-2">Oferta especial por tempo limitado:</p>
            <div className="flex justify-center gap-3 md:gap-4">
              <div className="bg-getclinicas-primary/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-4 md:py-2">
                <span className="text-lg md:text-2xl font-bold">{countdown.days.toString().padStart(2, '0')}</span>
                <span className="text-xs block">dias</span>
              </div>
              <div className="bg-getclinicas-primary/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-4 md:py-2">
                <span className="text-lg md:text-2xl font-bold">{countdown.hours.toString().padStart(2, '0')}</span>
                <span className="text-xs block">horas</span>
              </div>
              <div className="bg-getclinicas-primary/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-4 md:py-2">
                <span className="text-lg md:text-2xl font-bold">{countdown.minutes.toString().padStart(2, '0')}</span>
                <span className="text-xs block">min</span>
              </div>
              <div className="bg-getclinicas-primary/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-4 md:py-2">
                <span className="text-lg md:text-2xl font-bold">{countdown.seconds.toString().padStart(2, '0')}</span>
                <span className="text-xs block">seg</span>
              </div>
            </div>
          </div>
        </div>

        <section id="plans-section" className={`py-10 md:py-16 bg-gray-50 transition-opacity duration-700 ${visibleSection === "plans-section" ? "opacity-100" : "opacity-70"}`}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Planos Personalizados para Sua Necessidade</h2>
              <p className="text-gray-600">Escolha o plano ideal para o tamanho e as necessidades específicas da sua clínica de recuperação.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* Plano Mensal */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500 transform hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Plano Mensal</CardTitle>
                  <CardDescription className="text-center">Para clínicas que estão começando</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 md:mb-6">
                    <p className="text-3xl md:text-4xl font-bold">R$ 490</p>
                    <p className="text-gray-500">por mês</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Geração ilimitada de contratos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Suporte por e-mail</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Atualizações do sistema</span>
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
              <Card className={`shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500 ${!isMobile ? 'scale-105 z-10' : 'my-6'} transform hover:scale-110 transition-transform duration-300`}>
                <CardHeader className="bg-purple-50 rounded-t-lg">
                  <div className="py-1 px-3 bg-purple-600 text-white rounded-full text-xs font-bold w-fit mx-auto mb-2 animate-pulse">
                    MAIS POPULAR
                  </div>
                  <CardTitle className="text-xl md:text-2xl">Plano Semestral</CardTitle>
                  <CardDescription className="text-center">Ideal para a maioria das clínicas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center justify-center mb-1">
                      <p className="text-sm line-through text-gray-400 mr-2">R$ 2.940</p>
                      <p className="text-3xl md:text-4xl font-bold">R$ 2.640</p>
                    </div>
                    <p className="text-gray-500">por semestre</p>
                    <p className="text-green-600 text-sm font-medium">Economia de 10% (R$ 300)</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Geração ilimitada de contratos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Suporte prioritário</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Atualizações do sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Treinamento da equipe</span>
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
              <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500 transform hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Plano Anual</CardTitle>
                  <CardDescription className="text-center">Para clínicas bem estabelecidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center justify-center mb-1">
                      <p className="text-sm line-through text-gray-400 mr-2">R$ 5.880</p>
                      <p className="text-3xl md:text-4xl font-bold">R$ 4.900</p>
                    </div>
                    <p className="text-gray-500">por ano</p>
                    <p className="text-green-600 text-sm font-medium">Economia de 17% (R$ 980)</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Acesso completo ao sistema</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Geração ilimitada de contratos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Suporte VIP 24/7</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Atualizações prioritárias</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Treinamento completo da equipe</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-left">Personalização de modelos</span>
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
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Satisfação garantida ou seu dinheiro de volta em até 14 dias</p>
            </div>
          </div>
        </section>

        <section id="features-section" className={`py-10 md:py-16 bg-white transition-opacity duration-700 ${visibleSection === "features-section" ? "opacity-100" : "opacity-70"}`}>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Funcionalidades que Transformam sua Gestão</h2>
              <p className="text-gray-600">Conheça as ferramentas que tornarão o dia a dia da sua clínica mais eficiente e organizado.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                <div className="bg-blue-50 p-4 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-center">Gestão de Pacientes</h3>
                <p className="text-gray-600 text-center">
                  Cadastre, monitore e acompanhe o histórico completo dos pacientes em tratamento.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                <div className="bg-green-50 p-4 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
                  <CircleCheck className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-center">Gestão de Leitos</h3>
                <p className="text-gray-600 text-center">
                  Controle em tempo real a ocupação e disponibilidade dos leitos da clínica.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                <div className="bg-purple-50 p-4 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-center">Relatórios Detalhados</h3>
                <p className="text-gray-600 text-center">
                  Acompanhe métricas e indicadores para tomada de decisões estratégicas.
                </p>
              </div>
            </div>
            
            {/* Segunda linha de recursos com gestão de profissionais e geração de contratos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-gray-50 p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                <div className="bg-yellow-50 p-4 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
                  <UserRound className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-center">Gestão de Profissionais</h3>
                <p className="text-gray-600 text-center">
                  Organize as equipes de saúde, escalas de trabalho e acompanhe o desempenho dos profissionais da sua clínica.
                </p>
                <div className="mt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Cadastro completo de profissionais</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Controle de especialidades</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Gestão de escalas de trabalho</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                <div className="bg-blue-50 p-4 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4">
                  <FilePen className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-center">Geração Rápida de Contratos</h3>
                <p className="text-gray-600 text-center">
                  Crie contratos padronizados em segundos, personalizáveis para cada paciente e situação.
                </p>
                <div className="mt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Modelos de contratos personalizáveis</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Geração em PDF com 1 clique</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">Armazenamento seguro de documentos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials-section" className={`py-10 md:py-16 bg-gray-50 transition-opacity duration-700 ${visibleSection === "testimonials-section" ? "opacity-100" : "opacity-70"}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">O Que Dizem Nossos Clientes</h2>
            
            <div className="max-w-5xl mx-auto">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-4">
                        <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
                          <div className="flex items-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <img 
                                src={testimonial.image} 
                                alt={testimonial.name} 
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                              <p className="text-sm text-gray-600">{testimonial.role}</p>
                            </div>
                          </div>
                          <div className="flex mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500" fill="currentColor" />
                            ))}
                          </div>
                          <p className="text-gray-700 italic flex-grow">"{testimonial.comment}"</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:flex">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-getclinicas-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Pronto para Transformar sua Clínica?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 200 clínicas que já estão economizando tempo e melhorando seus resultados com o GetClinicas.
            </p>
            <Button 
              size={isMobile ? "default" : "lg"}
              onClick={scrollToPlans}
              className={`text-base md:text-lg ${isMobile ? 'py-4 px-6' : 'py-6 px-8'} bg-white text-getclinicas-dark hover:bg-gray-100`}
            >
              Começar Agora
            </Button>
            <p className="mt-4 text-sm opacity-80">Sem contratos longos. Cancele quando quiser.</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <GetClinicasLogo />
              <span className="text-base md:text-lg font-semibold ml-2">GetClinicas</span>
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              &copy; {new Date().getFullYear()} GetClinicas. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
