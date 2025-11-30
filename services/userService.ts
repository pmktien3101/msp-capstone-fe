import { BusinessResponse, GetUserResponse, ReAssignRoleRequest, ReAssignRoleResponse } from '@/types/user';
import { api } from './api';
import type { BusinessOwner, ApiResponse } from '@/types/auth';

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
    },

    async reassignRole(
        businessOwnerId: string,
        userId: string,
        newRole: string
    ): Promise<{
        success: boolean;
        data?: ReAssignRoleResponse;
        message?: string;
        error?: string
    }> {
        try {
            const requestBody: ReAssignRoleRequest = {
                businessOwnerId,
                userId,
                newRole
            };

            const response = await api.put<ApiResponse<ReAssignRoleResponse>>(
                '/users/re-assign-role',
                requestBody
            );

            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Role reassigned successfully'
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to reassign role'
                };
            }
        } catch (error: any) {
            console.error('Reassign role error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to reassign role'
            };
        }
    },

    async getUserDetailById(userId: string): Promise<{
        success: boolean;
        data?: GetUserResponse;
        message?: string;
        error?: string
    }> {
        try {
            // ✅ Đúng endpoint: /users/detail/{id}
            const response = await api.get<ApiResponse<GetUserResponse>>(
                `/users/detail/${userId}`
            );

            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'User details fetched successfully'
                };
            }

            return {
                success: false,
                error: response.data.message || 'Failed to fetch user details'
            };
        } catch (error: any) {
            console.error('Get user details error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch user details'
            };
        }
    },

    /**
     * Get list of all businesses (for users without organization)
     * Authorization: ProjectManager, Member
     */
    async getBusinessList(): Promise<{
        success: boolean;
        data?: BusinessResponse[];
        message?: string;
        error?: string
    }> {
        try {
            const response = await api.get<ApiResponse<BusinessResponse[]>>('/users/business-list');
            return {
                success: response.data.success,
                data: response.data.data ?? [],
                message: response.data.message,
            };
        } catch (error: any) {
            console.error('Get business list error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to get business list'
            };
        }
    },

    /**
     * Get business detail by owner ID
     * Authorization: Admin, BusinessOwner, ProjectManager, Member
     */
    async getBusinessDetail(ownerId: string): Promise<{
        success: boolean;
        data?: BusinessResponse;
        message?: string;
        error?: string
    }> {
        try {
            const response = await api.get<ApiResponse<BusinessResponse>>(
                `/users/business-detail/${ownerId}`
            );
            return {
                success: response.data.success,
                data: response.data.data ?? undefined,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error('Get business detail error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to get business detail'
            };
        }
    },

    async removeMemberFromOrganization(memberId: string): Promise<{ success: boolean; error?: string; }> {
        try {
            const res = await api.post(`/Users/remove-member/${memberId}`);
            return { success: res.data.success };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || "Không thể xóa thành viên" };
        }
    },

    async updateUserProfile(userId: string, request: {
        fullName?: string;
        phoneNumber?: string;
        avatarUrl?: string;
    }): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.put(`/users/update-profile/${userId}`, request);
            
            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Profile updated successfully'
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to update profile'
                };
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update profile'
            };
        }
    }

};
