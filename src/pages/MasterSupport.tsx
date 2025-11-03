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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Ticket, BookOpen, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SupportTicket {
  id: string;
  clinic_id: string;
  clinic_name: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface Documentation {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
}

export default function MasterSupport() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);

  // Ticket response form
  const [responseMessage, setResponseMessage] = useState("");
  const [newStatus, setNewStatus] = useState<'open' | 'in_progress' | 'resolved' | 'closed'>('in_progress');

  // FAQ form
  const [faqCategory, setFaqCategory] = useState("");
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
    
    // Setup realtime subscriptions
    const ticketsChannel = supabase
      .channel('support-tickets-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets'
      }, () => {
        loadTickets();
      })
      .subscribe();

    const faqsChannel = supabase
      .channel('faqs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'faqs'
      }, () => {
        loadFAQs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(faqsChannel);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTickets(),
        loadFAQs(),
        loadDocumentation()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch clinic names
      if (data && data.length > 0) {
        const clinicIds = [...new Set(data.map(t => t.clinic_id))];
        const { data: clinicsData } = await supabase
          .from('clinics')
          .select('id, name')
          .in('id', clinicIds);

        const clinicsMap = new Map(clinicsData?.map(c => [c.id, c.name]) || []);
        
        const ticketsWithClinicNames = data.map(t => ({
          ...t,
          clinic_name: clinicsMap.get(t.clinic_id) || 'Desconhecida',
          priority: t.priority as 'low' | 'medium' | 'high' | 'urgent',
          status: t.status as 'open' | 'in_progress' | 'resolved' | 'closed'
        }));

        setTickets(ticketsWithClinicNames);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Erro ao carregar tickets');
    }
  };

  const loadFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast.error('Erro ao carregar FAQs');
    }
  };

  const loadDocumentation = async () => {
    try {
      const mockDocs: Documentation[] = [
        {
          id: '1',
          title: 'Guia de Início Rápido',
          category: 'Primeiros Passos',
          content: 'Bem-vindo ao GetClínicas! Este guia vai ajudá-lo a configurar sua clínica e começar a usar o sistema...',
          lastUpdated: new Date(Date.now() - 604800000).toISOString()
        },
        {
          id: '2',
          title: 'Gerenciamento de Pacientes',
          category: 'Módulos',
          content: 'O módulo de pacientes permite cadastrar, editar e acompanhar todos os pacientes da sua clínica...',
          lastUpdated: new Date(Date.now() - 1209600000).toISOString()
        },
        {
          id: '3',
          title: 'Sistema de Medicamentos',
          category: 'Módulos',
          content: 'Gerencie prescrições, estoque e administração de medicamentos de forma integrada...',
          lastUpdated: new Date(Date.now() - 1814400000).toISOString()
        },
        {
          id: '4',
          title: 'Relatórios e Analytics',
          category: 'Avançado',
          content: 'Aprenda a gerar relatórios detalhados sobre ocupação, financeiro e atividades...',
          lastUpdated: new Date(Date.now() - 2419200000).toISOString()
        }
      ];
      setDocumentation(mockDocs);
    } catch (error) {
      console.error('Error loading documentation:', error);
    }
  };

  const handleRespondTicket = async () => {
    if (!selectedTicket || !responseMessage) {
      toast.error('Preencha a resposta');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create response record
      await supabase
        .from('support_ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: responseMessage
        });

      // Update ticket status
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', selectedTicket.id);

      if (updateError) throw updateError;

      // Create notification for the clinic
      await supabase
        .from('notifications')
        .insert({
          clinic_id: selectedTicket.clinic_id,
          title: `Resposta ao Ticket #${selectedTicket.id.slice(0, 8)}`,
          message: responseMessage,
          type: 'info',
          category: 'support',
          read: false
        });

      toast.success('Resposta enviada com sucesso!');
      setResponseDialogOpen(false);
      setResponseMessage("");
      setSelectedTicket(null);
      loadTickets();
    } catch (error) {
      console.error('Error responding to ticket:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleCreateFAQ = async () => {
    if (!faqCategory || !faqQuestion || !faqAnswer) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('faqs')
        .insert({
          category: faqCategory,
          question: faqQuestion,
          answer: faqAnswer
        });

      if (error) throw error;

      toast.success('FAQ criado com sucesso!');
      setFaqDialogOpen(false);
      resetFaqForm();
      loadFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error('Erro ao criar FAQ');
    }
  };

  const resetFaqForm = () => {
    setFaqCategory("");
    setFaqQuestion("");
    setFaqAnswer("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technical: 'Técnico',
      question: 'Dúvida',
      feature_request: 'Sugestão',
      bug: 'Bug',
      other: 'Outro'
    };
    return labels[category] || category;
  };

  // Filter tickets based on status and search
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSearch = !searchQuery || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.clinic_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando sistema de suporte...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Suporte</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie tickets, FAQ e documentação do sistema
          </p>
        </div>
        <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <HelpCircle className="mr-2 h-4 w-4" />
              Nova FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova FAQ</DialogTitle>
              <DialogDescription>
                Adicione uma nova pergunta frequente à base de conhecimento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  placeholder="Ex: Conta e Acesso"
                />
              </div>
              <div className="space-y-2">
                <Label>Pergunta</Label>
                <Input
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="Digite a pergunta..."
                />
              </div>
              <div className="space-y-2">
                <Label>Resposta</Label>
                <Textarea
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Digite a resposta..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFAQ}>
                Criar FAQ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets de Suporte</CardTitle>
              <CardDescription>
                Todas as solicitações de suporte das clínicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por título, descrição ou clínica..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="resolved">Resolvidos</SelectItem>
                    <SelectItem value="closed">Fechados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum ticket encontrado
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                  >
                    {getStatusIcon(ticket.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{ticket.clinic_name}</span>
                        <span>•</span>
                        <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                        <span>•</span>
                        <span>{format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setNewStatus(ticket.status === 'open' ? 'in_progress' : ticket.status);
                        setResponseDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Responder
                    </Button>
                  </div>
                ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>
                Base de conhecimento para as clínicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{category}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {documentation.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {doc.content.slice(0, 100)}...
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{doc.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Atualizado em {format(new Date(doc.lastUpdated), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Digite sua resposta..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Novo Status</Label>
              <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRespondTicket}>
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
