export interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed";
  startDate: string;
  endDate: string;
  milestones?: string[];
  meetings?: string[];
  progress?: number;
  members?: ProjectMember[];
  manager?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}
