
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { toast } from "sonner";

export default function MasterSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isMasterAdmin");
    toast.success("Logout realizado com sucesso");
    navigate("/login");
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

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 px-4 py-2">
        <div className="flex items-center gap-2">
          <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
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
              MA
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <div className="text-sm font-medium text-sidebar-foreground">Master Admin</div>
            <div className="text-xs text-sidebar-foreground/70">admin@getclinics.com</div>
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
