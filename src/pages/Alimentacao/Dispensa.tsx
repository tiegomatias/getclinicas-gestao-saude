
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Calendar, Filter, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

// Interface para os itens de alimentos
interface FoodItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: Date;
  status: "normal" | "expiring" | "expired";
  addedDate: Date;
}

// Dados fictícios para a lista de alimentos
const dummyFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Arroz",
    category: "Grãos",
    quantity: 5,
    unit: "kg",
    expirationDate: new Date(2025, 11, 31),
    status: "normal",
    addedDate: new Date(2025, 1, 15),
  },
  {
    id: "2",
    name: "Feijão",
    category: "Grãos",
    quantity: 3,
    unit: "kg",
    expirationDate: new Date(2025, 5, 15),
    status: "normal",
    addedDate: new Date(2025, 1, 15),
  },
  {
    id: "3",
    name: "Leite",
    category: "Laticínios",
    quantity: 12,
    unit: "L",
    expirationDate: new Date(2025, 5, 10),
    status: "normal",
    addedDate: new Date(2025, 1, 20),
  },
  {
    id: "4",
    name: "Iogurte",
    category: "Laticínios",
    quantity: 6,
    unit: "und",
    expirationDate: new Date(2025, 5, 1),
    status: "expiring",
    addedDate: new Date(2025, 4, 10),
  },
  {
    id: "5",
    name: "Banana",
    category: "Frutas",
    quantity: 2,
    unit: "kg",
    expirationDate: new Date(2025, 4, 25),
    status: "expiring",
    addedDate: new Date(2025, 4, 15),
  },
  {
    id: "6",
    name: "Pão de forma",
    category: "Padaria",
    quantity: 1,
    unit: "und",
    expirationDate: new Date(2025, 4, 20),
    status: "expired",
    addedDate: new Date(2025, 4, 5),
  },
];

