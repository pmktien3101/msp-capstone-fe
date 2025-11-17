import { api } from "./api";
import type { TaskHistory, AvailableUser } from "@/types/taskHistory";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const taskHistoryService = {
  /**
   * Get available users for task reassignment
   * @param taskId - Task ID
   * @param fromUserId - Current user ID
   */
  async getAvailableUsersForReassignment(
    taskId: string,
    fromUserId: string
  ): Promise<ApiResponse<AvailableUser[]>> {
    try {
      const response = await api.get<ApiResponse<AvailableUser[]>>(
        "/TaskHistories/available-users",
        { 
          params: { taskId, fromUserId } 
        }
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

  /**
   * Get all task histories for a specific task
   * @param taskId - Task ID
   */
  async getTaskHistoriesByTaskId(
    taskId: string
  ): Promise<ApiResponse<TaskHistory[]>> {
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
          "Failed to fetch task histories",
      };
    }
  },
};