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
import { ChartBarIcon, Download, TrendingUp, DollarSign, Activity, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/shared/EmptyState";
import { reportService, OccupationReport, FinancialReport, ActivitiesReport, PatientsReport } from "@/services/reportService";
import { exportService } from "@/services/exportService";
import { toast } from "sonner";

export default function Relatorios() {
  const [isLoading, setIsLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string>("");
  const [occupationReport, setOccupationReport] = useState<OccupationReport | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [activitiesReport, setActivitiesReport] = useState<ActivitiesReport | null>(null);
  const [patientsReport, setPatientsReport] = useState<PatientsReport | null>(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        setIsLoading(false);
        return;
      }
      
      const clinicData = JSON.parse(clinicDataStr);
      setClinicId(clinicData.id);
      
      const [occupation, financial, activities, patients] = await Promise.all([
        reportService.getOccupationReport(clinicData.id),
        reportService.getFinancialReport(clinicData.id, startDate, endDate),
        reportService.getActivitiesReport(clinicData.id, startDate, endDate),
        reportService.getPatientsReport(clinicData.id),
      ]);
      
      setOccupationReport(occupation);
      setFinancialReport(financial);
      setActivitiesReport(activities);
      setPatientsReport(patients);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    loadReports();
    toast.success("Relatórios atualizados!");
  };

  const handleExportCSV = () => {
    exportService.exportToCSV(
      occupationReport,
      financialReport,
      activitiesReport,
      patientsReport,
      startDate,
      endDate
    );
    toast.success("Relatório exportado em CSV!");
  };

  const handleExportPDF = async () => {
    await exportService.exportToPDF(
      occupationReport,
      financialReport,
      activitiesReport,
      patientsReport,
      startDate,
      endDate
    );
    toast.success("Abrindo visualização para impressão...");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando relatórios...</p>
      </div>
    );
  }

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

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[150px]"
          />
          <span className="text-sm text-muted-foreground">até</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px]"
          />
          <Button onClick={handleGenerateReport}>
            <TrendingUp className="mr-2 h-4 w-4" /> Atualizar
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{occupationReport?.occupationRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {occupationReport?.occupiedBeds} de {occupationReport?.totalBeds} leitos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(financialReport?.balance || 0)}</div>
                  <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activitiesReport?.totalActivities || 0}</div>
                  <p className="text-xs text-muted-foreground">No período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patientsReport?.totalActive || 0}</div>
                  <p className="text-xs text-muted-foreground">Em tratamento</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                  <CardDescription>Período: {startDate} até {endDate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Receitas:</span>
                    <span className="font-bold text-green-600">{formatCurrency(financialReport?.totalIncome || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Despesas:</span>
                    <span className="font-bold text-red-600">{formatCurrency(financialReport?.totalExpenses || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Saldo:</span>
                    <span className="font-bold">{formatCurrency(financialReport?.balance || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ocupação de Leitos</CardTitle>
                  <CardDescription>Status atual da ocupação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ocupados:</span>
                    <span className="font-medium">{occupationReport?.occupiedBeds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disponíveis:</span>
                    <span className="font-medium">{occupationReport?.availableBeds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Manutenção:</span>
                    <span className="font-medium">{occupationReport?.maintenanceBeds}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="font-bold">{occupationReport?.totalBeds}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="detalhado">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividades por Tipo</CardTitle>
                <CardDescription>Distribuição das atividades no período</CardDescription>
              </CardHeader>
              <CardContent>
                {activitiesReport && Object.keys(activitiesReport.activitiesByType).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(activitiesReport.activitiesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center p-3 rounded-md border">
                        <span className="text-sm capitalize font-medium">{type}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma atividade no período selecionado
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas por Categoria</CardTitle>
                  <CardDescription>Distribuição das receitas</CardDescription>
                </CardHeader>
                <CardContent>
                  {financialReport && Object.keys(financialReport.incomeByCategory).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(financialReport.incomeByCategory).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm">{category}:</span>
                          <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma receita no período
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                  <CardDescription>Distribuição das despesas</CardDescription>
                </CardHeader>
                <CardContent>
                  {financialReport && Object.keys(financialReport.expensesByCategory).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(financialReport.expensesByCategory).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm">{category}:</span>
                          <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma despesa no período
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Pacientes</CardTitle>
                <CardDescription>Dados sobre internações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total de Internações</p>
                    <p className="text-2xl font-bold">{patientsReport?.totalAdmissions}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Altas no Período</p>
                    <p className="text-2xl font-bold">{patientsReport?.totalDischarges}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Atualmente Ativos</p>
                    <p className="text-2xl font-bold">{patientsReport?.totalActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
