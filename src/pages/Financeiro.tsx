
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
import { DollarSign, Search, CreditCard, Receipt, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { clinicService } from "@/services/clinicService";
import { toast } from "sonner";

// No demo data - transactions will come from real database
const initialTransactionData: any[] = [];

// No demo data - bills will come from real database
const initialBillsData: any[] = [];

export default function Financeiro() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionData, setTransactionData] = useState(initialTransactionData);
  const [billsData, setBillsData] = useState(initialBillsData);

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
        // Check if the clinic has financial data
        const hasFinancialData = await clinicService.hasClinicData(clinicData.id, "finances");
        setHasData(hasFinancialData);
      } catch (error) {
        console.error("Erro ao verificar dados financeiros:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForData();
  }, []);

  // Stats data - empty for new clinic
  const totalMonthlyIncome = "R$ 0,00";
  const totalMonthlyExpense = "R$ 0,00";
  const monthlyBalance = "R$ 0,00";
  const pendingReceivables = "R$ 0,00";

  // Função para adicionar uma nova transação
  const handleNewTransaction = () => {
    const newTransaction = {
      id: `T${transactionData.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      description: "Nova Transação",
      pacient: "Novo Paciente",
      value: 100.00,
      status: "Pendente"
    };
    
    setTransactionData([newTransaction, ...transactionData]);
    setHasData(true);
    toast.success("Nova transação adicionada com sucesso!");
  };

  // Função para pagar uma conta
  const handlePayBill = (billId: string) => {
    const updatedBills = billsData.filter(bill => bill.id !== billId);
    setBillsData(updatedBills);
    
    // Adicionar esta conta como transação paga
    const billToPay = billsData.find(bill => bill.id === billId);
    if (billToPay) {
      const newTransaction = {
        id: `T${transactionData.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        description: `Pagamento: ${billToPay.description}`,
        pacient: "-",
        value: billToPay.value,
        status: "Pago"
      };
      
      setTransactionData([newTransaction, ...transactionData]);
    }
    
    toast.success("Conta paga com sucesso!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!hasData) {
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
          value={totalMonthlyIncome}
          icon={DollarSign}
          description="Ainda sem receitas registradas"
        />
        <StatCard
          title="Despesas Mensais"
          value={totalMonthlyExpense}
          icon={CreditCard}
          description="Ainda sem despesas registradas"
        />
        <StatCard
          title="Saldo Mensal"
          value={monthlyBalance}
          icon={DollarSign}
          description="Ainda sem movimentação"
        />
        <StatCard
          title="A Receber"
          value={pendingReceivables}
          icon={Receipt}
          description="Valores pendentes de recebimento"
        />
      </div>

      <Tabs defaultValue="transacoes">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="contas">Contas a Pagar</TabsTrigger>
        </TabsList>
        <TabsContent value="transacoes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Visualize todas as transações financeiras da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma transação encontrada. Adicione uma transação para começar.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contas">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
              <CardDescription>
                Gerencie as despesas e contas pendentes da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma conta pendente. Adicione despesas para gerenciar.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
