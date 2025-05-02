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
  LayoutDashboard,
  Building,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/Logo";

export default function MasterSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  
  const handleLogout = () => {
    signOut();
  };
  
  const menuItems = [
    {
      title: "Painel Geral",
      path: "/master",
      icon: LayoutDashboard,
    },
    {
      title: "Clínicas",
      path: "/master/clinics",
      icon: Building,
    },
    {
      title: "Relatórios",
      path: "/master/reports",
      icon: BarChart2,
    },
    {
      title: "Configurações",
      path: "/master/settings",
      icon: Settings,
    },
  ];

  // Extrair o nome ou email do usuário para exibição
  const userDisplayName = user?.user_metadata?.name || 
    (user?.email ? user.email.split('@')[0] : 'Master Admin');
  
  // Obter o email do usuário
  const userEmail = user?.email || 'admin@getclinics.com';
  
  // Gerar iniciais para o avatar
  const userInitials = userDisplayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 px-4 py-2">
        <div className="flex items-center gap-2">
          <Logo size="sm" whiteShield={true} />
          <span className="text-xl font-bold text-white">GetClinics Master</span>
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
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <div className="text-sm font-medium text-sidebar-foreground">{userDisplayName}</div>
            <div className="text-xs text-sidebar-foreground/70">{userEmail}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="rounded-full p-1.5 text-sidebar-foreground hover:bg-sidebar-accent/20"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
