import { api } from './api';
import type { 
    MilestoneBackend, 
    CreateMilestoneRequest,
    UpdateMilestoneRequest
} from '@/types/milestone';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export const milestoneService = {
    // Create new milestone
    async createMilestone(data: CreateMilestoneRequest): Promise<{ success: boolean; data?: MilestoneBackend; error?: string }> {
        try {
            // Convert date to ISO 8601 UTC format if needed
            const requestData = {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined
            };

            const response = await api.post<ApiResponse<MilestoneBackend>>('/milestones', requestData);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to create milestone'
                };
            }
        } catch (error: any) {
            console.error('Create milestone error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to create milestone'
            };
        }
    },

    // Update milestone
    async updateMilestone(data: UpdateMilestoneRequest): Promise<{ success: boolean; data?: MilestoneBackend; error?: string }> {
        try {
            // Convert date to ISO 8601 UTC format if needed
            const requestData = {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined
            };

            const response = await api.put<ApiResponse<MilestoneBackend>>('/milestones', requestData);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to update milestone'
                };
            }
        } catch (error: any) {
            console.error('Update milestone error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update milestone'
            };
        }
    },

    // Delete milestone
    async deleteMilestone(milestoneId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.delete<ApiResponse>(`/milestones/${milestoneId}`);
            
            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to delete milestone'
                };
            }
        } catch (error: any) {
            console.error('Delete milestone error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to delete milestone'
            };
        }
    },

    // Get milestone by ID
    async getMilestoneById(milestoneId: string): Promise<{ success: boolean; data?: MilestoneBackend; error?: string }> {
        try {
            const response = await api.get<ApiResponse<MilestoneBackend>>(`/milestones/${milestoneId}`);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch milestone'
                };
            }
        } catch (error: any) {
            console.error('Get milestone error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch milestone'
            };
        }
    },

    // Get milestones by project ID
    async getMilestonesByProjectId(projectId: string): Promise<{ success: boolean; data?: MilestoneBackend[]; error?: string }> {
        try {
            const response = await api.get<ApiResponse<MilestoneBackend[]>>(`/milestones/by-project/${projectId}`);
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to fetch milestones'
                };
            }
        } catch (error: any) {
            console.error('Get milestones by project error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch milestones'
            };
        }
    }
};

