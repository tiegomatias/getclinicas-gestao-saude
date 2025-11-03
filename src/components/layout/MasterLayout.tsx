
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import MasterSidebar from "./MasterSidebar";
import { useLocation, Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

export default function MasterLayout() {
  const location = useLocation();
  
  // Get the title based on the current route
  const getTitle = () => {
    if (location.pathname === "/master") return "Painel Mestre";
    if (location.pathname === "/master/clinics") return "Gerenciamento de Clínicas";
    if (location.pathname === "/master/analytics") return "Analytics Avançado";
    if (location.pathname === "/master/plans") return "Gestão de Planos";
    if (location.pathname === "/master/communication") return "Sistema de Comunicação";
    if (location.pathname === "/master/maintenance") return "Backup & Manutenção";
    if (location.pathname === "/master/support") return "Sistema de Suporte";
    if (location.pathname === "/master/reports") return "Relatórios Gerais";
    if (location.pathname === "/master/settings") return "Configurações do Sistema";
    return "GetClinicas Master";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MasterSidebar />
        <div className="flex-1">
          <AppHeader title={getTitle()} />
          <main className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
