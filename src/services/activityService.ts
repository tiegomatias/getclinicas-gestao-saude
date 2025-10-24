import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Activity {
  id: string;
  clinic_id: string;
  title: string;
  description?: string;
  activity_type: string;
  start_time: string;
  end_time: string;
  professional_id?: string;
  location?: string;
  participants?: ActivityParticipant[];
  professional?: {
    name: string;
  };
}

export interface ActivityParticipant {
  id: string;
  activity_id?: string;
  patient_id: string;
  attendance_status: string;
  patient?: {
    name: string;
  };
}

export interface CreateActivityData {
  title: string;
  description?: string;
  activity_type: string;
  start_time: string;
  end_time: string;
  professional_id?: string;
  location?: string;
  patient_ids?: string[];
}

export const activityService = {
  async getActivities(clinicId: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          professional:professionals(name),
          participants:activity_participants(
            id,
            patient_id,
            attendance_status,
            patient:patients(name)
          )
        `)
        .eq("clinic_id", clinicId)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toast.error("Erro ao carregar atividades");
      return [];
    }
  },

  async getActivityById(activityId: string): Promise<Activity | null> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          professional:professionals(name),
          participants:activity_participants(
            id,
            patient_id,
            attendance_status,
            patient:patients(name)
          )
        `)
        .eq("id", activityId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error fetching activity:", error);
      toast.error("Erro ao carregar atividade");
      return null;
    }
  },

  async createActivity(clinicId: string, activityData: CreateActivityData): Promise<Activity | null> {
    try {
      const { patient_ids, ...activityFields } = activityData;

      const { data, error } = await supabase
        .from("activities")
        .insert({
          ...activityFields,
          clinic_id: clinicId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants if provided
      if (patient_ids && patient_ids.length > 0 && data) {
        await this.addParticipants(data.id, patient_ids);
      }

      toast.success("Atividade criada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error creating activity:", error);
      toast.error("Erro ao criar atividade");
      return null;
    }
  },

  async updateActivity(activityId: string, activityData: Partial<CreateActivityData>): Promise<boolean> {
    try {
      const { patient_ids, ...activityFields } = activityData;

      const { error } = await supabase
        .from("activities")
        .update(activityFields)
        .eq("id", activityId);

      if (error) throw error;

      // Update participants if provided
      if (patient_ids !== undefined) {
        await this.removeAllParticipants(activityId);
        if (patient_ids.length > 0) {
          await this.addParticipants(activityId, patient_ids);
        }
      }

      toast.success("Atividade atualizada com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error updating activity:", error);
      toast.error("Erro ao atualizar atividade");
      return false;
    }
  },

  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      // First remove all participants
      await this.removeAllParticipants(activityId);

      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId);

      if (error) throw error;

      toast.success("Atividade excluída com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error deleting activity:", error);
      toast.error("Erro ao excluir atividade");
      return false;
    }
  },

  async addParticipants(activityId: string, patientIds: string[]): Promise<boolean> {
    try {
      const participants = patientIds.map(patient_id => ({
        activity_id: activityId,
        patient_id: patient_id,
        attendance_status: "confirmed",
      }));

      const { error } = await supabase
        .from("activity_participants")
        .insert(participants);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error adding participants:", error);
      return false;
    }
  },

  async removeAllParticipants(activityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("activity_participants")
        .delete()
        .eq("activity_id", activityId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error removing participants:", error);
      return false;
    }
  },

  async updateParticipantStatus(participantId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("activity_participants")
        .update({ attendance_status: status })
        .eq("id", participantId);

      if (error) throw error;
      toast.success("Status atualizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Error updating participant status:", error);
      toast.error("Erro ao atualizar status");
      return false;
    }
  },

  async getActivitiesByDateRange(clinicId: string, startDate: string, endDate: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          professional:professionals(name),
          participants:activity_participants(
            id,
            patient_id,
            attendance_status,
            patient:patients(name)
          )
        `)
        .eq("clinic_id", clinicId)
        .gte("start_time", startDate)
        .lte("start_time", endDate)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Error fetching activities by date range:", error);
      return [];
    }
  },
};
