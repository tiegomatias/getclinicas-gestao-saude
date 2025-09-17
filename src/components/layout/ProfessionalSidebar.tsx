import React, { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Stethoscope, 
  Activity,
  ClipboardList,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";

interface ProfessionalData {
  id: string;
  name: string;
  profession: string;
  specialization?: string;
}

const ProfessionalSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null);
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const storedProfessionalData = localStorage.getItem('professionalData');
    if (storedProfessionalData) {
      const professional = JSON.parse(storedProfessionalData);
      setProfessionalData(professional);
      setDefaultPermissions(professional.profession);
    }
  }, []);

  const setDefaultPermissions = (profession: string) => {
    let defaultPerms: { [key: string]: boolean } = {};

    switch (profession) {
      case 'doctor':
        defaultPerms = {
          patients: true,
          calendar: true,
          medications: true,
          documents: true,
          beds: true,
          reports: true,
        };
        break;
      case 'nurse':
        defaultPerms = {
          patients: true,
          calendar: true,
          medications: true,
          beds: true,
          reports: false,
        };
        break;
      case 'physiotherapist':
        defaultPerms = {
          patients: true,
          calendar: true,
          documents: true,
          reports: false,
        };
        break;
      case 'psychologist':
        defaultPerms = {
          patients: true,
          calendar: true,
          documents: true,
          reports: false,
        };
        break;
      default:
        defaultPerms = {
          patients: true,
          calendar: true,
          reports: false,
        };
    }

    setPermissions(defaultPerms);
  };

  const getProfessionLabel = (profession: string) => {
    const labels: { [key: string]: string } = {
      doctor: "Médico",
      nurse: "Enfermeiro",
      physiotherapist: "Fisioterapeuta",
      psychologist: "Psicólogo",
      nutritionist: "Nutricionista",
      social_worker: "Assistente Social",
      administrator: "Administrador",
      technician: "Técnico",
      other: "Outro"
    };
    return labels[profession] || profession;
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      url: "/professional-dashboard",
      permission: null, // Always available
    },
    {
      title: "Pacientes",
      icon: Users,
      url: "/pacientes",
      permission: "patients",
    },
    {
      title: "Agenda",
      icon: Calendar,
      url: "/agenda",
      permission: "calendar",
    },
    {
      title: "Medicamentos",
      icon: Stethoscope,
      url: "/medicamentos",
      permission: "medications",
    },
    {
      title: "Documentos",
      icon: FileText,
      url: "/documentos",
      permission: "documents",
    },
    {
      title: "Leitos",
      icon: Activity,
      url: "/leitos",
      permission: "beds",
    },
    {
      title: "Relatórios",
      icon: ClipboardList,
      url: "/relatorios",
      permission: "reports",
    },
  ];

  const handleMenuClick = (item: any) => {
    if (item.permission && !permissions[item.permission]) {
      toast.error(`Você não tem permissão para acessar ${item.title}`);
      return;
    }
    navigate(item.url);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Logo />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">GetClinics</span>
            <span className="text-xs text-gray-500">Profissional</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.url;
                const hasPermission = !item.permission || permissions[item.permission];
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleMenuClick(item)}
                      isActive={isActive}
                      disabled={!hasPermission}
                      className={!hasPermission ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.title}</span>
                      {!hasPermission && (
                        <span className="ml-auto text-xs text-gray-400">Sem acesso</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {professionalData && (
          <div className="mb-3 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-sm">{professionalData.name.split(' ')[0]}</span>
            </div>
            <p className="text-xs text-gray-600">
              {getProfessionLabel(professionalData.profession)}
              {professionalData.specialization && ` • ${professionalData.specialization}`}
            </p>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ProfessionalSidebar;