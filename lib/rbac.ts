import { User } from '@/types/auth';

// Define user roles
export enum UserRole {
  ADMIN = 'Admin',
  BUSINESS_OWNER = 'BusinessOwner',
  PROJECT_MANAGER = 'ProjectManager',
  MEMBER = 'Member'
}

// Define permissions
export enum Permission {
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Project management
  MANAGE_PROJECTS = 'manage_projects',
  VIEW_PROJECTS = 'view_projects',
  DELETE_PROJECTS = 'delete_projects',
  
  // Meeting management
  MANAGE_MEETINGS = 'manage_meetings',
  VIEW_MEETINGS = 'view_meetings',
  DELETE_MEETINGS = 'delete_meetings',
  
  // Task management
  MANAGE_TASKS = 'manage_tasks',
  VIEW_TASKS = 'view_tasks',
  DELETE_TASKS = 'delete_tasks',
  
  // Reports and analytics
  VIEW_REPORTS = 'view_reports',
  MANAGE_REPORTS = 'manage_reports',
  
  // System settings
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_SYSTEM_SETTINGS = 'view_system_settings'
}

// Role-based permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    // Permission.MANAGE_PROJECTS,
    // Permission.VIEW_PROJECTS,
    // Permission.DELETE_PROJECTS,
    Permission.MANAGE_MEETINGS,
    Permission.VIEW_MEETINGS,
    Permission.DELETE_MEETINGS,
    Permission.MANAGE_TASKS,
    Permission.VIEW_TASKS,
    Permission.DELETE_TASKS,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_REPORTS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_SETTINGS
  ],
  [UserRole.BUSINESS_OWNER]: [
    Permission.VIEW_USERS,
    Permission.MANAGE_PROJECTS,
    Permission.VIEW_PROJECTS,
    Permission.DELETE_PROJECTS,
    Permission.MANAGE_MEETINGS,
    Permission.VIEW_MEETINGS,
    Permission.DELETE_MEETINGS,
    Permission.MANAGE_TASKS,
    Permission.VIEW_TASKS,
    Permission.DELETE_TASKS,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_REPORTS
  ],
  [UserRole.PROJECT_MANAGER]: [
    Permission.VIEW_USERS,
    Permission.MANAGE_PROJECTS,
    Permission.VIEW_PROJECTS,
    Permission.MANAGE_MEETINGS,
    Permission.VIEW_MEETINGS,
    Permission.MANAGE_TASKS,
    Permission.VIEW_TASKS,
    Permission.VIEW_REPORTS
  ],
  [UserRole.MEMBER]: [
    Permission.VIEW_PROJECTS,
    Permission.VIEW_MEETINGS,
    Permission.VIEW_TASKS,
    Permission.VIEW_REPORTS
  ]
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.role) return false;
  
  const userRole = user.role as UserRole;
  const permissions = rolePermissions[userRole] || [];
  
  return permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user || !user.role) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user || !user.role) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
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
 * Check if user can manage projects
 */
export function canManageProjects(user: User | null): boolean {
  return hasPermission(user, Permission.MANAGE_PROJECTS);
}

/**
 * Check if user can manage users
 */
export function canManageUsers(user: User | null): boolean {
  return hasPermission(user, Permission.MANAGE_USERS);
}

/**
 * Check if user can manage meetings
 */
export function canManageMeetings(user: User | null): boolean {
  return hasPermission(user, Permission.MANAGE_MEETINGS);
}

/**
 * Check if user can manage tasks
 */
export function canManageTasks(user: User | null): boolean {
  return hasPermission(user, Permission.MANAGE_TASKS);
}

/**
 * Check if user can view reports
 */
export function canViewReports(user: User | null): boolean {
  return hasPermission(user, Permission.VIEW_REPORTS);
}

/**
 * Get user's permissions
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user || !user.role) return [];
  
  const userRole = user.role as UserRole;
  return rolePermissions[userRole] || [];
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
    'AdminSystem': UserRole.ADMIN,
    'Admin': UserRole.ADMIN,
    'BusinessOwner': UserRole.BUSINESS_OWNER,
    'ProjectManager': UserRole.PROJECT_MANAGER,
    'pm': UserRole.PROJECT_MANAGER,
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
