import { OrganizationInvitationResponse, SendInvitationResult } from "@/types/organizeInvitation";
import { api } from "./api";

export const organizeInvitationService = {
    /**
     * BusinessOwner: Get list of invitations sent to members
     */
    async getSentInvitationsByBusinessOwnerId(
    ): Promise<{
        success: boolean;
        data?: OrganizationInvitationResponse[];
        message?: string;
        error?: string;
    }> {
        try {
            const res = await api.get(`/OrganizationInvitations/sent-invitations`);
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

    async sendInvitations(memberEmails: string[]): Promise<{
        success: boolean;
        data?: SendInvitationResult[];
        message?: string;
        error?: string;
    }> {
        try {
            const res = await api.post("/OrganizationInvitations/send-invitations", {
                memberEmails,
            });
            return {
                success: res.data.success,
                data: res.data.data,
                message: res.data.message,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Gửi lời mời thất bại.",
            };
        }
    },

    async getPendingRequestsByBusinessOwner(): Promise<{
        success: boolean;
        data?: OrganizationInvitationResponse[];
        error?: string;
    }> {
        try {
            const res = await api.get(`/OrganizationInvitations/pending-requests`);
            return {
                success: res.data.success,
                data: res.data.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Không thể lấy danh sách yêu cầu tham gia",
            };
        }
    },

    async businessOwnerRejectRequest(invitationId: string): Promise<{ success: boolean; error?: string; message?: string; }> {
        try {
            const res = await api.post(`/OrganizationInvitations/reject-request/${invitationId}`);
            return { success: res.data.success, message: res.data.message };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || "Không thể từ chối yêu cầu" };
        }
    },

    async businessOwnerAcceptRequest(invitationId: string): Promise<{ success: boolean; error?: string; message?: string; }> {
        try {
            const res = await api.post(`/OrganizationInvitations/accept-request/${invitationId}`);
            return { success: res.data.success, message: res.data.message };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || "Không thể duyệt yêu cầu" };
        }
    }

};