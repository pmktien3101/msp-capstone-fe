import { api } from './api';
import type { BusinessOwnersResponse, BusinessOwner, User } from '@/types/auth';

export const userService = {
    async getAllUsers(): Promise<{ success: boolean; data?: User[]; message?: string; error?: string }> {
        try {
            const response = await api.get('/users');
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data as User[],
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to get users'
                };
            }
        } catch (error: any) {
            console.error('Get users error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to get users'
            };
        }
    },

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
            const response = await api.post(`/users/business-owners/${userId}/approve`);
            
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
            const response = await api.post(`/users/business-owners/${userId}/reject`);
            
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
    }
};
