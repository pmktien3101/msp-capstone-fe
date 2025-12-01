import { api } from './api';
import type { LoginCredentials, RegisterData, LoginResponse, ApiResponse, User, AuthTokens, ResendConfirmationEmailRequest, GoogleLoginRequest } from '@/types/auth';
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
// Tokens are stored in localStorage only
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

    async resetPassword(email: string, token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await api.post('/auth/reset-password', { email, token, newPassword });
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

    async confirmEmail(email: string, token: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            console.log('Confirming email with token:', token.substring(0, 10) + '...');
            
            const response = await api.get(`/auth/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
            
            if (response.data.success) {
                console.log('Email confirmed successfully');
                return {
                    success: true,
                    message: response.data.message || "Email đã được xác nhận thành công!",
                };
            } else {
                console.error('Email confirmation failed:', response.data.message);
                return {
                    success: false,
                    error: response.data.message || "Xác nhận email thất bại",
                };
            }
        } catch (error: any) {
            console.error("Confirm email error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Có lỗi xảy ra khi xác nhận email",
            };
        }
    },

    async resendConfirmation(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            console.log('Resending confirmation email for:', email);
            
            const requestData: ResendConfirmationEmailRequest = { email };
            const response = await api.post('/auth/resend-confirmation-email', requestData);
            
            if (response.data.success) {
                console.log('Confirmation email resent successfully');
                return {
                    success: true,
                    message: response.data.message || "Email xác nhận đã được gửi lại!",
                };
            } else {
                console.error('Resend confirmation failed:', response.data.message);
                return {
                    success: false,
                    error: response.data.message || "Gửi lại email thất bại",
                };
            }
        } catch (error: any) {
            console.error("Resend confirmation error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Có lỗi xảy ra khi gửi lại email",
            };
        }
    },

    async googleLogin(idToken: string, rememberMe: boolean = false): Promise<{ success: boolean; data?: LoginResponse; message?: string; error?: string }> {
        try {
            // TEMPORARY WORKAROUND for backend Email validation issue
            // Backend requires Email field to pass validation even though it's not used
            // Proper fix: Update backend to remove validation or simplify model
            // See: docs/BACKEND_FIX_EMAIL_VALIDATION.md
            const googleLoginRequest = {
                IdToken: idToken,
                Email: "temp@placeholder.com",  // Dummy email to pass backend validation
                GoogleId: "",
                FirstName: "",
                LastName: ""
            };

            console.log('📤 Sending Google login request (with workaround)');
            console.log('🔑 Token length:', idToken.length);
            console.log('📦 Request body:', JSON.stringify({ 
                IdToken: idToken.substring(0, 50) + '...',
                Email: "temp@placeholder.com (dummy)"
            }, null, 2));
            
            const response = await api.post('/auth/google-login', googleLoginRequest);
            console.log('✅ Google login response:', response.data);
            
            if (response.data.success && response.data.data) {
                const loginData = response.data.data as LoginResponse;
                
                // Process login response using helper function
                processLoginResponse(loginData, rememberMe);
                
                return {
                    success: true,
                    data: loginData,
                    message: response.data.message || 'Google login successful'
                };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Google login failed'
                };
            }
        } catch (error: any) {
            console.error('❌ Google login error:', error.name, error.message);
            console.error('📋 Error response:', error.response?.data);
            console.error('🔢 Status code:', error.response?.status);
            
            // Extract error message with proper handling
            let errorMessage = 'Google login failed';
            
            if (error.response?.data) {
                const data = error.response.data;
                
                // Try different error formats
                if (data.message) {
                    errorMessage = data.message;
                } else if (data.errors) {
                    // Handle errors as array
                    if (Array.isArray(data.errors)) {
                        errorMessage = data.errors.join(', ');
                    }
                    // Handle errors as object (validation errors from .NET)
                    else if (typeof data.errors === 'object') {
                        const errorMessages = Object.entries(data.errors)
                            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                            .join('; ');
                        errorMessage = errorMessages || 'Validation error';
                    }
                    // Handle errors as string
                    else if (typeof data.errors === 'string') {
                        errorMessage = data.errors;
                    }
                } else if (data.title) {
                    // .NET problem details format
                    errorMessage = data.title;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            console.error('💬 Final error message:', errorMessage);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    },

};

