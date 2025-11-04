import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Database, Bell } from "lucide-react";
import { AuditLogsTable } from "@/components/master/AuditLogsTable";
import { SystemSettingsPanel } from "@/components/master/SystemSettingsPanel";
import { NotificationSettingsPanel } from "@/components/master/NotificationSettingsPanel";

export default function MasterSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie configurações e visualize logs de auditoria
        </p>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="audit">
            <Shield className="mr-2 h-4 w-4" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            Banco de Dados
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <AuditLogsTable />
        </TabsContent>

        <TabsContent value="database">
          <SystemSettingsPanel />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
