// Authentication utility functions

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const localToken = localStorage.getItem('accessToken');
  if (localToken) return localToken;
  
  // Try cookies
  const cookieToken = document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('accessToken='))
    ?.split('=')[1];
    
  return cookieToken || null;
};

export const setAccessToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window === 'undefined') return;
  
  // Store in localStorage
  localStorage.setItem('accessToken', token);
  
  // Store in cookies for middleware
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
  document.cookie = `accessToken=${token}; max-age=${maxAge}; path=/; secure; samesite=strict`;
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

export const clearAllAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('user-storage');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
