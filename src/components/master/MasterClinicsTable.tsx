
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MasterClinicsTableProps {
  clinics: any[];
  onViewClinic: (clinicId: string) => void;
}

export const MasterClinicsTable = ({ clinics, onViewClinic }: MasterClinicsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clínicas Cadastradas</CardTitle>
      </CardHeader>
      <CardContent>
        {clinics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma clínica cadastrada ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Data de Registro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => {
                // Check if the clinic was created in the last 48 hours
                const createdAt = new Date(clinic.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const isNew = diffDays < 2;
                
                return (
                  <TableRow key={clinic.id}>
                    <TableCell className="font-medium">
                      {clinic.clinicName}
                      {isNew && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          Nova
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{clinic.plan || "Padrão"}</TableCell>
                    <TableCell>{new Date(clinic.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewClinic(clinic.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Acessar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
