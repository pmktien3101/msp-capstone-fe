import { Member } from "./member";

export interface ProjectManager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "on-hold" | "completed";
  startDate: string;
  endDate: string;
  manager: string;
  members: Member[];
  projectManagers?: ProjectManager[];
  progress?: number;
  milestones: string[];
  meetings?: string[];
}
