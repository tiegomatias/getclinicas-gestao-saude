
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import MasterSidebar from "./MasterSidebar";
import { useLocation } from "react-router-dom";
import AppHeader from "./AppHeader";

interface MasterLayoutProps {
  children: React.ReactNode;
}

export default function MasterLayout({ children }: MasterLayoutProps) {
  const location = useLocation();
  
  // Get the title based on the current route
  const getTitle = () => {
    if (location.pathname === "/master") return "Painel Mestre";
    // Add more master routes here if needed
    return "GetClinics Master";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MasterSidebar />
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
