import { api } from "./api";
import type { TaskHistory } from "@/types/taskHistory";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const taskHistoryService = {
  async getAvailableUsersForReassignment(
    taskId: string,
    fromUserId: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await api.get<ApiResponse>(
        "/TaskHistories/available-users",
        { params: { taskId, fromUserId } }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch available users",
      };
    }
  },

  async getTaskHistoriesByTaskId(taskId: string): Promise<ApiResponse<TaskHistory[]>> {
    try {
      const response = await api.get<ApiResponse<TaskHistory[]>>(
        `/TaskHistories/by-task/${taskId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch task histories by task",
      };
    }
  },
};
