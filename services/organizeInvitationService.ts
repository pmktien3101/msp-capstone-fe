import { OrganizationInvitationResponse } from "@/types/organizeInvitation";
import { api } from "./api";

export const organizeInvitationService = {
    /**
     * BusinessOwner: Get list of invitations sent to members
     */
    async getSentInvitationsByBusinessOwnerId(
        businessOwnerId: string
    ): Promise<{
        success: boolean;
        data?: OrganizationInvitationResponse[];
        message?: string;
        error?: string;
    }> {
        try {
            const res = await api.get(`/OrganizationInvitations/sent-invitations/${businessOwnerId}`);
            return {
                success: res.data.success,
                data: res.data.data,
                message: res.data.message,
            };
        } catch (error: any) {
            console.error('Get sent invitations error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to get sent invitations",
            };
        }
    },

    /**
     * BusinessOwner: Get list of pending requests from members
     */
    async getPendingRequestsByBusinessOwnerId(
        businessOwnerId: string
    ): Promise<{
        success: boolean;
        data?: OrganizationInvitationResponse[];
        message?: string;
        error?: string;
    }> {
        try {
            const res = await api.get(`/OrganizationInvitations/pending-requests/${businessOwnerId}`);
            return {
                success: res.data.success,
                data: res.data.data,
                message: res.data.message,
            };
        } catch (error: any) {
            console.error('Get pending requests error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to get pending requests",
            };
        }
    },

    /**
     * Member: Get invitations RECEIVED
     */
    async getReceivedInvitationsByMemberId(
        memberId: string
    ): Promise<{
        success: boolean;
        data?: OrganizationInvitationResponse[];
        message?: string;
        error?: string;
    }> {
        try {
            const res = await api.get(`/OrganizationInvitations/received-invitations/${memberId}`);
            return {
                success: res.data.success,
                data: res.data.data,
                message: res.data.message,
            };
        } catch (error: any) {
            console.error('Get received invitations error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to get received invitations",
            };
        }
    },

    /**
     * Member: Get requests SENT
     */
    async getSentRequestsByMemberId(
        memberId: string
    ): Promise<{
        success: boolean;
        data?: OrganizationInvitationResponse[];
        message?: string;
        error?: string;
    }> {
        try {
            const res = await api.get(`/OrganizationInvitations/sent-requests/${memberId}`);
            return {
                success: res.data.success,
                data: res.data.data,
                message: res.data.message,
            };
        } catch (error: any) {
            console.error('Get sent requests error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Failed to get sent requests",
            };
        }
    },

    async requestJoinOrganization(memberId: string, businessOwnerId: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            const response = await api.post(
                `/OrganizationInvitations/request-join?memberId=${memberId}&businessOwnerId=${businessOwnerId}`
            );
            return {
                success: response.data.success,
                message: response.data.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Request failed",
            };
        }
    },

    async acceptInvitation(invitationId: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            const response = await api.post(`/OrganizationInvitations/accept-invitation/${invitationId}`);
            return {
                success: response.data.success,
                message: response.data.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Accept invitation failed",
            };
        }
    },

    async leaveOrganization(): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            const response = await api.post(`/OrganizationInvitations/leave-organization`);
            return {
                success: response.data.success,
                message: response.data.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Rời tổ chức thất bại",
            };
        }
    },

    async rejectInvitation(invitationId: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }> {
        try {
            const response = await api.post(`/OrganizationInvitations/reject-invitation/${invitationId}`);
            return {
                success: response.data.success,
                message: response.data.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Từ chối lời mời thất bại",
            };
        }
    },

};