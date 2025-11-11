export interface TaskHistory {
  id: string;
  taskId: string;
  fromUserId?: string;
  toUserId: string;
  assignedAt: string;
  task?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    projectId: string;
    startDate?: string;
    endDate?: string;
  };
  fromUser?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  toUser?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}