
import React, { useEffect, useState } from "react";
import { Bed, Building, CalendarIcon, DollarSign, UserIcon, Users } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import OccupationChart from "@/components/dashboard/OccupationChart";
import RecentAdmissions from "@/components/dashboard/RecentAdmissions";
import WeeklyActivities from "@/components/dashboard/WeeklyActivities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ClinicData {
  clinicName: string;
  id: string;
  plan: string;
  createdAt: string;
  bedsCapacity?: string;
  hasInitialData?: boolean;
  // Add other properties as needed
}

export default function Dashboard() {
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [isNewClinic, setIsNewClinic] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch clinic data from localStorage
    const clinicDataStr = localStorage.getItem("clinicData");
    if (clinicDataStr) {
      const clinic = JSON.parse(clinicDataStr);
      setClinicData(clinic);
      
      // Check if the clinic was recently created or has no initial data
      if (!clinic.hasInitialData) {
        setIsNewClinic(true);
        // Show a welcome toast
        setTimeout(() => {
          toast.success(`Bem-vindo à ${clinic.clinicName}! Seu espaço está pronto para uso.`);
        }, 1000);
      }
    }
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {clinicData ? `Bem-vindo à ${clinicData.clinicName}` : "Bem-vindo ao GetClinicas"}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Mês atual</SelectItem>
              <SelectItem value="previous">Mês anterior</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Exportar relatório
          </Button>
        </div>
      </div>

      {clinicData && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-500" />
            <h2 className="font-medium text-blue-700">Informações da clínica</h2>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-600">Plano</p>
              <p className="font-medium">{clinicData.plan}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Data de registro</p>
              <p className="font-medium">{new Date(clinicData.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">ID da Clínica</p>
              <p className="font-medium text-xs">{clinicData.id}</p>
            </div>
          </div>
        </div>
      )}

      {isNewClinic && (
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <h2 className="font-medium text-green-700 mb-2">Parabéns pelo cadastro!</h2>
          <p className="text-green-600 mb-3">
            Sua clínica está pronta para começar a usar o sistema. Para começar:
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <Card className="bg-white cursor-pointer hover:bg-green-50/50 transition-colors" onClick={() => handleNavigate("/pacientes")}>
              <CardContent className="p-4 flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Adicionar pacientes</h3>
                  <p className="text-xs text-muted-foreground">Cadastre os pacientes da clínica</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white cursor-pointer hover:bg-green-50/50 transition-colors" onClick={() => handleNavigate("/leitos")}>
              <CardContent className="p-4 flex items-center gap-3">
                <Bed className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Configurar leitos</h3>
                  <p className="text-xs text-muted-foreground">Organize os leitos disponíveis</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white cursor-pointer hover:bg-green-50/50 transition-colors" onClick={() => handleNavigate("/profissionais")}>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Cadastrar profissionais</h3>
                  <p className="text-xs text-muted-foreground">Adicione a equipe da clínica</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Pacientes"
          value={isNewClinic ? "0" : "27"}
          icon={UserIcon}
          description={isNewClinic ? "Nenhum paciente cadastrado" : "Pacientes atualmente internados"}
          trend={isNewClinic ? undefined : "up"}
          trendValue={isNewClinic ? undefined : "+3 este mês"}
        />
        <StatCard
          title="Taxa de Ocupação"
          value={isNewClinic ? "0%" : "82%"}
          icon={Bed}
          description={
            clinicData && isNewClinic && clinicData.bedsCapacity 
              ? `Capacidade total: ${clinicData.bedsCapacity} leitos` 
              : "Capacidade total: 33 leitos"
          }
          trend={isNewClinic ? undefined : "up"}
          trendValue={isNewClinic ? undefined : "+5% este mês"}
        />
        <StatCard
          title="Atividades Semanais"
          value={isNewClinic ? "0" : "18"}
          icon={CalendarIcon}
          description={isNewClinic ? "Nenhuma atividade agendada" : "4 atividades hoje"}
        />
        <StatCard
          title="Faturamento Mensal"
          value={isNewClinic ? "R$ 0" : "R$ 156.400"}
          icon={DollarSign}
          description={isNewClinic ? "Sem dados financeiros" : "Maio/2025"}
          trend={isNewClinic ? undefined : "up"}
          trendValue={isNewClinic ? undefined : "+12% vs. Abril"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OccupationChart />
        <Card>
          <CardHeader>
            <CardTitle>Indicadores Clínicos</CardTitle>
            <CardDescription>Métricas gerais de desempenho da clínica</CardDescription>
          </CardHeader>
          <CardContent>
            {isNewClinic ? (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">
                  Os indicadores clínicos serão exibidos quando houver dados disponíveis.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleNavigate("/pacientes")}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Adicionar pacientes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tempo médio de internação</span>
                  <span className="font-medium">42 dias</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxa de alta planejada</span>
                  <span className="font-medium">74%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxa de reinternação (30 dias)</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Atividades por paciente (semanal)</span>
                  <span className="font-medium">5.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Atendimentos médicos semanais</span>
                  <span className="font-medium">33</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <WeeklyActivities />
        <div className="lg:col-span-2">
          <RecentAdmissions />
        </div>
      </div>
    </div>
  );
}
