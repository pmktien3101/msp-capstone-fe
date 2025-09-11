import { Member } from './member'

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
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
  } | null;
  milestoneId: number;
}
