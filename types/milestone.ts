import { Member } from "./member";

export interface MilestoneFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in-progress" | "completed" | "delayed";
  priority: "low" | "medium" | "high" | "urgent";
  members: string[]; // Member IDs
}

export interface Milestone {
  id: string | number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in-progress" | "completed" | "delayed";
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  projectId: string | number;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
  members: Member[];
}

export interface Task {
  id: string;
  title: string;
  name?: string;
  description?: string;
  epic?: string;
  status: "todo" | "in-progress" | "review" | "done" | string;
  priority?: string;
  assignee?: string | null;
  assignedTo?: Member | null; // Changed from ProjectMember to Member
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  createdDate?: string;
  updatedDate?: string;
  tags?: string[];
  projectId?: string;
  milestoneId?: string;
  milestoneIds?: string[];
  comments?: any[];
}

// Backend API types for Milestone
export interface MilestoneBackend {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  userId: string;
  projectId: string;
  name: string;
  dueDate: string;
  description: string;
}

export interface UpdateMilestoneRequest {
  id: string;
  name: string;
  dueDate: string;
  description: string;
}
