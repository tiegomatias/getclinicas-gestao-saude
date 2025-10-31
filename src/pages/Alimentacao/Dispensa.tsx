import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { foodInventoryService, FoodItem as FoodItemType } from "@/services/foodInventoryService";
import FoodItemForm from "@/components/alimentacao/FoodItemForm";

export default function Dispensa() {
  const [foodItems, setFoodItems] = useState<FoodItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItemType | null>(null);
  const [clinicId, setClinicId] = useState<string>("");

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        setIsLoading(false);
        return;
      }
      
      const clinicData = JSON.parse(clinicDataStr);
      setClinicId(clinicData.id);
      
      const items = await foodInventoryService.getFoodItems(clinicData.id);
      setFoodItems(items);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      toast.error("Erro ao carregar itens da dispensa");
    } finally {
      setIsLoading(false);
    }
  };

  const getItemStatus = (item: FoodItemType): "normal" | "expiring" | "expired" => {
    if (!item.expiration_date) return "normal";
    
    const now = new Date();
    const expirationDate = new Date(item.expiration_date);
    const daysUntilExpiration = Math.floor(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiration < 0) return "expired";
    if (daysUntilExpiration < 7) return "expiring";
    return "normal";
  };

  const filteredItems = foodItems.filter((item) => {
    const itemStatus = getItemStatus(item);
    
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === null || item.category === categoryFilter;

    const matchesStatus = statusFilter === null || getItemStatus(item) === statusFilter;

    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "expirando" && itemStatus === "expiring") ||
      (activeTab === "expirados" && itemStatus === "expired");

    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  const uniqueCategories = Array.from(
    new Set(foodItems.map((item) => item.category))
  );

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir "${name}"?`)) return;
    
    try {
      await foodInventoryService.deleteFoodItem(id);
      await loadFoodItems();
      toast.success(`Item "${name}" removido com sucesso`);
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      toast.error("Erro ao deletar item");
    }
  };

  const handleFormSuccess = () => {
    loadFoodItems();
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const renderStatusBadge = (status: "normal" | "expiring" | "expired") => {
    switch (status) {
      case "normal":
        return <Badge>Normal</Badge>;
      case "expiring":
        return <Badge variant="outline">Expirando</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando itens da dispensa...</p>
      </div>
    );
  }

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
              onClick={() => {
                setEditingItem(null);
                setIsAddDialogOpen(true);
              }}
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
              value={categoryFilter || "all"}
              onValueChange={(value) =>
                setCategoryFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter || "all"}
              onValueChange={(value) =>
                setStatusFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
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
                      filteredItems.map((item) => {
                        const itemStatus = getItemStatus(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="text-center">
                              {item.stock} {item.unit}
                            </TableCell>
                            <TableCell>
                              {item.expiration_date 
                                ? format(new Date(item.expiration_date), "dd/MM/yyyy")
                                : "Sem validade"}
                            </TableCell>
                            <TableCell>{renderStatusBadge(itemStatus)}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsAddDialogOpen(true);
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
                        );
                      })
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

      <FoodItemForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        clinicId={clinicId}
        item={editingItem}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
