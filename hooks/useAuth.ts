import { useUser } from './useUser';
import { hasRole, hasAnyRole, isAdmin, isBusinessOwnerOrAdmin } from '@/lib/rbac';
import { UserRole } from '@/lib/rbac';
import { User } from '@/types/auth';

export const useAuth = () => {
  const userStore = useUser();

  // Build user object from store data
  const user: User | null = userStore.userId ? {
    userId: userStore.userId,
    email: userStore.email,
    fullName: userStore.fullName,
    role: userStore.role,
    avatarUrl: userStore.avatarUrl
  } : null;

  return {
    // Auth state
    user,
    isAuthenticated: userStore.isAuthenticated(),
    isLoading: userStore.isLoading,
    
    // Auth actions
    login: userStore.login,
    register: userStore.register,
    logout: userStore.logout,
    refreshUser: userStore.refreshUser,
    
    // Role checks
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    
    // Convenience methods
    isAdmin: () => isAdmin(user),
    isBusinessOwnerOrAdmin: () => isBusinessOwnerOrAdmin(user),
    isProjectManager: () => hasRole(user, UserRole.PROJECT_MANAGER),
    
    // User data helpers
    getUserDisplayName: () => user?.fullName || user?.email || 'Unknown User',
    getUserInitials: () => {
      if (!user?.fullName) return 'U';
      return user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
    
    // Set user data (for compatibility)
    setUserData: (data: {
      userId: string;
      email: string;
      fullName?: string;
      role: string;
      avatarUrl: string;
    }) => {
      userStore.setUserData(data);
    },
    
    // Direct access to setUser
    setUser: userStore.setUser
  };
};
