
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Building, Bell, Shield, Database, CreditCard, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { clinicService } from "@/services/clinicService";
import { professionalService } from "@/services/professionalService";
import { settingsService, type ClinicSettings } from "@/services/settingsService";
import type { Clinic, Professional } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { formatPrice } from "@/lib/subscriptionPlans";

export default function Configuracoes() {
  const navigate = useNavigate();
  const { checkSubscription } = useAuth();
  const subscription = useSubscription();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // System users
  const [systemUsers, setSystemUsers] = useState<Professional[]>([]);
  
  // Settings state
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const clinicDataStr = localStorage.getItem("clinicData");
        
        if (!clinicDataStr) {
          setLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        const clinicId = clinicData.id;
        
        if (!clinicId) {
          setLoading(false);
          return;
        }
        
        // Load clinic info
        const clinicInfo = await clinicService.getClinicById(clinicId);
        
        if (clinicInfo) {
          setClinic(clinicInfo);
          setName(clinicInfo.clinic_name || "");
          setEmail(clinicInfo.admin_email || "");
          
          const metadata = clinicData.metadata || {};
          setPhone(metadata.phone || "");
          setAddress(metadata.address || "");
          setCity(metadata.city || "");
          setState(metadata.state || "");
          setWebsite(metadata.website || "");
          setCnpj(metadata.cnpj || "");
        }
        
        // Load system users (professionals with system access)
        const users = await professionalService.getProfessionalsWithSystemAccess(clinicId);
        setSystemUsers(users);
        
        // Load settings
        let clinicSettings = await settingsService.getClinicSettings(clinicId);
        if (!clinicSettings) {
          clinicSettings = settingsService.getDefaultSettings(clinicId);
        }
        setSettings(clinicSettings);
        
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClinicData();
  }, []);
  
  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    
    try {
      if (!clinic) return;
      
      // Update clinic data
      const updatedClinic = await clinicService.updateClinic(clinic.id, {
        ...clinic,
        clinic_name: name,
        admin_email: email
      });
      
      // Update local state
      setClinic(updatedClinic);
      
      // Update metadata in localStorage
      const clinicDataStr = localStorage.getItem("clinicData");
      if (clinicDataStr) {
        const clinicData = JSON.parse(clinicDataStr);
        const updatedMetadata = {
          ...clinicData.metadata,
          phone,
          address,
          city,
          state,
          website,
          cnpj
        };
        
        localStorage.setItem("clinicData", JSON.stringify({
          ...clinicData,
          metadata: updatedMetadata
        }));
      }
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSavingGeneral(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    if (!clinic || !settings) return;
    
    setSavingNotifications(true);
    try {
      await settingsService.upsertClinicSettings(settings);
      toast.success("Configurações de notificações salvas!");
    } catch (error) {
      console.error("Erro ao salvar notificações:", error);
      toast.error("Erro ao salvar configurações de notificações");
    } finally {
      setSavingNotifications(false);
    }
  };
  
  const handleSaveSecurity = async () => {
    if (!clinic || !settings) return;
    
    setSavingSecurity(true);
    try {
      await settingsService.upsertClinicSettings(settings);
      toast.success("Configurações de segurança salvas!");
    } catch (error) {
      console.error("Erro ao salvar segurança:", error);
      toast.error("Erro ao salvar configurações de segurança");
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(`Erro ao alterar senha: ${error.message || 'Tente novamente'}`);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento');
    } finally {
      setLoadingPortal(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Settings />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Personalize e configure o sistema para {clinic?.clinic_name || "sua clínica"}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="geral">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 md:w-auto">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Personalize as configurações básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma do Sistema</Label>
                <select 
                  id="language" 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option>Português (Brasil)</option>
                  <option>English (US)</option>
                  <option>Español</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <select 
                  id="timezone" 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option>America/Sao_Paulo (UTC-03:00)</option>
                  <option>America/New_York (UTC-04:00)</option>
                  <option>Europe/London (UTC+01:00)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format">Formato de Data</Label>
                <select 
                  id="date-format" 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Tema Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar modo escuro para a interface
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={settings?.general_settings?.dark_mode === true}
                  onCheckedChange={(checked) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        general_settings: {
                          ...settings.general_settings,
                          dark_mode: checked
                        }
                      });
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-mode">Modo Compacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduzir o espaçamento entre elementos
                  </p>
                </div>
                <Switch 
                  id="compact-mode"
                  checked={settings?.general_settings?.compact_mode === true}
                  onCheckedChange={(checked) => {
                    if (settings) {
                      setSettings({
                        ...settings,
                        general_settings: {
                          ...settings.general_settings,
                          compact_mode: checked
                        }
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Restaurar Padrões</Button>
              <Button onClick={handleSaveGeneral} disabled={savingGeneral}>
                {savingGeneral ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Profissionais com acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {systemUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum profissional com acesso ao sistema encontrado
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Configure o acesso ao sistema na página de Profissionais
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  {systemUsers.map((user, index) => (
                    <div 
                      key={user.id} 
                      className={`p-4 ${index < systemUsers.length - 1 ? 'border-b' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email || "Sem e-mail"}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              {user.profession}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled>
                            Ver Permissões
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clinica">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
              <CardDescription>
                Configure os dados da sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Nome da Clínica</Label>
                <Input 
                  id="clinic-name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite o nome da sua clínica"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input 
                  id="cnpj" 
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="Digite o CNPJ da clínica"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input 
                  id="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Digite o endereço completo"
                />
              </div>
              
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input 
                    id="city" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Digite a cidade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input 
                    id="state" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Digite o estado"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Digite o telefone"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite o e-mail"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Digite o website"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo da Clínica</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                    <Building className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <Button variant="outline">Alterar Logo</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleSaveGeneral} disabled={savingGeneral}>
                {savingGeneral ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="assinatura">
          <Card>
            <CardHeader>
              <CardTitle>Minha Assinatura</CardTitle>
              <CardDescription>
                Gerencie sua assinatura e pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Status da Assinatura</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {subscription.isSubscribed() ? (
                        <>
                          <Badge className="bg-green-500">Ativa</Badge>
                          <span className="text-sm font-medium">
                            {subscription.getPlanName()}
                          </span>
                        </>
                      ) : (
                        <Badge variant="outline">Sem Assinatura</Badge>
                      )}
                    </div>
                    
                    {subscription.isExpiringSoon() && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                          Expira em {subscription.daysUntilRenewal()} dias
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => subscription.refresh()}
                    variant="outline"
                    size="sm"
                  >
                    Atualizar Status
                  </Button>
                </div>
                
                {subscription.getCurrentPlan() && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">{formatPrice(subscription.getCurrentPlan()!.price)}</span>
                    </div>
                    {subscription.getSubscriptionEnd() && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Próxima Renovação:</span>
                        <span className="font-medium">{formatDate(subscription.subscriptionStatus.subscription_end)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {subscription.isSubscribed() ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2">Gerenciar Assinatura</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Acesse o portal de gerenciamento para alterar seu plano, atualizar forma de pagamento ou cancelar sua assinatura.
                    </p>
                    <Button 
                      onClick={handleManageSubscription}
                      disabled={loadingPortal}
                      className="w-full sm:w-auto"
                    >
                      {loadingPortal ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Gerenciar Assinatura
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted p-6 text-center">
                  <h4 className="font-medium mb-2">Sem Assinatura Ativa</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Assine agora para ter acesso a todos os recursos da plataforma
                  </p>
                  <Button onClick={() => navigate('/checkout')}>
                    Ver Planos Disponíveis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie como e quando você recebe notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações do Sistema</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novos Agendamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações quando novos agendamentos são criados
                    </p>
                  </div>
                  <Switch 
                    id="new-appointments" 
                    checked={settings?.notification_settings?.appointments ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev, 
                        notification_settings: {...prev.notification_settings, appointments: checked}
                      } : null)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cancelamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações quando agendamentos são cancelados
                    </p>
                  </div>
                  <Switch 
                    id="cancellations" 
                    checked={settings?.notification_settings?.cancellations ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        notification_settings: {...prev.notification_settings, cancellations: checked}
                      } : null)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Medicamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas quando medicamentos precisam de atenção
                    </p>
                  </div>
                  <Switch 
                    id="medicines" 
                    checked={settings?.notification_settings?.medicines ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        notification_settings: {...prev.notification_settings, medicines: checked}
                      } : null)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Documentos</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre novos documentos
                    </p>
                  </div>
                  <Switch 
                    id="documents" 
                    checked={settings?.notification_settings?.documents ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        notification_settings: {...prev.notification_settings, documents: checked}
                      } : null)
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Canais de Notificação</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">E-mail</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações por e-mail
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={settings?.notification_settings?.email ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        notification_settings: {...prev.notification_settings, email: checked}
                      } : null)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Navegador</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações push no navegador
                    </p>
                  </div>
                  <Switch 
                    id="browser-notifications" 
                    checked={settings?.notification_settings?.browser ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        notification_settings: {...prev.notification_settings, browser: checked}
                      } : null)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações por SMS
                    </p>
                  </div>
                  <Switch 
                    id="sms-notifications" 
                    checked={settings?.notification_settings?.sms ?? false}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        notification_settings: {...prev.notification_settings, sms: checked}
                      } : null)
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Lembretes</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembretes de Consulta</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes automáticos de consultas
                    </p>
                  </div>
                  <Switch 
                    id="reminders" 
                    checked={settings?.notification_settings?.reminders ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        notification_settings: {...prev.notification_settings, reminders: checked}
                      } : null)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Restaurar Padrões</Button>
              <Button onClick={handleSaveNotifications} disabled={savingNotifications}>
                {savingNotifications ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Segurança e Privacidade</CardTitle>
              <CardDescription>
                Configure as opções de segurança da sua conta e sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Controle de Acesso</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação em Duas Etapas</p>
                    <p className="text-sm text-muted-foreground">
                      Aumente a segurança com verificação adicional
                    </p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={settings?.security_settings?.two_factor ?? false}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        security_settings: {...prev.security_settings, two_factor: checked}
                      } : null)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tempo Limite de Sessão</p>
                    <p className="text-sm text-muted-foreground">
                      Tempo de inatividade até desconectar automaticamente (minutos)
                    </p>
                  </div>
                  <select 
                    className="w-48 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background"
                    value={settings?.security_settings?.session_timeout ?? 30}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      security_settings: {...prev.security_settings, session_timeout: Number(e.target.value)}
                    } : null)}
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={240}>4 horas</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Alteração de Senha</h3>
                <p className="text-sm text-muted-foreground">
                  Digite uma nova senha para sua conta
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirme a Nova Senha</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                  />
                </div>
                
                <Button 
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Registro de Atividades</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Registrar Acessos ao Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Manter histórico de logins e tentativas de acesso
                    </p>
                  </div>
                  <Switch id="log-access" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Registrar Ações de Usuários</p>
                    <p className="text-sm text-muted-foreground">
                      Manter histórico de mudanças feitas no sistema
                    </p>
                  </div>
                  <Switch id="log-actions" defaultChecked />
                </div>
                
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" /> Ver Registro de Atividades
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleSaveSecurity} disabled={savingSecurity}>
                {savingSecurity ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle>Sistema e Banco de Dados</CardTitle>
              <CardDescription>
                Configure opções avançadas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Backup e Restauração</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Faça backup dos dados do sistema ou restaure a partir de um backup anterior
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      <Database className="mr-2 h-4 w-4" /> Fazer Backup
                    </Button>
                    <Button variant="outline">
                      Restaurar Backup
                    </Button>
                    <Button variant="outline">
                      Backups Automáticos
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Manutenção do Sistema</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Otimize o banco de dados e limpe dados temporários
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      Otimizar Banco de Dados
                    </Button>
                    <Button variant="outline">
                      Limpar Cache
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Importação e Exportação</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Importe ou exporte dados do sistema
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      Exportar Dados
                    </Button>
                    <Button variant="outline">
                      Importar Dados
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Informações do Sistema</h3>
                
                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Versão do Sistema:</span>
                    <span className="text-sm">2.5.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Data da Instalação:</span>
                    <span className="text-sm">15/01/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Última Atualização:</span>
                    <span className="text-sm">01/05/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Ambiente:</span>
                    <span className="text-sm">Produção</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Plano:</span>
                    <span className="text-sm">{clinic?.plan || "Premium"} (Válido até 31/12/2025)</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Verificar Atualizações
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="destructive">
                Redefinir Sistema
              </Button>
              <Button onClick={handleSaveSecurity} disabled={savingSecurity}>
                {savingSecurity ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
