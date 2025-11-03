
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, BarChart2, Globe, AlertCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MasterStatsCards } from "@/components/master/MasterStatsCards";
import { MasterClinicsTable } from "@/components/master/MasterClinicsTable";
import { MasterOccupationChart } from "@/components/master/MasterOccupationChart";
import { MasterFinanceCard } from "@/components/master/MasterFinanceCard";
import { MasterFinancialDashboard } from "@/components/master/MasterFinancialDashboard";
import { EditClinicDialog } from "@/components/master/EditClinicDialog";
import { toast } from "sonner";
import { masterService, type ClinicData } from "@/services/masterService";
import { auditService } from "@/services/auditService";

export default function MasterDashboard() {
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<ClinicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClinics, setTotalClinics] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  const [averageOccupation, setAverageOccupation] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [planRevenueData, setPlanRevenueData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicData | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadClinicsData();
  }, []);

  const loadClinicsData = async () => {
    try {
      setLoading(true);
      const clinicsData = await masterService.getAllClinics();
      
      console.log("Loaded clinics:", clinicsData);
      
      setClinics(clinicsData);
      setFilteredClinics(clinicsData);
      
      // Calculate statistics
      const stats = masterService.calculateStats(clinicsData);
      setTotalClinics(stats.totalClinics);
      setTotalBeds(stats.totalBeds);
      setAverageOccupation(stats.averageOccupation);
      setTotalRevenue(stats.totalRevenue);
      
      // Calculate plan revenue
      const planRevenue = masterService.calculatePlanRevenue(clinicsData);
      setPlanRevenueData(planRevenue);
      
    } catch (error) {
      console.error("Error loading clinics:", error);
      toast.error("Erro ao carregar dados das clínicas");
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    // Apply filters whenever search query or plan filter changes
    let result = [...clinics];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(clinic => 
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.admin_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply plan filter
    if (filterPlan) {
      result = result.filter(clinic => clinic.plan === filterPlan);
    }
    
    setFilteredClinics(result);
  }, [searchQuery, filterPlan, clinics]);
  
  const handleNavigateToClinic = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    
    // Registrar log de auditoria
    auditService.logAction('VIEW', 'clinic', clinicId, {
      clinicName: clinic?.name
    });
    
    localStorage.setItem("currentClinicId", clinicId);
    navigate("/dashboard");
  };
  
  const handleCreateClinic = () => {
    navigate("/registro");
  };

  const handleEditClinic = (clinic: ClinicData) => {
    setSelectedClinic(clinic);
    setEditDialogOpen(true);
  };

  const handleSaveClinic = async (clinicId: string, updates: Partial<ClinicData>) => {
    try {
      await masterService.updateClinic(clinicId, updates);
      
      // Registrar log de auditoria
      await auditService.logAction('UPDATE', 'clinic', clinicId, {
        changes: updates,
        clinicName: selectedClinic?.name
      });
      
      toast.success("Clínica atualizada com sucesso");
      await loadClinicsData();
    } catch (error) {
      console.error("Error updating clinic:", error);
      toast.error("Erro ao atualizar clínica");
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    try {
      const clinic = clinics.find(c => c.id === clinicId);
      
      await masterService.deleteClinic(clinicId);
      
      // Registrar log de auditoria
      await auditService.logAction('DELETE', 'clinic', clinicId, {
        clinicName: clinic?.name,
        plan: clinic?.plan
      });
      
      toast.success("Clínica excluída com sucesso");
      await loadClinicsData();
    } catch (error) {
      console.error("Error deleting clinic:", error);
      toast.error("Erro ao excluir clínica");
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handlePlanFilterChange = (value: string) => {
    setFilterPlan(value === "all" ? null : value);
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setFilterPlan(null);
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    toast.success(`Navegando para ${path}`);
  };
  
  // Get unique plans for filter options
  const availablePlans = React.useMemo(() => {
    const plans = new Set<string>();
    clinics.forEach(clinic => {
      if (clinic.plan) plans.add(clinic.plan);
    });
    return Array.from(plans);
  }, [clinics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Mestre</h1>
          <p className="text-muted-foreground">
            Visão geral de todas as clínicas cadastradas
          </p>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Ações</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-2 w-48">
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle() + " w-full justify-start cursor-pointer"}
                    onClick={handleCreateClinic}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    <span>Nova Clínica</span>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle() + " w-full justify-start cursor-pointer mt-2"}
                    onClick={() => handleNavigate("/master/reports")}
                  >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    <span>Relatórios</span>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      {/* Stats overview */}
      <MasterStatsCards 
        totalClinics={totalClinics} 
        totalBeds={totalBeds} 
        averageOccupation={averageOccupation}
        totalRevenue={totalRevenue}
      />

      {/* Financial Dashboard */}
      <MasterFinancialDashboard />
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="relative w-full sm:w-64">
          <Input
            type="search"
            placeholder="Buscar clínica..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-8"
          />
          <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        
        <Select
          value={filterPlan || "all"}
          onValueChange={handlePlanFilterChange}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filtrar por plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            {availablePlans.map(plan => (
              <SelectItem key={plan} value={plan}>{plan}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(searchQuery || filterPlan) && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            Limpar filtros
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinics list */}
        <div className="lg:col-span-2">
          <MasterClinicsTable 
            clinics={filteredClinics}
            onViewClinic={handleNavigateToClinic}
            onEditClinic={handleEditClinic}
            onDeleteClinic={handleDeleteClinic}
          />
        </div>
        
        {/* Financial overview */}
        <div className="space-y-6">
          <MasterFinanceCard 
            planData={planRevenueData}
            totalMonthlyRevenue={totalRevenue}
          />
          <MasterOccupationChart clinics={filteredClinics} />
        </div>
      </div>

      <EditClinicDialog
        clinic={selectedClinic}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveClinic}
      />
    </div>
  );
}
