
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/lib/types";
import { toast } from "sonner";

export default function RecentAdmissions() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadRecentPatients = async () => {
      setLoading(true);
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) return;
      
      try {
        const clinic = JSON.parse(clinicDataStr);
        const allPatients = await patientService.getClinicPatients(clinic.id);
        
        // Get last 5 active patients sorted by admission date
        const recentPatients = allPatients
          .filter(p => p.status === 'active')
          .sort((a, b) => new Date(b.admission_date || '').getTime() - new Date(a.admission_date || '').getTime())
          .slice(0, 5);
        
        setPatients(recentPatients);
      } catch (error) {
        console.error('Error loading recent patients:', error);
        toast.error('Erro ao carregar pacientes recentes');
      }
      setLoading(false);
    };
    
    loadRecentPatients();
  }, []);

  const handleNavigateToPacientes = () => {
    navigate("/pacientes");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Nenhuma internação</h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não possui pacientes internados. Adicione pacientes para visualizar as internações recentes.
            </p>
            <Button onClick={() => navigate("/pacientes")}>
              Adicionar pacientes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(patient.admission_date || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge variant={patient.admission_type === 'emergency' ? 'destructive' : 'default'}>
                  {patient.admission_type === 'emergency' ? 'Emergência' : 
                   patient.admission_type === 'scheduled' ? 'Agendado' : 
                   patient.admission_type === 'transfer' ? 'Transferência' : patient.admission_type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
