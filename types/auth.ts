export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    role: string;
    organization?: string;
    businessLicense?: string;
}

export interface User {
    userId: string;
    email: string;
    fullName: string;
    role: string;
    image?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errors: string[] | null;
}

export interface JwtPayload {
    sub: string;
    jti: string;
    email: string;
    fullName: string;
    userId: string;
    role: string;
    exp: number;
    iss: string;
    aud: string;
    [key: string]: any;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface BusinessOwner {
    id: string;
    userName: string;
    email: string;
    fullName: string;
    organization: string;
    businessLicense: string;
    isApproved: boolean;
    isActive: boolean;
    createdAt: string;
    managedById?: string;
    managedBy?: any;
    managedUsers: any[];
    notifications: any[];
    avatarUrl?: string;
    phoneNumber?: string;
    packageName?: string;
    packageExpireDate?: string;
}

export interface BusinessOwnersResponse {
    success: boolean;
    message: string;
    data: BusinessOwner[];
    errors: string[] | null;
}

export interface ResendConfirmationEmailRequest {
    email: string;
}