import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";

interface UserState {
  userId: string;
  email: string;
  role: string;
  image: string;
  setUserData: (data: {
    userId: string;
    email: string;
    role: string;
    image: string;
  }) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useUser = create<UserState>()(
  persist(
    (set, get) => ({
      userId: "",
      email: "",
      role: "",
      image: "",
      setUserData: (data) => {
        console.log("Setting user data:", data);
        set((state) => ({
          ...state,
          userId: data.userId,
          email: data.email,
          role: data.role,
          image: data.image,
        }));
      },
      clearUser: () => {
        console.log("Clearing user data");
        set((state) => ({
          ...state,
          userId: "",
          email: "",
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
            role: "",
            image: "",
          }));
        } catch (error) {
          console.error("Logout error:", error);
          set((state) => ({
            ...state,
            userId: "",
            email: "",
            role: "",
            image: "",
          }));
        }
      },
      isAuthenticated: () => {
        const state = get();
        const hasUserData = !!(state.userId && state.email && state.role);

        const hasToken =
          typeof window !== "undefined" &&
          !!localStorage.getItem("accessToken");

        const hasCookieToken =
          typeof document !== "undefined" &&
          document.cookie
            .split(";")
            .some((cookie) => cookie.trim().startsWith("accessToken="));

        return hasUserData && (hasToken || hasCookieToken);
      },
    }),
    {
      name: "user-storage",
    }
  )
);
