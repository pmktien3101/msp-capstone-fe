import type { TaskHistory } from "@/types/taskHistory";

/**
 * Format task history for display
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
      return `${changedBy} đã tạo công việc`;
      
    case "Assigned":
      return `${changedBy} đã giao việc cho ${history.toUser?.fullName || "N/A"}`;
      
    case "Reassigned":
      return `${changedBy} đã chuyển giao từ ${history.fromUser?.fullName || "N/A"} sang ${history.toUser?.fullName || "N/A"}`;
      
    case "StatusChanged":
      return `${changedBy} đã thay đổi trạng thái từ '${history.oldValue}' sang '${history.newValue}'`;
      
    case "Updated":
      if (history.fieldName === "Title") {
        return `${changedBy} đã thay đổi tiêu đề từ '${history.oldValue}' sang '${history.newValue}'`;
      }
      if (history.fieldName === "Description") {
        return `${changedBy} đã cập nhật mô tả`;
      }
      if (history.fieldName === "StartDate") {
        return `${changedBy} đã thay đổi ngày bắt đầu từ ${history.oldValue} sang ${history.newValue}`;
      }
      if (history.fieldName === "EndDate") {
        return `${changedBy} đã thay đổi hạn chót từ ${history.oldValue} sang ${history.newValue}`;
      }
      return `${changedBy} đã cập nhật ${history.fieldName}`;
      
    default:
      return `${changedBy} đã thực hiện thay đổi`;
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
 * Format date for display
 */
export const formatHistoryDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};