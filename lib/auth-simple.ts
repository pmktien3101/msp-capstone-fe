// Simplified auth using only cookies

export const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  return document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('accessToken='))
    ?.split('=')[1] || null;
};

export const setAccessToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof document === 'undefined') return;
  
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
  document.cookie = `accessToken=${token}; max-age=${maxAge}; path=/; secure; samesite=strict`;
};

export const removeAccessToken = (): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const isAuthenticated = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const token = getAccessToken();
  const userStorage = document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('user-storage='))
    ?.split('=')[1];
  
  try {
    const userData = userStorage ? JSON.parse(decodeURIComponent(userStorage)) : null;
    const hasUserData = userData?.state?.userId && userData?.state?.email && userData?.state?.role;
    
    return !!(token && hasUserData);
  } catch (error) {
    console.error('Error parsing user storage:', error);
    return false;
  }
};

export const clearAllAuthData = (): void => {
  if (typeof document === 'undefined') return;
  
  // Clear cookies only
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};
