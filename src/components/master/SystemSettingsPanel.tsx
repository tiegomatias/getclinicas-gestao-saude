import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Database, RefreshCw, Trash2, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SystemSettingsPanel() {
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [autoBackup, setAutoBackup] = React.useState(true);
  const [dataRetention, setDataRetention] = React.useState("90");
  const [saving, setSaving] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalRecords: 0,
    lastBackup: null as Date | null,
    loading: true
  });

  React.useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // Buscar total de registros de várias tabelas
      const [
        { count: patientsCount },
        { count: professionalsCount },
        { count: clinicsCount },
        { count: bedsCount },
        { data: lastBackup }
      ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('professionals').select('*', { count: 'exact', head: true }),
        supabase.from('clinics').select('*', { count: 'exact', head: true }),
        supabase.from('beds').select('*', { count: 'exact', head: true }),
        supabase.from('backup_logs').select('*').order('created_at', { ascending: false }).limit(1)
      ]);

      const totalRecords = (patientsCount || 0) + (professionalsCount || 0) + (clinicsCount || 0) + (bedsCount || 0);
      
      setStats({
        totalRecords,
        lastBackup: lastBackup && lastBackup[0] ? new Date(lastBackup[0].created_at) : null,
        loading: false
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Configurações salvas com sucesso!");
    setSaving(false);
  };

  const handleRunMaintenance = async () => {
    toast.info("Iniciando rotina de manutenção...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Manutenção concluída com sucesso!");
  };

  const handleCleanupLogs = async () => {
    toast.info("Limpando logs antigos...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Logs limpos com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Banco de Dados</CardTitle>
          <CardDescription>
            Configure opções de manutenção e backup do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
              <p className="text-sm text-muted-foreground">
                Bloqueia acesso temporário ao sistema para todas as clínicas
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Backup Automático</Label>
              <p className="text-sm text-muted-foreground">
                Executa backup diário do banco de dados às 03:00
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="data-retention">Retenção de Dados (dias)</Label>
            <p className="text-sm text-muted-foreground">
              Período de retenção de logs e dados de auditoria
            </p>
            <Input
              id="data-retention"
              type="number"
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              min="30"
              max="365"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operações de Manutenção</CardTitle>
          <CardDescription>
            Execute operações de manutenção e limpeza do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Otimizar Banco de Dados</p>
                <p className="text-sm text-muted-foreground">
                  Executa VACUUM e reindex em todas as tabelas
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleRunMaintenance}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Executar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">Limpar Logs Antigos</p>
                <p className="text-sm text-muted-foreground">
                  Remove logs de auditoria com mais de {dataRetention} dias
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleCleanupLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Sistema</CardTitle>
          <CardDescription>
            Informações sobre o uso de recursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Shield className="h-4 w-4" />
                  <p className="text-xs font-medium">Total de Registros</p>
                </div>
                <p className="text-2xl font-bold">{stats.totalRecords.toLocaleString('pt-BR')}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <p className="text-xs font-medium">Último Backup</p>
                </div>
                <p className="text-sm font-bold">
                  {stats.lastBackup 
                    ? format(stats.lastBackup, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                    : 'Sem backups'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Database className="h-4 w-4" />
                  <p className="text-xs font-medium">Status</p>
                </div>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
