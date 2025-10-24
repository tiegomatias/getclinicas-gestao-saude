import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ShoppingCart, Plus, Search, Trash2, Share } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { shoppingListService, ShoppingListItem } from "@/services/shoppingListService";

export default function Supermercado() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mostrarComprados, setMostrarComprados] = useState(false);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string>("");
  const [shoppingListId, setShoppingListId] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    food_item_name: "",
    quantity: 1,
    unit: "kg",
    estimated_cost: 0,
    notes: "",
  });

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        setIsLoading(false);
        return;
      }

      const clinicData = JSON.parse(clinicDataStr);
      setClinicId(clinicData.id);

      // Get or create active shopping list
      let activeList = await shoppingListService.getActiveShoppingList(clinicData.id);
      
      if (!activeList) {
        activeList = await shoppingListService.createShoppingList(
          clinicData.id,
          `Lista de Compras - ${new Date().toLocaleDateString()}`
        );
      }

      setShoppingListId(activeList.id);

      // Load items
      const listItems = await shoppingListService.getShoppingListItems(activeList.id);
      setItems(listItems);
    } catch (error) {
      console.error("Erro ao carregar lista de compras:", error);
      toast.error("Erro ao carregar lista de compras");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.food_item_name || !shoppingListId) {
      toast.error("Preencha o nome do item");
      return;
    }

    try {
      await shoppingListService.addShoppingListItem(shoppingListId, newItem);
      toast.success("Item adicionado com sucesso");
      setNewItem({
        food_item_name: "",
        quantity: 1,
        unit: "kg",
        estimated_cost: 0,
        notes: "",
      });
      setIsAddDialogOpen(false);
      loadShoppingList();
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
    }
  };

  const handleToggleComprado = async (itemId: string, currentStatus: boolean) => {
    const success = await shoppingListService.toggleItemPurchased(itemId, !currentStatus);
    if (success) {
      toast.success("Status atualizado");
      loadShoppingList();
    } else {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Deseja realmente remover este item?")) {
      const success = await shoppingListService.deleteShoppingListItem(itemId);
      if (success) {
        toast.success("Item removido");
        loadShoppingList();
      } else {
        toast.error("Erro ao remover item");
      }
    }
  };

  const handleCompartilhar = () => {
    const pendingItems = items.filter(item => !item.purchased);
    const message = `📋 *Lista de Compras*\n\n${pendingItems.map(item => 
      `• ${item.food_item_name} - ${item.quantity} ${item.unit}`
    ).join('\n')}`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.food_item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComprado = mostrarComprados ? true : !item.purchased;
    return matchesSearch && matchesComprado;
  });

  const totalItems = items.length;
  const purchasedItems = items.filter(i => i.purchased).length;
  const pendingItems = totalItems - purchasedItems;
  const estimatedTotal = items.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);

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
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comprados</p>
                <p className="text-2xl font-bold">{purchasedItems}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-500">{pendingItems}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Custo Estimado</p>
                <p className="text-2xl font-bold text-green-500">
                  R$ {estimatedTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ações Rápidas</CardTitle>
              <Button size="sm" variant="outline" onClick={handleCompartilhar} disabled={pendingItems === 0}>
                <Share className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
            <CardDescription>Gerencie sua lista de compras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingItems === 0 ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-muted-foreground">Todos os itens foram comprados ou a lista está vazia.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Você tem <strong>{pendingItems}</strong> {pendingItems === 1 ? 'item pendente' : 'itens pendentes'} para comprar.
                  </p>
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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Item</DialogTitle>
                    <DialogDescription>Adicione um novo item à lista de compras</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="item-name">Nome do Item</Label>
                      <Input
                        id="item-name"
                        value={newItem.food_item_name}
                        onChange={(e) => setNewItem({ ...newItem, food_item_name: e.target.value })}
                        placeholder="Ex: Arroz"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unidade</Label>
                        <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="und">und</SelectItem>
                            <SelectItem value="pct">pct</SelectItem>
                            <SelectItem value="cx">cx</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost">Custo Estimado (R$)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newItem.estimated_cost}
                        onChange={(e) => setNewItem({ ...newItem, estimated_cost: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Input
                        id="notes"
                        value={newItem.notes}
                        onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddItem}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Custo Est.</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum item na lista de compras. Adicione itens para começar.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className={item.purchased ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={item.purchased}
                          onCheckedChange={() => handleToggleComprado(item.id, item.purchased)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.purchased ? <s>{item.food_item_name}</s> : item.food_item_name}
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.estimated_cost ? `R$ ${item.estimated_cost.toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}