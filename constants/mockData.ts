// Mock data tập trung cho tất cả tabs trong dự án

import { Participant } from "@/types";

// Mock Members data
export const mockMembers = [
  {
    id: "member-1",
    name: "Quang Long",
    email: "ql@msp.com",
    role: "Project Manager",
    avatar: "QL",
    tasks: ["MWA-1", "MWA-6"],
  },
  {
    id: "member-2",
    name: "Nguyễn Văn A",
    email: "a@msp.com",
    role: "Developer",
    avatar: "NA",
    tasks: ["MWA-3"],
  },
  {
    id: "member-3",
    name: "Trần Thị B",
    email: "b@msp.com",
    role: "Designer",
    avatar: "TB",
    tasks: ["MWA-2"],
  },
  {
    id: "member-4",
    name: "Lê Văn C",
    email: "c@msp.com",
    role: "Backend Developer",
    avatar: "LC",
    tasks: ["MWA-4"],
  },
  {
    id: "member-5",
    name: "Phạm Thị D",
    email: "d@msp.com",
    role: "Frontend Developer",
    avatar: "PD",
    tasks: ["MWA-5"],
  },
];

export const mockProject = {
  id: "1",
  name: "Hệ thống quản lý dự án MSP",
  description: "Xây dựng hệ thống quản lý dự án cho công ty MSP",
  status: "active",
  startDate: "2025-09-01",
  endDate: "2025-12-31",
  milestones: ["milestone-1", "milestone-2"],
  members: ["member-1", "member-2", "member-3", "member-4", "member-5"],
  meetings: [
    "meeting-1",
    "meeting-2",
    "meeting-3",
    "meeting-4",
    "meeting-5",
    "meeting-6",
  ],
};

export const mockTasks = [
  {
    id: "MWA-1",
    title: "API Authentication",
    description: "Xây dựng API xác thực người dùng với JWT",
    milestoneIds: ["milestone-1", "milestone-2"],
    status: "done",
    priority: "high",
    assignee: "member-1",
    startDate: "2025-09-01",
    endDate: "2025-09-14",
  },
  {
    id: "MWA-2",
    title: "Frontend Login UI",
    description: "Thiết kế giao diện đăng nhập responsive",
    milestoneIds: ["milestone-1"],
    status: "in-progress",
    priority: "high",
    assignee: "member-3",
    startDate: "2025-09-15",
    endDate: "2025-09-16",
  },
  {
    id: "MWA-3",
    title: "Database Schema Design",
    description: "Thiết kế cấu trúc cơ sở dữ liệu cho hệ thống",
    milestoneIds: ["milestone-1"],
    status: "done",
    priority: "medium",
    assignee: "member-2",
    startDate: "2025-09-01",
    endDate: "2025-09-10",
  },
  {
    id: "MWA-4",
    title: "Payment Gateway Integration",
    description: "Tích hợp cổng thanh toán VNPay",
    milestoneIds: ["milestone-2"],
    status: "review",
    priority: "high",
    assignee: "member-4",
    startDate: "2025-09-15",
    endDate: "2025-09-20",
  },
  {
    id: "MWA-5",
    title: "User Management System",
    description: "Hệ thống quản lý người dùng và phân quyền",
    milestoneIds: ["milestone-1"],
    status: "todo",
    priority: "medium",
    assignee: "member-5",
    startDate: "2025-09-20",
    endDate: "2025-09-25",
  },
  {
    id: "MWA-6",
    title: "Email Notification Service",
    description: "Dịch vụ gửi email thông báo",
    milestoneIds: ["milestone-2"],
    status: "in-progress",
    priority: "low",
    assignee: "member-1",
    startDate: "2025-09-25",
    endDate: "2025-09-30",
  },
  {
    id: "MWA-7",
    title: "Task without Milestone",
    description: "Task không liên kết với milestone",
    milestoneIds: [],
    status: "todo",
    priority: "low",
    assignee: "",
    startDate: "2025-09-25",
    endDate: "2025-09-30",
  },
];

// Mock Comments data
export const mockComments = [
  {
    id: "comment-1",
    taskId: "MWA-3",
    authorId: "member-1",
    content:
      "Đã hoàn thành thiết kế database schema cho bảng users và authentication",
    timestamp: "2025-09-05T10:30:00Z",
    isEdited: false,
  },
  {
    id: "comment-2",
    taskId: "MWA-3",
    authorId: "member-2",
    content: "Cần thêm index cho các trường thường xuyên query",
    timestamp: "2025-09-06T14:20:00Z",
    isEdited: false,
  },
  {
    id: "comment-3",
    taskId: "MWA-1",
    authorId: "member-3",
    content: "API authentication đã được test và hoạt động tốt",
    timestamp: "2025-09-07T09:15:00Z",
    isEdited: false,
  },
];

