
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// No demo data - will show empty state for new clinics

export default function RecentAdmissions() {
  const navigate = useNavigate();
  
  // Check if clinic is newly registered
  const isNewClinic = () => {
    const clinicDataStr = localStorage.getItem("clinicData");
    if (!clinicDataStr) return true; // Default to true if no data
    
    const clinic = JSON.parse(clinicDataStr);
    
    // Consider as new if there's no hasInitialData flag set to true
    return !clinic.hasInitialData;
  };

  const handleNavigateToPacientes = () => {
    navigate("/pacientes");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Nenhuma internação</h3>
          <p className="text-muted-foreground mb-6">
            Você ainda não possui pacientes internados. Adicione pacientes para visualizar as internações recentes.
          </p>
          <Button onClick={handleNavigateToPacientes}>
            Adicionar pacientes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
