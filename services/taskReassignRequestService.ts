import { UpdateTaskReassignRequestRequest } from '@/types/taskReassignRequest';
import { api } from './api';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export const taskReassignRequestService = {
    async getAvailableUsersForReassignment(taskId: string, fromUserId: string): Promise<{ success: boolean; data?: any; error?: string }>{
        try {
            const response = await api.get<ApiResponse<any>>('/TaskReassignRequests/available-users', {
                params: { taskId, fromUserId },
            });

            if (response.data.success) {
                return { success: true, data: response.data.data };
            }
            return { success: false, error: response.data.message || 'Failed to fetch available users' };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch available users' };
        }
    },

    async createTaskReassignRequest(payload: CreateTaskReassignRequestRequest): Promise<{ success: boolean; data?: any; error?: string }>{
        try {
            const response = await api.post<ApiResponse<any>>('/TaskReassignRequests', payload);
            if (response.data.success) {
                return { success: true, data: response.data.data };
            }
            return { success: false, error: response.data.message || 'Failed to create task reassign request' };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || 'Failed to create task reassign request' };
        }
    },

    async acceptTaskReassignRequest(taskReassignRequestId: string, payload: UpdateTaskReassignRequestRequest): Promise<{ success: boolean; data?: any; error?: string }>{
        try {
            const response = await api.post<ApiResponse<any>>(`/TaskReassignRequests/${taskReassignRequestId}/accept`, payload);
            if (response.data.success) {
                return { success: true, data: response.data.data };
            }
            return { success: false, error: response.data.message || 'Failed to accept task reassign request' };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || 'Failed to accept task reassign request' };
        }
    },

    async rejectTaskReassignRequest(taskReassignRequestId: string, payload: UpdateTaskReassignRequestRequest): Promise<{ success: boolean; data?: any; error?: string }>{
        try {
            const response = await api.post<ApiResponse<any>>(`/TaskReassignRequests/${taskReassignRequestId}/reject`, payload);
            if (response.data.success) {
                return { success: true, data: response.data.data };
            }
            return { success: false, error: response.data.message || 'Failed to reject task reassign request' };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || 'Failed to reject task reassign request' };
        }
    },

    async getTaskReassignRequestsByTaskId(taskId: string): Promise<{ success: boolean; data?: any; error?: string }>{
        try {
            const response = await api.get<ApiResponse<any>>(`/TaskReassignRequests/by-task/${taskId}`);
            if (response.data.success) {
                return { success: true, data: response.data.data };
            }
            return { success: false, error: response.data.message || 'Failed to fetch requests by task' };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch requests by task' };
        }
    },

    async getTaskReassignRequestsForUser(userId: string): Promise<{ success: boolean; data?: any; error?: string }>{
        try {
            const response = await api.get<ApiResponse<any>>(`/TaskReassignRequests/for-user/${userId}`);
            if (response.data.success) {
                return { success: true, data: response.data.data };
            }
            return { success: false, error: response.data.message || 'Failed to fetch requests for user' };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch requests for user' };
        }
    },
};