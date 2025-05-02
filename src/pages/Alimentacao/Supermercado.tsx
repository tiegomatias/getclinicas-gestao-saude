
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ShoppingCart, Plus, Search, Calendar, Trash2, Check, Edit, Share } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ItemCompra {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  prioridade: "baixa" | "media" | "alta";
  comprado: boolean;
}

export default function Supermercado() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [filterPrioridade, setFilterPrioridade] = useState<string | null>(null);
  const [mostrarComprados, setMostrarComprados] = useState(false);
  
  // Mock data
  const mockItens: ItemCompra[] = [
    {
      id: "1",
      nome: "Arroz",
      categoria: "Grãos",
      quantidade: 5,
      unidade: "kg",
      prioridade: "alta",
      comprado: false,
    },
    {
      id: "2",
      nome: "Feijão",
      categoria: "Grãos",
      quantidade: 3,
      unidade: "kg",
      prioridade: "alta",
      comprado: false,
    },
    {
      id: "3",
      nome: "Açúcar",
      categoria: "Básicos",
      quantidade: 2,
      unidade: "kg",
      prioridade: "media",
      comprado: false,
    },
    {
      id: "4",
      nome: "Leite",
      categoria: "Laticínios",
      quantidade: 6,
      unidade: "L",
      prioridade: "alta",
      comprado: true,
    },
    {
      id: "5",
      nome: "Óleo de Soja",
      categoria: "Básicos",
      quantidade: 2,
      unidade: "L",
      prioridade: "media",
      comprado: false,
    },
    {
      id: "6",
      nome: "Sal",
      categoria: "Básicos",
      quantidade: 1,
      unidade: "kg",
      prioridade: "baixa",
      comprado: false,
    },
    {
      id: "7",
      nome: "Macarrão",
      categoria: "Massas",
      quantidade: 4,
      unidade: "pacotes",
      prioridade: "media",
      comprado: true,
    },
    {
      id: "8",
      nome: "Farinha de Trigo",
      categoria: "Básicos",
      quantidade: 2,
      unidade: "kg",
      prioridade: "baixa",
      comprado: false,
    },
    {
      id: "9",
      nome: "Iogurte",
      categoria: "Laticínios",
      quantidade: 8,
      unidade: "un",
      prioridade: "media",
      comprado: true,
    },
  ];

  // Filtrar itens
  const filteredItens = mockItens.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategoria = !filterCategoria || item.categoria === filterCategoria;
    const matchesPrioridade = !filterPrioridade || item.prioridade === filterPrioridade;
    const matchesComprado = mostrarComprados ? true : !item.comprado;
    return matchesSearch && matchesCategoria && matchesPrioridade && matchesComprado;
  });

  // Obter categorias únicas para o filtro
  const categorias = Array.from(new Set(mockItens.map(item => item.categoria)));
  
  // Marcar item como comprado
  const handleToggleComprado = (id: string) => {
    // Na implementação real, aqui atualizaríamos o backend
    toast.success("Status do item atualizado");
  };
  
  // Compartilhar lista
  const handleCompartilhar = () => {
    toast.success("Lista compartilhada via WhatsApp");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lista de Supermercado</h1>
        <p className="text-muted-foreground">
          Organize as compras necessárias para a sua clínica
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Visão Geral</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Resumo dos itens da lista</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total de itens</p>
                <p className="text-2xl font-bold">{mockItens.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comprados</p>
                <p className="text-2xl font-bold">{mockItens.filter(item => item.comprado).length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-500">
                  {mockItens.filter(item => !item.comprado).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-500">
                  {mockItens.filter(item => item.prioridade === "alta" && !item.comprado).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista Rápida</CardTitle>
              <Button size="sm" variant="outline" onClick={handleCompartilhar}>
                <Share className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
            <CardDescription>Itens de alta prioridade para compra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockItens
                .filter(item => item.prioridade === "alta" && !item.comprado)
                .map(item => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={`check-${item.id}`}
                        checked={item.comprado}
                        onCheckedChange={() => handleToggleComprado(item.id)}
                      />
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantidade} {item.unidade} - {item.categoria}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">Alta Prioridade</Badge>
                  </div>
                ))}
              {mockItens.filter(item => item.prioridade === "alta" && !item.comprado).length === 0 && (
                <div className="flex items-center justify-center h-20">
                  <p className="text-muted-foreground">Nenhum item de alta prioridade pendente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lista de Compras</CardTitle>
            <div className="flex gap-2">
              <Button className="w-full sm:w-auto" onClick={handleCompartilhar} variant="outline">
                <Share className="mr-2 h-4 w-4" /> Compartilhar Lista
              </Button>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Item
              </Button>
            </div>
          </div>
          <CardDescription>Gerencie os itens para comprar no supermercado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end mb-6">
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

            <Select value={filterPrioridade || ""} onValueChange={(value) => setFilterPrioridade(value || null)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="mostrarComprados" 
                checked={mostrarComprados}
                onCheckedChange={(checked) => setMostrarComprados(!!checked)} 
              />
              <label
                htmlFor="mostrarComprados"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mostrar comprados
              </label>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItens.length > 0 ? (
                  filteredItens.map((item) => (
                    <TableRow key={item.id} className={item.comprado ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={item.comprado}
                          onCheckedChange={() => handleToggleComprado(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <span className={item.comprado ? "line-through text-muted-foreground" : ""}>
                          {item.nome}
                        </span>
                      </TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>{item.quantidade} {item.unidade}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.prioridade === "baixa" ? "outline" : 
                            item.prioridade === "media" ? "secondary" : "destructive"
                          }
                        >
                          {item.prioridade === "baixa" ? "Baixa" : 
                           item.prioridade === "media" ? "Média" : "Alta"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
