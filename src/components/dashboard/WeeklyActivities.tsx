
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// No demo data - will show empty state

export default function WeeklyActivities() {
  const navigate = useNavigate();
  
  // Check if clinic is newly registered
  const isNewClinic = () => {
    const clinicDataStr = localStorage.getItem("clinicData");
    if (!clinicDataStr) return true; // Default to true if no data
    
    const clinic = JSON.parse(clinicDataStr);
    
    // Consider as new if there's no hasInitialData flag set to true
    return !clinic.hasInitialData;
  };

  const handleNavigateToAgenda = () => {
    navigate("/agenda");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atividades da Semana</CardTitle>
        <Button
          variant="link"
          className="text-xs text-primary hover:underline p-0 h-auto"
          onClick={() => navigate("/agenda")}
        >
          Ver agenda completa
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Sem atividades</h3>
          <p className="text-muted-foreground mb-6">
            Nenhuma atividade agendada para esta semana. Adicione atividades através da agenda.
          </p>
          <Button onClick={handleNavigateToAgenda}>
            Agendar atividades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
