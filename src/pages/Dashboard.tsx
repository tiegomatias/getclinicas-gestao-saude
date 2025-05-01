
import React from "react";
import { Bed, CalendarIcon, DollarSign, UserIcon, Users } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import OccupationChart from "@/components/dashboard/OccupationChart";
import RecentAdmissions from "@/components/dashboard/RecentAdmissions";
import WeeklyActivities from "@/components/dashboard/WeeklyActivities";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Pacientes"
          value="27"
          icon={UserIcon}
          description="Pacientes atualmente internados"
          trend="up"
          trendValue="+3 este mês"
        />
        <StatCard
          title="Taxa de Ocupação"
          value="82%"
          icon={Bed}
          description="Capacidade total: 33 leitos"
          trend="up"
          trendValue="+5% este mês"
        />
        <StatCard
          title="Atividades Semanais"
          value="18"
          icon={CalendarIcon}
          description="4 atividades hoje"
        />
        <StatCard
          title="Faturamento Mensal"
          value="R$ 156.400"
          icon={DollarSign}
          description="Maio/2025"
          trend="up"
          trendValue="+12% vs. Abril"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OccupationChart />
        <RecentAdmissions />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <WeeklyActivities />
        <div className="lg:col-span-2">
          <RecentAdmissions />
        </div>
      </div>
    </div>
  );
}
