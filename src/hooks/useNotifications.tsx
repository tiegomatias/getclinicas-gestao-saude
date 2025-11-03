import { useState, useEffect } from 'react';
import { notificationService, type Notification } from '@/services/notificationService';
import { toast } from 'sonner';

export const useNotifications = (clinicId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) return;

    const loadNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(clinicId),
          notificationService.getUnreadCount(clinicId)
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Subscribe to real-time updates
    const unsubscribe = notificationService.subscribeToNotifications(
      clinicId,
      (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast[notification.type](notification.title, {
          description: notification.message,
          duration: 5000
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [clinicId]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!clinicId) return;
    
    try {
      await notificationService.markAllAsRead(clinicId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};