import { api } from "./api";
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
} from "@/types/todo";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const todoService = {
  // Create new todo
  async createTodo(
    data: CreateTodoRequest
  ): Promise<{ success: boolean; data?: Todo; error?: string }> {
    try {
      console.log('Creating todo with data:', data);
      const response = await api.post<ApiResponse<Todo>>(
        "/todos",
        data
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to create todo",
        };
      }
    } catch (error: any) {
      console.error("Create todo error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create todo",
      };
    }
  },

  // Update todo
  async updateTodo(
    todoId: string,
    data: UpdateTodoRequest
  ): Promise<{ success: boolean; data?: Todo; error?: string }> {
    try {

      // Làm sạch input
      const requestData = {
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : null,
        endDate: data.endDate
          ? new Date(data.endDate).toISOString()
          : null,
        assigneeId: data.assigneeId || null,
        title: data.title?.trim() || null,
        description: data.description?.trim() || null,
      };

      const response = await api.put<ApiResponse<Todo>>(
        `/todos/${todoId}`,
        requestData
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to update todo",
        };
      }
    } catch (error: any) {
      console.error("Update todo error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update todo",
      };
    }
  },

  // Delete todo
  async deleteTodo(
    todoId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse>(`/todos/${todoId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to delete todo",
        };
      }
    } catch (error: any) {
      console.error("Delete todo error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete todo",
      };
    }
  },

  // Get todos by meeting ID
  async getTodosByMeetingId(
    meetingId: string
  ): Promise<{ success: boolean; data?: Todo[]; error?: string }> {
    try {
      const response = await api.get<ApiResponse<Todo[]>>(
        `/todos/meeting/${meetingId}`
      );

      if (response.data.success && response.data.data) {
        console.log('Todos fetched successfully:', response.data.data);
        return {
          success: true,
          data: response.data.data,
        };


      } else {
        return {
          success: false,
          error: response.data.message || "Failed to fetch todos",
        };
      }
    } catch (error: any) {
      console.error("Get todos by meeting error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch todos",
      };
    }
  },

  // Create multiple todos from AI response
  async createTodosFromAI(
    meetingId: string,
    todoList: any[],
    fallbackUserId?: string
  ): Promise<{ success: boolean; data?: Todo[]; error?: string }> {
    try {
      const createPromises = todoList.map(todo =>
        this.createTodo({
          meetingId,
          assigneeId: todo.assigneeId || fallbackUserId, // Use fallback if assigneeId is null/undefined
          title: todo.title,
          description: todo.description,
          startDate: todo.startDate,
          endDate: todo.endDate
        })
      );

      const results = await Promise.all(createPromises);

      // Check if all creations were successful
      const successfulTodos = results
        .filter(result => result.success)
        .map(result => result.data!);

      if (successfulTodos.length === todoList.length) {
        return {
          success: true,
          data: successfulTodos,
        };
      } else {
        return {
          success: false,
          error: `Only ${successfulTodos.length} out of ${todoList.length} todos were created successfully`,
        };
      }
    } catch (error: any) {
      console.error("Create todos from AI error:", error);
      return {
        success: false,
        error: error.message || "Failed to create todos from AI",
      };
    }
  },
  // Convert nhiều todos sang tasks
  async convertTodosToTasks(
    todoIds: string[]
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await api.post<ApiResponse<any[]>>(
        "/todos/convert-to-tasks",
        {
          todoIds, // truyền danh sách id
        }
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to convert todos to tasks",
        };
      }
    } catch (error: any) {
      console.error("Convert todos to tasks error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to convert todos to tasks",
      };
    }
  }
};
