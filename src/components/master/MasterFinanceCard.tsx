
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface PlanRevenue {
  plan: string;
  count: number;
  monthlyRevenue: number;
  color: string;
}

interface MasterFinanceCardProps {
  planData: PlanRevenue[];
  totalMonthlyRevenue: number;
}

export const MasterFinanceCard = ({
  planData,
  totalMonthlyRevenue,
}: MasterFinanceCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Faturamento por Plano</CardTitle>
        <Wallet className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {planData.map((plan, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: plan.color }}
                  ></div>
                  <span className="font-medium">{plan.plan}</span>
                </div>
                <span className="font-medium text-sm">
                  {plan.count} {plan.count === 1 ? "clínica" : "clínicas"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Valor mensal: R$ {plan.monthlyRevenue.toLocaleString('pt-BR')}</span>
                <span>
                  {((plan.monthlyRevenue / totalMonthlyRevenue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(plan.monthlyRevenue / totalMonthlyRevenue) * 100}%`,
                    backgroundColor: plan.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 mt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Mensal:</span>
              <span className="font-bold">
                R$ {totalMonthlyRevenue.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
              <span>Faturamento anual estimado:</span>
              <span>R$ {(totalMonthlyRevenue * 12).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
