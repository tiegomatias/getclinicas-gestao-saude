
import React, { useState, useEffect } from "react";
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";

// No demo data - charts will be empty until real data is available
const monthlyAppointments: any[] = [];

// No demo data - pie chart will be empty
const appointmentTypes: any[] = [];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

// No demo data - reports list will be empty
const availableReports: any[] = [];

export default function Relatorios() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkForData = async () => {
      try {
        // Obter o ID da clínica do localStorage
        const clinicDataStr = localStorage.getItem("clinicData");
        if (!clinicDataStr) {
          setHasData(false);
          setIsLoading(false);
          return;
        }
        
        const clinicData = JSON.parse(clinicDataStr);
        // Verificar se há dados suficientes para gerar relatórios
        // Considera que há relatórios se houver pacientes, profissionais ou atividades
        const hasAnyData = await Promise.all([
          clinicService.hasClinicData(clinicData.id, "patients"),
          clinicService.hasClinicData(clinicData.id, "professionals"),
          clinicService.hasClinicData(clinicData.id, "activities")
        ]);
        
        setHasData(hasAnyData.some(d => d));
      } catch (error) {
        console.error("Erro ao verificar dados para relatórios:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  const handleGenerateReport = () => {
    // Aqui você pode implementar a lógica para gerar um novo relatório
    console.log("Gerar relatório");
  };

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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Carregando...</p>
        </div>
      ) : hasData ? (
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
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Sem dados de atendimentos para exibir</p>
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
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Sem dados de tipos de atendimento para exibir</p>
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
                    <p className="mt-1 text-2xl font-bold text-card-foreground">0%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Sem dados disponíveis</p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Espera</p>
                    <p className="mt-1 text-2xl font-bold text-card-foreground">0 min</p>
                    <p className="mt-1 text-xs text-muted-foreground">Sem dados disponíveis</p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Satisfação do Paciente</p>
                    <p className="mt-1 text-2xl font-bold text-card-foreground">0/5</p>
                    <p className="mt-1 text-xs text-muted-foreground">Sem dados disponíveis</p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Retorno</p>
                    <p className="mt-1 text-2xl font-bold text-card-foreground">0%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Sem dados disponíveis</p>
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
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum relatório disponível ainda.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Os relatórios serão gerados automaticamente quando houver dados suficientes.
                    </p>
                  </div>
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
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={<ChartBarIcon className="h-10 w-10 text-muted-foreground" />}
              title="Nenhum dado disponível para relatórios"
              description="Adicione pacientes, profissionais e registre atividades para começar a gerar relatórios e análises."
              actionText="Começar a adicionar dados"
              onAction={handleGenerateReport}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
