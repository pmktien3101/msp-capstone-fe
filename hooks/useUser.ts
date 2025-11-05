import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { isAuthenticated as checkAuth, getCurrentUser, clearAllAuthData } from "@/lib/auth";
import { normalizeRole } from "@/lib/rbac";
import { extractUserFromToken } from "@/lib/jwt";
import { LoginCredentials, RegisterData, User } from "@/types/auth";

interface UserState {
  // User data
  userId: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string;
  
  // Auth state
  isLoading: boolean;
  
  // User actions
  setUserData: (data: {
    userId: string;
    email: string;
    fullName?: string;
    role: string;
    avatarUrl: string;
  }) => void;
  clearUser: () => void;
  
  // Auth actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Helper methods
  isAuthenticated: () => boolean;
  setUser: (user: User) => void;
}

export const useUser = create<UserState>()(
  persist(
    (set, get) => ({
      userId: "",
      email: "",
      fullName: "",
      role: "",
      avatarUrl: "",
      isLoading: false,
      
      setUserData: (data) => {
        console.log("Setting user data:", data);
        // Normalize role
        const normalizedRole = normalizeRole(data.role);
        
        set((state) => ({
          ...state,
          userId: data.userId,
          email: data.email,
          fullName: data.fullName || "",
          role: normalizedRole,
          avatarUrl: data.avatarUrl,
        }));
      },
      
      setUser: (user: User) => {
        console.log("Setting user:", user);
        const normalizedRole = normalizeRole(user.role);
        
        set((state) => ({
          ...state,
          userId: user.userId,
          email: user.email,
          fullName: user.fullName,
          role: normalizedRole,
          avatarUrl: user.avatarUrl || "",
        }));
      },
      
      clearUser: () => {
        console.log("Clearing user data");
        set((state) => ({
          ...state,
          userId: "",
          email: "",
          fullName: "",
          role: "",
          avatarUrl: "",
          isLoading: false,
        }));
      },
      
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
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
                avatarUrl: userInfo.avatarUrl || `https://getstream.io/random_svg/?id=${userInfo.userId}&name=${userInfo.fullName}`
              };
              
              set((state) => ({
                ...state,
                userId: newUser.userId,
                email: newUser.email,
                fullName: newUser.fullName,
                role: newUser.role,
                avatarUrl: newUser.avatarUrl,
              }));
              
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
          set({ isLoading: false });
        }
      },
      
      register: async (data: RegisterData) => {
        set({ isLoading: true });
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
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          console.log("Logging out user");
          await authService.logout();
          set((state) => ({
            ...state,
            userId: "",
            email: "",
            fullName: "",
            role: "",
            avatarUrl: "",
            isLoading: false,
          }));
        } catch (error) {
          console.error("Logout error:", error);
          // Still clear local state even if API call fails
          set((state) => ({
            ...state,
            userId: "",
            email: "",
            fullName: "",
            role: "",
            avatarUrl: "",
            isLoading: false,
          }));
        }
      },
      
      isAuthenticated: () => {
        return checkAuth();
      },
      
      refreshUser: async () => {
        try {
          const result = await authService.getCurrentUser();
          if (result.success && result.user) {
            // Normalize role
            const normalizedRole = normalizeRole(result.user.role);
            
            set((state) => ({
              ...state,
              userId: result.user!.userId,
              email: result.user!.email,
              fullName: result.user!.fullName,
              role: normalizedRole,
                  avatarUrl: result.user!.avatarUrl || "",
            }));
          } else {
            // If we can't get user data, clear the state
            get().clearUser();
            clearAllAuthData();
          }
        } catch (error) {
          console.error("Error refreshing user:", error);
          get().clearUser();
          clearAllAuthData();
        }
      },
    }),
    {
      name: "user-storage",
    }
  )
);
