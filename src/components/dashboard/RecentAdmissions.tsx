
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const admissions = [
  {
    id: 1,
    name: "Ricardo Santos",
    admission: "Voluntária",
    date: "01/06/2025",
    assignedTo: "Dr. Ana Silva",
    status: "ativo",
  },
  {
    id: 2,
    name: "Márcia Oliveira",
    admission: "Involuntária",
    date: "30/05/2025",
    assignedTo: "Dr. Paulo Costa",
    status: "ativo",
  },
  {
    id: 3,
    name: "João Ferreira",
    admission: "Compulsória",
    date: "28/05/2025",
    assignedTo: "Dr. Ana Silva",
    status: "ativo",
  },
  {
    id: 4,
    name: "Carla Mendes",
    admission: "Voluntária",
    date: "25/05/2025",
    assignedTo: "Dr. Carlos Mendes",
    status: "alta",
  }
];

export default function RecentAdmissions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Internações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {admissions.map((admission) => (
            <div
              key={admission.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {admission.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{admission.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{admission.admission}</span>
                    <span className="mx-1">•</span>
                    <span>{admission.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden text-right text-sm md:block">
                  {admission.assignedTo}
                </div>
                <Badge
                  variant="outline"
                  className={
                    admission.status === "ativo"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }
                >
                  {admission.status === "ativo" ? "Ativo" : "Alta"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <a href="/pacientes" className="text-sm text-primary hover:underline">
            Ver todos os pacientes
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
