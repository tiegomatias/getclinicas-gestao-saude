
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, BarChart2, Globe, AlertCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

export default function MasterDashboard() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [totalClinics, setTotalClinics] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  const [averageOccupation, setAverageOccupation] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch clinics data from localStorage
    const allClinicsStr = localStorage.getItem("allClinics");
    if (allClinicsStr) {
      const allClinics = JSON.parse(allClinicsStr);
      setClinics(allClinics);
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
    }
  }, []);
  
  const handleNavigateToClinic = (clinicId: string) => {
    // Set the current clinic ID in localStorage
    localStorage.setItem("currentClinicId", clinicId);
    
    // Navigate to the dashboard
    navigate("/dashboard");
  };

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
                    onClick={() => navigate("/registro")}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    <span>Nova Clínica</span>
                  </NavigationMenuLink>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle() + " w-full justify-start cursor-pointer mt-2"}
                    onClick={() => navigate("/relatorios")}
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
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinics list */}
        <div className="lg:col-span-2">
          <MasterClinicsTable 
            clinics={clinics}
            onViewClinic={handleNavigateToClinic}
          />
        </div>
        
        {/* Occupation summary */}
        <div>
          <MasterOccupationChart clinics={clinics} />
        </div>
      </div>
    </div>
  );
}
