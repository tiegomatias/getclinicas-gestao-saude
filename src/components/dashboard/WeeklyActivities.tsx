
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { activityService } from "@/services/activityService";
import { toast } from "sonner";

interface Activity {
  id: string;
  title: string;
  start_time: string;
  activity_type: string;
  participants_count: number;
}

export default function WeeklyActivities() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadWeeklyActivities = async () => {
      setLoading(true);
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) return;
      
      try {
        const clinic = JSON.parse(clinicDataStr);
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        
        const weekActivities = await activityService.getActivitiesByDateRange(
          clinic.id,
          startOfWeek.toISOString(),
          endOfWeek.toISOString()
        );
        
        const activitiesWithCount = weekActivities.map(activity => ({
          ...activity,
          participants_count: activity.participants?.length || 0
        }));
        
        setActivities(activitiesWithCount.slice(0, 5));
      } catch (error) {
        console.error('Error loading weekly activities:', error);
        toast.error('Erro ao carregar atividades');
      }
      setLoading(false);
    };
    
    loadWeeklyActivities();
  }, []);

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
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Sem atividades</h3>
            <p className="text-muted-foreground mb-6">
              Nenhuma atividade agendada para esta semana. Adicione atividades através da agenda.
            </p>
            <Button onClick={() => navigate("/agenda")}>
              Agendar atividades
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 px-6 py-3 hover:bg-accent cursor-pointer">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.start_time).toLocaleDateString('pt-BR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{activity.participants_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
