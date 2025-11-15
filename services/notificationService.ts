import { api } from './api';
import type {
  CreateNotificationRequest,
  SendBulkNotificationRequest,
  NotificationResponse,
} from '@/types/notification';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const notificationService = {
  // Get all notifications for a user
  async getUserNotifications(userId: string): Promise<{ success: boolean; data?: NotificationResponse[]; error?: string }> {
    try {
      const response = await api.get<ApiResponse<NotificationResponse[]>>(`/notification/user/${userId}`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch notifications' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch notifications' };
    }
  },

  // Get unread notifications for a user
  async getUnreadNotifications(userId: string): Promise<{ success: boolean; data?: NotificationResponse[]; error?: string }> {
    try {
      const response = await api.get<ApiResponse<NotificationResponse[]>>(`/notification/user/${userId}/unread`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch unread notifications' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch unread notifications' };
    }
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      const response = await api.get<ApiResponse<number>>(`/notification/user/${userId}/unread-count`);
      if (response.data.success && typeof response.data.data === 'number') {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to get unread count' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to get unread count' };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.put<ApiResponse>(`/notification/${notificationId}/mark-read`);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message || 'Failed to mark as read' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to mark as read' };
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.put<ApiResponse>(`/notification/user/${userId}/mark-all-read`);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message || 'Failed to mark all as read' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to mark all as read' };
    }
  },

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse>(`/notification/${notificationId}`);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message || 'Failed to delete notification' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to delete notification' };
    }
  },

  // Send single notification
  async sendNotification(data: CreateNotificationRequest): Promise<{ success: boolean; data?: NotificationResponse; error?: string }> {
    try {
      const response = await api.post<ApiResponse<NotificationResponse>>('/notification/send', data);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to send notification' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to send notification' };
    }
  },

  // Send bulk notification (PM/BO/Admin)
  async sendBulkNotification(data: SendBulkNotificationRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.post<ApiResponse>('/notification/bulk', data);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message || 'Failed to send bulk notification' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to send bulk notification' };
    }
  },
};
