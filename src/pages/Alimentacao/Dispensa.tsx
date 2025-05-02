
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Package, Plus, Search, Calendar, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ItemDispensa {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  validade: Date;
  status: "ok" | "alerta" | "vencido";
}

export default function Dispensa() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  
  // Mock data
  const mockItens: ItemDispensa[] = [
    {
      id: "1",
      nome: "Arroz",
      categoria: "Grãos",
      quantidade: 5,
      unidade: "kg",
      validade: new Date(2025, 11, 25),
      status: "ok",
    },
    {
      id: "2",
      nome: "Feijão",
      categoria: "Grãos",
      quantidade: 3,
      unidade: "kg",
      validade: new Date(2025, 10, 15),
      status: "ok",
    },
    {
      id: "3",
      nome: "Açúcar",
      categoria: "Básicos",
      quantidade: 2,
      unidade: "kg",
      validade: new Date(2025, 8, 30),
      status: "ok",
    },
    {
      id: "4",
      nome: "Leite",
      categoria: "Laticínios",
      quantidade: 6,
      unidade: "L",
      validade: new Date(2025, 5, 18),
      status: "alerta",
    },
    {
      id: "5",
      nome: "Óleo de Soja",
      categoria: "Básicos",
      quantidade: 2,
      unidade: "L",
      validade: new Date(2025, 7, 10),
      status: "ok",
    },
    {
      id: "6",
      nome: "Sal",
      categoria: "Básicos",
      quantidade: 1,
      unidade: "kg",
      validade: new Date(2026, 1, 5),
      status: "ok",
    },
    {
      id: "7",
      nome: "Macarrão",
      categoria: "Massas",
      quantidade: 4,
      unidade: "pacotes",
      validade: new Date(2025, 9, 20),
      status: "ok",
    },
    {
      id: "8",
      nome: "Farinha de Trigo",
      categoria: "Básicos",
      quantidade: 2,
      unidade: "kg",
      validade: new Date(2025, 5, 5),
      status: "alerta",
    },
    {
      id: "9",
      nome: "Iogurte",
      categoria: "Laticínios",
      quantidade: 8,
      unidade: "un",
      validade: new Date(2025, 5, 2),
      status: "vencido",
    },
  ];

  // Filtrar itens
  const filteredItens = mockItens.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategoria = !filterCategoria || item.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  // Obter categorias únicas para o filtro
  const categorias = Array.from(new Set(mockItens.map(item => item.categoria)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Controle de Dispensa</h1>
        <p className="text-muted-foreground">
          Gerencie o estoque de alimentos da sua clínica
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Visão Geral</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Resumo dos itens em estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total de itens</p>
                <p className="text-2xl font-bold">{mockItens.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">{categorias.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-amber-500">
                  {mockItens.filter(item => item.status === "alerta").length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-500">
                  {mockItens.filter(item => item.status === "vencido").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alertas de Validade</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <CardDescription>Itens próximos do vencimento</CardDescription>
          </CardHeader>
          <CardContent>
            {mockItens.filter(item => item.status !== "ok").length > 0 ? (
              <div className="space-y-3">
                {mockItens
                  .filter(item => item.status !== "ok")
                  .map(item => (
                    <Alert key={item.id} variant={item.status === "vencido" ? "destructive" : "warning"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-sm">{item.nome}</AlertTitle>
                      <AlertDescription className="text-xs">
                        {item.status === "vencido" 
                          ? `Vencido desde ${format(item.validade, "dd/MM/yyyy", { locale: ptBR })}`
                          : `Vence em ${format(item.validade, "dd/MM/yyyy", { locale: ptBR })}`}
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-20">
                <p className="text-muted-foreground">Nenhum item com alerta de validade</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Itens na Dispensa</CardTitle>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Item
            </Button>
          </div>
          <CardDescription>Gerencie os itens disponíveis na dispensa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row items-end mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar item..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterCategoria || ""} onValueChange={(value) => setFilterCategoria(value || null)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItens.length > 0 ? (
                  filteredItens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>{item.quantidade} {item.unidade}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{format(item.validade, "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "ok" ? "outline" : 
                            item.status === "alerta" ? "warning" : "destructive"
                          }
                        >
                          {item.status === "ok" ? "OK" : 
                           item.status === "alerta" ? "Próximo ao vencimento" : "Vencido"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
