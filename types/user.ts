export interface GetUserResponse {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl?: string;
    googleId?: string;
    organization?: string;
    managedBy?: string;
    managerName?: string;
    businessLicense?: string;
    isApproved: boolean;
    isActive: boolean;
    createdAt: string;
    roleName: string;
    projects?: number | 0;
}