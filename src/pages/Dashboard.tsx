
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
import ClinicDebug from "@/components/debug/ClinicDebug";
import { patientService } from "@/services/patientService";
import { bedService } from "@/services/bedService";
import { activityService } from "@/services/activityService";
import { financeService } from "@/services/financeService";
import { useSubscription } from "@/hooks/useSubscription";

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
  const [showDebug, setShowDebug] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isSubscribed } = useSubscription();
  
  // Verificar assinatura e redirecionar para planos se não estiver ativo
  useEffect(() => {
    if (!loading && !isSubscribed()) {
      toast.info("Escolha um plano para acessar o sistema");
      navigate("/plans");
    }
  }, [loading, isSubscribed, navigate]);
  
  // Real data states
  const [totalPatients, setTotalPatients] = useState(0);
  const [occupationRate, setOccupationRate] = useState(0);
  const [weeklyActivities, setWeeklyActivities] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [bedsCapacity, setBedsCapacity] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      // Fetch clinic data from localStorage
      const clinicDataStr = localStorage.getItem("clinicData");
      if (clinicDataStr) {
        const clinic = JSON.parse(clinicDataStr);
        setClinicData(clinic);
        
        // Check if the clinic was recently created or has no initial data
        if (!clinic.hasInitialData) {
          setIsNewClinic(true);
          setTimeout(() => {
            const clinicName = clinic.clinicName || (clinic as any).clinic_name || 'sua clínica';
            toast.success(`Bem-vindo à ${clinicName}! Seu espaço está pronto para uso.`);
          }, 1000);
        }
        
        // Load real data
        try {
          // Get patients
          const patients = await patientService.getClinicPatients(clinic.id);
          const activePatients = patients.filter(p => p.status === 'active');
          setTotalPatients(activePatients.length);
          
          // Get beds data
          const beds = await bedService.getBedsByClinic(clinic.id);
          const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
          const totalBeds = beds.length;
          setBedsCapacity(totalBeds);
          setOccupationRate(totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0);
          
          // Get activities from current week
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7);
          
          const activities = await activityService.getActivitiesByDateRange(
            clinic.id,
            startOfWeek.toISOString(),
            endOfWeek.toISOString()
          );
          setWeeklyActivities(activities.length);
          
          // Get monthly revenue
          let firstDayOfMonth: Date;
          let lastDayOfMonth: Date;
          
          switch (selectedPeriod) {
            case 'previous':
              firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
              break;
            case 'quarter':
              const currentQuarter = Math.floor(today.getMonth() / 3);
              firstDayOfMonth = new Date(today.getFullYear(), currentQuarter * 3, 1);
              lastDayOfMonth = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
              break;
            case 'year':
              firstDayOfMonth = new Date(today.getFullYear(), 0, 1);
              lastDayOfMonth = new Date(today.getFullYear(), 11, 31);
              break;
            default: // current
              firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          }
          
          const finances = await financeService.getFinancesByDateRange(
            clinic.id,
            firstDayOfMonth.toISOString(),
            lastDayOfMonth.toISOString()
          );
          
          const revenue = finances
            .filter(f => f.type === 'income')
            .reduce((sum, f) => sum + Number(f.amount), 0);
          setMonthlyRevenue(revenue);
          
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast.error('Erro ao carregar dados do dashboard');
        }
      }
      setLoading(false);
    };
    
    loadDashboardData();
  }, [selectedPeriod]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Format date function to handle possible invalid dates
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "Data não disponível";
    
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Data não disponível";
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return "Data não disponível";
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Section - Temporary */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs"
        >
          {showDebug ? 'Ocultar' : 'Mostrar'} Debug
        </Button>
        {showDebug && <ClinicDebug />}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          {clinicData ? 
            `Bem-vindo à ${clinicData.clinicName || (clinicData as any).clinic_name || 'sua clínica'}` : 
            "Bem-vindo ao GetClinicas"}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Mês atual</SelectItem>
              <SelectItem value="previous">Mês anterior</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleNavigate("/relatorios")} className="whitespace-nowrap">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar relatório</span>
            <span className="sm:hidden">Relatório</span>
          </Button>
        </div>
      </div>

      {clinicData && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Building className="h-5 w-5 text-blue-500" />
            <h2 className="font-medium text-blue-700 dark:text-blue-300">Informações da clínica</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Plano</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">{clinicData.plan}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Data de registro</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">{formatDate(clinicData.createdAt)}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-blue-600 dark:text-blue-400">ID da Clínica</p>
              <p className="font-medium text-xs text-blue-900 dark:text-blue-100 break-all">{clinicData.id}</p>
            </div>
          </div>
        </div>
      )}

      {isNewClinic && (
        <div className="mb-6 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="font-medium text-green-700 dark:text-green-300 mb-2">Parabéns pelo cadastro!</h2>
          <p className="text-green-600 dark:text-green-400 mb-4">
            Sua clínica está pronta para começar a usar o sistema. Para começar:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-gray-900 cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/30 transition-colors" onClick={() => handleNavigate("/pacientes")}>
              <CardContent className="p-4 flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-sm">Adicionar pacientes</h3>
                  <p className="text-xs text-muted-foreground">Cadastre os pacientes da clínica</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-900 cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/30 transition-colors" onClick={() => handleNavigate("/leitos")}>
              <CardContent className="p-4 flex items-center gap-3">
                <Bed className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-sm">Configurar leitos</h3>
                  <p className="text-xs text-muted-foreground">Organize os leitos disponíveis</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-900 cursor-pointer hover:bg-green-50/50 dark:hover:bg-green-950/30 transition-colors sm:col-span-2 lg:col-span-1" onClick={() => handleNavigate("/medicamentos")}>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-sm">Cadastrar medicamentos</h3>
                  <p className="text-xs text-muted-foreground">Adicione medicamentos ao estoque</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Pacientes"
          value={loading ? "..." : totalPatients.toString()}
          icon={UserIcon}
          description={totalPatients === 0 ? "Nenhum paciente cadastrado" : "Pacientes ativos"}
        />
        <StatCard
          title="Taxa de Ocupação"
          value={loading ? "..." : `${occupationRate}%`}
          icon={Bed}
          description={
            bedsCapacity > 0 
              ? `Capacidade total: ${bedsCapacity} leitos` 
              : "Nenhum leito cadastrado"
          }
        />
        <StatCard
          title="Atividades Semanais"
          value={loading ? "..." : weeklyActivities.toString()}
          icon={CalendarIcon}
          description={weeklyActivities === 0 ? "Nenhuma atividade agendada" : "Atividades desta semana"}
        />
        <StatCard
          title="Faturamento Mensal"
          value={loading ? "..." : `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          description={
            monthlyRevenue === 0 
              ? "Sem dados financeiros" 
              : selectedPeriod === 'previous' 
                ? 'Mês anterior'
                : selectedPeriod === 'quarter'
                  ? 'Trimestre atual'
                  : selectedPeriod === 'year'
                    ? 'Ano atual'
                    : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
          }
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
                  <span className="text-muted-foreground">Taxa de Ocupação</span>
                  <span className="font-medium">{occupationRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de Pacientes</span>
                  <span className="font-medium">{totalPatients}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Atividades Semanais</span>
                  <span className="font-medium">{weeklyActivities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Leitos Disponíveis</span>
                  <span className="font-medium">{bedsCapacity - Math.round((occupationRate / 100) * bedsCapacity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Faturamento Mensal</span>
                  <span className="font-medium">R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-1 xl:col-span-1">
          <WeeklyActivities />
        </div>
        <div className="lg:col-span-1 xl:col-span-2">
          <RecentAdmissions />
        </div>
      </div>
    </div>
  );
}
