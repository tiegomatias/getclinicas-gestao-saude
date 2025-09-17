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
  
  // No demo data - shopping list items will come from real database
  const mockItens: ItemCompra[] = [];

  // Filtrar itens - empty array means no items to filter
  const filteredItens = mockItens.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategoria = !filterCategoria || item.categoria === filterCategoria;
    const matchesPrioridade = !filterPrioridade || item.prioridade === filterPrioridade;
    const matchesComprado = mostrarComprados ? true : !item.comprado;
    return matchesSearch && matchesCategoria && matchesPrioridade && matchesComprado;
  });

  // Obter categorias únicas para o filtro - empty for new setup
  const categorias: string[] = [];
  
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
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comprados</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-500">0</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-500">0</p>
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
              <div className="flex items-center justify-center h-20">
                <p className="text-muted-foreground">Nenhum item de alta prioridade. Adicione itens à lista de compras.</p>
              </div>
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
            
            <Select value={filterCategoria || "all"} onValueChange={(value) => setFilterCategoria(value === "all" ? null : value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPrioridade || "all"} onValueChange={(value) => setFilterPrioridade(value === "all" ? null : value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
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
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum item na lista de compras. Adicione itens para começar.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}