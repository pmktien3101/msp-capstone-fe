import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationHub } from "./useNotificationHub";
import { getAccessToken } from "@/lib/auth";
import { notificationService } from "@/services/notificationService";
import type { NotificationResponse } from "@/types/notification";
import { toast } from "react-toastify";
import { signalRConfig } from "@/config/signalr.config";

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
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const hubRef = useRef<NotificationHub | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!userId || isInitializedRef.current) return;

    const accessTokenFactory = () => {
      const token = getAccessToken();
      if (!token) {
        console.warn("⚠️ No access token available");
        return "";
      }

      try {
        // Validate JWT format: must have 3 parts separated by '.'
        const parts = token.split(".");
        if (parts.length !== 3) {
          console.warn("⚠️ Invalid JWT format");
          return token;
        }

        // Base64url to base64 conversion
        const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64Payload));
        const exp = payload.exp * 1000;
        const now = Date.now();
        const minutesLeft = Math.floor((exp - now) / 60000);
        console.log(`🔑 Token expires in ${minutesLeft}m`);
      } catch (err) {
        console.error("❌ Token parse error:", err);
      }

      return token;
    };

    const hub = NotificationHub.getInstance(userId, accessTokenFactory);
    hubRef.current = hub;
    isInitializedRef.current = true;

    const offReceive = hub.onNotificationReceived((notification) => {
      setNotifications((prev) => [notification, ...prev]);

      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      if (showToast) {
        toast.info(`${notification.title}\n${notification.message}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    });

    const offUnread = hub.onUnreadCountUpdated((count: number) => {
      setUnreadCount(count);
    });

    const offRead = hub.onNotificationRead((notificationId: string) => {
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
      let isMounted = true;

      hub
        .start()
        .then(() => {
          if (!isMounted) return;

          setIsConnected(true);
          setConnectionError(null);

          const userGroup = signalRConfig.groups.userGroup(userId);
          return hub.joinGroup(userGroup);
        })
        .then(() => {
          // Silent success
        })
        .catch((err: any) => {
          if (!isMounted) return;

          setIsConnected(false);
          setConnectionError(err?.message || "Connection failed");
          console.error("❌ Auto-connect failed:", err);
        });

      return () => {
        isMounted = false;

        try {
          if (offReceive) offReceive();
          if (offUnread) offUnread();
          if (offRead) offRead();
        } catch (err) {
          console.error("❌ Error removing handlers:", err);
        }

        setIsConnected(false);
      };
    }

    return () => {
      try {
        if (offReceive) offReceive();
        if (offUnread) offUnread();
        if (offRead) offRead();
      } catch (err) {
        console.error("❌ Error removing handlers:", err);
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
      } else {
        console.error("❌ Fetch notifications failed:", result.error);
        toast.error("Không thể tải thông báo");
      }
    } catch (error) {
      console.error("❌ Fetch notifications error:", error);
      toast.error("Lỗi khi tải thông báo");
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
      } else {
        console.error("❌ Fetch unread failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Fetch unread error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await notificationService.getUnreadCount(userId);
      if (result.success && typeof result.data === "number") {
        setUnreadCount(result.data);
      }
    } catch (error) {
      console.error("❌ Fetch count error:", error);
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

        if (hubRef.current?.isConnectionActive()) {
          try {
            await hubRef.current.markNotificationAsRead(notificationId);
          } catch (err) {
            console.warn("⚠️ SignalR notify failed:", err);
          }
        }
      } else {
        toast.error("Không thể đánh dấu đã đọc");
      }
    } catch (error) {
      console.error("❌ Mark read error:", error);
      toast.error("Lỗi khi đánh dấu đã đọc");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await notificationService.markAllAsRead(userId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);
        toast.success("Đã đánh dấu tất cả là đã đọc");
      } else {
        toast.error("Không thể đánh dấu tất cả");
      }
    } catch (error) {
      console.error("❌ Mark all error:", error);
      toast.error("Lỗi khi đánh dấu tất cả");
    }
  }, [userId]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const result = await notificationService.deleteNotification(
          notificationId
        );
        if (result.success) {
          const notification = notifications.find(
            (n) => n.id === notificationId
          );
          if (notification && !notification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );

          toast.success("Đã xóa thông báo");
        } else {
          toast.error("Không thể xóa thông báo");
        }
      } catch (error) {
        console.error("❌ Delete error:", error);
        toast.error("Lỗi khi xóa thông báo");
      }
    },
    [notifications]
  );

  const connect = useCallback(async () => {
    if (!hubRef.current) {
      console.error("❌ Hub not initialized");
      return;
    }

    if (isConnected) return;

    try {
      await hubRef.current.start();
      setIsConnected(true);
      setConnectionError(null);

      const userGroup = signalRConfig.groups.userGroup(userId);
      await hubRef.current.joinGroup(userGroup);
    } catch (err: any) {
      setConnectionError(err?.message || "Connection failed");
      console.error("❌ Manual connect failed:", err);
      throw err;
    }
  }, [isConnected, userId]);

  const disconnect = useCallback(async () => {
    if (!hubRef.current) return;

    try {
      await hubRef.current.stop();
      setIsConnected(false);
    } catch (err) {
      console.error("❌ Disconnect error:", err);
    }
  }, []);

  const joinGroup = useCallback(async (groupName: string) => {
    if (!hubRef.current) {
      console.error("❌ Hub not initialized");
      return;
    }

    try {
      await hubRef.current.joinGroup(groupName);
    } catch (err) {
      console.error(`❌ Join group ${groupName} failed:`, err);
      throw err;
    }
  }, []);

  const leaveGroup = useCallback(async (groupName: string) => {
    if (!hubRef.current) {
      console.error("❌ Hub not initialized");
      return;
    }

    try {
      await hubRef.current.leaveGroup(groupName);
    } catch (err) {
      console.error(`❌ Leave group ${groupName} failed:`, err);
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
