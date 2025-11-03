import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Database, Bell } from "lucide-react";
import { AuditLogsTable } from "@/components/master/AuditLogsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Banco de Dados</CardTitle>
              <CardDescription>
                Visualize estatísticas e gerencie o banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total de Registros</p>
                      <p className="text-2xl font-bold">Em breve</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tamanho do Banco</p>
                      <p className="text-2xl font-bold">Em breve</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Funcionalidades avançadas de gerenciamento de banco de dados
                    serão implementadas em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure alertas e notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Sistema de notificações será implementado em breve.
                    Incluirá alertas para:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                    <li>Novas clínicas cadastradas</li>
                    <li>Alterações importantes no sistema</li>
                    <li>Problemas de segurança</li>
                    <li>Relatórios de uso</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
