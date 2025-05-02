
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
import { Settings, Users, Building, Bell, Shield, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { clinicService } from "@/services/clinicService";
import type { Clinic } from "@/lib/types";

export default function Configuracoes() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");
  const [cnpj, setCnpj] = useState("");

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        // Get clinic ID from localStorage for demonstration
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
        
        const clinicInfo = await clinicService.getClinicById(clinicId);
        
        if (clinicInfo) {
          setClinic(clinicInfo);
          
          // Initialize form fields with clinic data
          setName(clinicInfo.clinic_name || "");
          setEmail(clinicInfo.admin_email || "");
          
          // If we have additional clinic metadata in localStorage, use it
          const metadata = clinicData.metadata || {};
          setPhone(metadata.phone || "");
          setAddress(metadata.address || "");
          setCity(metadata.city || "");
          setState(metadata.state || "");
          setWebsite(metadata.website || "");
          setCnpj(metadata.cnpj || "");
        }
      } catch (error) {
        console.error("Erro ao buscar dados da clínica:", error);
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
  
  const handleSaveSecurity = () => {
    setSavingSecurity(true);
    
    setTimeout(() => {
      toast.success("Configurações de segurança salvas com sucesso!");
      setSavingSecurity(false);
    }, 1000);
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
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 md:w-auto">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
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
                <Switch id="dark-mode" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-mode">Modo Compacto</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduzir o espaçamento entre elementos
                  </p>
                </div>
                <Switch id="compact-mode" />
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
                Administre usuários e permissões do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-end">
                <Button>
                  <Users className="mr-2 h-4 w-4" /> Adicionar Usuário
                </Button>
              </div>
              
              <div className="rounded-md border">
                <div className="p-4 border-b">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">{clinic?.admin_name || "Admin Clínica"}</h3>
                      <p className="text-sm text-muted-foreground">{clinic?.admin_email || email}</p>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Administrador
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Redefinir Senha</Button>
                    </div>
                  </div>
                </div>
                
                {/* Opcional: se houver outros usuários vinculados à clínica */}
                {clinic?.has_initial_data && (
                  <>
                    <div className="p-4 border-b">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium">Dr. João Silva</h3>
                          <p className="text-sm text-muted-foreground">joao.silva@getclinicas.com</p>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Médico
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Redefinir Senha</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium">Ana Oliveira</h3>
                          <p className="text-sm text-muted-foreground">ana.oliveira@getclinicas.com</p>
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                            Recepcionista
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Redefinir Senha</Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
                  <Switch id="new-appointments" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cancelamentos</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações quando agendamentos são cancelados
                    </p>
                  </div>
                  <Switch id="cancellations" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estoque Baixo</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas quando medicamentos estão em estoque baixo
                    </p>
                  </div>
                  <Switch id="low-stock" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Atualizações do Sistema</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre novas atualizações e recursos
                    </p>
                  </div>
                  <Switch id="system-updates" />
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
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Navegador</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações push no navegador
                    </p>
                  </div>
                  <Switch id="browser-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações por SMS
                    </p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Lembretes</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembretes de Consulta</p>
                    <p className="text-sm text-muted-foreground">
                      Quando enviar lembretes de consulta para pacientes
                    </p>
                  </div>
                  <select className="w-48 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background">
                    <option>1 dia antes</option>
                    <option>2 dias antes</option>
                    <option>1 semana antes</option>
                    <option>Não enviar</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Restaurar Padrões</Button>
              <Button>Salvar Configurações</Button>
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
                  <Switch id="two-factor" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tempo Limite de Sessão</p>
                    <p className="text-sm text-muted-foreground">
                      Tempo de inatividade até desconectar automaticamente
                    </p>
                  </div>
                  <select className="w-48 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background">
                    <option>30 minutos</option>
                    <option>1 hora</option>
                    <option>2 horas</option>
                    <option>4 horas</option>
                    <option>8 horas</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Alteração de Senha</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirme a Nova Senha</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                
                <Button>Alterar Senha</Button>
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
              <Button>Salvar Configurações</Button>
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
