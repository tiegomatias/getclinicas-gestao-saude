import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  clinic_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'patient' | 'medication' | 'appointment' | 'document' | 'system' | 'finance';
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export interface CreateNotificationData {
  clinic_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'patient' | 'medication' | 'appointment' | 'document' | 'system' | 'finance';
  link?: string;
  metadata?: Record<string, any>;
}

export const notificationService = {
  async getNotifications(clinicId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as Notification[];
  },

  async getUnreadCount(clinicId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return notification as Notification;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(clinicId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('clinic_id', clinicId)
      .eq('read', false);

    if (error) throw error;
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  subscribeToNotifications(
    clinicId: string,
    onNotification: (notification: Notification) => void
  ) {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `clinic_id=eq.${clinicId}`
        },
        (payload) => {
          onNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};