
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Users } from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Terapia em Grupo",
    day: "Segunda-feira",
    time: "10:00 - 11:30",
    location: "Sala 3",
    participants: 8,
    type: "group",
  },
  {
    id: 2,
    title: "Consulta Dr. Ana Silva",
    day: "Segunda-feira",
    time: "14:00 - 15:00",
    location: "Consultório 2",
    participants: 1,
    type: "individual",
  },
  {
    id: 3,
    title: "Atividade Física",
    day: "Terça-feira",
    time: "09:00 - 10:00",
    location: "Área Externa",
    participants: 15,
    type: "group",
  },
  {
    id: 4,
    title: "Terapia em Grupo",
    day: "Quarta-feira",
    time: "10:00 - 11:30",
    location: "Sala 3",
    participants: 8,
    type: "group",
  },
];

export default function WeeklyActivities() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atividades da Semana</CardTitle>
        <a
          href="/agenda"
          className="text-xs text-primary hover:underline"
        >
          Ver agenda completa
        </a>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 border-b p-4 last:border-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                {activity.type === "group" ? (
                  <Users className="h-5 w-5 text-primary" />
                ) : (
                  <CalendarIcon className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">{activity.title}</h4>
                <div className="text-xs text-muted-foreground">
                  <p>
                    {activity.day} • {activity.time}
                  </p>
                  <p>
                    {activity.location} •{" "}
                    {activity.participants > 1
                      ? `${activity.participants} participantes`
                      : "Individual"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
