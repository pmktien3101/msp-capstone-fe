import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useUser } from './useUser';
import { hasPermission, hasRole, hasAnyRole, canManageProjects, canManageUsers, canManageMeetings, canManageTasks, canViewReports, isAdmin, isBusinessOwnerOrAdmin } from '@/lib/rbac';
import { UserRole, Permission } from '@/lib/rbac';
import { User } from '@/types/auth';

export const useAuth = () => {
  const authContext = useAuthContext();
  const userStore = useUser();

  // Combine context and store data
  const user = authContext.user || (userStore.userId ? {
    userId: userStore.userId,
    email: userStore.email,
    fullName: userStore.fullName,
    role: userStore.role,
    image: userStore.image
  } : null);

  return {
    // Auth state
    user,
    isAuthenticated: authContext.isAuthenticated || userStore.isAuthenticated(),
    isLoading: authContext.isLoading,
    
    // Auth actions
    login: authContext.login,
    register: authContext.register,
    logout: async () => {
      await authContext.logout();
      await userStore.logout();
    },
    refreshUser: async () => {
      await authContext.refreshUser();
      await userStore.refreshUser();
    },
    
    // Permission checks
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions: Permission[]) => hasPermission(user, permissions[0]), // Simplified for now
    hasAllPermissions: (permissions: Permission[]) => permissions.every(p => hasPermission(user, p)),
    
    // Role checks
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    
    // Convenience methods
    isAdmin: () => isAdmin(user),
    isBusinessOwnerOrAdmin: () => isBusinessOwnerOrAdmin(user),
    canManageProjects: () => canManageProjects(user),
    canManageUsers: () => canManageUsers(user),
    canManageMeetings: () => canManageMeetings(user),
    canManageTasks: () => canManageTasks(user),
    canViewReports: () => canViewReports(user),
    
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
      image: string;
    }) => {
      userStore.setUserData(data);
    }
  };
};
