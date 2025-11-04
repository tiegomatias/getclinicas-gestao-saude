import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, activityService } from "@/services/activityService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Users, Edit, Trash2, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActivityDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onEdit: (activity: Activity) => void;
  onDelete: () => void;
}

const activityTypeLabels: Record<string, string> = {
  medical: "Consulta Médica",
  therapy: "Terapia Individual",
  group: "Terapia em Grupo",
  workshop: "Workshop",
  recreation: "Atividade Recreativa",
  other: "Outro",
};

const activityTypeColors: Record<string, string> = {
  medical: "bg-blue-100 text-blue-800",
  therapy: "bg-purple-100 text-purple-800",
  group: "bg-green-100 text-green-800",
  workshop: "bg-amber-100 text-amber-800",
  recreation: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

interface AttendanceCardProps {
  participant: {
    id: string;
    attendance_status: string;
    patient?: { name: string };
  };
  onStatusChange: (status: string) => Promise<void>;
}

function AttendanceCard({ participant, onStatusChange }: AttendanceCardProps) {
  const [updating, setUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    await onStatusChange(newStatus);
    setUpdating(false);
  };

  return (
    <div className="flex items-center justify-between rounded-md border p-3 bg-card">
      <span className="text-sm font-medium">
        {participant.patient?.name || "Paciente"}
      </span>
      <div className="flex gap-1">
        <Button
          variant={participant.attendance_status === "present" ? "default" : "outline"}
          size="sm"
          disabled={updating}
          onClick={() => handleStatusChange("present")}
          className="h-8 px-2"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Presente
        </Button>
        <Button
          variant={participant.attendance_status === "absent" ? "destructive" : "outline"}
          size="sm"
          disabled={updating}
          onClick={() => handleStatusChange("absent")}
          className="h-8 px-2"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Ausente
        </Button>
        <Button
          variant={participant.attendance_status === "confirmed" ? "secondary" : "outline"}
          size="sm"
          disabled={updating}
          onClick={() => handleStatusChange("confirmed")}
          className="h-8 px-2"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Confirmado
        </Button>
      </div>
    </div>
  );
}

export default function ActivityDetailModal({
  open,
  onOpenChange,
  activity,
  onEdit,
  onDelete,
}: ActivityDetailModalProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  if (!activity) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const success = await activityService.deleteActivity(activity.id);
    if (success) {
      onDelete();
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
    setDeleting(false);
  };

  const startDate = new Date(activity.start_time);
  const endDate = new Date(activity.end_time);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl">{activity.title}</DialogTitle>
                <Badge className={activityTypeColors[activity.activity_type] || activityTypeColors.other}>
                  {activityTypeLabels[activity.activity_type] || activity.activity_type}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(activity)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Data</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Horário</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                  </p>
                </div>
              </div>

              {activity.professional && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Profissional</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.professional.name}
                    </p>
                  </div>
                </div>
              )}

              {activity.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Local</p>
                    <p className="text-sm text-muted-foreground">{activity.location}</p>
                  </div>
                </div>
              )}

              {activity.description && (
                <div>
                  <p className="font-medium mb-1">Descrição</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              )}

              {activity.participants && activity.participants.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-2">
                      Participantes ({activity.participants.length})
                    </p>
                    <div className="space-y-2">
                      {activity.participants.map((participant) => (
                        <AttendanceCard
                          key={participant.id}
                          participant={participant}
                          onStatusChange={async (newStatus) => {
                            const success = await activityService.updateParticipantStatus(
                              participant.id,
                              newStatus
                            );
                            if (success) {
                              window.location.reload();
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
