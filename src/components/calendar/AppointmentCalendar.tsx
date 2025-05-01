
import React from "react";
import { Calendar } from "@/components/ui/calendar";

export default function AppointmentCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col">
      <div className="mb-4 px-2 py-1">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </div>
      
      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Legenda:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-xs">Consultas Médicas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-xs">Terapias em Grupo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs">Atividades Individuais</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-xs">Eventos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
