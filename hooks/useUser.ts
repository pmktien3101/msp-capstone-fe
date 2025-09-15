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
    (set) => ({
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
          }));
        } catch (error) {
          console.error("Logout error:", error);
          // Still clear user data even if logout service fails
          set((state) => ({
            ...state,
            userId: "",
            email: "",
            role: "",
          }));
        }
      },
      isAuthenticated: () => {
        // Check if user data exists in store
        const state = useUser.getState();
        const hasUserData = state.userId && state.email && state.role;

        // Check if access token exists in localStorage
        const hasToken =
          typeof window !== "undefined" && localStorage.getItem("accessToken");

        // Check if access token exists in cookies
        const hasCookieToken =
          typeof document !== "undefined" &&
          document.cookie
            .split(";")
            .some((cookie) => cookie.trim().startsWith("accessToken="));

        return hasUserData && (hasToken || hasCookieToken);
      },
    }),
    {
      name: "user-storage", // name of the item in localStorage
    }
  )
);
