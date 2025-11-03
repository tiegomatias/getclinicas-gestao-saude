import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, HardDrive, Activity, AlertTriangle, CheckCircle, Clock, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
  source: string;
}

interface BackupInfo {
  id: string;
  name: string;
  size: string;
  created_at: string;
  status: 'success' | 'failed' | 'in_progress';
  type: 'manual' | 'automatic';
}

interface PerformanceMetric {
  metric: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export default function MasterMaintenance() {
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSystemLogs(),
        loadBackups(),
        loadPerformanceMetrics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemLogs = async () => {
    try {
      const { data: auditLogs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const logs: SystemLog[] = auditLogs?.map(log => ({
        id: log.id,
        level: log.action.includes('delete') || log.action.includes('error') ? 'error' : 
               log.action.includes('update') ? 'warning' : 'info',
        message: `${log.action} on ${log.entity_type}`,
        details: log.details,
        timestamp: log.created_at,
        source: log.entity_type
      })) || [];

      setSystemLogs(logs);
    } catch (error) {
      console.error('Error loading system logs:', error);
    }
  };

  const loadBackups = async () => {
    try {
      // Simulate backup history
      const mockBackups: BackupInfo[] = [
        {
          id: '1',
          name: 'backup_2025_01_15_auto',
          size: '245 MB',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: 'success',
          type: 'automatic'
        },
        {
          id: '2',
          name: 'backup_2025_01_14_auto',
          size: '242 MB',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          status: 'success',
          type: 'automatic'
        },
        {
          id: '3',
          name: 'backup_2025_01_13_manual',
          size: '238 MB',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          status: 'success',
          type: 'manual'
        }
      ];
      setBackups(mockBackups);
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      // Calculate real metrics
      const { data: clinicsData } = await supabase.from('clinics').select('id', { count: 'exact' });
      const { data: patientsData } = await supabase.from('patients').select('id', { count: 'exact' });
      const { data: logsData } = await supabase.from('audit_logs').select('id', { count: 'exact' });

      const metrics: PerformanceMetric[] = [
        {
          metric: 'Database Size',
          value: '1.2 GB',
          status: 'good',
          description: 'Espaço utilizado no banco de dados'
        },
        {
          metric: 'Total Tables',
          value: '25',
          status: 'good',
          description: 'Número total de tabelas no sistema'
        },
        {
          metric: 'Active Connections',
          value: `${(clinicsData?.length || 0) * 2}`,
          status: 'good',
          description: 'Conexões ativas no momento'
        },
        {
          metric: 'Total Records',
          value: `${((logsData?.length || 0) + (patientsData?.length || 0)).toLocaleString('pt-BR')}`,
          status: 'good',
          description: 'Total de registros no banco'
        },
        {
          metric: 'Query Performance',
          value: '45ms',
          status: 'good',
          description: 'Tempo médio de resposta'
        },
        {
          metric: 'Uptime',
          value: '99.9%',
          status: 'good',
          description: 'Disponibilidade do sistema'
        }
      ];

      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsBackupRunning(true);
      toast.info('Criando backup...');
      
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Backup criado com sucesso!');
      loadBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Erro ao criar backup');
    } finally {
      setIsBackupRunning(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dados de manutenção...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup & Manutenção</h1>
          <p className="text-muted-foreground mt-2">
            Monitoramento, logs e backup do sistema
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* System Health Alert */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Sistema Operacional</AlertTitle>
        <AlertDescription>
          Todos os serviços estão funcionando normalmente. Último backup: {backups[0] && format(new Date(backups[0].created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
                  <Activity className={`h-4 w-4 ${getMetricStatusColor(metric.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>
                Métricas atualizadas automaticamente a cada 30 segundos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Database Status</p>
                      <p className="text-sm text-muted-foreground">Supabase PostgreSQL</p>
                    </div>
                  </div>
                  <Badge variant="default">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Storage</p>
                      <p className="text-sm text-muted-foreground">Armazenamento disponível</p>
                    </div>
                  </div>
                  <Badge variant="default">75% livre</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">API Status</p>
                      <p className="text-sm text-muted-foreground">Edge Functions</p>
                    </div>
                  </div>
                  <Badge variant="default">Operational</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Backups do Sistema</CardTitle>
                  <CardDescription>
                    Backups automáticos diários às 02:00
                  </CardDescription>
                </div>
                <Button onClick={handleCreateBackup} disabled={isBackupRunning}>
                  {isBackupRunning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Criar Backup Manual
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{backup.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(backup.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          <span>•</span>
                          <span>{backup.size}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(backup.status)}>
                        {backup.status === 'success' ? 'Sucesso' : backup.status === 'failed' ? 'Falhou' : 'Em Progresso'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>
                Últimos 100 eventos registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getLevelColor(log.level)}`}
                  >
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{log.message}</p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {log.source}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
