import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { activityService, Activity, CreateActivityData } from "@/services/activityService";
import { professionalService } from "@/services/professionalService";
import { patientService } from "@/services/patientService";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  activity?: Activity | null;
  onSuccess: () => void;
}

export default function ActivityForm({
  open,
  onOpenChange,
  clinicId,
  activity,
  onSuccess,
}: ActivityFormProps) {
  const [formData, setFormData] = useState<CreateActivityData>({
    title: "",
    description: "",
    activity_type: "medical",
    start_time: "",
    end_time: "",
    professional_id: "",
    location: "",
    patient_ids: [],
  });
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, clinicId]);

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        description: activity.description || "",
        activity_type: activity.activity_type,
        start_time: activity.start_time,
        end_time: activity.end_time,
        professional_id: activity.professional_id || "",
        location: activity.location || "",
        patient_ids: activity.participants?.map(p => p.patient_id) || [],
      });
    } else {
      resetForm();
    }
  }, [activity]);

  const loadData = async () => {
    const [profsData, patientsData] = await Promise.all([
      professionalService.getProfessionalsByClinic(clinicId),
      patientService.getClinicPatients(clinicId),
    ]);
    setProfessionals(profsData);
    setPatients(patientsData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      activity_type: "medical",
      start_time: "",
      end_time: "",
      professional_id: "",
      location: "",
      patient_ids: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activity) {
        await activityService.updateActivity(activity.id, formData);
      } else {
        await activityService.createActivity(clinicId, formData);
      }
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientToggle = (patientId: string) => {
    setFormData(prev => ({
      ...prev,
      patient_ids: prev.patient_ids?.includes(patientId)
        ? prev.patient_ids.filter(id => id !== patientId)
        : [...(prev.patient_ids || []), patientId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Editar Atividade" : "Nova Atividade"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações da atividade ou consulta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_type">Tipo de Atividade *</Label>
            <Select
              value={formData.activity_type}
              onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Consulta Médica</SelectItem>
                <SelectItem value="therapy">Terapia Individual</SelectItem>
                <SelectItem value="group">Terapia em Grupo</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="recreation">Atividade Recreativa</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Data/Hora Início *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Data/Hora Fim *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional_id">Profissional Responsável</Label>
            <Select
              value={formData.professional_id}
              onValueChange={(value) => setFormData({ ...formData, professional_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name} - {prof.profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Sala 03, Salão Principal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            <ScrollArea className="h-40 rounded-md border p-4">
              <div className="space-y-2">
                {patients.map((patient) => (
                  <div key={patient.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={patient.id}
                      checked={formData.patient_ids?.includes(patient.id)}
                      onCheckedChange={() => handlePatientToggle(patient.id)}
                    />
                    <label
                      htmlFor={patient.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {patient.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : activity ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
