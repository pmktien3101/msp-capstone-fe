export interface OrganizationInvitationResponse {
    id: string;
    businessOwnerId: string;
    businessOwnerName?: string;
    businessOwnerEmail?: string;
    businessOwnerAvatar?: string;
    organizationName?: string;

    memberId: string;
    memberName?: string;
    memberEmail?: string;
    memberAvatar?: string;

    type: number; // 1: Invite, 2: Request
    typeDisplay: "Invite" | "Request";
    status: number; // 1: Pending, 2: Accepted, 3: Rejected, 4: Canceled
    statusDisplay: "Pending" | "Accepted" | "Rejected" | "Canceled";
    createdAt: string;
    respondedAt?: string;
}