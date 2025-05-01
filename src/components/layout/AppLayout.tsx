
import React, { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Get the title based on the current route
  const getTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path.includes("pacientes")) return "Gestão de Pacientes";
    if (path.includes("profissionais")) return "Profissionais";
    if (path.includes("agenda")) return "Agenda";
    if (path.includes("leitos")) return "Gestão de Leitos";
    if (path.includes("medicamentos")) return "Controle de Medicamentos";
    if (path.includes("documentos")) return "Documentos";
    if (path.includes("contratos")) return "Contratos";
    if (path.includes("financeiro")) return "Financeiro";
    if (path.includes("relatorios")) return "Relatórios e Indicadores";
    if (path.includes("configuracoes")) return "Configurações";
    return "GetClinics";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">
          <AppHeader title={getTitle()} />
          <main className="container mx-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
