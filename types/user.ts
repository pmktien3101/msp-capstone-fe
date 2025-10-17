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

export interface ReAssignRoleRequest {
    businessOwnerId: string;
    userId: string;
    newRole: string;
}

export interface ReAssignRoleResponse {
    userId: string;
    newRole: string;
}

export interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  organization?: string;
  managedBy?: string;
  managerName?: string;
  createdAt: string;
  roleName: string;
}

export interface BusinessResponse {
    id: string;
    businessName: string;
    businessOwnerName: string;
    memberCount: number;
    projectCount: number;
    createdAt: string;
    status?: string;
}
