import { User } from '@/types/auth';

// Define user roles
export enum UserRole {
  ADMIN = 'Admin',
  BUSINESS_OWNER = 'BusinessOwner',
  PROJECT_MANAGER = 'ProjectManager',
  MEMBER = 'Member'
}


/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user || !user.role) return false;
  
  const normalizedUserRole = normalizeRole(user.role);
  const normalizedTargetRole = normalizeRole(role);
  
  return normalizedUserRole === normalizedTargetRole;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user || !user.role) return false;
  
  const normalizedUserRole = normalizeRole(user.role);
  const normalizedTargetRoles = roles.map(role => normalizeRole(role));
  
  return normalizedTargetRoles.includes(normalizedUserRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.ADMIN);
}

/**
 * Check if user is business owner or admin
 */
export function isBusinessOwnerOrAdmin(user: User | null): boolean {
  return hasAnyRole(user, [UserRole.BUSINESS_OWNER, UserRole.ADMIN]);
}


/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

/**
 * Normalize role string to UserRole enum (supports legacy roles)
 */
export function normalizeRole(role: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'Admin': UserRole.ADMIN,
    'BusinessOwner': UserRole.BUSINESS_OWNER,
    'ProjectManager': UserRole.PROJECT_MANAGER,
    'Member': UserRole.MEMBER
  };
  
  return roleMap[role] || UserRole.MEMBER;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole | string): string {
  const normalizedRole = typeof role === 'string' ? normalizeRole(role) : role;
  
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.BUSINESS_OWNER]: 'Business Owner',
    [UserRole.PROJECT_MANAGER]: 'Project Manager',
    [UserRole.MEMBER]: 'Team Member'
  };
  
  return roleNames[normalizedRole] || role;
}
