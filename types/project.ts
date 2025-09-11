export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  startDate: string;
  endDate: string;
  manager: string;
  members: ProjectMember[];
  progress: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}
