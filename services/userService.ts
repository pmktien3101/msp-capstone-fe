import { GetUserResponse } from '@/types/user';
import { api } from './api';
import type { BusinessOwnersResponse, BusinessOwner, ApiResponse } from '@/types/auth';

export const userService = {
    async getBusinessOwners(): Promise<{ success: boolean; data?: BusinessOwner[]; message?: string; error?: string }> {
        try {
            const response = await api.get('/users/business-owners');

            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data as BusinessOwner[],
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to get business owners'
                };
            }
        } catch (error: any) {
            console.error('Get business owners error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to get business owners'
            };
        }
    },

    async approveBusinessOwner(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.post(`/users/approve-business-owner/${userId}`);

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to approve business owner'
                };
            }
        } catch (error: any) {
            console.error('Approve business owner error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to approve business owner'
            };
        }
    },

    async rejectBusinessOwner(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.post(`/users/reject-business-owner/${userId}`);

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to reject business owner'
                };
            }
        } catch (error: any) {
            console.error('Reject business owner error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to reject business owner'
            };
        }
    },

    async toggleActive(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.put(`/users/${userId}/toggle-active`);

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to toggle active status'
                };
            }
        } catch (error: any) {
            console.error('Toggle active error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to toggle active status'
            };
        }
    },

    async getMembersByBO(userId: string): Promise<{
        success: boolean;
        data?: GetUserResponse[];
        message?: string;
        error?: string
    }> {
        try {
            const response = await api.get<ApiResponse<GetUserResponse[]>>(
                `/users/get-members-managed-by/${userId}`
            );

            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }

            return {
                success: false,
                error: response.data.message || 'Failed to get members'
            };
        } catch (error: any) {
            console.error('Get members error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to get members'
            };
        }
    }
};
