export interface TaskHistory {
  id: string;
  taskId: string;
  
  // Assignment tracking
  fromUserId?: string;
  toUserId?: string;
  
  // Action tracking
  action: string; // "Created" | "Assigned" | "Reassigned" | "Updated" | "StatusChanged"
  changedById: string;
  
  // Field change tracking
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  
  createdAt: string;
  
  // Navigation properties
  task?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    projectId: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    isOverdue?: boolean;
  };
  
  fromUser?: {
    id: string;
    userName?: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    phoneNumber?: string;
  };
  
  toUser?: {
    id: string;
    userName?: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    phoneNumber?: string;
  };
  
  changedBy?: {
    id: string;
    userName?: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    phoneNumber?: string;
  };
  
  // Display properties (computed from backend)
  actionDisplay?: string;
  changeDescription?: string;
}

// Enum for actions (for type safety)
export enum TaskHistoryAction {
  Created = "Created",
  Assigned = "Assigned",
  Reassigned = "Reassigned",
  Updated = "Updated",
  StatusChanged = "StatusChanged"
}

// Helper type for available users response
export interface AvailableUser {
  id: string;
  userName?: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phoneNumber?: string;
}