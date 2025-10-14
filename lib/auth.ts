import { AuthTokens, User } from '@/types/auth';
import { decodeJwtToken, isTokenExpired, isTokenValid, extractUserFromToken, isValidJwtFormat } from './jwt';
import { normalizeRole } from './rbac';

// Authentication utility functions

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const localToken = localStorage.getItem('accessToken');
  if (localToken && isValidJwtFormat(localToken)) return localToken;
  
  // Try cookies
  const cookieToken = document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('accessToken='))
    ?.split('=')[1];
    
  return (cookieToken && isValidJwtFormat(cookieToken)) ? cookieToken : null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const localToken = localStorage.getItem('refreshToken');
  if (localToken) return localToken;
  
  // Try cookies
  const cookieToken = document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('refreshToken='))
    ?.split('=')[1];
    
  return cookieToken || null;
};

export const setTokens = (tokens: AuthTokens, rememberMe: boolean = false): void => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  
  // Store in cookies for middleware
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
  document.cookie = `accessToken=${tokens.accessToken}; max-age=${maxAge}; path=/; secure; samesite=strict`;
  document.cookie = `refreshToken=${tokens.refreshToken}; max-age=${maxAge}; path=/; secure; samesite=strict`;
};

export const setAccessToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage
  localStorage.setItem('accessToken', token);
  
  // Store in cookies for middleware
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
  document.cookie = `accessToken=${token}; max-age=${maxAge}; path=/; secure; samesite=strict`;
};

export const removeTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Remove from cookies
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem('accessToken');
  
  // Remove from cookies
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = getAccessToken();
  if (!token) return false;
  
  // Use comprehensive token validation (includes iat check)
  if (!isTokenValid(token)) {
    return false;
  }
  
  // Check if we have user data
  const userStorage = localStorage.getItem('user-storage');
  try {
    const userData = userStorage ? JSON.parse(userStorage) : null;
    const hasUserData = userData?.state?.userId && userData?.state?.email && userData?.state?.role;
    
    return !!(token && hasUserData);
  } catch (error) {
    console.error('Error parsing user storage:', error);
    return false;
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) return null;
  
  // Try to get user from token first
  const userFromToken = extractUserFromToken(token);
  if (userFromToken) {
    return {
      userId: userFromToken.userId,
      email: userFromToken.email,
      fullName: userFromToken.fullName,
      role: normalizeRole(userFromToken.role),
      image: ''
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
        image: userData.state.image || ''
      };
    }
  } catch (error) {
    console.error('Error parsing user storage:', error);
  }
  
  return null;
};

export const clearAllAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('user-storage');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
