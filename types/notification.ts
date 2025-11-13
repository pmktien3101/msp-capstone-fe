// Notification model returned from backend
export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  entityId?: string;
  isRead: boolean;
  readAt?: string | null;
  data?: string | null;
  createdAt: string; // ISO 8601 UTC
}

// Request to create single notification
export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type?: string;
  data?: string;
}

// Request for bulk notification (PM/BO/Admin)
export interface SendBulkNotificationRequest {
  senderId: string;
  projectId?: string | null;
  recipientIds?: string[];
  title: string;
  message: string;
  notificationType?: string; // default: "TeamNotification"
  entityId?: string;
  data?: string;
}
