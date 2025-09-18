import { Member } from './member'
import { Comment } from './comment'

export interface MilestoneFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  members: string[]; // Member IDs
}

export interface Milestone {
  id: string | number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  projectId: string | number;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
  members: Member[];
}

export interface Task {
  id: number | string;
  name: string;
  title?: string; // For compatibility with existing code
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'todo' | 'done' | 'review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
  } | null;
  assignee?: string; // For compatibility with existing code
  milestoneId: number | string;
  comments?: Comment[];
  createdDate?: string;
  updatedDate?: string;
  tags?: string[];
  epic?: string;
}
