import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationSettingsPanel() {
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [securityAlerts, setSecurityAlerts] = React.useState(true);
  const [newClinicAlerts, setNewClinicAlerts] = React.useState(true);
  const [financialAlerts, setFinancialAlerts] = React.useState(true);
  const [systemAlerts, setSystemAlerts] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [recentNotifications, setRecentNotifications] = React.useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = React.useState(true);

  React.useEffect(() => {
    loadRecentNotifications();
  }, []);

  const loadRecentNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Preferências de notificação salvas!");
    setSaving(false);
  };

  const handleTestNotification = () => {
    toast.info("Notificação de teste", {
      description: "Esta é uma notificação de teste do sistema GetClínicas",
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
          <CardDescription>
            Configure como deseja receber notificações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas importantes por email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações em tempo real no navegador
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Alertas</CardTitle>
          <CardDescription>
            Escolha quais eventos você deseja ser notificado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div className="space-y-0.5">
                <Label htmlFor="security-alerts">Alertas de Segurança</Label>
                <p className="text-sm text-muted-foreground">
                  Tentativas de acesso suspeitas e violações de segurança
                </p>
              </div>
            </div>
            <Switch
              id="security-alerts"
              checked={securityAlerts}
              onCheckedChange={setSecurityAlerts}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div className="space-y-0.5">
                <Label htmlFor="new-clinic-alerts">Novas Clínicas</Label>
                <p className="text-sm text-muted-foreground">
                  Notificação quando uma nova clínica se cadastra
                </p>
              </div>
            </div>
            <Switch
              id="new-clinic-alerts"
              checked={newClinicAlerts}
              onCheckedChange={setNewClinicAlerts}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div className="space-y-0.5">
                <Label htmlFor="financial-alerts">Alertas Financeiros</Label>
                <p className="text-sm text-muted-foreground">
                  Mudanças importantes em receitas e assinaturas
                </p>
              </div>
            </div>
            <Switch
              id="financial-alerts"
              checked={financialAlerts}
              onCheckedChange={setFinancialAlerts}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div className="space-y-0.5">
                <Label htmlFor="system-alerts">Alertas do Sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Problemas técnicos e manutenções programadas
                </p>
              </div>
            </div>
            <Switch
              id="system-alerts"
              checked={systemAlerts}
              onCheckedChange={setSystemAlerts}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleTestNotification}>
              Testar Notificação
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Preferências"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingNotifications ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {notification.action === 'CREATE' && <MessageSquare className="h-5 w-5 text-green-500 mt-0.5" />}
                  {notification.action === 'UPDATE' && <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />}
                  {notification.action === 'DELETE' && <Shield className="h-5 w-5 text-red-500 mt-0.5" />}
                  {notification.action === 'VIEW' && <Bell className="h-5 w-5 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {notification.action} - {notification.entity_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.user_email || 'Sistema'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
