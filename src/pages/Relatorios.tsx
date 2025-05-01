
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBarIcon, Download, FileText, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Dados para o gráfico de atendimentos mensais
const monthlyAppointments = [
  { name: "Jan", value: 65 },
  { name: "Fev", value: 59 },
  { name: "Mar", value: 80 },
  { name: "Abr", value: 81 },
  { name: "Mai", value: 95 },
  { name: "Jun", value: 87 },
  { name: "Jul", value: 90 },
  { name: "Ago", value: 105 },
  { name: "Set", value: 95 },
  { name: "Out", value: 110 },
  { name: "Nov", value: 102 },
  { name: "Dez", value: 98 },
];

// Dados para o gráfico de tipos de atendimento
const appointmentTypes = [
  { name: "Consultas", value: 55 },
  { name: "Exames", value: 25 },
  { name: "Procedimentos", value: 15 },
  { name: "Retornos", value: 5 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

// Lista de relatórios disponíveis
const availableReports = [
  { 
    id: 1, 
    title: "Relatório Financeiro Mensal", 
    description: "Resumo de receitas, despesas e lucro", 
    lastGenerated: "2025-04-28" 
  },
  { 
    id: 2, 
    title: "Ocupação de Leitos", 
    description: "Taxa de ocupação e tempo médio de internação", 
    lastGenerated: "2025-04-30" 
  },
  { 
    id: 3, 
    title: "Produtividade de Profissionais", 
    description: "Quantidade de atendimentos por profissional", 
    lastGenerated: "2025-04-25" 
  },
  { 
    id: 4, 
    title: "Perfil de Pacientes", 
    description: "Dados demográficos e frequência de atendimentos", 
    lastGenerated: "2025-04-22" 
  },
  { 
    id: 5, 
    title: "Estoque de Medicamentos", 
    description: "Medicamentos com estoque baixo e consumo mensal", 
    lastGenerated: "2025-04-29" 
  },
];

export default function Relatorios() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <ChartBarIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Relatórios e Indicadores</h1>
            <p className="text-sm text-muted-foreground">
              Dados e métricas para análise gerencial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="month"
              className="w-full md:w-[200px]"
              defaultValue="2025-05"
            />
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="custom">Personalizado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atendimentos Mensais</CardTitle>
                <CardDescription>
                  Evolução do número de atendimentos ao longo do ano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyAppointments}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Atendimento</CardTitle>
                <CardDescription>
                  Distribuição por categoria de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={appointmentTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {appointmentTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Indicadores Principais</CardTitle>
              <CardDescription>
                Principais métricas de desempenho da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação de Leitos</p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">78%</p>
                  <p className="mt-1 text-xs text-emerald-600">↑ 5% vs. mês anterior</p>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Espera</p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">18 min</p>
                  <p className="mt-1 text-xs text-emerald-600">↓ 3 min vs. mês anterior</p>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">Satisfação do Paciente</p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">4.8/5</p>
                  <p className="mt-1 text-xs text-emerald-600">↑ 0.2 vs. mês anterior</p>
                </div>
                
                <div className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Retorno</p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">82%</p>
                  <p className="mt-1 text-xs text-emerald-600">Estável vs. mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Disponíveis</CardTitle>
              <CardDescription>
                Acesse e baixe os relatórios pré-configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex flex-col justify-between gap-2 rounded-lg border p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h3 className="text-lg font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Última geração: {report.lastGenerated}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-1 h-4 w-4" /> Visualizar
                      </Button>
                      <Button size="sm">
                        <Download className="mr-1 h-4 w-4" /> Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Personalizado</CardTitle>
              <CardDescription>
                Configure um relatório com os dados e métricas de seu interesse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Tipo de Relatório</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option>Financeiro</option>
                      <option>Atendimentos</option>
                      <option>Ocupação</option>
                      <option>Medicamentos</option>
                      <option>Profissionais</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Período</label>
                    <div className="flex items-center gap-2">
                      <Input type="date" className="w-full" />
                      <span>até</span>
                      <Input type="date" className="w-full" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Métricas a incluir</label>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span>Receita Total</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span>Despesas</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span>Lucro</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span>Atendimentos</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span>Taxa de Ocupação</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span>Tempo Médio</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Formato de Saída</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="format" className="h-4 w-4 border-gray-300" defaultChecked />
                      <span>PDF</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="format" className="h-4 w-4 border-gray-300" />
                      <span>Excel</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="format" className="h-4 w-4 border-gray-300" />
                      <span>CSV</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Limpar</Button>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" /> Gerar Relatório
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
