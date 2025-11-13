import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotificationHub } from './useNotificationHub';
import { notificationService } from '@/services/notificationService';
import type { NotificationResponse } from '@/types/notification';
import { toast } from 'react-toastify';

interface UseNotificationsOptions {
  userId: string;
  accessToken?: string;
  autoConnect?: boolean;
  showToast?: boolean;
}

export const useNotifications = ({
  userId,
  accessToken,
  autoConnect = true,
  showToast = true,
}: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const hubRef = useRef<useNotificationHub | null>(null);

  // Initialize SignalR Hub
  useEffect(() => {
    if (!userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:7129';
    const hub = new useNotificationHub(baseUrl, userId, accessToken);
    hubRef.current = hub;

    // Setup event handlers
    hub.onNotificationReceived((notification) => {
      console.log('📬 New notification:', notification);
      
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);
      
      // Update unread count
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show toast notification
      if (showToast) {
        toast.info(`${notification.title}\n${notification.message}`, {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    });

    hub.onUnreadCountUpdated((count) => {
      console.log('🔢 Unread count updated:', count);
      setUnreadCount(count);
    });

    hub.onNotificationRead((notificationId) => {
      console.log('✓ Notification marked as read:', notificationId);
      
      // Update notification in list
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    });

    // Auto-connect if enabled
    if (autoConnect) {
      hub.start()
        .then(() => {
          setIsConnected(true);
          console.log('✅ SignalR auto-connected');
        })
        .catch((err) => {
          setIsConnected(false);
          console.error('❌ SignalR auto-connect failed:', err);
          // Don't throw, just log - app should still work without real-time
        });
    }

    // Cleanup on unmount
    return () => {
      if (hubRef.current) {
        hubRef.current.stop()
          .then(() => {
            setIsConnected(false);
            console.log('🔌 SignalR disconnected on cleanup');
          })
          .catch((err) => {
            console.error('Error disconnecting SignalR:', err);
          });
      }
    };
  }, [userId, accessToken, autoConnect, showToast]);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const result = await notificationService.getUserNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        console.error('Failed to fetch notifications:', result.error);
        toast.error('Không thể tải thông báo');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch unread notifications
  const fetchUnreadNotifications = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const result = await notificationService.getUnreadNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        console.error('Failed to fetch unread notifications:', result.error);
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await notificationService.getUnreadCount(userId);
      if (result.success && typeof result.data === 'number') {
        setUnreadCount(result.data);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error('Không thể đánh dấu đã đọc');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await notificationService.markAllAsRead(userId);
      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success('Đã đánh dấu tất cả là đã đọc');
      } else {
        toast.error('Không thể đánh dấu tất cả');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        // Remove from local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        
        // Update unread count if notification was unread
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        toast.success('Đã xóa thông báo');
      } else {
        toast.error('Không thể xóa thông báo');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Manual connect/disconnect
  const connect = useCallback(async () => {
    if (hubRef.current && !isConnected) {
      await hubRef.current.start();
      setIsConnected(true);
    }
  }, [isConnected]);

  const disconnect = useCallback(async () => {
    if (hubRef.current && isConnected) {
      await hubRef.current.stop();
      setIsConnected(false);
    }
  }, [isConnected]);

  // Load initial data on mount
  useEffect(() => {
    if (userId && autoConnect) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userId, autoConnect, fetchNotifications, fetchUnreadCount]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    
    // Actions
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    connect,
    disconnect,
    
    // Hub reference (for advanced usage)
    hub: hubRef.current,
  };
};
