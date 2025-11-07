// Task Status Enum (synced with backend)
export enum TaskStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Paused = 'Paused',
  OverDue = 'OverDue',
  Completed = 'Completed'
}

// Project Status Enum (synced with backend)
export enum ProjectStatus {
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Paused = 'Paused',
  Completed = 'Completed'
}

// Task Status Labels (Vietnamese)
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.NotStarted]: 'Chưa bắt đầu',
  [TaskStatus.InProgress]: 'Đang thực hiện',
  [TaskStatus.Paused]: 'Tạm dừng',
  [TaskStatus.OverDue]: 'Quá hạn',
  [TaskStatus.Completed]: 'Hoàn thành'
};

// Project Status Labels (Vietnamese)
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Scheduled]: 'Lập kế hoạch',
  [ProjectStatus.InProgress]: 'Đang hoạt động',
  [ProjectStatus.Paused]: 'Tạm dừng',
  [ProjectStatus.Completed]: 'Hoàn thành'
};

// Reverse mapping: Vietnamese to Enum
export const TASK_STATUS_FROM_LABEL: Record<string, TaskStatus> = {
  'Chưa bắt đầu': TaskStatus.NotStarted,
  'Đang thực hiện': TaskStatus.InProgress,
  'Tạm dừng': TaskStatus.Paused,
  'Quá hạn': TaskStatus.OverDue,
  'Hoàn thành': TaskStatus.Completed
};

export const PROJECT_STATUS_FROM_LABEL: Record<string, ProjectStatus> = {
  'Lập kế hoạch': ProjectStatus.Scheduled,
  'Đang hoạt động': ProjectStatus.InProgress,
  'Tạm dừng': ProjectStatus.Paused,
  'Hoàn thành': ProjectStatus.Completed
};

// Helper functions
export const getTaskStatusLabel = (status: string | TaskStatus): string => {
  // If already enum value
  if (Object.values(TaskStatus).includes(status as TaskStatus)) {
    return TASK_STATUS_LABELS[status as TaskStatus];
  }
  // If Vietnamese label
  return status;
};

export const getTaskStatusEnum = (status: string): TaskStatus => {
  // If already enum value
  if (Object.values(TaskStatus).includes(status as TaskStatus)) {
    return status as TaskStatus;
  }
  // If Vietnamese label
  return TASK_STATUS_FROM_LABEL[status] || TaskStatus.NotStarted;
};

export const getProjectStatusLabel = (status: string | ProjectStatus): string => {
  // If already enum value
  if (Object.values(ProjectStatus).includes(status as ProjectStatus)) {
    return PROJECT_STATUS_LABELS[status as ProjectStatus];
  }
  // If Vietnamese label
  return status;
};

export const getProjectStatusEnum = (status: string): ProjectStatus => {
  // If already enum value
  if (Object.values(ProjectStatus).includes(status as ProjectStatus)) {
    return status as ProjectStatus;
  }
  // If Vietnamese label
  return PROJECT_STATUS_FROM_LABEL[status] || ProjectStatus.Scheduled;
};

// Task status colors
export const getTaskStatusColor = (status: string | TaskStatus): string => {
  const enumStatus = typeof status === 'string' ? getTaskStatusEnum(status) : status;
  
  switch (enumStatus) {
    case TaskStatus.NotStarted:
      return '#6b7280'; // gray
    case TaskStatus.InProgress:
      return '#3b82f6'; // blue
    case TaskStatus.Paused:
      return '#f59e0b'; // amber
    case TaskStatus.OverDue:
      return '#ef4444'; // red
    case TaskStatus.Completed:
      return '#10b981'; // green
    default:
      return '#6b7280';
  }
};

// Project status colors
export const getProjectStatusColor = (status: string | ProjectStatus): string => {
  const enumStatus = typeof status === 'string' ? getProjectStatusEnum(status) : status;
  
  switch (enumStatus) {
    case ProjectStatus.Scheduled:
      return '#f59e0b'; // amber
    case ProjectStatus.InProgress:
      return '#10b981'; // green
    case ProjectStatus.Paused:
      return '#ef4444'; // red
    case ProjectStatus.Completed:
      return '#6b7280'; // gray
    default:
      return '#6b7280';
  }
};

// All task statuses for dropdowns
export const ALL_TASK_STATUSES = Object.values(TaskStatus);
export const ALL_PROJECT_STATUSES = Object.values(ProjectStatus);

// Task status options for select/dropdown (Vietnamese labels)
export const TASK_STATUS_OPTIONS = ALL_TASK_STATUSES.map(status => ({
  value: status,
  label: TASK_STATUS_LABELS[status]
}));

// Project status options for select/dropdown (Vietnamese labels)
export const PROJECT_STATUS_OPTIONS = ALL_PROJECT_STATUSES.map(status => ({
  value: status,
  label: PROJECT_STATUS_LABELS[status]
}));
