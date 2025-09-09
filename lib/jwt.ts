import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;

  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
};

export const getTokenData = (token: string): { role: string; userId: string; email: string } | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    role: decoded.role,
    userId: decoded.id,
    email: decoded.email
  };
};
