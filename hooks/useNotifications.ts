import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationHub } from './useNotificationHub';
import { getAccessToken } from '@/lib/auth';
import { notificationService } from '@/services/notificationService';
import type { NotificationResponse } from '@/types/notification';
import { toast } from 'react-toastify';
import { signalRConfig } from '@/config/signalr.config';

interface UseNotificationsOptions {
  userId: string;
  autoConnect?: boolean;
  showToast?: boolean;
}

export const useNotifications = ({
  userId,
  autoConnect = true,
  showToast = true,
}: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const hubRef = useRef<NotificationHub | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!userId || isInitializedRef.current) return;

    console.log(' [useNotifications] Initializing SignalR for user:', userId);

    const accessTokenFactory = () => {
      const token = getAccessToken();
      if (!token) {
        console.warn(' [useNotifications] No access token available');
        return '';
      }
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        const now = Date.now();
        const minutesLeft = Math.floor((exp - now) / 60000);
        console.log(` [useNotifications] Access token expires in ${minutesLeft} minutes`);
      } catch (err) {
        console.error(' [useNotifications] Failed to parse token:', err);
      }
      
      return token;
    };

    const hub = NotificationHub.getInstance(userId, accessTokenFactory);
    hubRef.current = hub;
    isInitializedRef.current = true;

    const offReceive = hub.onNotificationReceived((notification) => {
      console.log(' [useNotifications] New notification received:', notification);
      
      setNotifications((prev) => [notification, ...prev]);
      
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      if (showToast) {
        toast.info(`${notification.title}\n${notification.message}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    });

    const offUnread = hub.onUnreadCountUpdated((count: number) => {
      console.log(' [useNotifications] Unread count updated:', count);
      setUnreadCount(count);
    });

    const offRead = hub.onNotificationRead((notificationId: string) => {
      console.log(' [useNotifications] Notification marked as read:', notificationId);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId 
            ? { ...n, isRead: true, readAt: new Date().toISOString() } 
            : n
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    if (autoConnect) {
      console.log(' [useNotifications] Auto-connecting...');
      
      // Use a flag to track if component is still mounted
      let isMounted = true;
      
      hub.start()
        .then(() => {
          if (!isMounted) {
            console.log(' [useNotifications] Component unmounted during connection, skipping...');
            return;
          }
          
          setIsConnected(true);
          setConnectionError(null);
          console.log(' [useNotifications] Auto-connected successfully');

          const userGroup = signalRConfig.groups.userGroup(userId);
          return hub.joinGroup(userGroup);
        })
        .then(() => {
          if (isMounted) {
            console.log(` [useNotifications] Joined personal group successfully`);
          }
        })
        .catch((err: any) => {
          if (!isMounted) {
            console.log(' [useNotifications] Component unmounted, ignoring error');
            return;
          }
          
          setIsConnected(false);
          setConnectionError(err?.message || 'Connection failed');
          console.error(' [useNotifications] Auto-connect/join failed:', err);
        });

      // Cleanup function
      return () => {
        console.log(' [useNotifications] Cleaning up...');
        isMounted = false;
        
        try {
          if (offReceive) offReceive();
          if (offUnread) offUnread();
          if (offRead) offRead();
        } catch (err) {
          console.error('Error removing event handlers:', err);
        }

        // Don't stop the hub in cleanup - let singleton manage lifecycle
        // Hub will be reused by other components
        setIsConnected(false);
        console.log(' [useNotifications] Cleanup completed (hub kept alive)');
      };
    }

    return () => {
      console.log(' [useNotifications] Cleaning up (no autoConnect)...');
      
      try {
        if (offReceive) offReceive();
        if (offUnread) offUnread();
        if (offRead) offRead();
      } catch (err) {
        console.error('Error removing event handlers:', err);
      }
      
      isInitializedRef.current = false;
    };
  }, [userId, autoConnect, showToast]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const result = await notificationService.getUserNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
        console.log(` [useNotifications] Fetched ${result.data.length} notifications`);
      } else {
        console.error(' [useNotifications] Failed to fetch notifications:', result.error);
        toast.error('Không thể tải thông báo');
      }
    } catch (error) {
      console.error(' [useNotifications] Error fetching notifications:', error);
      toast.error('Lỗi khi tải thông báo');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const result = await notificationService.getUnreadNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
        console.log(` [useNotifications] Fetched ${result.data.length} unread notifications`);
      } else {
        console.error(' [useNotifications] Failed to fetch unread notifications:', result.error);
      }
    } catch (error) {
      console.error(' [useNotifications] Error fetching unread notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await notificationService.getUnreadCount(userId);
      if (result.success && typeof result.data === 'number') {
        setUnreadCount(result.data);
        console.log(` [useNotifications] Unread count: ${result.data}`);
      }
    } catch (error) {
      console.error(' [useNotifications] Error fetching unread count:', error);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() } 
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        console.log(` [useNotifications] Marked notification ${notificationId} as read`);
        
        if (hubRef.current?.isConnectionActive()) {
          try {
            await hubRef.current.markNotificationAsRead(notificationId);
          } catch (err) {
            console.warn(' [useNotifications] Failed to notify via SignalR:', err);
          }
        }
      } else {
        toast.error('Không thể đánh dấu đã đọc');
      }
    } catch (error) {
      console.error(' [useNotifications] Error marking as read:', error);
      toast.error('Lỗi khi đánh dấu đã đọc');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      const result = await notificationService.markAllAsRead(userId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success('Đã đánh dấu tất cả là đã đọc');
        console.log(' [useNotifications] Marked all notifications as read');
      } else {
        toast.error('Không thể đánh dấu tất cả');
      }
    } catch (error) {
      console.error(' [useNotifications] Error marking all as read:', error);
      toast.error('Lỗi khi đánh dấu tất cả');
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        
        toast.success('Đã xóa thông báo');
        console.log(` [useNotifications] Deleted notification ${notificationId}`);
      } else {
        toast.error('Không thể xóa thông báo');
      }
    } catch (error) {
      console.error(' [useNotifications] Error deleting notification:', error);
      toast.error('Lỗi khi xóa thông báo');
    }
  }, [notifications]);

  const connect = useCallback(async () => {
    if (!hubRef.current) {
      console.error(' [useNotifications] Hub not initialized');
      return;
    }
    
    if (isConnected) {
      console.log('ℹ [useNotifications] Already connected');
      return;
    }
    
    try {
      await hubRef.current.start();
      setIsConnected(true);
      setConnectionError(null);
      console.log(' [useNotifications] Manually connected');
      
      const userGroup = signalRConfig.groups.userGroup(userId);
      await hubRef.current.joinGroup(userGroup);
    } catch (err: any) {
      setConnectionError(err?.message || 'Connection failed');
      console.error(' [useNotifications] Manual connect failed:', err);
      throw err;
    }
  }, [isConnected, userId]);

  const disconnect = useCallback(async () => {
    if (!hubRef.current) return;
    
    try {
      await hubRef.current.stop();
      setIsConnected(false);
      console.log(' [useNotifications] Manually disconnected');
    } catch (err) {
      console.error(' [useNotifications] Error disconnecting:', err);
    }
  }, []);

  const joinGroup = useCallback(async (groupName: string) => {
    if (!hubRef.current) {
      console.error(' [useNotifications] Hub not initialized');
      return;
    }
    
    try {
      await hubRef.current.joinGroup(groupName);
      console.log(` [useNotifications] Joined group: ${groupName}`);
    } catch (err) {
      console.error(` [useNotifications] Failed to join group ${groupName}:`, err);
      throw err;
    }
  }, []);

  const leaveGroup = useCallback(async (groupName: string) => {
    if (!hubRef.current) {
      console.error(' [useNotifications] Hub not initialized');
      return;
    }
    
    try {
      await hubRef.current.leaveGroup(groupName);
      console.log(` [useNotifications] Left group: ${groupName}`);
    } catch (err) {
      console.error(` [useNotifications] Failed to leave group ${groupName}:`, err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (userId && autoConnect) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [userId, autoConnect, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!hubRef.current) return;

    const interval = setInterval(() => {
      const state = hubRef.current?.getState();
      if (state) {
        setIsConnected(state.isConnected);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    connectionError,
    
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    connect,
    disconnect,
    joinGroup,
    leaveGroup,
    
    hub: hubRef.current,
    hubState: hubRef.current?.getState(),
  };
};
