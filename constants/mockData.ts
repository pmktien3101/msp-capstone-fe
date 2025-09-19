// Mock data tập trung cho tất cả tabs trong dự án

export const mockProject = {
  id: '1',
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
  // Project 1 - Project Management System
  {
    id: 'MWA-1',
    title: 'API Authentication',
    name: 'API Authentication',
    description: 'Xây dựng API xác thực người dùng với JWT',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'done',
    priority: 'high',
    assignee: 'QL',
    assignedTo: {
      id: 1,
      name: 'Quang Lê',
      email: 'quang.le@example.com',
      role: 'Backend Developer',
      avatar: '/avatars/quang.png'
    },
    startDate: '2025-09-01',
    endDate: '2025-09-14',
    createdDate: '2025-09-01',
    updatedDate: '2025-09-01',
    tags: ['backend', 'api', 'auth'],
    projectId: '1',
    milestoneId: 'milestone-1',
    comments: [
      {
        id: 'comment-1',
        content: 'Tôi đã bắt đầu implement JWT authentication. Cần review approach này có phù hợp không?',
        author: {
          id: '1',
          name: 'Quang Lê',
          email: 'quang.le@example.com',
          role: 'Backend Developer',
          avatar: '/avatars/quang.png'
        },
        createdAt: '2025-01-15T09:30:00Z',
        updatedAt: '2025-01-15T09:30:00Z',
        taskId: 'MWA-1'
      },
      {
        id: 'comment-2',
        content: 'Approach này tốt rồi. Nhớ thêm refresh token mechanism nhé.',
        author: {
          id: '2',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'Project Manager',
          avatar: '/avatars/john.svg'
        },
        createdAt: '2025-01-15T10:15:00Z',
        updatedAt: '2025-01-15T10:15:00Z',
        taskId: 'MWA-1'
      }
    ]
  },
  {
    id: 'MWA-2',
    title: 'Frontend Login UI',
    name: 'Frontend Login UI',
    description: 'Thiết kế giao diện đăng nhập responsive',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'in-progress',
    priority: 'high',
    assignee: 'TB',
    assignedTo: {
      id: 3,
      name: 'Trần Bình',
      email: 'tran.binh@example.com',
      role: 'Frontend Developer',
      avatar: '/avatars/binh.png'
    },
    startDate: '2025-09-15',
    endDate: '2025-09-16',
    createdDate: '2025-09-02',
    updatedDate: '2025-09-10',
    tags: ['frontend', 'ui', 'responsive'],
    projectId: '1',
    milestoneId: 'milestone-1',
    comments: [
      {
        id: 'comment-3',
        content: 'UI design đã xong, đang implement responsive cho mobile.',
        author: {
          id: '3',
          name: 'Trần Bình',
          email: 'tran.binh@example.com',
          role: 'Frontend Developer',
          avatar: '/avatars/binh.png'
        },
        createdAt: '2025-01-15T14:20:00Z',
        updatedAt: '2025-01-15T14:20:00Z',
        taskId: 'MWA-2'
      }
    ]
  },
  {
    id: 'MWA-3',
    title: 'Database Schema Design',
    name: 'Database Schema Design',
    description: 'Thiết kế cấu trúc cơ sở dữ liệu cho hệ thống',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'done',
    priority: 'medium',
    assignee: 'NA',
    assignedTo: {
      id: 4,
      name: 'Nguyễn An',
      email: 'nguyen.an@example.com',
      role: 'Database Designer',
      avatar: '/avatars/an.png'
    },
    startDate: '2025-09-01',
    endDate: '2025-09-10',
    createdDate: '2025-09-01',
    updatedDate: '2025-09-08',
    tags: ['database', 'design', 'schema'],
    projectId: '1',
    milestoneId: 'milestone-1',
    comments: []
  },
  {
    id: 'MWA-4',
    title: 'Payment Gateway Integration',
    description: 'Tích hợp cổng thanh toán VNPay',
    epic: 'XÂY DỰNG MODULE PAYMENT',
    status: 'review',
    priority: 'high',
    assignee: 'NA',
    startDate: '2025-09-15',
    endDate: '2025-09-20',
    createdDate: '2025-09-05',
    updatedDate: '2025-09-15',
    tags: ['payment', 'integration', 'vnpay'],
    milestoneId: 'milestone-2'
  },
  {
    id: 'MWA-5',
    title: 'User Management System',
    description: 'Hệ thống quản lý người dùng và phân quyền',
    epic: 'XÂY DỰNG HỆ THỐNG LOGIN',
    status: 'todo',
    priority: 'medium',
    assignee: null,
    startDate: '2025-09-20',
    endDate: '2025-09-25',
    createdDate: '2025-09-08',
    updatedDate: '2025-09-08',
    tags: ['user-management', 'permissions', 'backend'],
    milestoneId: 'milestone-1'
  },
  {
    id: 'MWA-6',
    title: 'Email Notification Service',
    description: 'Dịch vụ gửi email thông báo',
    epic: 'XÂY DỰNG MODULE PAYMENT',
    status: 'in-progress',
    priority: 'low',
    assignee: 'QL',
    startDate: '2025-09-25',
    endDate: '2025-09-30',
    createdDate: '2025-09-10',
    updatedDate: '2025-09-12',
    tags: ['email', 'notification', 'service'],
    milestoneId: 'milestone-2'
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

// Shared milestone data - single source of truth
export const mockMilestones = [
  {
    id: 'milestone-1',
    name: 'Hoàn thành hệ thống đăng nhập',
    description: 'Hoàn thành tất cả tính năng đăng nhập và xác thực',
    dueDate: '2025-09-25',
    status: 'in-progress',
    progress: 60,
    tasks: mockTasks.filter(task => task.epic === 'XÂY DỰNG HỆ THỐNG LOGIN')
  },
  {
    id: 'milestone-2',
    name: 'Hoàn thành module thanh toán',
    description: 'Hoàn thành tích hợp thanh toán VNPay',
    dueDate: '2025-09-30',
    status: 'pending',
    progress: 40,
    tasks: mockTasks.filter(task => task.epic === 'XÂY DỰNG MODULE PAYMENT')
  }
];

// Helper function to calculate milestone progress based on tasks
export const calculateMilestoneProgress = (milestoneId: string) => {
  const milestone = mockMilestones.find(m => m.id === milestoneId);
  if (!milestone || !milestone.tasks.length) return 0;
  
  const completedTasks = milestone.tasks.filter(task => task.status === 'done').length;
  return Math.round((completedTasks / milestone.tasks.length) * 100);
};

// Helper function to get milestone status based on progress and due date
export const getMilestoneStatus = (milestoneId: string) => {
  const milestone = mockMilestones.find(m => m.id === milestoneId);
  if (!milestone) return 'pending';
  
  const progress = calculateMilestoneProgress(milestoneId);
  const dueDate = new Date(milestone.dueDate);
  const today = new Date();
  
  if (progress === 100) return 'completed';
  if (progress > 0) return 'in-progress';
  if (today > dueDate) return 'overdue';
  return 'pending';
};

// Generate hierarchical work items from shared milestone data
export const mockHierarchicalWorkItems = mockMilestones.map(milestone => {
  const progress = calculateMilestoneProgress(milestone.id);
  const status = getMilestoneStatus(milestone.id);
  
  return {
    id: milestone.id,
    title: milestone.name,
    type: 'milestone' as const,
    status: status,
    startDate: milestone.dueDate,
    endDate: milestone.dueDate,
    progress: progress,
    isExpanded: milestone.id === 'milestone-1', // First milestone expanded by default
    children: milestone.tasks.map(task => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      status: task.status,
      assignee: task.assignee,
      startDate: task.startDate,
      endDate: task.endDate,
      milestoneId: milestone.id
    }))
  };
});

