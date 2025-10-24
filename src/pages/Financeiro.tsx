
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
import { DollarSign, Search, CreditCard, Receipt, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { financeService, Finance, FinanceSummary } from "@/services/financeService";
import FinanceForm from "@/components/financeiro/FinanceForm";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Financeiro() {
  const [searchQuery, setSearchQuery] = useState("");
  const [finances, setFinances] = useState<Finance[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
  const [clinicId, setClinicId] = useState<string>("");

  useEffect(() => {
    loadFinances();
  }, []);

  const loadFinances = async () => {
    try {
      const clinicDataStr = localStorage.getItem("clinicData");
      if (!clinicDataStr) {
        setIsLoading(false);
        return;
      }
      
      const clinicData = JSON.parse(clinicDataStr);
      setClinicId(clinicData.id);
      
      const [financesData, summaryData] = await Promise.all([
        financeService.getFinances(clinicData.id),
        financeService.getFinanceSummary(clinicData.id),
      ]);
      
      setFinances(financesData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTransaction = () => {
    setEditingFinance(null);
    setShowFinanceForm(true);
  };

  const handleEditFinance = (finance: Finance) => {
    setEditingFinance(finance);
    setShowFinanceForm(true);
  };

  const handleDeleteFinance = async (financeId: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      const success = await financeService.deleteFinance(financeId);
      if (success) {
        loadFinances();
      }
    }
  };

  const handleFormSuccess = () => {
    loadFinances();
  };

  const filteredFinances = finances.filter((finance) =>
    finance.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const incomeTransactions = filteredFinances.filter(f => f.type === "income");
  const expenseTransactions = filteredFinances.filter(f => f.type === "expense");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!clinicId || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando...</p>
      </div>
    );
  }

  if (finances.length === 0) {
    return (
      <EmptyState
        title="Sem dados financeiros"
        description="Você ainda não possui dados financeiros cadastrados. Adicione uma transação para começar a gerenciar suas finanças."
        icon={<DollarSign className="h-10 w-10 text-muted-foreground" />}
        actionText="Adicionar Transação"
        onAction={handleNewTransaction}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <DollarSign />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
            <p className="text-sm text-muted-foreground">
              Gestão financeira da clínica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar transações..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleNewTransaction}>
            <Receipt className="mr-2 h-4 w-4" /> Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Mensal"
          value={formatCurrency(summary.monthlyIncome)}
          icon={DollarSign}
          description="Total de receitas no mês"
        />
        <StatCard
          title="Despesas Mensais"
          value={formatCurrency(summary.monthlyExpenses)}
          icon={CreditCard}
          description="Total de despesas no mês"
        />
        <StatCard
          title="Saldo Mensal"
          value={formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}
          icon={DollarSign}
          description="Receitas - Despesas"
        />
        <StatCard
          title="Saldo Total"
          value={formatCurrency(summary.balance)}
          icon={Receipt}
          description="Balanço geral"
        />
      </div>

      <Tabs defaultValue="transacoes">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="transacoes">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="transacoes">
          <Card>
            <CardHeader>
              <CardTitle>Receitas</CardTitle>
              <CardDescription>
                Visualize todas as receitas da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhuma receita encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomeTransactions.map((finance) => (
                      <TableRow key={finance.id}>
                        <TableCell>
                          {format(new Date(finance.date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{finance.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {finance.category || "Sem categoria"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(Number(finance.amount))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFinance(finance)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFinance(finance.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
              <CardDescription>
                Gerencie as despesas da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhuma despesa encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenseTransactions.map((finance) => (
                      <TableRow key={finance.id}>
                        <TableCell>
                          {format(new Date(finance.date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{finance.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {finance.category || "Sem categoria"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(Number(finance.amount))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFinance(finance)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFinance(finance.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FinanceForm
        open={showFinanceForm}
        onOpenChange={setShowFinanceForm}
        clinicId={clinicId}
        finance={editingFinance}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
