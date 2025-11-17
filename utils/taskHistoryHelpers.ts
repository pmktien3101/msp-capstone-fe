import type { TaskHistory } from "@/types/taskHistory";

/**
 * Get user initials for avatar
 */
export const getUserInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get avatar background color based on user name (consistent color per user)
 */
export const getAvatarColor = (fullName: string): string => {
  const colors = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
  ];
  
  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get action text for history item
 */
export const getHistoryActionText = (history: TaskHistory): string => {
  if (history.action === 'Created') {
    return 'created the Work item';
  } else if (history.action === 'Assigned' || history.action === 'Reassigned') {
    return 'changed the Assignee';
  } else if (history.action === 'StatusChanged' || history.fieldName === 'Status') {
    return 'changed the Status';
  } else if (history.fieldName) {
    return `updated the ${history.fieldName}`;
  } else {
    return history.actionDisplay || history.action || 'updated';
  }
};

/**
 * Format task history for display (legacy)
 */
export const formatTaskHistory = (history: TaskHistory): string => {
  // Use backend's changeDescription if available
  if (history.changeDescription) {
    return history.changeDescription;
  }

  // Fallback to manual formatting
  const changedBy = history.changedBy?.fullName || "Someone";
  
  switch (history.action) {
    case "Created":
      return `${changedBy} created the work item`;
      
    case "Assigned":
      return `${changedBy} assigned to ${history.toUser?.fullName || "N/A"}`;
      
    case "Reassigned":
      return `${changedBy} reassigned from ${history.fromUser?.fullName || "N/A"} to ${history.toUser?.fullName || "N/A"}`;
      
    case "StatusChanged":
      return `${changedBy} changed status from '${history.oldValue}' to '${history.newValue}'`;
      
    case "Updated":
      if (history.fieldName === "Title") {
        return `${changedBy} changed title from '${history.oldValue}' to '${history.newValue}'`;
      }
      if (history.fieldName === "Description") {
        return `${changedBy} updated description`;
      }
      if (history.fieldName === "StartDate") {
        return `${changedBy} changed start date from ${history.oldValue} to ${history.newValue}`;
      }
      if (history.fieldName === "EndDate") {
        return `${changedBy} changed due date from ${history.oldValue} to ${history.newValue}`;
      }
      return `${changedBy} updated ${history.fieldName}`;
      
    default:
      return `${changedBy} made changes`;
  }
};

/**
 * Get icon for history action
 */
export const getHistoryIcon = (action: string): string => {
  switch (action) {
    case "Created":
      return "plus-circle";
    case "Assigned":
    case "Reassigned":
      return "user-check";
    case "StatusChanged":
      return "refresh-cw";
    case "Updated":
      return "edit";
    default:
      return "activity";
  }
};

/**
 * Get color for history action
 */
export const getHistoryColor = (action: string): string => {
  switch (action) {
    case "Created":
      return "text-green-600";
    case "Assigned":
      return "text-blue-600";
    case "Reassigned":
      return "text-purple-600";
    case "StatusChanged":
      return "text-orange-600";
    case "Updated":
      return "text-gray-600";
    default:
      return "text-gray-500";
  }
};

/**
 * Format date for display (time ago)
 */
export const formatHistoryDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};