// Mock data tập trung cho tất cả tabs trong dự án

export const mockProject = {
  id: 'proj-1',
  name: 'Hệ thống quản lý dự án MSP',
  description: 'Xây dựng hệ thống quản lý dự án cho công ty MSP',
  status: 'active',
  startDate: '2025-09-01',
  endDate: '2025-12-31',
  members: [
    { id: 'user-1', name: 'Quang Long', email: 'ql@msp.com', role: 'Project Manager', avatar: 'QL' },
    { id: 'user-2', name: 'Nguyễn Văn A', email: 'a@msp.com', role: 'Developer', avatar: 'NA' },
    { id: 'user-3', name: 'Trần Thị B', email: 'b@msp.com', role: 'Designer', avatar: 'TB' }
  ],
  createdAt: '2025-09-01',
  updatedAt: '2025-09-15'
};

export const mockTasks = [
  {
    id: 'MWA-1',
    title: 'API Authentication',
    description: 'Xây dựng API xác thực người dùng với JWT',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'todo',
    priority: 'high',
    assignee: 'QL',
    dueDate: '2025-09-14',
    createdDate: '2025-09-01',
    updatedDate: '2025-09-01',
    estimatedHours: 16,
    actualHours: 0,
    tags: ['backend', 'api', 'auth']
  },
  {
    id: 'MWA-2',
    title: 'Frontend Login UI',
    description: 'Thiết kế giao diện đăng nhập responsive',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'in-progress',
    priority: 'high',
    assignee: 'TB',
    dueDate: '2025-09-16',
    createdDate: '2025-09-02',
    updatedDate: '2025-09-10',
    estimatedHours: 12,
    actualHours: 8,
    tags: ['frontend', 'ui', 'responsive']
  },
  {
    id: 'MWA-3',
    title: 'Database Schema Design',
    description: 'Thiết kế cấu trúc cơ sở dữ liệu cho hệ thống',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'done',
    priority: 'medium',
    assignee: 'NA',
    dueDate: '2025-09-10',
    createdDate: '2025-09-01',
    updatedDate: '2025-09-08',
    estimatedHours: 8,
    actualHours: 8,
    tags: ['database', 'design', 'schema']
  },
  {
    id: 'MWA-4',
    title: 'Payment Gateway Integration',
    description: 'Tích hợp cổng thanh toán VNPay',
    epic: 'XÂY DỰNG MODULE PAYMENT',
    status: 'review',
    priority: 'high',
    assignee: 'NA',
    dueDate: '2025-09-20',
    createdDate: '2025-09-05',
    updatedDate: '2025-09-15',
    estimatedHours: 20,
    actualHours: 18,
    tags: ['payment', 'integration', 'vnpay']
  },
  {
    id: 'MWA-5',
    title: 'User Management System',
    description: 'Hệ thống quản lý người dùng và phân quyền',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'todo',
    priority: 'medium',
    assignee: null,
    dueDate: '2025-09-25',
    createdDate: '2025-09-08',
    updatedDate: '2025-09-08',
    estimatedHours: 24,
    actualHours: 0,
    tags: ['user-management', 'permissions', 'backend']
  },
  {
    id: 'MWA-6',
    title: 'Email Notification Service',
    description: 'Dịch vụ gửi email thông báo',
    epic: 'XÂY DỰNG MODULE PAYMENT',
    status: 'in-progress',
    priority: 'low',
    assignee: 'QL',
    dueDate: '2025-09-30',
    createdDate: '2025-09-10',
    updatedDate: '2025-09-12',
    estimatedHours: 16,
    actualHours: 4,
    tags: ['email', 'notification', 'service']
  }
];

export const mockEpics = [
  {
    id: 'epic-1',
    name: 'XÂY DỰNG HỆ THỐNG LOGIN',
    description: 'Xây dựng hệ thống đăng nhập và xác thực',
    status: 'in-progress',
    progress: 60,
    startDate: '2025-09-01',
    endDate: '2025-09-25',
    tasks: mockTasks.filter(task => task.epic === 'XÂY DỰNG HỆ THỐNG LOGIN')
  },
  {
    id: 'epic-2',
    name: 'XÂY DỰNG MODULE PAYMENT',
    description: 'Xây dựng module thanh toán',
    status: 'in-progress',
    progress: 40,
    startDate: '2025-09-05',
    endDate: '2025-09-30',
    tasks: mockTasks.filter(task => task.epic === 'XÂY DỰNG MODULE PAYMENT')
  }
];

