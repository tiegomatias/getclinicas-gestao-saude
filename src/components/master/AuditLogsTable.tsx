import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, RefreshCw } from "lucide-react";
import { auditService, type AuditLog, type AuditAction, type EntityType } from "@/services/auditService";
import { toast } from "sonner";

export function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadLogs();
  }, [page, filterAction, filterEntity]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const options: any = {
        limit: pageSize,
        offset: page * pageSize
      };

      if (filterAction !== "all") {
        options.action = filterAction as AuditAction;
      }

      if (filterEntity !== "all") {
        options.entityType = filterEntity as EntityType;
      }

      const { data, total: count } = await auditService.getLogs(options);
      setLogs(data);
      setTotal(count);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await auditService.exportLogs();
      toast.success("Logs exportados com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar logs");
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.user_email?.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.entity_type.toLowerCase().includes(query)
    );
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      CREATE: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
      VIEW: "outline",
      LOGIN: "default",
      LOGOUT: "secondary",
      EXPORT: "outline"
    };
    return variants[action] || "outline";
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Logs de Auditoria</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, ação ou tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="CREATE">Criar</SelectItem>
                <SelectItem value="UPDATE">Atualizar</SelectItem>
                <SelectItem value="DELETE">Excluir</SelectItem>
                <SelectItem value="VIEW">Visualizar</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="EXPORT">Exportar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="clinic">Clínica</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="report">Relatório</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>{log.user_email || "Sistema"}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadge(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{log.entity_type}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.details && Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {page * pageSize + 1} a {Math.min((page + 1) * pageSize, total)} de {total} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * pageSize >= total}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
