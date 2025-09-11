import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string;
  email: string;
  role: string;
  setUserData: (data: { userId: string; email: string; role: string }) => void;
  clearUser: () => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      userId: '',
      email: '',
      role: '',
      setUserData: (data) => {
        console.log("Setting user data:", data);
        set((state) => ({
          ...state,
          userId: data.userId, 
          email: data.email,
          role: data.role,
        }));
      },
      clearUser: () => {
        console.log("Clearing user data");
        set((state) => ({
          ...state,
          id: '',
          email: '',
          role: '',
        }));
      },
    }),
    {
      name: 'user-storage', // name of the item in localStorage
    }
  )
);