// Generate flattened work items from shared data for Gantt chart synchronization
export const mockFlattenedWorkItems = (() => {
  const items: any[] = [];
  let rowIndex = 0;
  
  mockMilestones.forEach(milestone => {
    const progress = calculateMilestoneProgress(milestone.id);
    const status = getMilestoneStatus(milestone.id);
    
    // Add milestone
    items.push({
      id: milestone.id,
      title: milestone.name,
      type: 'milestone',
      status: status,
      assignee: '',
      startDate: milestone.dueDate,
      endDate: milestone.dueDate,
      progress: progress,
      rowIndex: rowIndex++
    });
    
    // Add tasks for this milestone
    milestone.tasks.forEach(task => {
      items.push({
        id: task.id,
        title: task.title,
        type: 'task',
        status: task.status,
        assignee: task.assignee || '',
        startDate: task.startDate,
        endDate: task.endDate,
        milestoneId: milestone.id,
        progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0,
        rowIndex: rowIndex++
      });
    });
  });
  
  return items;
})();

export const mockMeetings = [
  {
    id: 'meeting-1',
    projectId: '1',
    milestoneId: 'milestone-1',
    title: 'Họp kick-off dự án',
    description: 'Cuộc họp khởi động dự án MSP với toàn bộ team',
    startTime: '2025-09-15T09:00:00Z',
    endTime: '2025-09-15T10:30:00Z',
    status: 'Finished',
    roomUrl: 'https://meet.google.com/abc-defg-hij',
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2025-09-15T10:30:00Z'
  },
  {
    id: 'meeting-2',
    projectId: '1',
    milestoneId: 'milestone-1',
    title: 'Review thiết kế UI/UX',
    description: 'Review và feedback về thiết kế giao diện đăng nhập',
    startTime: '2025-09-20T14:00:00Z',
    endTime: '2025-09-20T15:30:00Z',
    status: 'Scheduled',
    roomUrl: 'https://meet.google.com/xyz-uvw-rst',
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-09-10T10:00:00Z'
  },
  {
    id: 'meeting-3',
    projectId: '1',
    milestoneId: 'milestone-2',
    title: 'Demo tích hợp Payment',
    description: 'Demo tính năng tích hợp thanh toán VNPay',
    startTime: '2025-09-25T10:00:00Z',
    endTime: '2025-09-25T11:00:00Z',
    status: 'Scheduled',
    roomUrl: 'https://meet.google.com/mno-pqr-stu',
    createdAt: '2025-09-15T14:00:00Z',
    updatedAt: '2025-09-15T14:00:00Z'
  },
  {
    id: 'meeting-4',
    projectId: '1',
    milestoneId: null,
    title: 'Họp hàng tuần',
    description: 'Họp cập nhật tiến độ dự án hàng tuần',
    startTime: '2025-09-22T09:00:00Z',
    endTime: '2025-09-22T10:00:00Z',
    status: 'Ongoing',
    roomUrl: 'https://meet.google.com/weekly-standup',
    createdAt: '2025-09-18T15:00:00Z',
    updatedAt: '2025-09-22T09:00:00Z'
  },
  {
    id: 'meeting-5',
    projectId: '1',
    milestoneId: 'milestone-1',
    title: 'Code review session',
    description: 'Review code cho module authentication',
    startTime: '2025-09-18T15:00:00Z',
    endTime: '2025-09-18T16:30:00Z',
    status: 'Finished',
    roomUrl: 'https://meet.google.com/code-review-123',
    createdAt: '2025-09-16T10:00:00Z',
    updatedAt: '2025-09-18T16:30:00Z'
  },
  {
    id: 'meeting-6',
    projectId: '1',
    milestoneId: 'milestone-2',
    title: 'Testing session',
    description: 'Test tích hợp payment gateway',
    startTime: '2025-09-28T14:00:00Z',
    endTime: null,
    status: 'Scheduled',
    roomUrl: 'https://meet.google.com/testing-session',
    createdAt: '2025-09-20T11:00:00Z',
    updatedAt: '2025-09-20T11:00:00Z'
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

export const getTasksByMilestone = (milestone: string) => {
  return mockTasks.filter(task => task.epic === milestone);
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

// Additional tasks for other projects
export const additionalMockTasks = [
  // Project 2 - Marketing Campaign tasks
  {
    id: 'MKT-1',
    title: 'Social Media Strategy',
    name: 'Social Media Strategy',
    description: 'Phát triển chiến lược social media cho Q4',
    epic: 'DIGITAL MARKETING',
    status: 'done',
    priority: 'high',
    assignee: 'MKT',
    assignedTo: {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'Marketing Lead',
      avatar: '/avatars/mike.png'
    },
    startDate: '2025-10-01',
    endDate: '2025-10-15',
    createdDate: '2025-10-01',
    updatedDate: '2025-10-01',
    tags: ['marketing', 'social'],
    projectId: '2',
    milestoneId: 'milestone-2',
    comments: []
  },
  {
    id: 'MKT-2',
    title: 'Content Creation',
    name: 'Content Creation',
    description: 'Tạo nội dung cho các kênh marketing',
    epic: 'DIGITAL MARKETING',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'SC',
    assignedTo: {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      role: 'Content Creator',
      avatar: '/avatars/sarah.png'
    },
    startDate: '2025-10-15',
    endDate: '2025-11-01',
    createdDate: '2025-10-01',
    updatedDate: '2025-10-01',
    tags: ['content', 'marketing'],
    projectId: '2',
    milestoneId: 'milestone-2',
    comments: []
  },
  {
    id: 'MKT-3',
    title: 'Campaign Analytics',
    name: 'Campaign Analytics',
    description: 'Thiết lập tracking và phân tích hiệu quả campaign',
    epic: 'DIGITAL MARKETING',
    status: 'todo',
    priority: 'medium',
    assignee: 'MKT',
    assignedTo: {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'Marketing Lead',
      avatar: '/avatars/mike.png'
    },
    startDate: '2025-11-01',
    endDate: '2025-11-15',
    createdDate: '2025-10-01',
    updatedDate: '2025-10-01',
    tags: ['analytics', 'tracking'],
    projectId: '2',
    milestoneId: 'milestone-2',
    comments: []
  },

  // Project 3 - Mobile App Development tasks
  {
    id: 'MOB-1',
    title: 'App Architecture',
    name: 'App Architecture',
    description: 'Thiết kế kiến trúc ứng dụng mobile',
    epic: 'MOBILE DEVELOPMENT',
    status: 'done',
    priority: 'high',
    assignee: 'TB',
    assignedTo: {
      id: 5,
      name: 'Tom Brown',
      email: 'tom.brown@example.com',
      role: 'Tech Lead',
      avatar: '/avatars/tom.png'
    },
    startDate: '2025-08-01',
    endDate: '2025-08-15',
    createdDate: '2025-08-01',
    updatedDate: '2025-08-01',
    tags: ['architecture', 'mobile'],
    projectId: '3',
    milestoneId: 'milestone-3',
    comments: []
  },
  {
    id: 'MOB-2',
    title: 'UI/UX Design',
    name: 'UI/UX Design',
    description: 'Thiết kế giao diện người dùng cho mobile app',
    epic: 'MOBILE DEVELOPMENT',
    status: 'done',
    priority: 'high',
    assignee: 'ED',
    assignedTo: {
      id: 6,
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      role: 'Developer',
      avatar: '/avatars/emma.png'
    },
    startDate: '2025-08-15',
    endDate: '2025-08-30',
    createdDate: '2025-08-01',
    updatedDate: '2025-08-01',
    tags: ['ui', 'ux', 'design'],
    projectId: '3',
    milestoneId: 'milestone-3',
    comments: []
  },
  {
    id: 'MOB-3',
    title: 'Backend API',
    name: 'Backend API',
    description: 'Phát triển API backend cho mobile app',
    epic: 'MOBILE DEVELOPMENT',
    status: 'in-progress',
    priority: 'high',
    assignee: 'TB',
    assignedTo: {
      id: 5,
      name: 'Tom Brown',
      email: 'tom.brown@example.com',
      role: 'Tech Lead',
      avatar: '/avatars/tom.png'
    },
    startDate: '2025-08-30',
    endDate: '2025-09-15',
    createdDate: '2025-08-01',
    updatedDate: '2025-08-01',
    tags: ['backend', 'api'],
    projectId: '3',
    milestoneId: 'milestone-3',
    comments: []
  },
  {
    id: 'MOB-4',
    title: 'Testing & QA',
    name: 'Testing & QA',
    description: 'Kiểm thử và đảm bảo chất lượng ứng dụng',
    epic: 'MOBILE DEVELOPMENT',
    status: 'todo',
    priority: 'medium',
    assignee: 'ED',
    assignedTo: {
      id: 6,
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      role: 'Developer',
      avatar: '/avatars/emma.png'
    },
    startDate: '2025-09-25',
    endDate: '2025-09-30',
    createdDate: '2025-08-01',
    updatedDate: '2025-08-01',
    tags: ['testing', 'qa'],
    projectId: '3',
    milestoneId: 'milestone-3',
    comments: []
  },

  // Project 4 - E-commerce Platform tasks
  {
    id: 'E-1',
    title: 'Product Catalog',
    name: 'Product Catalog',
    description: 'Xây dựng hệ thống quản lý sản phẩm',
    epic: 'E-COMMERCE',
    status: 'done',
    priority: 'high',
    assignee: 'AJ',
    assignedTo: {
      id: 7,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'Product Manager',
      avatar: '/avatars/alice.png'
    },
    startDate: '2025-08-25',
    endDate: '2025-09-01',
    createdDate: '2025-08-01',
    updatedDate: '2025-08-01',
    tags: ['catalog', 'products'],
    projectId: '4',
    milestoneId: 'milestone-4',
    comments: []
  },
  {
    id: 'E-2',
    title: 'Payment Integration',
    name: 'Payment Integration',
    description: 'Tích hợp hệ thống thanh toán',
    epic: 'E-COMMERCE',
    status: 'in-progress',
    priority: 'high',
    assignee: 'BW',
    assignedTo: {
      id: 8,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      role: 'Full Stack Developer',
      avatar: '/avatars/bob.png'
    },
    startDate: '2025-08-30',
    endDate: '2025-09-15',
    createdDate: '2025-08-01',
    updatedDate: '2025-08-01',
    tags: ['payment', 'integration'],
    projectId: '4',
    milestoneId: 'milestone-4',
    comments: []
  },
  {
    id: 'E-3',
    title: 'Order Management',
    name: 'Order Management',
    description: 'Hệ thống quản lý đơn hàng',
    epic: 'E-COMMERCE',
    status: 'todo',
    priority: 'medium',
    assignee: 'BW',
    assignedTo: {
      id: 8,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      role: 'Full Stack Developer',
      avatar: '/avatars/bob.png'
    },
    startDate: '2025-09-01',
    endDate: '2025-10-01',
    createdDate: '2025-08-01',
    updatedDate: '2025-08-01',
    tags: ['orders', 'management'],
    projectId: '4',
    milestoneId: 'milestone-4',
    comments: []
  },

  // Project 5 - Data Analytics Dashboard tasks
  {
    id: 'DA-1',
    title: 'Data Collection',
    name: 'Data Collection',
    description: 'Thu thập và chuẩn bị dữ liệu cho dashboard',
    epic: 'DATA ANALYTICS',
    status: 'done',
    priority: 'high',
    assignee: 'DL',
    assignedTo: {
      id: 9,
      name: 'David Lee',
      email: 'david.lee@example.com',
      role: 'Data Analyst',
      avatar: '/avatars/david.png'
    },
    startDate: '2025-11-01',
    endDate: '2025-11-15',
    createdDate: '2025-11-01',
    updatedDate: '2025-11-01',
    tags: ['data', 'collection'],
    projectId: '5',
    milestoneId: 'milestone-5',
    comments: []
  },
  {
    id: 'DA-2',
    title: 'Dashboard Design',
    name: 'Dashboard Design',
    description: 'Thiết kế giao diện dashboard analytics',
    epic: 'DATA ANALYTICS',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'LC',
    assignedTo: {
      id: 10,
      name: 'Lisa Chen',
      email: 'lisa.chen@example.com',
      role: 'UI/UX Designer',
      avatar: '/avatars/lisa.png'
    },
    startDate: '2025-11-15',
    endDate: '2025-12-01',
    createdDate: '2025-11-01',
    updatedDate: '2025-11-01',
    tags: ['dashboard', 'design'],
    projectId: '5',
    milestoneId: 'milestone-5',
    comments: []
  },

  // Project 6 - Customer Support System tasks
  {
    id: 'CS-1',
    title: 'Ticket System',
    name: 'Ticket System',
    description: 'Hệ thống quản lý ticket hỗ trợ khách hàng',
    epic: 'CUSTOMER SUPPORT',
    status: 'done',
    priority: 'high',
    assignee: 'MG',
    assignedTo: {
      id: 11,
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      role: 'AI Engineer',
      avatar: '/avatars/maria.png'
    },
    startDate: '2025-08-15',
    endDate: '2025-08-30',
    createdDate: '2025-07-01',
    updatedDate: '2025-07-01',
    tags: ['tickets', 'support'],
    projectId: '6',
    milestoneId: 'milestone-6',
    comments: []
  },
  {
    id: 'CS-2',
    title: 'AI Chatbot',
    name: 'AI Chatbot',
    description: 'Phát triển chatbot AI cho hỗ trợ tự động',
    epic: 'CUSTOMER SUPPORT',
    status: 'in-progress',
    priority: 'high',
    assignee: 'MG',
    assignedTo: {
      id: 11,
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      role: 'AI Engineer',
      avatar: '/avatars/maria.png'
    },
    startDate: '2025-08-30',
    endDate: '2025-09-15',
    createdDate: '2025-07-01',
    updatedDate: '2025-07-01',
    tags: ['ai', 'chatbot'],
    projectId: '6',
    milestoneId: 'milestone-6',
    comments: []
  },
  {
    id: 'CS-3',
    title: 'Knowledge Base',
    name: 'Knowledge Base',
    description: 'Xây dựng cơ sở tri thức cho hỗ trợ',
    epic: 'CUSTOMER SUPPORT',
    status: 'todo',
    priority: 'medium',
    assignee: 'JT',
    assignedTo: {
      id: 12,
      name: 'James Taylor',
      email: 'james.taylor@example.com',
      role: 'Backend Developer',
      avatar: '/avatars/james.png'
    },
    startDate: '2025-09-01',
    endDate: '2025-10-01',
    createdDate: '2025-07-01',
    updatedDate: '2025-07-01',
    tags: ['knowledge', 'base'],
    projectId: '6',
    milestoneId: 'milestone-6',
    comments: []
  }
];
