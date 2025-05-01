
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Home,
  UserIcon,
  Users,
  Bed,
  PillIcon,
  FileText,
  DollarSign,
  ChartBarIcon,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppSidebar() {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      title: "Pacientes",
      path: "/pacientes",
      icon: UserIcon,
    },
    {
      title: "Profissionais",
      path: "/profissionais",
      icon: Users,
    },
    {
      title: "Agenda",
      path: "/agenda",
      icon: CalendarIcon,
    },
    {
      title: "Leitos",
      path: "/leitos",
      icon: Bed,
    },
    {
      title: "Medicamentos",
      path: "/medicamentos",
      icon: PillIcon,
    },
    {
      title: "Documentos",
      path: "/documentos",
      icon: FileText,
    },
    {
      title: "Financeiro",
      path: "/financeiro",
      icon: DollarSign,
    },
    {
      title: "Relatórios",
      path: "/relatorios",
      icon: ChartBarIcon,
    },
    {
      title: "Configurações",
      path: "/configuracoes",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 px-4 py-2">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/71c67761-69d0-4325-9bdd-f39cf3a0076f.png" alt="GetClinicas Logo" className="h-8" />
          <span className="text-xl font-bold text-white">Clinicas</span>
        </div>
        <div className="ml-auto md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path} className={cn(
                      "flex items-center gap-3",
                      location.pathname === item.path ? "font-medium" : ""
                    )}>
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/10 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-sidebar-accent/30 text-sidebar-foreground">
              AC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <div className="text-sm font-medium text-sidebar-foreground">Admin Clínica</div>
            <div className="text-xs text-sidebar-foreground/70">admin@getclinicas.com</div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
