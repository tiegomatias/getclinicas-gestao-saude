
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function MasterSettings() {
  const [adminEmail, setAdminEmail] = useState("tiegomatias@gmail.comm");
  const [systemName, setSystemName] = useState("GetClinics");
  const [sendEmails, setSendEmails] = useState(true);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [securityLevel, setSecurityLevel] = useState("high");
  const [loading, setLoading] = useState(false);
  const [require2fa, setRequire2fa] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  const handleSaveGeneral = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Salvar configurações na localStorage para persistência
      const settings = {
        systemName,
        adminEmail,
        allowRegistration
      };
      localStorage.setItem("masterGeneralSettings", JSON.stringify(settings));
      
      toast.success("Configurações gerais salvas com sucesso!");
      setLoading(false);
    }, 1000);
  };
  
  const handleSaveSecurity = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Salvar configurações de segurança
      const securitySettings = {
        securityLevel,
        require2fa
      };
      localStorage.setItem("masterSecuritySettings", JSON.stringify(securitySettings));
      
      toast.success("Configurações de segurança salvas com sucesso!");
      setLoading(false);
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Salvar configurações de notificações
      const notificationSettings = {
        sendEmails,
        weeklyReports,
        systemAlerts
      };
      localStorage.setItem("masterNotificationSettings", JSON.stringify(notificationSettings));
      
      toast.success("Configurações de notificações salvas com sucesso!");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações gerais do sistema GetClinics
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configure as informações básicas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">Nome do Sistema</Label>
                <Input 
                  id="systemName" 
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email do Administrador</Label>
                <Input 
                  id="adminEmail" 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration">Permitir Novos Registros</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita ou desabilita o registro de novas clínicas
                  </p>
                </div>
                <Switch 
                  id="registration" 
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>
              
              <Button onClick={handleSaveGeneral} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>Configure as opções de segurança do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="securityLevel">Nível de Segurança</Label>
                <select 
                  id="securityLevel"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(e.target.value)}
                >
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  Define o nível de segurança para todas as clínicas
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Exigir Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Exige autenticação de dois fatores para administradores de clínicas
                  </p>
                </div>
                <Switch 
                  id="2fa" 
                  checked={require2fa} 
                  onCheckedChange={setRequire2fa}
                />
              </div>
              
              <Button onClick={handleSaveSecurity} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Configure como as notificações são enviadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar notificações do sistema por email
                  </p>
                </div>
                <Switch 
                  id="emailNotifications" 
                  checked={sendEmails}
                  onCheckedChange={setSendEmails}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weeklyReports">Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar relatórios semanais para administradores
                  </p>
                </div>
                <Switch 
                  id="weeklyReports" 
                  checked={weeklyReports} 
                  onCheckedChange={setWeeklyReports}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="systemAlerts">Alertas do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre eventos críticos do sistema
                  </p>
                </div>
                <Switch 
                  id="systemAlerts" 
                  checked={systemAlerts} 
                  onCheckedChange={setSystemAlerts}
                />
              </div>
              
              <Separator className="my-4" />
              
              <Button onClick={handleSaveNotifications} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
