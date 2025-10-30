import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { isAuthenticated as checkAuth, getCurrentUser } from "@/lib/auth";
import { normalizeRole } from "@/lib/rbac";

interface UserState {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  image: string;
  setUserData: (data: {
    userId: string;
    email: string;
    fullName?: string;
    role: string;
    image: string;
  }) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  refreshUser: () => Promise<void>;
}

export const useUser = create<UserState>()(
  persist(
    (set, get) => ({
      userId: "",
      email: "",
      fullName: "",
      role: "",
      image: "",
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
          image: data.image,
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
          image: "",
        }));
      },
      logout: async () => {
        try {
          console.log("Logging out user");
          await authService.logout();
          set((state) => ({
            ...state,
            userId: "",
            email: "",
            fullName: "",
            role: "",
            image: "",
          }));
        } catch (error) {
          console.error("Logout error:", error);
          set((state) => ({
            ...state,
            userId: "",
            email: "",
            fullName: "",
            role: "",
            image: "",
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
              image: result.user!.image || "",
            }));
          } else {
            // If we can't get user data, clear the state
            get().clearUser();
          }
        } catch (error) {
          console.error("Error refreshing user:", error);
          get().clearUser();
        }
      },
    }),
    {
      name: "user-storage",
    }
  )
);
