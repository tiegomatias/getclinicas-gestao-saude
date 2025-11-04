import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Calendar, FileText, Stethoscope, Activity, ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface ProfessionalData {
  id: string;
  name: string;
  profession: string;
  specialization?: string;
  license_number?: string;
  email: string;
  phone?: string;
}

interface ClinicData {
  id: string;
  name: string;
}

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});

  const [stats, setStats] = useState({
    activePatients: 0,
    todayAppointments: 0,
    prescriptions: 0,
    documents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedProfessionalData = localStorage.getItem('professionalData');
      const storedClinicData = localStorage.getItem('clinicData');

      if (storedProfessionalData) {
        setProfessionalData(JSON.parse(storedProfessionalData));
      }

      if (storedClinicData) {
        const clinic = JSON.parse(storedClinicData);
        setClinicData(clinic);
        
        // Load real statistics
        await loadStatistics(clinic.id);
      }

      if (storedProfessionalData) {
        const professional = JSON.parse(storedProfessionalData);
        setDefaultPermissions(professional.profession);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async (clinicId: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Count active patients
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'active');
      
      // Count today's activities
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const { count: activitiesCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);
      
      // Count active prescriptions
      const { count: prescriptionsCount } = await supabase
        .from('medication_prescriptions')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'active');
      
      // Count documents
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);
      
      setStats({
        activePatients: patientsCount || 0,
        todayAppointments: activitiesCount || 0,
        prescriptions: prescriptionsCount || 0,
        documents: documentsCount || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

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

  const getWelcomeMessage = () => {
    if (!professionalData) return "Bem-vindo!";
    
    const profession = getProfessionLabel(professionalData.profession);
    const greeting = getGreetingByTime();
    
    return `${greeting}, ${profession} ${professionalData.name.split(' ')[0]}!`;
  };

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const moduleCards = [
    {
      key: 'patients',
      title: 'Pacientes',
      description: 'Visualizar informações dos pacientes',
      icon: Users,
      href: '/pacientes',
      color: 'text-blue-600',
    },
    {
      key: 'calendar',
      title: 'Agenda',
      description: 'Gerenciar compromissos e consultas',
      icon: Calendar,
      href: '/agenda',
      color: 'text-green-600',
    },
    {
      key: 'medications',
      title: 'Medicamentos',
      description: 'Controle de medicamentos e prescrições',
      icon: Stethoscope,
      href: '/medicamentos',
      color: 'text-purple-600',
    },
    {
      key: 'documents',
      title: 'Documentos',
      description: 'Gerenciar documentos dos pacientes',
      icon: FileText,
      href: '/documentos',
      color: 'text-orange-600',
    },
    {
      key: 'beds',
      title: 'Leitos',
      description: 'Visualizar status dos leitos',
      icon: Activity,
      href: '/leitos',
      color: 'text-red-600',
    },
    {
      key: 'reports',
      title: 'Relatórios',
      description: 'Visualizar relatórios e indicadores',
      icon: ClipboardList,
      href: '/relatorios',
      color: 'text-indigo-600',
    },
  ];

  const handleModuleClick = (module: any) => {
    if (!permissions[module.key]) {
      toast.error(`Você não tem permissão para acessar ${module.title}`);
      return;
    }
    
    // Navigate to module
    window.location.href = module.href;
  };

  if (!professionalData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
          <p className="text-gray-600">Obtendo suas informações profissionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{getWelcomeMessage()}</h1>
        <p className="text-gray-600">
          {clinicData?.name} • {professionalData.specialization && `${professionalData.specialization} • `}
          CRM/CRE: {professionalData.license_number}
        </p>
      </div>

      {/* Professional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Profissão</p>
              <Badge variant="secondary" className="mt-1">
                {getProfessionLabel(professionalData.profession)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{professionalData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-medium">{professionalData.phone || 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleCards.map((module) => {
            const IconComponent = module.icon;
            const hasAccess = permissions[module.key];
            
            return (
              <Card 
                key={module.key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  hasAccess ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => handleModuleClick(module)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconComponent className={`h-5 w-5 ${module.color}`} />
                    {module.title}
                    {!hasAccess && (
                      <Badge variant="outline" className="text-xs">
                        Sem acesso
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{module.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? "..." : stats.activePatients}
              </div>
              <p className="text-sm text-gray-600">Pacientes Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {loading ? "..." : stats.todayAppointments}
              </div>
              <p className="text-sm text-gray-600">Atividades Hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {loading ? "..." : stats.prescriptions}
              </div>
              <p className="text-sm text-gray-600">Prescrições Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {loading ? "..." : stats.documents}
              </div>
              <p className="text-sm text-gray-600">Documentos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;