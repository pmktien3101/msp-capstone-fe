// Task Status Enum (synced with backend)
export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  ReadyToReview = 'ReadyToReview',
  ReOpened = 'ReOpened',
  Cancelled = 'Cancelled',
  Done = 'Done'
}

// Project Status Enum (synced with backend)
export enum ProjectStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// Task Status Labels (English)
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.NotStarted]: 'Not Started',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.ReadyToReview]: 'Ready To Review',
  [TaskStatus.ReOpened]: 'Re-Opened',
  [TaskStatus.Cancelled]: 'Cancelled',
  [TaskStatus.Done]: 'Done'
};

// Project Status Labels (English)
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.NotStarted]: 'Not Started',
  [ProjectStatus.InProgress]: 'In Progress',
  [ProjectStatus.OnHold]: 'On Hold',
  [ProjectStatus.Completed]: 'Completed',
  [ProjectStatus.Cancelled]: 'Cancelled'
};

// Reverse mapping: English Label to Enum
export const TASK_STATUS_FROM_LABEL: Record<string, TaskStatus> = {
  'Not Started': TaskStatus.NotStarted,
  'In Progress': TaskStatus.InProgress,
  'Ready To Review': TaskStatus.ReadyToReview,
  'Re-Opened': TaskStatus.ReOpened,
  'Cancelled': TaskStatus.Cancelled,
  'Done': TaskStatus.Done
};

export const PROJECT_STATUS_FROM_LABEL: Record<string, ProjectStatus> = {
  'Not Started': ProjectStatus.NotStarted,
  'In Progress': ProjectStatus.InProgress,
  'On Hold': ProjectStatus.OnHold,
  'Completed': ProjectStatus.Completed,
  'Cancelled': ProjectStatus.Cancelled
};

// Helper functions
export const getTaskStatusLabel = (status: string | TaskStatus): string => {
  // If already enum value
  if (Object.values(TaskStatus).includes(status as TaskStatus)) {
    return TASK_STATUS_LABELS[status as TaskStatus];
  }
  // If English label
  return status;
};

export const getTaskStatusEnum = (status: string): TaskStatus => {
  // If already enum value
  if (Object.values(TaskStatus).includes(status as TaskStatus)) {
    return status as TaskStatus;
  }
  // If English label
  return TASK_STATUS_FROM_LABEL[status] || TaskStatus.NotStarted;
};

export const getProjectStatusLabel = (status: string | ProjectStatus): string => {
  // If already enum value
  if (Object.values(ProjectStatus).includes(status as ProjectStatus)) {
    return PROJECT_STATUS_LABELS[status as ProjectStatus];
  }
  // If English label
  return status;
};

export const getProjectStatusEnum = (status: string): ProjectStatus => {
  // If already enum value
  if (Object.values(ProjectStatus).includes(status as ProjectStatus)) {
    return status as ProjectStatus;
  }
  // If English label
  return PROJECT_STATUS_FROM_LABEL[status] || ProjectStatus.NotStarted;
};

// Task status colors
export const getTaskStatusColor = (status: string | TaskStatus): string => {
  const enumStatus = typeof status === 'string' ? getTaskStatusEnum(status) : status;
  
  switch (enumStatus) {
    case TaskStatus.NotStarted:
      return '#6b7280'; // gray
    case TaskStatus.InProgress:
      return '#3b82f6'; // blue
    case TaskStatus.ReadyToReview:
      return '#8b5cf6'; // purple
    case TaskStatus.ReOpened:
      return '#f59e0b'; // amber
    case TaskStatus.Cancelled:
      return '#ef4444'; // red
    case TaskStatus.Done:
      return '#10b981'; // green
    default:
      return '#6b7280';
  }
};

// Project status colors
export const getProjectStatusColor = (status: string | ProjectStatus): string => {
  const enumStatus = typeof status === 'string' ? getProjectStatusEnum(status) : status;
  
  switch (enumStatus) {
    case ProjectStatus.NotStarted:
      return '#6b7280'; // gray
    case ProjectStatus.InProgress:
      return '#3b82f6'; // blue
    case ProjectStatus.OnHold:
      return '#f59e0b'; // amber
    case ProjectStatus.Completed:
      return '#10b981'; // green
    case ProjectStatus.Cancelled:
      return '#ef4444'; // red
    default:
      return '#6b7280';
  }
};

// All task statuses for dropdowns
export const ALL_TASK_STATUSES = Object.values(TaskStatus);
export const ALL_PROJECT_STATUSES = Object.values(ProjectStatus);

// Task status options for select/dropdown (English labels)
export const TASK_STATUS_OPTIONS = ALL_TASK_STATUSES.map(status => ({
  value: status,
  label: TASK_STATUS_LABELS[status]
}));

// Project status options for select/dropdown (English labels)
export const PROJECT_STATUS_OPTIONS = ALL_PROJECT_STATUSES.map(status => ({
  value: status,
  label: PROJECT_STATUS_LABELS[status]
}));
