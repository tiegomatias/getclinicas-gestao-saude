import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WebhookLog {
  id: string;
  event_id: string;
  event_type: string;
  payload: any;
  processed_at: string;
  status: string;
  error_message: string | null;
}

export default function MasterWebhooks() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error loading webhook logs:', error);
      toast.error('Erro ao carregar logs de webhooks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('webhook_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webhook_logs'
        },
        () => {
          loadLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    const colors: Record<string, string> = {
      'checkout.session.completed': 'bg-blue-100 text-blue-800',
      'customer.subscription.created': 'bg-green-100 text-green-800',
      'customer.subscription.updated': 'bg-purple-100 text-purple-800',
      'customer.subscription.deleted': 'bg-red-100 text-red-800',
      'invoice.payment_succeeded': 'bg-emerald-100 text-emerald-800',
      'invoice.payment_failed': 'bg-orange-100 text-orange-800',
    };

    const colorClass = colors[eventType] || 'bg-gray-100 text-gray-800';
    
    return <Badge className={colorClass}>{eventType}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs de Webhooks do Stripe</h1>
        <p className="text-muted-foreground mt-2">
          Monitore todos os eventos recebidos do Stripe em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>
              Últimos 100 eventos do Stripe ({logs.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedLog?.id === log.id
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.event_id.substring(0, 20)}...
                        </span>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                    
                    <div className="space-y-2">
                      {getEventTypeBadge(log.event_type)}
                      
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.processed_at), "dd/MM/yyyy 'às' HH:mm:ss", {
                          locale: ptBR,
                        })}
                      </p>

                      {log.error_message && (
                        <p className="text-sm text-red-600 mt-1">
                          Erro: {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {logs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhum evento registrado ainda</p>
                    <p className="text-sm mt-2">
                      Os webhooks aparecerão aqui quando forem recebidos
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detalhes do Log Selecionado */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Evento</CardTitle>
            <CardDescription>
              {selectedLog ? 'Payload completo do webhook' : 'Selecione um evento para ver os detalhes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLog ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Event ID:</label>
                    <p className="font-mono text-sm mt-1 p-2 bg-muted rounded">
                      {selectedLog.event_id}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Tipo de Evento:</label>
                    <div className="mt-1">
                      {getEventTypeBadge(selectedLog.event_type)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Status:</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedLog.status)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Processado em:</label>
                    <p className="text-sm mt-1">
                      {format(new Date(selectedLog.processed_at), "dd/MM/yyyy 'às' HH:mm:ss", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  {selectedLog.error_message && (
                    <div>
                      <label className="text-sm font-semibold text-red-600">Mensagem de Erro:</label>
                      <p className="text-sm mt-1 p-2 bg-red-50 text-red-800 rounded">
                        {selectedLog.error_message}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold">Payload Completo:</label>
                    <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                <p>Selecione um evento na lista para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
