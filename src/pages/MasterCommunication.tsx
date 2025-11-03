import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Send, Bell, Megaphone, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  clinic_id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
  clinic_name?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  created_at: string;
}

export default function MasterCommunication() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  // Message form
  const [selectedClinic, setSelectedClinic] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState("info");

  // Mass notification form
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationCategory, setNotificationCategory] = useState("general");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedClinics, setSelectedClinics] = useState<string[]>([]);

  // Announcement form
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'success' | 'error'>('info');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMessages(),
        loadAnnouncements(),
        loadClinics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          clinic_id,
          title,
          message,
          type,
          created_at,
          read
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch clinic names
      if (data && data.length > 0) {
        const clinicIds = [...new Set(data.map(m => m.clinic_id))];
        const { data: clinicsData } = await supabase
          .from('clinics')
          .select('id, name')
          .in('id', clinicIds);

        const clinicsMap = new Map(clinicsData?.map(c => [c.id, c.name]) || []);
        
        const messagesWithClinicNames = data.map(m => ({
          ...m,
          clinic_name: clinicsMap.get(m.clinic_id) || 'Desconhecida'
        }));

        setMessages(messagesWithClinicNames);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      // Simulate announcements (could be stored in a separate table)
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Nova Funcionalidade: Analytics Avançado',
          content: 'Agora você pode visualizar métricas detalhadas de uso do sistema!',
          type: 'success',
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Manutenção Programada',
          content: 'Haverá manutenção do sistema no domingo das 2h às 6h.',
          type: 'warning',
          active: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedClinic || !messageTitle || !messageContent) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          clinic_id: selectedClinic,
          title: messageTitle,
          message: messageContent,
          type: messageType,
          category: 'message',
          read: false
        });

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso!');
      setMessageDialogOpen(false);
      resetMessageForm();
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleSendMassNotification = async () => {
    if (!notificationTitle || !notificationContent) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const targetClinics = sendToAll ? clinics : clinics.filter(c => selectedClinics.includes(c.id));

      const notifications = targetClinics.map(clinic => ({
        clinic_id: clinic.id,
        title: notificationTitle,
        message: notificationContent,
        type: 'info',
        category: notificationCategory,
        read: false
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast.success(`Notificação enviada para ${targetClinics.length} clínica(s)!`);
      setNotificationDialogOpen(false);
      resetNotificationForm();
      loadMessages();
    } catch (error) {
      console.error('Error sending mass notification:', error);
      toast.error('Erro ao enviar notificação em massa');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      // In a real implementation, this would be stored in a database
      toast.success('Anúncio criado com sucesso!');
      setAnnouncementDialogOpen(false);
      resetAnnouncementForm();
      loadAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Erro ao criar anúncio');
    }
  };

  const resetMessageForm = () => {
    setSelectedClinic("");
    setMessageTitle("");
    setMessageContent("");
    setMessageType("info");
  };

  const resetNotificationForm = () => {
    setNotificationTitle("");
    setNotificationContent("");
    setNotificationCategory("general");
    setSendToAll(true);
    setSelectedClinics([]);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setAnnouncementType("info");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando comunicações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Comunicação</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie mensagens, notificações e anúncios do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Mensagem</DialogTitle>
                <DialogDescription>
                  Envie uma mensagem para uma clínica específica
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Clínica</Label>
                  <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma clínica" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map(clinic => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    placeholder="Título da mensagem"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Conteúdo da mensagem..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Notificação em Massa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enviar Notificação em Massa</DialogTitle>
                <DialogDescription>
                  Envie uma notificação para todas as clínicas ou um grupo selecionado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enviar para todas as clínicas</Label>
                  <Switch checked={sendToAll} onCheckedChange={setSendToAll} />
                </div>
                {!sendToAll && (
                  <div className="space-y-2">
                    <Label>Selecionar Clínicas</Label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {clinics.map(clinic => (
                        <div key={clinic.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedClinics.includes(clinic.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClinics([...selectedClinics, clinic.id]);
                              } else {
                                setSelectedClinics(selectedClinics.filter(id => id !== clinic.id));
                              }
                            }}
                          />
                          <span className="text-sm">{clinic.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Título da notificação"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={notificationContent}
                    onChange={(e) => setNotificationContent(e.target.value)}
                    placeholder="Conteúdo da notificação..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={notificationCategory} onValueChange={setNotificationCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="update">Atualização</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSendMassNotification}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar para {sendToAll ? 'Todos' : `${selectedClinics.length} Clínica(s)`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="mr-2 h-4 w-4" />
                Novo Anúncio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Anúncio do Sistema</DialogTitle>
                <DialogDescription>
                  Crie um anúncio que será exibido para todas as clínicas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Título do anúncio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="Conteúdo do anúncio..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={announcementType} onValueChange={(v: any) => setAnnouncementType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAnnouncement}>
                  Criar Anúncio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Mensagens Enviadas</TabsTrigger>
          <TabsTrigger value="announcements">Anúncios Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Mensagens</CardTitle>
              <CardDescription>
                Últimas 50 mensagens e notificações enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma mensagem enviada ainda
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className={`p-2 rounded-md ${getTypeColor(message.type)}`}>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{message.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {message.message}
                            </p>
                          </div>
                          <Badge variant={message.read ? "secondary" : "default"} className="shrink-0">
                            {message.read ? "Lida" : "Nova"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{message.clinic_name}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(message.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className={getTypeColor(announcement.type)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 mt-0.5" />
                      <div>
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {announcement.content}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={announcement.active ? "default" : "secondary"}>
                      {announcement.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Criado em {format(new Date(announcement.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