export const mockActivities = [
  {
    id: "act-1",
    type: "task_created",
    description: 'Tạo task "API Authentication"',
    user: "QL",
    timestamp: "2025-09-01T09:00:00Z",
    taskId: "MWA-1",
  },
  {
    id: "act-2",
    type: "task_updated",
    description: 'Cập nhật task "Frontend Login UI" - chuyển sang Đang làm',
    user: "TB",
    timestamp: "2025-09-10T14:30:00Z",
    taskId: "MWA-2",
  },
  {
    id: "act-3",
    type: "task_completed",
    description: 'Hoàn thành task "Database Schema Design"',
    user: "NA",
    timestamp: "2025-09-08T16:45:00Z",
    taskId: "MWA-3",
  },
  {
    id: "act-4",
    type: "comment_added",
    description: 'Thêm comment vào "Payment Gateway Integration"',
    user: "QL",
    timestamp: "2025-09-15T11:20:00Z",
    taskId: "MWA-4",
  },
];

// Shared milestone data - single source of truth
let mockMilestones = [
  {
    id: "milestone-1",
    name: "Hoàn thành hệ thống đăng nhập",
    description: "Hoàn thành tất cả tính năng đăng nhập và xác thực",
    dueDate: "2025-09-25",
    status: "in-progress",
    tasks: ["MWA-1", "MWA-2", "MWA-3", "MWA-5"],
    projectId: "1",
    meetings: ["meeting-1", "meeting-2", "meeting-5"],
  },
  {
    id: "milestone-2",
    name: "Hoàn thành module thanh toán",
    description: "Hoàn thành tích hợp thanh toán VNPay",
    dueDate: "2025-09-30",
    status: "pending",
    tasks: ["MWA-4", "MWA-6", "MWA-1"],
    projectId: "1",
    meetings: ["meeting-3", "meeting-6"],
  },
];

// Function to add new milestone
export const addMilestone = (milestoneData: any) => {
  const newMilestone = {
    ...milestoneData,
    id: `milestone-${Date.now()}`,
    status: "pending",
    tasks: [],
    meetings: [],
  };
  mockMilestones.push(newMilestone);
  return newMilestone;
};

// Function to get milestones
export const getMilestones = () => mockMilestones;

// Function to update milestone
export const updateMilestone = (milestoneId: string, milestoneData: any) => {
  const milestoneIndex = mockMilestones.findIndex((m) => m.id === milestoneId);
  if (milestoneIndex === -1) {
    throw new Error(`Milestone with id ${milestoneId} not found`);
  }

  const oldMilestone = mockMilestones[milestoneIndex];
  const oldTaskIds = oldMilestone.tasks || [];
  const newTaskIds = milestoneData.tasks || [];

  // Update milestone with new data while preserving existing fields
  mockMilestones[milestoneIndex] = {
    ...mockMilestones[milestoneIndex],
    ...milestoneData,
    id: milestoneId, // Ensure ID doesn't change
  };

  // Update task.milestoneIds for tasks that were removed from milestone
  const removedTaskIds = oldTaskIds.filter((id) => !newTaskIds.includes(id));
  removedTaskIds.forEach((taskId) => {
    const task = mockTasks.find((t) => t.id === taskId);
    if (task) {
      task.milestoneIds = task.milestoneIds.filter((id) => id !== milestoneId);
    }
  });

  // Update task.milestoneIds for tasks that were added to milestone
  const addedTaskIds = newTaskIds.filter(
    (id: string) => !oldTaskIds.includes(id)
  );
  addedTaskIds.forEach((taskId: string) => {
    const task = mockTasks.find((t) => t.id === taskId);
    if (task && !task.milestoneIds.includes(milestoneId)) {
      task.milestoneIds.push(milestoneId);
    }
  });

  return mockMilestones[milestoneIndex];
};

// Function to delete milestone
export const deleteMilestone = (milestoneId: string) => {
  const milestoneIndex = mockMilestones.findIndex((m) => m.id === milestoneId);
  if (milestoneIndex === -1) {
    throw new Error(`Milestone with id ${milestoneId} not found`);
  }

  const deletedMilestone = mockMilestones[milestoneIndex];

  // Remove milestone from array
  mockMilestones.splice(milestoneIndex, 1);

  // Remove milestone from all tasks that reference it
  mockTasks.forEach((task) => {
    if (task.milestoneIds.includes(milestoneId)) {
      task.milestoneIds = task.milestoneIds.filter((id) => id !== milestoneId);
    }
  });

  return deletedMilestone;
};

// Export the array for backward compatibility
export { mockMilestones };

