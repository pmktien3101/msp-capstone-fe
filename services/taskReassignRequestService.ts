import { CreateTaskReassignRequestRequest, UpdateTaskReassignRequestRequest } from '@/types/taskReassignRequest';
import { api } from './api';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export const taskReassignRequestService = {
  async getAvailableUsersForReassignment(
    taskId: string,
    fromUserId: string
  ): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>(
        '/TaskReassignRequests/available-users',
        { params: { taskId, fromUserId } }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch available users',
      };
    }
  },

  async createTaskReassignRequest(
    payload: CreateTaskReassignRequestRequest
  ): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(
        '/TaskReassignRequests',
        payload
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to create task reassign request',
      };
    }
  },

  async acceptTaskReassignRequest(
    taskReassignRequestId: string,
    payload: UpdateTaskReassignRequestRequest
  ): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(
        `/TaskReassignRequests/${taskReassignRequestId}/accept`,
        payload
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to accept task reassign request',
      };
    }
  },

  async rejectTaskReassignRequest(
    taskReassignRequestId: string,
    payload: UpdateTaskReassignRequestRequest
  ): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(
        `/TaskReassignRequests/${taskReassignRequestId}/reject`,
        payload
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to reject task reassign request',
      };
    }
  },

  async getTaskReassignRequestsByTaskId(
    taskId: string
  ): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>(
        `/TaskReassignRequests/by-task/${taskId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch requests by task',
      };
    }
  },

  async getTaskReassignRequestsForUser(
    userId: string
  ): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>(
        `/TaskReassignRequests/for-user/${userId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch requests for user',
      };
    }
  },
};