export default function Dispensa() {
  // Estados
  const [foodItems, setFoodItems] = useState<FoodItem[]>(dummyFoodItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({
    name: "",
    category: "",
    quantity: 1,
    unit: "und",
    expirationDate: new Date(),
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Filtragem dos itens com base nos filtros ativos
  const filteredItems = foodItems.filter((item) => {
    // Filtro por termo de busca
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por categoria
    const matchesCategory =
      categoryFilter === null || item.category === categoryFilter;

    // Filtro por status
    const matchesStatus = statusFilter === null || item.status === statusFilter;

    // Filtro por tab
    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "expirando" && item.status === "expiring") ||
      (activeTab === "expirados" && item.status === "expired");

    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  // Categorias únicas para o filtro
  const uniqueCategories = Array.from(
    new Set(foodItems.map((item) => item.category))
  );

  // Função para adicionar um novo item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const now = new Date();
    const daysUntilExpiration = Math.floor(
      (new Date(newItem.expirationDate!).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let status: "normal" | "expiring" | "expired" = "normal";
    if (daysUntilExpiration < 0) {
      status = "expired";
    } else if (daysUntilExpiration < 7) {
      status = "expiring";
    }

    const newFoodItem: FoodItem = {
      id: Date.now().toString(),
      name: newItem.name!,
      category: newItem.category!,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || "und",
      expirationDate: new Date(newItem.expirationDate!),
      status,
      addedDate: now,
    };

    setFoodItems([...foodItems, newFoodItem]);
    setNewItem({
      name: "",
      category: "",
      quantity: 1,
      unit: "und",
      expirationDate: new Date(),
    });
    setIsAddDialogOpen(false);
    toast.success(`Item "${newItem.name}" adicionado com sucesso`);
  };

  // Função para editar um item
  const handleEditItem = () => {
    if (!editingItem) return;

    const now = new Date();
    const daysUntilExpiration = Math.floor(
      (new Date(editingItem.expirationDate).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let status: "normal" | "expiring" | "expired" = "normal";
    if (daysUntilExpiration < 0) {
      status = "expired";
    } else if (daysUntilExpiration < 7) {
      status = "expiring";
    }

    const updatedItem = {
      ...editingItem,
      status,
    };

    setFoodItems(
      foodItems.map((item) =>
        item.id === editingItem.id ? updatedItem : item
      )
    );
    setIsEditDialogOpen(false);
    toast.success(`Item "${editingItem.name}" atualizado com sucesso`);
  };

  // Função para deletar um item
  const handleDeleteItem = (id: string, name: string) => {
    setFoodItems(foodItems.filter((item) => item.id !== id));
    toast.success(`Item "${name}" removido com sucesso`);
  };

  // Função para renderizar a badge de status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge>Normal</Badge>;
      case "expiring":
        return <Badge variant="outline">Expirando</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Controle de Dispensa
        </h1>
        <p className="text-muted-foreground">
          Gerencie o estoque de alimentos da clínica
        </p>
      </div>

      <Tabs defaultValue="todos" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="expirando">Expirando</TabsTrigger>
            <TabsTrigger value="expirados">Expirados</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar alimentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={categoryFilter || ""}
              onValueChange={(value) =>
                setCategoryFilter(value === "" ? null : value)
              }
            >
              <SelectTrigger className="w-[160px]">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {categoryFilter || "Categoria"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas categorias</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter || ""}
              onValueChange={(value) =>
                setStatusFilter(value === "" ? null : value)
              }
            >
              <SelectTrigger className="w-[160px]">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {statusFilter || "Status"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="expiring">Expirando</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-6 text-muted-foreground"
                        >
                          Nenhum item encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-center">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>
                            {format(new Date(item.expirationDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{renderStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id, item.name)}
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
            <CardFooter className="border-t px-6 py-3">
              <div className="text-sm text-muted-foreground">
                Total de itens: {filteredItems.length}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar novo item */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar alimento</DialogTitle>
            <DialogDescription>
              Adicione um novo item ao estoque da dispensa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                value={newItem.name || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Ex: Arroz"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="category">Categoria*</Label>
              <div className="flex gap-2">
                <Input
                  id="category"
                  value={newItem.category || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  placeholder="Ex: Grãos"
                  className="flex-1"
                />
                {uniqueCategories.length > 0 && (
                  <Select
                    value={newItem.category || ""}
                    onValueChange={(value) =>
                      setNewItem({ ...newItem, category: value })
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <span>Categorias</span>
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity || 1}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Select
                  value={newItem.unit || "und"}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="und">Unidade</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="L">Litro (L)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="cx">Caixa</SelectItem>
                    <SelectItem value="pct">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Data de validade</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expirationDate"
                  type="date"
                  className="pl-8"
                  value={
                    newItem.expirationDate
                      ? format(
                          new Date(newItem.expirationDate),
                          "yyyy-MM-dd"
                        )
                      : ""
                  }
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      expirationDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>Adicionar item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar item */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar alimento</DialogTitle>
            <DialogDescription>
              Edite as informações do item selecionado.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-name">Nome*</Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-category">Categoria*</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-category"
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  {uniqueCategories.length > 0 && (
                    <Select
                      value={editingItem.category}
                      onValueChange={(value) =>
                        setEditingItem({ ...editingItem, category: value })
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <span>Categorias</span>
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantidade</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="1"
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unidade</Label>
                  <Select
                    value={editingItem.unit}
                    onValueChange={(value) =>
                      setEditingItem({ ...editingItem, unit: value })
                    }
                  >
                    <SelectTrigger id="edit-unit">
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="und">Unidade</SelectItem>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="g">Grama (g)</SelectItem>
                      <SelectItem value="L">Litro (L)</SelectItem>
                      <SelectItem value="ml">Mililitro (ml)</SelectItem>
                      <SelectItem value="cx">Caixa</SelectItem>
                      <SelectItem value="pct">Pacote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expirationDate">Data de validade</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-expirationDate"
                    type="date"
                    className="pl-8"
                    value={format(
                      new Date(editingItem.expirationDate),
                      "yyyy-MM-dd"
                    )}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        expirationDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditItem}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
