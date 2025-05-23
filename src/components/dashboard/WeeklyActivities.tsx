
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Sample activities data
const activities = [
  {
    id: 1,
    title: "Terapia em Grupo",
    day: "Segunda-feira",
    time: "10:00 - 11:30",
    location: "Sala 3",
    participants: 8,
    type: "group",
  },
  {
    id: 2,
    title: "Consulta Dr. Ana Silva",
    day: "Segunda-feira",
    time: "14:00 - 15:00",
    location: "Consultório 2",
    participants: 1,
    type: "individual",
  },
  {
    id: 3,
    title: "Atividade Física",
    day: "Terça-feira",
    time: "09:00 - 10:00",
    location: "Área Externa",
    participants: 15,
    type: "group",
  },
  {
    id: 4,
    title: "Terapia em Grupo",
    day: "Quarta-feira",
    time: "10:00 - 11:30",
    location: "Sala 3",
    participants: 8,
    type: "group",
  },
];

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
        {isNewClinic() ? (
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
        ) : (
          <div className="grid gap-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-b p-4 last:border-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  {activity.type === "group" ? (
                    <Users className="h-5 w-5 text-primary" />
                  ) : (
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <div className="text-xs text-muted-foreground">
                    <p>
                      {activity.day} • {activity.time}
                    </p>
                    <p>
                      {activity.location} •{" "}
                      {activity.participants > 1
                        ? `${activity.participants} participantes`
                        : "Individual"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
