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
    status: number; // 0: Generated, 1: UnderReview, 2: ConvertedToTask, 3: Deleted
    statusDisplay: "Generated" | "UnderReview" | "ConvertedToTask" | "Deleted";
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