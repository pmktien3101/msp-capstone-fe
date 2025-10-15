"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/auth';
import { authService } from '@/services/authService';
import { getCurrentUser, isAuthenticated as checkAuth, clearAllAuthData } from '@/lib/auth';
import { extractUserFromToken } from '@/lib/jwt';
import { normalizeRole } from '@/lib/rbac';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = checkAuth();
        if (isAuth) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Try to get user from API
            const result = await authService.getCurrentUser();
            if (result.success && result.user) {
              setUser(result.user);
              setIsAuthenticated(true);
            } else {
              // Clear invalid auth data
              clearAllAuthData();
              setIsAuthenticated(false);
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAllAuthData();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.data) {
        // Extract user info from token
        const userInfo = extractUserFromToken(result.data.accessToken);
        if (userInfo) {
          // Normalize role
          const normalizedRole = normalizeRole(userInfo.role);
          
          const newUser: User = {
            userId: userInfo.userId,
            email: userInfo.email,
            fullName: userInfo.fullName,
            role: normalizedRole,
            image: `https://getstream.io/random_svg/?id=${userInfo.userId}&name=${userInfo.fullName}`
          };
          
          setUser(newUser);
          setIsAuthenticated(true);
          
          return {
            success: true,
            message: result.message || 'Login successful'
          };
        } else {
          return {
            success: false,
            error: 'Invalid token format received from server'
          };
        }
      } else {
        return {
          success: false,
          error: result.error || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        // If we can't get user data, clear auth state
        setUser(null);
        setIsAuthenticated(false);
        clearAllAuthData();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setIsAuthenticated(false);
      clearAllAuthData();
    }
  };

  const contextValue: AuthContextType = {
    user,
    tokens: null, // We don't expose tokens directly for security
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    setUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};