// Helper function to calculate milestone progress based on tasks
export const calculateMilestoneProgress = (milestoneId: string) => {
  const milestone = mockMilestones.find((m) => m.id === milestoneId);
  if (!milestone || !milestone.tasks.length) return 0;

  const milestoneTasks = mockTasks.filter((task) =>
    task.milestoneIds.includes(milestoneId)
  );

  const completedTasks = milestoneTasks.filter(
    (task) => task.status === "done"
  ).length;
  return Math.round((completedTasks / milestoneTasks.length) * 100);
};

// Helper function to get milestone status based on progress and due date
export const getMilestoneStatus = (milestoneId: string) => {
  const milestone = mockMilestones.find((m) => m.id === milestoneId);
  if (!milestone) return "pending";

  const progress = calculateMilestoneProgress(milestoneId);
  const dueDate = new Date(milestone.dueDate);
  const today = new Date();

  if (progress === 100) return "completed";
  if (progress > 0) return "in-progress";
  if (today > dueDate) return "overdue";
  return "pending";
};

// Generate hierarchical work items from shared milestone data
export const mockHierarchicalWorkItems = mockMilestones.map((milestone) => {
  const progress = calculateMilestoneProgress(milestone.id);
  const status = getMilestoneStatus(milestone.id);

  const milestoneTasks = mockTasks.filter((task) =>
    task.milestoneIds.includes(milestone.id)
  );

  return {
    id: milestone.id,
    title: milestone.name,
    type: "milestone" as const,
    status: status,
    startDate: milestone.dueDate,
    endDate: milestone.dueDate,
    progress: progress,
    isExpanded: milestone.id === "milestone-1", // First milestone expanded by default
    children: milestoneTasks.map((task) => ({
      id: task.id,
      title: task.title,
      type: "task" as const,
      status: task.status,
      assignee: task.assignee,
      startDate: task.startDate,
      endDate: task.endDate,
      milestoneId: milestone.id,
    })),
  };
});

// Generate flattened work items from shared data for Gantt chart synchronization
export const mockFlattenedWorkItems = (() => {
  const items: any[] = [];
  let rowIndex = 0;

  mockMilestones.forEach((milestone) => {
    const progress = calculateMilestoneProgress(milestone.id);
    const status = getMilestoneStatus(milestone.id);

    const milestoneTasks = mockTasks.filter((task) =>
      task.milestoneIds.includes(milestone.id)
    );

    // Add milestone
    items.push({
      id: milestone.id,
      title: milestone.name,
      type: "milestone",
      status: status,
      assignee: "",
      startDate: milestone.dueDate,
      endDate: milestone.dueDate,
      progress: progress,
      rowIndex: rowIndex++,
    });

    // Add tasks for this milestone
    milestoneTasks.forEach((task) => {
      items.push({
        id: task.id,
        title: task.title,
        type: "task",
        status: task.status,
        assignee: task.assignee || "",
        startDate: task.startDate,
        endDate: task.endDate,
        milestoneId: milestone.id,
        progress:
          task.status === "done" ? 100 : task.status === "in-progress" ? 50 : 0,
        rowIndex: rowIndex++,
      });
    });
  });

  return items;
})();

export const mockMeetings = [
  {
    id: "meeting-1",
    projectId: "1",
    milestoneId: "milestone-1",
    title: "Họp kick-off dự án",
    description: "Cuộc họp khởi động dự án MSP với toàn bộ team",
    startTime: "2025-09-15T09:00:00Z",
    endTime: "2025-09-15T10:30:00Z",
    status: "Finished",
    meetingType: "offline",
    roomUrl: "",
    location: "Phòng họp A, Tầng 3, Văn phòng MSP",
    participants: ["member-1", "member-2", "member-3", "member-4", "member-5"],
  },
  {
    id: "meeting-2",
    projectId: "1",
    milestoneId: "milestone-1",
    title: "Review thiết kế UI/UX",
    description: "Review và feedback về thiết kế giao diện đăng nhập",
    startTime: "2025-09-28T14:00:00Z",
    endTime: "",
    status: "Scheduled",
    meetingType: "offline",
    roomUrl: "",
    location: "Phòng họp B, Tầng 2, Văn phòng MSP",
    participants: ["member-1", "member-3", "member-5"],
  },
  {
    id: "meeting-3",
    projectId: "1",
    milestoneId: "milestone-2",
    title: "Demo tích hợp Payment",
    description: "Demo tính năng tích hợp thanh toán VNPay",
    startTime: "2025-09-28T10:00:00Z",
    endTime: "",
    status: "Scheduled",
    meetingType: "offline",
    roomUrl: "",
    location: "Phòng họp C, Tầng 1, Văn phòng MSP",
    participants: ["member-1", "member-4"],
  },
  {
    id: "meeting-4",
    projectId: "1",
    milestoneId: null,
    title: "Họp hàng tuần",
    description: "Họp cập nhật tiến độ dự án hàng tuần",
    startTime: "2025-09-21T09:00:00Z",
    endTime: "2025-09-21T10:00:00Z",
    status: "Finished",
    meetingType: "offline",
    roomUrl: "",
    location: "Phòng họp A, Tầng 3, Văn phòng MSP",
    participants: ["member-1", "member-2", "member-3", "member-4", "member-5"],
  },
];

