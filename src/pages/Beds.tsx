
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bed, Plus } from "lucide-react";
import BedManagementGrid from "@/components/beds/BedManagementGrid";

export default function Beds() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Bed />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Gestão de Leitos
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualize e administre a ocupação de leitos
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os leitos</SelectItem>
              <SelectItem value="occupied">Ocupados</SelectItem>
              <SelectItem value="available">Disponíveis</SelectItem>
              <SelectItem value="maintenance">Em manutenção</SelectItem>
            </SelectContent>
          </Select>

          <Button>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Leito
          </Button>
        </div>
      </div>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Mapa de Ocupação</CardTitle>
          <CardDescription>
            Visualize a ocupação atual de leitos por ala
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-background p-4">
            <BedManagementGrid />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
