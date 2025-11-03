
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { masterService, type ClinicData } from "@/services/masterService";

export default function MasterReports() {
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [timeRange, setTimeRange] = useState("month");
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await masterService.getAllClinics();
      setClinics(data);
    } catch (error) {
      console.error("Error loading clinics:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      const data = await masterService.getOccupationData(timeRange as any);
      setReportData(data);
    } catch (error) {
      console.error("Error loading report data:", error);
    }
  };
  
  const handleExportReport = () => {
    // Implementação do download de relatório em CSV
    const headers = ['Período', 'Leitos Ocupados', 'Leitos Disponíveis'];
    
    // Converter dados para formato CSV
    let csvContent = headers.join(',') + '\n';
    reportData.forEach(item => {
      const row = [
        item.name,
        item.ocupados,
        item.disponíveis
      ].join(',');
      csvContent += row + '\n';
    });
    
    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_ocupacao_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Relatório exportado com sucesso!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Gerais</h1>
          <p className="text-muted-foreground">
            Visualize e exporte relatórios de todas as clínicas
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Ocupação de Leitos</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={reportData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ocupados" fill="#2A6F97" name="Leitos Ocupados" />
                <Bar dataKey="disponíveis" fill="#40A850" name="Leitos Disponíveis" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Ocupação por Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              {clinics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma clínica cadastrada ainda.
                </div>
              ) : (
                <div className="space-y-4">
                  {clinics.map((clinic) => {
                    // Random occupation rate for demonstration
                    const occupationRate = clinic.beds_capacity > 0 
                      ? Math.round((clinic.occupied_beds / clinic.beds_capacity) * 100)
                      : 0;
                    
                    return (
                      <div key={clinic.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{clinic.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(clinic.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                            <div 
                              className={`h-full rounded-full ${
                                occupationRate > 90 ? "bg-red-500" : 
                                occupationRate > 70 ? "bg-yellow-500" : 
                                "bg-green-500"
                              }`} 
                              style={{ width: `${occupationRate}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{occupationRate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Planos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {clinics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma clínica cadastrada ainda.
                </div>
              ) : (
                <div className="w-full flex flex-col items-center space-y-6">
                  <div className="flex justify-center space-x-8">
                    {/* Count plans and create stats */}
                    {(function() {
                      const planCounts = {
                        "Mensal": 0,
                        "Semestral": 0,
                        "Anual": 0,
                        "Padrão": 0
                      };
                      
                      clinics.forEach(clinic => {
                        const plan = clinic.plan || "Padrão";
                        planCounts[plan] = (planCounts[plan] || 0) + 1;
                      });
                      
                      const colors = {
                        "Mensal": "#2A6F97",
                        "Semestral": "#7E69AB",
                        "Anual": "#40A850",
                        "Padrão": "#E6AB49"
                      };
                      
                      return Object.entries(planCounts).map(([plan, count]: [string, any]) => {
                        if (count === 0) return null;
                        const percentage = Math.round((count / clinics.length) * 100);
                        
                        return (
                          <div key={plan} className="flex flex-col items-center">
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: colors[plan] }}
                            >
                              {percentage}%
                            </div>
                            <p className="mt-2 font-medium">{plan}</p>
                            <p className="text-sm text-muted-foreground">{count} clínicas</p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Total de {clinics.length} clínicas cadastradas
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
