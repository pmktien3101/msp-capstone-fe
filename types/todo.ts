export interface CreateTodoRequest {
    meetingId: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    assigneeId: string;
  }

  export interface UpdateTodoRequest {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    assigneeId?: string;
  }
  
  export interface Todo {
    id: string;
    meetingId?: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    assigneeId?: string | null;
    assignee?: Assignee | null;
    
  }

  export interface Assignee {
    id?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string | null;
  }

  export interface DeleteTodoRequest {
    todoId: string;
  }