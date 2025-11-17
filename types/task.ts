import { GetUserResponse } from "./user";

// Backend API Response - Milestone info trong task
export interface TaskMilestoneResponse {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Backend API Response - Get Task
export interface GetTaskResponse {
  id: string;
  projectId: string;
  userId?: string;
  reviewerId?: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string; // ISO 8601 UTC
  endDate?: string;   // ISO 8601 UTC
  isOverdue: boolean; // Backend calculates overdue status
  createdAt: string;  // ISO 8601 UTC
  updatedAt: string;  // ISO 8601 UTC
  user?: GetUserResponse;
  reviewer?: GetUserResponse;
  milestones?: TaskMilestoneResponse[];
}

// Create Task Request
export interface CreateTaskRequest {
  projectId: string;
  userId?: string;
  actorId?: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;  // ISO 8601 UTC
  endDate?: string;    // ISO 8601 UTC
  milestoneIds?: string[];
}

// Update Task Request
export interface UpdateTaskRequest {
  id: string;
  projectId: string;
  userId?: string;
  reviewerId?: string;
  actorId: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;  // ISO 8601 UTC
  endDate?: string;    // ISO 8601 UTC
  milestoneIds?: string[];
}

// Frontend Task type (for UI display) - extends backend type
export interface Task extends GetTaskResponse {
  // Additional UI fields
  assignedTo?: GetUserResponse;
  name?: string; // Alias for title
  
  // Computed fields
  daysRemaining?: number;
}

// Task form data for create/edit modals
export interface TaskFormData {
  title: string;
  description?: string;
  status: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  milestoneIds?: string[];
}
