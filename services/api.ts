import axios, { AxiosError } from 'axios';
import { getAccessToken, clearAllAuthData } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7129/api/v1";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable credentials to include httpOnly cookies
});


// Add request interceptor
api.interceptors.request.use(
    async (config) => {
        const token = getAccessToken();
        
        console.log('🔍 REQUEST INTERCEPTOR - URL:', config.url);
        console.log('🔍 REQUEST INTERCEPTOR - Token exists:', !!token);
        console.log('🔍 REQUEST INTERCEPTOR - Token preview:', token?.substring(0, 50) + '...');
        
        // Check JWT expiration
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const exp = payload.exp * 1000; // Convert to milliseconds
                const now = Date.now();
                const timeLeft = exp - now;
                const minutesLeft = Math.floor(timeLeft / 60000);
                
                console.log('🕐 JWT EXPIRATION CHECK:');
                console.log('🕐 Expires at:', new Date(exp).toLocaleString());
                console.log('🕐 Current time:', new Date(now).toLocaleString());
                console.log('🕐 Time left:', minutesLeft, 'minutes');
                console.log('🕐 Is expired:', timeLeft < 0);
                
                if (timeLeft < 0) {
                    console.log('⚠️ TOKEN IS EXPIRED!');
                } else if (timeLeft < 60000) { // Less than 1 minute
                    console.log('⚠️ TOKEN EXPIRES SOON!');
                }
            } catch (error) {
                console.log('❌ Error parsing JWT:', error);
            }
        }
        
        // Check cookies
        console.log('🍪 COOKIES CHECK:');
        console.log('🍪 All cookies:', document.cookie);
        console.log('🍪 ACCESS_TOKEN cookie:', document.cookie.split(';').find(c => c.trim().startsWith('ACCESS_TOKEN=')));
        console.log('🍪 REFRESH_TOKEN cookie:', document.cookie.split(';').find(c => c.trim().startsWith('REFRESH_TOKEN=')));
        
        // Alert để biết API có được gọi qua interceptor không
        if (config.url && !config.url.includes('refresh-token')) {
            alert('🔍 API CALL: ' + config.url + ' - Token: ' + (token ? 'Có' : 'Không'));
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔍 REQUEST INTERCEPTOR - Authorization header set');
        } else {
            console.log('🔍 REQUEST INTERCEPTOR - No token found');
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        console.log('✅ RESPONSE SUCCESS - URL:', response.config.url);
        console.log('✅ RESPONSE SUCCESS - Status:', response.status);
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        console.log('❌ RESPONSE ERROR - URL:', originalRequest?.url);
        console.log('❌ RESPONSE ERROR - Status:', error.response?.status);
        console.log('❌ RESPONSE ERROR - Data:', error.response?.data);
        
        // Handle 401 errors - try to refresh token first
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                console.log('🚨 401 ERROR DETECTED - Access token expired, attempting to refresh...');
                console.log('Error details:', error.response?.data);
                console.log('Request URL:', originalRequest.url);
                
                // Alert user that 401 error was detected
                alert('🚨 401 ERROR: Access token đã hết hạn! Đang thử refresh token...');
                
                // Call refresh token endpoint (send refreshToken in body)
                console.log('🔄 CALLING REFRESH TOKEN ENDPOINT...');
                console.log('🔄 URL:', `${API_URL}/auth/refresh-token`);
                console.log('🔄 With credentials:', true);
                
                // Get refreshToken from localStorage (fallback if httpOnly cookies not available)
                const refreshToken = localStorage.getItem('refreshToken');
                console.log('🔄 RefreshToken from localStorage:', refreshToken ? 'Found' : 'Not found');
                console.log('🔄 Current AccessToken before refresh:', localStorage.getItem('accessToken')?.substring(0, 50) + '...');
                
                // Alert user that refresh token is being called
                alert('🔄 REFRESH TOKEN: Đang gọi refresh token...');
                
                const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, { 
                    refreshToken: refreshToken 
                }, {
                    withCredentials: true // Ensure httpOnly cookies are sent
                });
                
                console.log('🔄 REFRESH TOKEN RESPONSE:', refreshResponse.data);
                alert('✅ REFRESH TOKEN: Thành công! Response: ' + JSON.stringify(refreshResponse.data));
                
                if (refreshResponse.data.success && refreshResponse.data.data) {
                    const newAccessToken = refreshResponse.data.data.accessToken;
                    const newRefreshToken = refreshResponse.data.data.refreshToken;
                    
                    console.log('🔄 NEW ACCESS TOKEN:', newAccessToken?.substring(0, 50) + '...');
                    console.log('🔄 NEW REFRESH TOKEN:', newRefreshToken?.substring(0, 50) + '...');
                    
                    // Update accessToken in localStorage
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    
                    // Note: ACCESS_TOKEN cookie removed - using Authorization header only
                    
                    // Update the original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    
                    console.log('✅ Token refreshed successfully, retrying original request');
                    console.log('✅ Updated Authorization header:', `Bearer ${newAccessToken?.substring(0, 50)}...`);
                    
                    // Process queued requests
                    processQueue(null, newAccessToken);
                    
                    // Retry the original request
                    return api(originalRequest);
                } else {
                    throw new Error('Refresh token failed - invalid response');
                }
            } catch (refreshError) {
                console.log('Refresh token failed:', refreshError);
                console.log('Redirecting to sign-in');
                
                // Process queued requests with error
                processQueue(refreshError, null);
                
                // Alert user that refresh token failed
                const errorMessage = (refreshError as any)?.response?.data?.message || (refreshError as any)?.message || 'Unknown error';
                alert('❌ REFRESH TOKEN: Thất bại! Error: ' + errorMessage);
                alert('🔄 REDIRECT: Chuyển hướng về trang đăng nhập...');
                
                // Clear auth data and redirect to login
                clearAllAuthData();
                window.location.href = '/sign-in';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // Handle other errors
        if (error.response?.status === 403) {
            console.log('Access forbidden - insufficient permissions');
        }
        
        return Promise.reject(error);
    }
);
