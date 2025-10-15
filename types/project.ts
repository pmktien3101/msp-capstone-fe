import { User } from "./auth";

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  member?: User;
  joinedAt: string;
  leftAt?: string;
}

// Response from GET /projects/project-member/{projectId}
export interface ProjectMemberResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  googleId: string | null;
  organization: string | null;
  managedBy: string;
  managerName: string;
  businessLicense: string | null;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  roleName: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: string;
  ownerId: string;
  owner?: User;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  projectId: string;
  userId: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  milestoneIds?: string[];
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  id: string;
}

// Các request types
export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: string;
  createdById: string;
}

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

// Pagination
export interface PagingRequest {
  pageIndex: number;
  pageSize: number;
}

export interface PagingResponse<T> {
  items: T[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
}
