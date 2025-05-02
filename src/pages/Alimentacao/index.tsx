
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Alimentacao() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Dispensa",
      description: "Controle o estoque de alimentos da sua clínica",
      icon: Package,
      path: "/alimentacao/dispensa",
    },
    {
      title: "Supermercado",
      description: "Organize listas de compras para o supermercado",
      icon: ShoppingCart,
      path: "/alimentacao/supermercado",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gestão de Alimentação</h1>
        <p className="text-muted-foreground">
          Controle completo da alimentação para seus pacientes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {modules.map((module) => (
          <Card 
            key={module.title} 
            className="cursor-pointer hover:bg-accent/5 transition-colors"
            onClick={() => navigate(module.path)}
          >
            <CardHeader className="flex flex-row items-start space-y-0 pb-2">
              <div className="flex flex-col flex-1">
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <module.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Clique para acessar o módulo de {module.title.toLowerCase()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão Nutricional</CardTitle>
          <CardDescription>Visão geral da alimentação na clínica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Itens em estoque</span>
              </div>
              <div className="mt-1 text-2xl font-bold">24</div>
            </div>
            
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Itens na lista de compras</span>
              </div>
              <div className="mt-1 text-2xl font-bold">12</div>
            </div>
            
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Refeições registradas</span>
              </div>
              <div className="mt-1 text-2xl font-bold">42</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
