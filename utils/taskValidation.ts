/**
 * Task validation utilities
 * Contains validation logic for task creation and updates
 */

/**
 * Validates if status transition is allowed based on business rules
 */
export const isValidStatusTransition = (
  currentStatus: string,
  newStatus: string
): { valid: boolean; message?: string } => {
  // No change is always valid
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  // Define invalid transitions based on requirements
  const invalidTransitions: Record<string, string[]> = {
    Todo: ['ReadyToReview', 'Done', 'ReOpened'],
    InProgress: ['Done', 'ReOpened'],
    ReadyToReview: ['Todo'], // PM can change to InProgress for fixes, but not back to Todo
    ReOpened: ['Done', 'Todo'],
  };

  const notAllowed = invalidTransitions[currentStatus];
  
  if (notAllowed && notAllowed.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot change status from ${getStatusLabel(currentStatus)} to ${getStatusLabel(newStatus)}`,
    };
  }

  return { valid: true };
};

/**
 * Validates task dates against project dates and business rules
 */
export const validateTaskDates = (
  taskStartDate: string,
  taskEndDate: string,
  projectStartDate?: string,
  projectEndDate?: string
): { valid: boolean; message?: string } => {
  if (!taskStartDate || !taskEndDate) {
    return { valid: false, message: 'Start date and end date are required' };
  }

  const taskStart = new Date(taskStartDate);
  const taskEnd = new Date(taskEndDate);
  const today = new Date();
  
  // Set time to 00:00:00 for date-only comparison
  taskStart.setHours(0, 0, 0, 0);
  taskEnd.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Validation 1: Task end date must be >= task start date
  if (taskEnd < taskStart) {
    return { valid: false, message: 'End date must be after or equal to start date' };
  }

  // Validation 2: Task start date >= project start date
  if (projectStartDate) {
    const projectStart = new Date(projectStartDate);
    projectStart.setHours(0, 0, 0, 0);
    
    if (taskStart < projectStart) {
      return {
        valid: false,
        message: `Task start date must be on or after project start date (${formatDate(projectStartDate)})`,
      };
    }
  }

  // Validation 3: Task end date <= project end date
  if (projectEndDate) {
    const projectEnd = new Date(projectEndDate);
    projectEnd.setHours(0, 0, 0, 0);
    
    if (taskEnd > projectEnd) {
      return {
        valid: false,
        message: `Task end date must be on or before project end date (${formatDate(projectEndDate)})`,
      };
    }
  }

  return { valid: true };
};

/**
 * Validates task dates against selected milestone due dates
 */
export const validateTaskMilestoneDates = (
  taskStartDate: string,
  taskEndDate: string,
  selectedMilestones: Array<{ id: string; name: string; dueDate: string }>
): { valid: boolean; message?: string } => {
  if (!taskStartDate || !taskEndDate || selectedMilestones.length === 0) {
    return { valid: true }; // No validation needed if no milestones selected
  }

  const taskStart = new Date(taskStartDate);
  const taskEnd = new Date(taskEndDate);
  
  // Set time to 00:00:00 for date-only comparison
  taskStart.setHours(0, 0, 0, 0);
  taskEnd.setHours(0, 0, 0, 0);

  // Check each milestone
  for (const milestone of selectedMilestones) {
    const milestoneDue = new Date(milestone.dueDate);
    milestoneDue.setHours(0, 0, 0, 0);

    // Validation: Task end date must be <= milestone due date
    if (taskEnd > milestoneDue) {
      return {
        valid: false,
        message: `Task end date must be on or before milestone "${milestone.name}" due date (${formatDate(milestone.dueDate)})`,
      };
    }
  }

  return { valid: true };
};

/**
 * Format date for display
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Get human-readable status label
 */
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    Todo: 'Todo',
    InProgress: 'In Progress',
    ReadyToReview: 'Ready To Review',
    ReOpened: 'Re-Opened',
    Cancelled: 'Cancelled',
    Done: 'Done',
  };
  return labels[status] || status;
};
