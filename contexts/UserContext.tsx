// contexts/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '@/services/userService';
import { UserDetail } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';

interface UserContextType {
  userDetail: UserDetail | null;
  isLoading: boolean;
  error: string | null;
  refreshUserDetail: () => Promise<void>;
  setUserDetail: (user: UserDetail | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user } = useAuth(); // Lấy userId từ auth
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch user detail khi có userId
  const fetchUserDetail = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching user detail for userId:", userId);
    try {
      const result = await userService.getUserDetailById(userId);
      
      if (result.success && result.data) {
        setUserDetail(result.data);
      } else {
        setError(result.error || 'Failed to fetch user details');
        setUserDetail(null);
      }
    } catch (err: any) {
      console.error('Error fetching user detail:', err);
      setError(err.message || 'An error occurred');
      setUserDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Auto fetch khi userId thay đổi
  useEffect(() => {
    if (user?.userId) {
      fetchUserDetail(user.userId);
    } else {
      setUserDetail(null);
    }
  }, [user?.userId]);

  // ✅ Refresh function
  const refreshUserDetail = async () => {
    if (user?.userId) {
      await fetchUserDetail(user.userId);
    }
  };

  const contextValue: UserContextType = {
    userDetail,
    isLoading,
    error,
    refreshUserDetail,
    setUserDetail,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Custom hook để sử dụng UserContext
export const useUserDetail = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserDetail must be used within a UserProvider');
  }
  return context;
};