// Mock participants
export const mockParticipants: Participant[] = [
  {
    id: "4",
    email: "member1@example.com",
    image: "/avatar-3.png",
    role: "Member",
  },
  {
    id: "5",
    email: "member2@example.com",
    image: "/avatar-1.png",
    role: "Member",
  },
  {
    id: "6",
    email: "member3@example.com",
    image: "/avatar-4.png",
    role: "Member",
  },
];

// Helper functions
export const getTasksByStatus = (status: string) => {
  return mockTasks.filter((task) => task.status === status);
};

export const getTasksByAssignee = (assignee: string) => {
  if (assignee === "unassigned") {
    return mockTasks.filter((task) => !task.assignee);
  }
  return mockTasks.filter((task) => task.assignee === assignee);
};

export const getTasksByMilestone = (milestoneId: string) => {
  return mockTasks.filter((task) => task.milestoneIds.includes(milestoneId));
};

// Function to delete task
export const deleteTask = (taskId: string) => {
  const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const deletedTask = mockTasks[taskIndex];

  // Remove task from array
  mockTasks.splice(taskIndex, 1);

  // Remove task from all milestones that reference it
  mockMilestones.forEach((milestone) => {
    if (milestone.tasks.includes(taskId)) {
      milestone.tasks = milestone.tasks.filter((id) => id !== taskId);
    }
  });

  // Remove task from member's tasks
  mockMembers.forEach((member) => {
    if (member.tasks.includes(taskId)) {
      member.tasks = member.tasks.filter((id) => id !== taskId);
    }
  });

  return deletedTask;
};

// Function to update task
export const updateTask = (taskId: string, taskData: any) => {
  const taskIndex = mockTasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const oldTask = mockTasks[taskIndex];
  const oldMilestoneIds = oldTask.milestoneIds || [];
  const newMilestoneIds = taskData.milestoneIds || [];

  // Update task with new data while preserving existing fields
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    ...taskData,
    id: taskId, // Ensure ID doesn't change
  };

  // Update milestone.tasks for milestones that were removed from task
  const removedMilestoneIds = oldMilestoneIds.filter(
    (id) => !newMilestoneIds.includes(id)
  );
  removedMilestoneIds.forEach((milestoneId) => {
    const milestone = mockMilestones.find((m) => m.id === milestoneId);
    if (milestone) {
      milestone.tasks = milestone.tasks.filter((id) => id !== taskId);
    }
  });

  // Update milestone.tasks for milestones that were added to task
  const addedMilestoneIds = newMilestoneIds.filter(
    (id: string) => !oldMilestoneIds.includes(id)
  );
  addedMilestoneIds.forEach((milestoneId: string) => {
    const milestone = mockMilestones.find((m) => m.id === milestoneId);
    if (milestone && !milestone.tasks.includes(taskId)) {
      milestone.tasks.push(taskId);
    }
  });

  // Update member's tasks if assignee changed
  if (oldTask.assignee !== taskData.assignee) {
    // Remove from old assignee
    if (oldTask.assignee) {
      const oldMember = mockMembers.find((m) => m.id === oldTask.assignee);
      if (oldMember) {
        oldMember.tasks = oldMember.tasks.filter((id) => id !== taskId);
      }
    }

    // Add to new assignee
    if (taskData.assignee) {
      const newMember = mockMembers.find((m) => m.id === taskData.assignee);
      if (newMember && !newMember.tasks.includes(taskId)) {
        newMember.tasks.push(taskId);
      }
    }
  }

  return mockTasks[taskIndex];
};

export const getProjectStats = () => {
  const totalTasks = mockTasks.length;
  const completedTasks = getTasksByStatus("done").length;
  const inProgressTasks = getTasksByStatus("in-progress").length;
  const todoTasks = getTasksByStatus("todo").length;
  const reviewTasks = getTasksByStatus("review").length;

  return {
    total: totalTasks,
    completed: completedTasks,
    inProgress: inProgressTasks,
    todo: todoTasks,
    review: reviewTasks,
    completionRate: Math.round((completedTasks / totalTasks) * 100),
  };
};
