
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
import { DollarSign, Search, CreditCard, Receipt } from "lucide-react";
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

// Mock data for transactions
const transactionData = [
  {
    id: "T1",
    date: "2025-05-01",
    description: "Consulta - Dr. João",
    pacient: "Maria Silva",
    value: 150.00,
    status: "Pago",
  },
  {
    id: "T2",
    date: "2025-05-01",
    description: "Exame de Sangue",
    pacient: "Carlos Santos",
    value: 80.00,
    status: "Pendente",
  },
  {
    id: "T3",
    date: "2025-04-30",
    description: "Consulta - Dra. Ana",
    pacient: "Pedro Oliveira",
    value: 150.00,
    status: "Pago",
  },
  {
    id: "T4",
    date: "2025-04-30",
    description: "Raio-X",
    pacient: "Luísa Mendes",
    value: 120.00,
    status: "Pago",
  },
  {
    id: "T5",
    date: "2025-04-29",
    description: "Fisioterapia",
    pacient: "Antônio Ferreira",
    value: 90.00,
    status: "Cancelado",
  },
];

// Mock data for unpaid bills
const billsData = [
  {
    id: "B1",
    dueDate: "2025-05-10",
    description: "Aluguel Clínica",
    value: 3000.00,
    category: "Infraestrutura",
  },
  {
    id: "B2",
    dueDate: "2025-05-15",
    description: "Energia Elétrica",
    value: 850.00,
    category: "Utilidades",
  },
  {
    id: "B3",
    dueDate: "2025-05-20",
    description: "Suprimentos Médicos",
    value: 1250.00,
    category: "Materiais",
  },
];

export default function Financeiro() {
  const [searchQuery, setSearchQuery] = useState("");

  // Stats data
  const totalMonthlyIncome = "R$ 15.800,00";
  const totalMonthlyExpense = "R$ 9.250,00";
  const monthlyBalance = "R$ 6.550,00";
  const pendingReceivables = "R$ 3.450,00";

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
          <Button>
            <Receipt className="mr-2 h-4 w-4" /> Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Mensal"
          value={totalMonthlyIncome}
          icon={DollarSign}
          trend="up"
          trendValue="+8.5% vs. mês anterior"
        />
        <StatCard
          title="Despesas Mensais"
          value={totalMonthlyExpense}
          icon={CreditCard}
          trend="down"
          trendValue="-2.3% vs. mês anterior"
        />
        <StatCard
          title="Saldo Mensal"
          value={monthlyBalance}
          icon={DollarSign}
          trend="up"
          trendValue="+12.7% vs. mês anterior"
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
                  {transactionData
                    .filter((transaction) =>
                      transaction.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      transaction.pacient
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.pacient}</TableCell>
                        <TableCell className="text-right">
                          {transaction.value.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              transaction.status === "Pago"
                                ? "bg-green-100 text-green-800"
                                : transaction.status === "Pendente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  {billsData.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.dueDate}</TableCell>
                      <TableCell>{bill.description}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {bill.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.value.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Pagar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
