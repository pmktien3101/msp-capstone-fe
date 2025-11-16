import { AuthTokens, User } from '@/types/auth';
import { decodeJwtToken, isTokenExpired, isTokenValid, extractUserFromToken, isValidJwtFormat } from './jwt';
import { normalizeRole } from './rbac';

// Authentication utility functions

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Get accessToken from localStorage only
  const token = localStorage.getItem('accessToken');
  return (token && isValidJwtFormat(token)) ? token : null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Get refreshToken from localStorage only
  const token = localStorage.getItem('refreshToken');
  return token || null;
};

export const setTokens = (tokens: AuthTokens, rememberMe: boolean = false): void => {
  if (typeof window === 'undefined') return;
  
  // Store both tokens in localStorage only
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

export const setAccessToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage only
  localStorage.setItem('accessToken', token);
};

export const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove both tokens from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem('accessToken');
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = getAccessToken();
  
  // If no token, return false (don't clear user-storage here to avoid re-render loops)
  if (!token) {
    return false;
  }
  
  // Only check if token exists and has valid format, not if it's expired
  // Token expiration will be handled by API interceptor for refresh
  if (!isValidJwtFormat(token)) {
    return false;
  }
  
  // Token exists and is valid - user is authenticated
  // User data will be populated from token or Zustand store
  return true;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const token = getAccessToken();
  if (!token) return null;
  
  // Only check if token has valid format, not if it's expired
  // Token expiration will be handled by API interceptor for refresh
  if (!isValidJwtFormat(token)) return null;
  
  // Try to get user from token first
  const userFromToken = extractUserFromToken(token);
  if (userFromToken) {
    return {
      userId: userFromToken.userId,
      email: userFromToken.email,
      fullName: userFromToken.fullName,
      role: normalizeRole(userFromToken.role),
      avatarUrl: userFromToken.avatarUrl || ''
    };
  }
  
  // Fallback to stored user data
  const userStorage = localStorage.getItem('user-storage');
  try {
    const userData = userStorage ? JSON.parse(userStorage) : null;
    if (userData?.state?.userId && userData?.state?.email && userData?.state?.role) {
      return {
        userId: userData.state.userId,
        email: userData.state.email,
        fullName: userData.state.fullName || userData.state.name || '',
        role: normalizeRole(userData.state.role),
        avatarUrl: userData.state.avatarUrl || ''
      };
    }
  } catch (error) {
    console.error('Error parsing user storage:', error);
  }
  
  return null;
};

export const clearAllAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear all auth-related data from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('user-storage');
  
  // Clear sessionStorage
  sessionStorage.clear();
};
