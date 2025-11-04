
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Activity } from "@/services/activityService";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AppointmentCalendarProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

const activityTypeColors: Record<string, string> = {
  medical: "bg-blue-500",
  therapy: "bg-purple-500",
  group: "bg-green-500",
  workshop: "bg-amber-500",
  recreation: "bg-pink-500",
  other: "bg-gray-500",
};

export default function AppointmentCalendar({ activities, onActivityClick }: AppointmentCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const activitiesForSelectedDate = activities.filter(activity => {
    if (!date) return false;
    const activityDate = new Date(activity.start_time);
    return (
      activityDate.getDate() === date.getDate() &&
      activityDate.getMonth() === date.getMonth() &&
      activityDate.getFullYear() === date.getFullYear()
    );
  });

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

      {date && activitiesForSelectedDate.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Atividades em {format(date, "dd/MM/yyyy")}:</p>
          <div className="space-y-2">
            {activitiesForSelectedDate.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-md border p-2 cursor-pointer hover:bg-accent"
                onClick={() => onActivityClick(activity)}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${activityTypeColors[activity.activity_type] || activityTypeColors.other}`} />
                  <span className="text-sm font-medium">{activity.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(activity.start_time), "HH:mm")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Legenda:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-xs">Médico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-xs">Terapia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-xs">Grupo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs">Workshop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-pink-500" />
            <span className="text-xs">Recreação</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span className="text-xs">Outro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
