export interface CreateTaskReassignRequestRequest {
    taskId: string; 
    fromUserId: string; 
    toUserId: string;
    description: string;
}

export interface UpdateTaskReassignRequestRequest {
    responseMessage?: string | null;
}

export interface TaskReassignRequest {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId: string;
  description: string;
  status: string;
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  task?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    projectId: string;
  };
  fromUser?: {
    id: string;
    fullName: string;
    email: string;
  };
  toUser?: {
    id: string;
    fullName: string;
    email: string;
  };
}