export const mockActivities = [
  {
    id: 'act-1',
    type: 'task_created',
    description: 'Tạo task "API Authentication"',
    user: 'QL',
    timestamp: '2025-09-01T09:00:00Z',
    taskId: 'MWA-1'
  },
  {
    id: 'act-2',
    type: 'task_updated',
    description: 'Cập nhật task "Frontend Login UI" - chuyển sang Đang làm',
    user: 'TB',
    timestamp: '2025-09-10T14:30:00Z',
    taskId: 'MWA-2'
  },
  {
    id: 'act-3',
    type: 'task_completed',
    description: 'Hoàn thành task "Database Schema Design"',
    user: 'NA',
    timestamp: '2025-09-08T16:45:00Z',
    taskId: 'MWA-3'
  },
  {
    id: 'act-4',
    type: 'comment_added',
    description: 'Thêm comment vào "Payment Gateway Integration"',
    user: 'QL',
    timestamp: '2025-09-15T11:20:00Z',
    taskId: 'MWA-4'
  }
];

export const mockMilestones = [
  {
    id: 'milestone-1',
    title: 'Hoàn thành hệ thống đăng nhập',
    description: 'Hoàn thành tất cả tính năng đăng nhập và xác thực',
    dueDate: '2025-09-25',
    status: 'in-progress',
    progress: 60,
    tasks: mockTasks.filter(task => task.epic === 'XÂY DỰNG HỆ THỐNG LOGIN')
  },
  {
    id: 'milestone-2',
    title: 'Hoàn thành module thanh toán',
    description: 'Hoàn thành tích hợp thanh toán VNPay',
    dueDate: '2025-09-30',
    status: 'pending',
    progress: 40,
    tasks: mockTasks.filter(task => task.epic === 'XÂY DỰNG MODULE PAYMENT')
  }
];

export const mockMeetings = [
  {
    id: 'meeting-1',
    projectId: 'proj-1',
    title: 'Họp kick-off dự án',
    description: 'Cuộc họp khởi động dự án MSP với toàn bộ team',
    startTime: '2025-09-15T09:00:00Z',
    endTime: '2025-09-15T10:30:00Z',
    location: 'Phòng họp A - Tầng 3',
    attendees: [
      { id: 'user-1', name: 'Quang Long', email: 'ql@msp.com', role: 'Project Manager' },
      { id: 'user-2', name: 'Nguyễn Văn A', email: 'a@msp.com', role: 'Developer' },
      { id: 'user-3', name: 'Trần Thị B', email: 'b@msp.com', role: 'Designer' }
    ],
    status: 'completed',
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2025-09-15T10:30:00Z'
  },
  {
    id: 'meeting-2',
    projectId: 'proj-1',
    title: 'Review thiết kế UI/UX',
    description: 'Review và feedback về thiết kế giao diện đăng nhập',
    startTime: '2025-09-20T14:00:00Z',
    endTime: '2025-09-20T15:30:00Z',
    location: 'Phòng họp B - Tầng 2',
    attendees: [
      { id: 'user-1', name: 'Quang Long', email: 'ql@msp.com', role: 'Project Manager' },
      { id: 'user-3', name: 'Trần Thị B', email: 'b@msp.com', role: 'Designer' }
    ],
    status: 'scheduled',
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-09-10T10:00:00Z'
  },
  {
    id: 'meeting-3',
    projectId: 'proj-1',
    title: 'Demo tích hợp Payment',
    description: 'Demo tính năng tích hợp thanh toán VNPay',
    startTime: '2025-09-25T10:00:00Z',
    endTime: '2025-09-25T11:00:00Z',
    location: 'Phòng họp A - Tầng 3',
    attendees: [
      { id: 'user-1', name: 'Quang Long', email: 'ql@msp.com', role: 'Project Manager' },
      { id: 'user-2', name: 'Nguyễn Văn A', email: 'a@msp.com', role: 'Developer' }
    ],
    status: 'scheduled',
    createdAt: '2025-09-15T14:00:00Z',
    updatedAt: '2025-09-15T14:00:00Z'
  }
];

// Helper functions
export const getTasksByStatus = (status: string) => {
  return mockTasks.filter(task => task.status === status);
};

export const getTasksByAssignee = (assignee: string) => {
  if (assignee === 'unassigned') {
    return mockTasks.filter(task => !task.assignee);
  }
  return mockTasks.filter(task => task.assignee === assignee);
};

export const getTasksByEpic = (epic: string) => {
  return mockTasks.filter(task => task.epic === epic);
};

export const getProjectStats = () => {
  const totalTasks = mockTasks.length;
  const completedTasks = getTasksByStatus('done').length;
  const inProgressTasks = getTasksByStatus('in-progress').length;
  const todoTasks = getTasksByStatus('todo').length;
  const reviewTasks = getTasksByStatus('review').length;

  return {
    total: totalTasks,
    completed: completedTasks,
    inProgress: inProgressTasks,
    todo: todoTasks,
    review: reviewTasks,
    completionRate: Math.round((completedTasks / totalTasks) * 100)
  };
};
