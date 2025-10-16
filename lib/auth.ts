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
  
  // Get refreshToken from cookies only (not localStorage)
  const cookieToken = document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('refreshToken='))
    ?.split('=')[1];
  
  // Fix base64 padding if missing (add == if needed)
  let fixedToken = cookieToken;
  if (fixedToken) {
    // Decode URL-encoded characters first
    fixedToken = decodeURIComponent(fixedToken);
    
    // Add padding if missing
    while (fixedToken.length % 4) {
      fixedToken += '=';
    }
  }
    
  return fixedToken || null;
};

export const setTokens = (tokens: AuthTokens, rememberMe: boolean = false): void => {
  if (typeof window === 'undefined') return;
  
  // Store accessToken in localStorage
  localStorage.setItem('accessToken', tokens.accessToken);
  
  // Store accessToken in cookies for middleware
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
  document.cookie = `accessToken=${tokens.accessToken}; max-age=${maxAge}; path=/; secure; samesite=strict`;
  
  // Store refreshToken in cookies with its JWT expiration
  try {
    const decodedRefreshToken = decodeJwtToken(tokens.refreshToken);
    if (decodedRefreshToken && decodedRefreshToken.exp) {
      const refreshExpires = new Date(decodedRefreshToken.exp * 1000).toUTCString();
      document.cookie = `refreshToken=${tokens.refreshToken}; expires=${refreshExpires}; path=/; secure; samesite=strict`;
    } else {
      // Fallback to longer expiration for refresh token (7 days)
      const refreshMaxAge = 7 * 24 * 60 * 60; // 7 days
      document.cookie = `refreshToken=${tokens.refreshToken}; max-age=${refreshMaxAge}; path=/; secure; samesite=strict`;
    }
  } catch (error) {
    // If refreshToken is not a JWT, use longer expiration (7 days)
    const refreshMaxAge = 7 * 24 * 60 * 60; // 7 days
    document.cookie = `refreshToken=${tokens.refreshToken}; max-age=${refreshMaxAge}; path=/; secure; samesite=strict`;
  }
  
  // Note: refreshToken is also stored in httpOnly cookies by backend
  // But we also store it in regular cookies for frontend access
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
  
  // Remove from localStorage (only accessToken, refreshToken is now in cookies only)
  localStorage.removeItem('accessToken');
  
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
  
  // Only check if token exists and has valid format, not if it's expired
  // Token expiration will be handled by API interceptor for refresh
  if (!isValidJwtFormat(token)) {
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
  
  // Clear localStorage (only accessToken, refreshToken is now in cookies only)
  localStorage.removeItem('accessToken');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('user-storage');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
