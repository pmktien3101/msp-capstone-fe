import { api } from './api';
import type { LoginCredentials, RegisterData, LoginResponse, ApiResponse, User, AuthTokens } from '@/types/auth';
import { clearAllAuthData, setTokens, getCurrentUser } from '@/lib/auth';
import { extractUserFromToken } from '@/lib/jwt';
import { normalizeRole } from '@/lib/rbac';


// Helper function to process login response and extract user data
const processLoginResponse = (loginData: LoginResponse, rememberMe: boolean = false) => {
    // Extract user info from token
    const userInfo = extractUserFromToken(loginData.accessToken);
    if (!userInfo) {
        throw new Error('Invalid token format');
    }
    
    // Normalize role
    const normalizedRole = normalizeRole(userInfo.role);
    
    // Store tokens
    const tokens: AuthTokens = {
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken
    };
    
    setTokens(tokens, rememberMe);
    
    return {
        user: {
            userId: userInfo.userId,
            email: userInfo.email,
            fullName: userInfo.fullName,
            role: normalizedRole,
            image: `https://getstream.io/random_svg/?id=${userInfo.userId}&name=${userInfo.fullName}`
        },
        tokens
    };
};

// Helper function to process refresh token response
const processRefreshResponse = (loginData: LoginResponse) => {
    const tokens: AuthTokens = {
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken
    };
    
    setTokens(tokens, false);
    
    return tokens;
};

export const authService = {
    async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<{ success: boolean; data?: LoginResponse; message?: string; error?: string }> {
        try {
            const response = await api.post('/auth/login', credentials);
            console.log('Login response:', response.data);
            
            if (response.data.success && response.data.data) {
                const loginData = response.data.data as LoginResponse;
                
                // Process login response using helper function
                processLoginResponse(loginData, rememberMe);
                
                return {
                    success: true,
                    data: loginData,
                    message: response.data.message || 'Login successful'
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Login failed'
                };
            }
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    },

    async register(data: RegisterData): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            // Validate role-specific fields
            if (data.role === 'BusinessOwner') {
                if (!data.organization || !data.businessLicense) {
                    return {
                        success: false,
                        error: 'Organization and business license are required for BusinessOwner role'
                    };
                }
            } else if (data.role === 'Member') {
                // Remove organization and businessLicense for Member role
                const { organization, businessLicense, ...memberData } = data;
                const response = await api.post('/auth/register', memberData);
                return {
                    success: response.data.success,
                    message: response.data.message,
                    error: response.data.success ? undefined : response.data.message
                };
            } else {
                return {
                    success: false,
                    error: 'Invalid role. Must be either "Member" or "BusinessOwner"'
                };
            }

            const response = await api.post('/auth/register', data);
            return {
                success: response.data.success,
                message: response.data.message,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Registration failed'
            };
        }
    },


    async logout(): Promise<{ success: boolean; message: string }> {
        try {
            // Try to call logout endpoint if token is available
            try {
                await api.post('/auth/logout');
            } catch (error) {
                console.log('Logout endpoint failed, clearing local data anyway');
            }
            
            // Clear all auth data
            clearAllAuthData();
            
            console.log('All user data cleared from storage');
            return { success: true, message: 'Logged out successfully' };
        } catch (error) {
            console.error('Error during logout:', error);
            // Still clear local data even if API call fails
            clearAllAuthData();
            return { success: true, message: 'Logged out successfully' };
        }
    },

    async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
        try {
            // First try to get user from stored token
            const userFromToken = getCurrentUser();
            if (userFromToken) {
                return { success: true, user: userFromToken };
            }

            // If no user from token, try API call
            const response = await api.get('/auth/me');
            
            if (response.data.success && response.data.data) {
                return {
                    success: true,
                    user: response.data.data as User
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Failed to get user data'
                };
            }
        } catch (error: any) {
            console.error('Get current user error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to get user data'
            };
        }
    },

    async verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.post('/auth/verify-email', { token });
            return {
                success: response.data.success,
                message: response.data.message,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Email verification error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Email verification failed'
            };
        }
    },

    async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return {
                success: response.data.success,
                message: response.data.message,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Forgot password error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Password reset request failed'
            };
        }
    },

    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            return {
                success: response.data.success,
                message: response.data.message,
                error: response.data.success ? undefined : response.data.message
            };
        } catch (error: any) {
            console.error('Reset password error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Password reset failed'
            };
        }
    },

};

