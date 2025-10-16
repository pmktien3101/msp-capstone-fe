import { JwtPayload } from '@/types/auth';

/**
 * Decode JWT token without verification (client-side only)
 * Note: This is for reading token data, not for security validation
 */
export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtToken(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Check if JWT token is used before issued at (iat)
 */
export function isTokenUsedBeforeIssued(token: string): boolean {
  const payload = decodeJwtToken(token);
  if (!payload || !payload.iat) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  // Add 5 minutes tolerance for clock skew
  const tolerance = 5 * 60; // 5 minutes in seconds
  return currentTime < (payload.iat - tolerance);
}

/**
 * Check if JWT token is valid (not expired and not used before issued)
 */
export function isTokenValid(token: string): boolean {
  if (!token || !isValidJwtFormat(token)) return false;
  
  // Check if token is used before issued
  if (isTokenUsedBeforeIssued(token)) {
    console.log('Token used before issued at (iat)');
    return false;
  }
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Token is expired');
    return false;
  }
  
  return true;
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  const payload = decodeJwtToken(token);
  if (!payload) return null;
  
  return payload.exp * 1000; // Convert to milliseconds
}

/**
 * Check if token will expire within the next 5 minutes
 */
export function isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
  const payload = decodeJwtToken(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const thresholdTime = currentTime + (minutesThreshold * 60);
  
  return payload.exp < thresholdTime;
}

/**
 * Extract user information from JWT token
 */
export function extractUserFromToken(token: string): { userId: string; email: string; fullName: string; role: string } | null {
  const payload = decodeJwtToken(token);
  if (!payload) return null;
  
  return {
    userId: payload.userId || payload.sub,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role
  };
}

/**
 * Validate JWT token format and basic structure
 */
export function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode to check if it's valid base64
    atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return true;
  } catch {
    return false;
  }
}