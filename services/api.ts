import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, clearAllAuthData } from '@/lib/auth';
import { isTokenExpired, isTokenExpiringSoon } from '@/lib/jwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7129/api/v1";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

// Track refresh token attempts to avoid infinite loops
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    
    failedQueue = [];
};

// Add request interceptor
api.interceptors.request.use(
    async (config) => {
        const token = getAccessToken();
        
        if (token) {
            // Check if token is expired or expiring soon
            if (isTokenExpired(token)) {
                console.log('Token is expired, attempting refresh...');
                
                // Check if we've exceeded max refresh attempts
                if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
                    console.log('Max refresh attempts exceeded, clearing auth data');
                    clearAllAuthData();
                    return config;
                }
                
                try {
                    const refreshToken = getRefreshToken();
                    if (refreshToken) {
                        refreshAttempts++;
                        console.log('=== REQUEST TO BACKEND DEBUG ===');
                        console.log('URL:', `${API_URL}/auth/refresh-token`);
                        console.log('Method: POST');
                        console.log('Headers:', { 'Content-Type': 'application/json' });
                        console.log('Body:', { refreshToken });
                        console.log('Full refresh token:', refreshToken);
                        console.log('Refresh token length:', refreshToken.length);
                        console.log('================================');
                        
                        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                        console.log('Refresh token response:', response.data);
                        
                        if (response.data.success && response.data.data) {
                            const newToken = response.data.data.accessToken;
                            localStorage.setItem('accessToken', newToken);
                            config.headers.Authorization = `Bearer ${newToken}`;
                            refreshAttempts = 0; // Reset attempts on success
                        } else {
                            // Refresh failed, don't redirect here - let response interceptor handle it
                            console.log('Refresh failed in request interceptor:', response.data);
                            clearAllAuthData();
                        }
                    } else {
                        console.log('No refresh token available');
                        clearAllAuthData();
                    }
                } catch (error: any) {
                    console.log('Refresh error in request interceptor:', error.response?.data || error.message);
                    clearAllAuthData();
                    // Don't proceed with the request if refresh failed
                    return Promise.reject(error);
                }
            } else if (isTokenExpiringSoon(token, 5)) {
                // Token is expiring soon, try to refresh in background
                const refreshToken = getRefreshToken();
                if (refreshToken && !isRefreshing) {
                    isRefreshing = true;
                    try {
                        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                        if (response.data.success && response.data.data) {
                            const newToken = response.data.data.accessToken;
                            localStorage.setItem('accessToken', newToken);
                            config.headers.Authorization = `Bearer ${newToken}`;
                        }
                    } catch (error) {
                        console.log('Background token refresh failed');
                    } finally {
                        isRefreshing = false;
                    }
                }
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                console.log('=== RESPONSE INTERCEPTOR REQUEST DEBUG ===');
                console.log('URL:', `${API_URL}/auth/refresh-token?refreshToken=${refreshToken}`);
                console.log('Method: POST');
                console.log('Headers:', { 'Content-Type': 'application/json' });
                console.log('Query param refreshToken:', refreshToken);
                console.log('Full refresh token:', refreshToken);
                console.log('Refresh token length:', refreshToken.length);
                console.log('==========================================');
                
                const response = await axios.post(`${API_URL}/auth/refresh-token?refreshToken=${refreshToken}`);
                
                if (response.data.success && response.data.data) {
                    const newToken = response.data.data.accessToken;
                    localStorage.setItem('accessToken', newToken);
                    
                    // Update the original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    
                    processQueue(null, newToken);
                    return api(originalRequest);
                } else {
                    throw new Error('Token refresh failed');
                }
            } catch (refreshError: any) {
                console.log('Refresh error in response interceptor:', refreshError.response?.data || refreshError.message);
                processQueue(refreshError, null);
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
