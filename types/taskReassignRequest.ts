export interface CreateTaskReassignRequestRequest {
    taskId: string; 
    fromUserId: string; 
    toUserId: string;
    description: string;
}

export interface UpdateTaskReassignRequestRequest {
    responseMessage?: string | null;
}