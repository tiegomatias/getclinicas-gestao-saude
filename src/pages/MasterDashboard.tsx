
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
import { toast } from "sonner";

// Define the plan pricing
const PLAN_PRICING = {
  'Básico': 299,
  'Padrão': 499,
  'Premium': 999,
  'Enterprise': 1999
};

// Define plan colors for the financial charts
const PLAN_COLORS = {
  'Básico': '#3b82f6',
  'Padrão': '#10b981',
  'Premium': '#8b5cf6',
  'Enterprise': '#f59e0b',
  'default': '#6b7280'
};

export default function MasterDashboard() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<any[]>([]);
  const [totalClinics, setTotalClinics] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  const [averageOccupation, setAverageOccupation] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [planRevenueData, setPlanRevenueData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch clinics data from localStorage
    const allClinicsStr = localStorage.getItem("allClinics");
    if (allClinicsStr) {
      const allClinics = JSON.parse(allClinicsStr);
      setClinics(allClinics);
      setFilteredClinics(allClinics);
      setTotalClinics(allClinics.length);
      
      // Calculate total beds
      let bedsCount = 0;
      let occupiedTotal = 0;
      
      allClinics.forEach((clinic: any) => {
        // Use default value of 30 beds if not specified
        const clinicBeds = clinic.bedsCapacity ? parseInt(clinic.bedsCapacity) : 30;
        bedsCount += clinicBeds;
        
        // Calculate occupation if available (default to 0)
        const occupiedBeds = clinic.occupiedBeds ? parseInt(clinic.occupiedBeds) : 0;
        occupiedTotal += occupiedBeds;
      });
      
      setTotalBeds(bedsCount);
      
      // Calculate average occupation percentage
      if (bedsCount > 0) {
        setAverageOccupation(Math.round((occupiedTotal / bedsCount) * 100));
      }
      
      // Calculate financial data
      calculateFinancialData(allClinics);
    }
  }, []);
  
  // Calculate financial metrics
  const calculateFinancialData = (clinicsList: any[]) => {
    let revenue = 0;
    const planCounts: Record<string, number> = {};
    
    clinicsList.forEach((clinic) => {
      const plan = clinic.plan || 'Básico';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
      
      // Get the price for this plan
      const planPrice = PLAN_PRICING[plan as keyof typeof PLAN_PRICING] || PLAN_PRICING.Básico;
      revenue += planPrice;
    });
    
    setTotalRevenue(revenue);
    
    // Generate plan revenue data for the chart
    const revenueData = Object.keys(planCounts).map(plan => {
      const count = planCounts[plan];
      const planPrice = PLAN_PRICING[plan as keyof typeof PLAN_PRICING] || PLAN_PRICING.Básico;
      const monthlyRevenue = count * planPrice;
      const color = PLAN_COLORS[plan as keyof typeof PLAN_COLORS] || PLAN_COLORS.default;
      
      return {
        plan,
        count,
        monthlyRevenue,
        color
      };
    });
    
    // Sort by revenue (highest first)
    revenueData.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
    
    setPlanRevenueData(revenueData);
  };
  
  useEffect(() => {
    // Apply filters whenever search query or plan filter changes
    let result = [...clinics];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(clinic => 
        clinic.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply plan filter
    if (filterPlan) {
      result = result.filter(clinic => clinic.plan === filterPlan);
    }
    
    setFilteredClinics(result);
  }, [searchQuery, filterPlan, clinics]);
  
  const handleNavigateToClinic = (clinicId: string) => {
    // Set the current clinic ID in localStorage
    localStorage.setItem("currentClinicId", clinicId);
    
    // Navigate to the dashboard
    navigate("/dashboard");
  };
  
  const handleCreateClinic = () => {
    navigate("/registro");
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
    </div>
  );
}
