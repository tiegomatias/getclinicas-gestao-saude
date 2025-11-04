import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  Users,
  Calendar,
  Bed,
  Activity,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { ClinicData } from "@/services/masterService";
import { auditService, type AuditLog } from "@/services/auditService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClinicDetailsModalProps {
  clinic: ClinicData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClinicUser {
  id: string;
  user_id: string;
  role: string;
  email: string;
  name: string;
  created_at: string;
}

interface ClinicStats {
  totalPatients: number;
  totalProfessionals: number;
  totalAppointments: number;
  totalRevenue: number;
}

export function ClinicDetailsModal({
  clinic,
  open,
  onOpenChange,
}: ClinicDetailsModalProps) {
  const [users, setUsers] = useState<ClinicUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<ClinicStats>({
    totalPatients: 0,
    totalProfessionals: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clinic && open) {
      loadClinicData();
    }
  }, [clinic, open]);

  const loadClinicData = async () => {
    if (!clinic) return;

    try {
      setLoading(true);

      // Carregar usuários da clínica via edge function
      const { data: usersData, error: usersError } = await supabase.functions.invoke(
        "get-clinic-users",
        {
          body: { clinicId: clinic.id },
        }
      );

      if (usersError) {
        console.error("Error loading users:", usersError);
      } else if (usersData?.users) {
        setUsers(usersData.users);
      }

      // Carregar logs de atividade da clínica
      const logs = await auditService.getLogs({
        entityType: "clinic",
        limit: 20,
      });
      
      const clinicLogs = logs.data.filter(
        log => log.entity_id === clinic.id || 
        (log.details?.clinicName && log.details.clinicName === clinic.name)
      );
      setActivityLogs(clinicLogs);

      // Carregar estatísticas
      const [patients, professionals, appointments, finances] = await Promise.all([
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinic.id),
        supabase
          .from("professionals")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinic.id),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", clinic.id),
        supabase
          .from("finances")
          .select("amount")
          .eq("clinic_id", clinic.id)
          .eq("type", "revenue"),
      ]);

      const totalRevenue = finances.data?.reduce(
        (sum, f) => sum + Number(f.amount),
        0
      ) || 0;

      setStats({
        totalPatients: patients.count || 0,
        totalProfessionals: professionals.count || 0,
        totalAppointments: appointments.count || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error loading clinic data:", error);
      toast.error("Erro ao carregar dados da clínica");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!clinic) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {clinic.name}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos e gerenciamento da clínica
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Clínica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email Admin</p>
                      <p className="font-medium">{clinic.admin_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{clinic.plan || "Básico"}</Badge>
                    <span className="text-sm text-muted-foreground">Plano atual</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Leitos</p>
                      <p className="font-medium">
                        {clinic.has_beds_data 
                          ? `${clinic.occupied_beds} / ${clinic.occupied_beds + clinic.available_beds + clinic.maintenance_beds}`
                          : 'Não configurado'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cadastrado em</p>
                      <p className="font-medium">
                        {new Date(clinic.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Ocupação de Leitos</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {clinic.occupied_beds}
                      </p>
                      <p className="text-sm text-muted-foreground">Ocupados</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {clinic.available_beds}
                      </p>
                      <p className="text-sm text-muted-foreground">Disponíveis</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {clinic.maintenance_beds}
                      </p>
                      <p className="text-sm text-muted-foreground">Manutenção</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usuários da Clínica</CardTitle>
                <CardDescription>
                  Gerencie os usuários com acesso a esta clínica
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground">
                    Carregando usuários...
                  </p>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{user.role}</Badge>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Pacientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPatients}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Profissionais
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProfessionals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Agendamentos
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Receita Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades</CardTitle>
                <CardDescription>
                  Últimas ações relacionadas a esta clínica
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Nenhuma atividade registrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {log.user_email || "Sistema"}
                            </span>
                          </div>
                          <p className="text-sm mt-1">
                            {log.details && Object.keys(log.details).length > 0
                              ? JSON.stringify(log.details)
                              : "Sem detalhes"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
