
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { useLocation, Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

export default function AppLayout() {
  const location = useLocation();
  
  // Get the title based on the current route
  const getTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("pacientes")) return "Gestão de Pacientes";
    if (path.includes("profissionais")) return "Profissionais";
    if (path.includes("agenda")) return "Agenda";
    if (path.includes("leitos")) return "Gestão de Leitos";
    if (path.includes("medicamento")) return "Controle de Medicamentos";
    if (path.includes("alimentacao")) return "Gestão de Alimentação";
    if (path.includes("alimentacao/dispensa")) return "Gestão de Dispensa";
    if (path.includes("alimentacao/supermercado")) return "Lista de Supermercado";
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
          <main className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
