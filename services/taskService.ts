import { api } from './api';
import type {
    GetTaskResponse,
    CreateTaskRequest,
    UpdateTaskRequest,
} from '@/types/task';
import type { PagingRequest, PagingResponse } from '@/types/project';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export const taskService = {
    // Create new task
    async createTask(data: CreateTaskRequest): Promise<{ success: boolean; data?: GetTaskResponse; error?: string }> {
        try {
            console.log('createTask - Request:', data);
            
            // Convert dates to ISO 8601 UTC format if provided
            const requestData = {
                ...data,
                startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
                endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
            };

            const response = await api.post<ApiResponse<GetTaskResponse>>('/tasks', requestData);
            console.log('createTask - Response:', response.data);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to create task'
                };
            }
        } catch (error: any) {
            console.error('Create task error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to create task'
            };
        }
    },

    // Update task
    async updateTask(data: UpdateTaskRequest): Promise<{ success: boolean; data?: GetTaskResponse; error?: string }> {
        try {
            console.log('updateTask - Request:', data);
            
            // Convert dates to ISO 8601 UTC format if provided
            const requestData = {
                ...data,
                startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
                endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
            };

            const response = await api.put<ApiResponse<GetTaskResponse>>('/tasks', requestData);
            console.log('updateTask - Response:', response.data);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to update task'
                };
            }
        } catch (error: any) {
            console.error('Update task error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update task'
            };
        }
    },

    // Delete task
    async deleteTask(taskId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            console.log('deleteTask - TaskId:', taskId);
            
            const response = await api.delete<ApiResponse>(`/tasks/${taskId}`);
            console.log('deleteTask - Response:', response.data);
            
            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to delete task'
                };
            }
        } catch (error: any) {
            console.error('Delete task error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete task'
            };
        }
    },

    // Get task by ID
    async getTaskById(taskId: string): Promise<{ success: boolean; data?: GetTaskResponse; error?: string }> {
        try {
            console.log('getTaskById - TaskId:', taskId);
            
            const response = await api.get<ApiResponse<GetTaskResponse>>(`/tasks/${taskId}`);
            console.log('getTaskById - Response:', response.data);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch task'
                };
            }
        } catch (error: any) {
            console.error('Get task error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch task'
            };
        }
    },

    // Get tasks by project ID
    async getTasksByProjectId(
        projectId: string,
        params?: PagingRequest
    ): Promise<{ success: boolean; data?: PagingResponse<GetTaskResponse>; error?: string }> {
        try {
            console.log('getTasksByProjectId - ProjectId:', projectId, 'Params:', params);
            
            const response = await api.get<ApiResponse<PagingResponse<GetTaskResponse>>>(
                `/tasks/by-project/${projectId}`,
                { params }
            );
            console.log('getTasksByProjectId - Response:', response.data);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch tasks'
                };
            }
        } catch (error: any) {
            console.log('Get tasks by project error:', error.response?.status, error.response?.data);
            
            // Handle 400/404 as empty result (no tasks found)
            if (error.response?.status === 400 || error.response?.status === 404) {
                console.log('No tasks found for project, returning empty result');
                return {
                    success: true,
                    data: {
                        items: [],
                        totalItems: 0,
                        pageIndex: params?.pageIndex || 0,
                        pageSize: params?.pageSize || 10
                    }
                };
            }
            
            console.error('Get tasks by project error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch tasks'
            };
        }
    },

    // Get tasks by user ID
    async getTasksByUserId(
        userId: string,
        params?: PagingRequest
    ): Promise<{ success: boolean; data?: PagingResponse<GetTaskResponse>; error?: string }> {
        try {
            console.log('getTasksByUserId - UserId:', userId, 'Params:', params);
            
            const response = await api.get<ApiResponse<PagingResponse<GetTaskResponse>>>(
                `/tasks/by-user/${userId}`,
                { params }
            );
            console.log('getTasksByUserId - Response:', response.data);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch tasks'
                };
            }
        } catch (error: any) {
            console.log('Get tasks by user error:', error.response?.status, error.response?.data);
            
            // Handle 400/404 as empty result (no tasks found)
            if (error.response?.status === 400 || error.response?.status === 404) {
                console.log('No tasks found for user, returning empty result');
                return {
                    success: true,
                    data: {
                        items: [],
                        totalItems: 0,
                        pageIndex: params?.pageIndex || 0,
                        pageSize: params?.pageSize || 10
                    }
                };
            }
            
            console.error('Get tasks by user error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch tasks'
            };
        }
    },

    // Get tasks by milestone ID
    async getTasksByMilestoneId(milestoneId: string): Promise<{ success: boolean; data?: GetTaskResponse[]; error?: string }> {
        try {
            console.log('getTasksByMilestoneId - MilestoneId:', milestoneId);
            
            const response = await api.get<ApiResponse<GetTaskResponse[]>>(`/tasks/by-milestone/${milestoneId}`);
            console.log('getTasksByMilestoneId - Response:', response.data);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch tasks'
                };
            }
        } catch (error: any) {
            console.log('Get tasks by milestone error:', error.response?.status, error.response?.data);
            
            // Handle 400/404 as empty result (no tasks found)
            if (error.response?.status === 400 || error.response?.status === 404) {
                console.log('No tasks found for milestone, returning empty array');
                return {
                    success: true,
                    data: []
                };
            }
            
            console.error('Get tasks by milestone error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch tasks'
            };
        }
    },
};
