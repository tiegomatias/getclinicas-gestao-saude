
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import { useLocation } from "react-router-dom";

export default function AppLayout() {
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
    if (path.includes("financeiro")) return "Financeiro";
    if (path.includes("relatorios")) return "Relatórios e Indicadores";
    if (path.includes("configuracoes")) return "Configurações";
    return "GetClinicas";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">
          <AppHeader title={getTitle()} />
          <main className="container mx-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
