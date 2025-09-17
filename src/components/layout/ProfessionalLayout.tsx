import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProfessionalSidebar from "./ProfessionalSidebar";
import { useLocation, Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

export default function ProfessionalLayout() {
  const location = useLocation();
  
  // Get the title based on the current route
  const getTitle = () => {
    const path = location.pathname;
    if (path === "/professional-dashboard") return "Dashboard Profissional";
    if (path.includes("pacientes")) return "Gestão de Pacientes";
    if (path.includes("agenda")) return "Agenda";
    if (path.includes("medicamento")) return "Controle de Medicamentos";
    if (path.includes("documentos")) return "Documentos";
    if (path.includes("leitos")) return "Gestão de Leitos";
    if (path.includes("relatorios")) return "Relatórios e Indicadores";
    return "GetClinics - Profissional";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ProfessionalSidebar />
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