"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { mockTasks, mockMembers, mockMilestones, mockProjects, deleteMilestone, updateMilestone, deleteTask, updateTask } from "@/constants/mockData";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { DeleteMilestoneModal } from "@/components/milestones/DeleteMilestoneModal";
import { UpdateMilestoneModal } from "@/components/milestones/UpdateMilestoneModal";
import { DeleteTaskModal } from "@/components/tasks/DeleteTaskModal";
import { DetailTaskModal } from "@/components/tasks/DetailTaskModal";
import { useUser } from "@/hooks/useUser";
import {
  ChevronRight,
  Layers,
  CheckCircle,
  User,
  Star,
  Calendar,
  Edit,
  Trash2,
  Users,
  Plus,
  X
} from "lucide-react";

interface ListTableProps {
  project: Project;
  searchQuery: string;
  statusFilter: string;
  assigneeFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const ListTable = ({
  project,
  searchQuery,
  statusFilter,
  assigneeFilter,
  sortBy,
  sortOrder,
}: ListTableProps) => {
  const { role } = useUser();
  // Get tasks for this specific project based on milestoneIds
  const projectMilestones = mockProjects.find(p => p.id === project.id)?.milestones || [];
  const projectTasks = mockTasks.filter(task =>
    task.milestoneIds.some(milestoneId => projectMilestones.includes(milestoneId))
  );

  const [tasks, setTasks] = useState(projectTasks);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(
    new Set(["milestone-1"]) // Mở milestone đầu tiên mặc định
  );

  // Check if user has permission to create tasks
  const canCreateTask = role && role.toLowerCase() !== 'member';

  // Check if user has permission to edit/delete (non-member roles)
  const canEditDelete = role && role.toLowerCase() !== 'member';
  const [createTaskModal, setCreateTaskModal] = useState<{
    isOpen: boolean;
    milestoneId?: string;
  }>({
    isOpen: false,
    milestoneId: undefined
  });

  const [deleteMilestoneModal, setDeleteMilestoneModal] = useState<{
    isOpen: boolean;
    milestoneId?: string;
    milestoneName?: string;
    taskCount?: number;
  }>({
    isOpen: false,
    milestoneId: undefined,
    milestoneName: undefined,
    taskCount: 0
  });

  const [updateMilestoneModal, setUpdateMilestoneModal] = useState<{
    isOpen: boolean;
    milestone: any;
  }>({
    isOpen: false,
    milestone: null
  });

  const [deleteTaskModal, setDeleteTaskModal] = useState<{
    isOpen: boolean;
    taskId?: string;
    taskTitle?: string;
  }>({
    isOpen: false,
    taskId: undefined,
    taskTitle: undefined
  });


  const [detailTaskModal, setDetailTaskModal] = useState<{
    isOpen: boolean;
    task: any;
  }>({
    isOpen: false,
    task: null
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      // Task status
      case "todo":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "review":
        return "#3b82f6";
      case "done":
        return "#10b981";
      // Milestone status
      case "pending":
        return "#6b7280";
      case "completed":
        return "#10b981";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      // Task status
      case "todo":
        return "#f3f4f6";
      case "in-progress":
        return "#fef3c7";
      case "review":
        return "#dbeafe";
      case "done":
        return "#dcfce7";
      // Milestone status
      case "pending":
        return "#f3f4f6";
      case "completed":
        return "#dcfce7";
      case "overdue":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      // Task status
      case "todo":
        return "Cần làm";
      case "in-progress":
        return "Đang làm";
      case "review":
        return "Đang review";
      case "done":
        return "Hoàn thành";
      // Milestone status
      case "pending":
        return "Chờ thực hiện";
      case "completed":
        return "Hoàn thành";
      case "overdue":
        return "Quá hạn";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityBackgroundColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#fee2e2";
      case "medium":
        return "#fef3c7";
      case "low":
        return "#dcfce7";
      default:
        return "#f3f4f6";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
    }
  };

  // Helper function to get member name by ID
  const getMemberName = (memberId: string) => {
    const member = mockMembers.find(m => m.id === memberId);
    return member ? member.name : memberId;
  };

  // Helper function to get milestone names by IDs
  const getMilestoneNames = (milestoneIds: string[]) => {
    return milestoneIds.map(id => {
      const milestone = mockMilestones.find(m => m.id === id);
      return milestone ? milestone.name : id;
    }).join(", ");
  };

  // Helper function to toggle milestone expansion
  const toggleMilestone = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  // Helper function to open create task modal
  const openCreateTaskModal = (milestoneId?: string) => {
    setCreateTaskModal({
      isOpen: true,
      milestoneId
    });
  };

  // Helper function to close create task modal
  const closeCreateTaskModal = () => {
    setCreateTaskModal({
      isOpen: false,
      milestoneId: undefined
    });
  };

  // Helper function to open delete milestone modal
  const openDeleteMilestoneModal = (milestoneId: string, milestoneName: string, taskCount: number) => {
    setDeleteMilestoneModal({
      isOpen: true,
      milestoneId,
      milestoneName,
      taskCount
    });
  };

  // Helper function to close delete milestone modal
  const closeDeleteMilestoneModal = () => {
    setDeleteMilestoneModal({
      isOpen: false,
      milestoneId: undefined,
      milestoneName: undefined,
      taskCount: 0
    });
  };

  // Helper function to open update milestone modal
  const openUpdateMilestoneModal = (milestone: any) => {
    setUpdateMilestoneModal({
      isOpen: true,
      milestone
    });
  };

  // Helper function to close update milestone modal
  const closeUpdateMilestoneModal = () => {
    setUpdateMilestoneModal({
      isOpen: false,
      milestone: null
    });
  };

  // Helper function to handle milestone deletion
  const handleDeleteMilestone = () => {
    if (!deleteMilestoneModal.milestoneId) return;

    try {
      deleteMilestone(deleteMilestoneModal.milestoneId);

      // Remove from expanded milestones if it was expanded
      const newExpanded = new Set(expandedMilestones);
      newExpanded.delete(deleteMilestoneModal.milestoneId);
      setExpandedMilestones(newExpanded);

      closeDeleteMilestoneModal();
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Có lỗi xảy ra khi xóa cột mốc. Vui lòng thử lại!');
    }
  };

  // Helper function to handle milestone update
  const handleUpdateMilestone = (milestoneData: any) => {
    try {
      updateMilestone(milestoneData.id, milestoneData);
      closeUpdateMilestoneModal();
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Có lỗi xảy ra khi cập nhật cột mốc. Vui lòng thử lại!');
    }
  };

  // Helper function to handle task creation
  const handleCreateTask = (taskData: any) => {
    // Generate unique ID
    const existingIds = tasks.map(task => task.id);
    let newId = `MWA-${tasks.length + 1}`;
    let counter = 1;
    while (existingIds.includes(newId)) {
      newId = `MWA-${tasks.length + 1 + counter}`;
      counter++;
    }

    const newTask = {
      ...taskData,
      id: newId
    };

    setTasks(prevTasks => [...prevTasks, newTask]);

    // Update milestone tasks for all selected milestones
    if (taskData.milestoneIds && taskData.milestoneIds.length > 0) {
      taskData.milestoneIds.forEach((milestoneId: string) => {
        const milestone = mockMilestones.find(m => m.id === milestoneId);
        if (milestone && !milestone.tasks.includes(newTask.id)) {
          milestone.tasks.push(newTask.id);
        }
      });
    }
  };

  // Helper function to open delete task modal
  const openDeleteTaskModal = (taskId: string, taskTitle: string) => {
    setDeleteTaskModal({
      isOpen: true,
      taskId,
      taskTitle
    });
  };

  // Helper function to close delete task modal
  const closeDeleteTaskModal = () => {
    setDeleteTaskModal({
      isOpen: false,
      taskId: undefined,
      taskTitle: undefined
    });
  };

  // Helper function to handle task deletion
  const handleDeleteTask = () => {
    if (!deleteTaskModal.taskId) return;

    try {
      deleteTask(deleteTaskModal.taskId);

      // Update local tasks state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== deleteTaskModal.taskId));

      closeDeleteTaskModal();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Có lỗi xảy ra khi xóa công việc. Vui lòng thử lại!');
    }
  };

  // Helper function to handle task update
  const handleUpdateTask = (taskData: any) => {
    try {
      updateTask(taskData.id, taskData);

      // Update local tasks state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskData.id ? { ...task, ...taskData } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Có lỗi xảy ra khi cập nhật công việc. Vui lòng thử lại!');
    }
  };

  // Helper function to open detail task modal
  const openDetailTaskModal = (task: any) => {
    setDetailTaskModal({
      isOpen: true,
      task
    });
  };

  // Helper function to close detail task modal
  const closeDetailTaskModal = () => {
    setDetailTaskModal({
      isOpen: false,
      task: null
    });
  };

  // Helper function to get milestone progress
  const getMilestoneProgress = (milestoneId: string) => {
    const milestoneTasks = tasks.filter(task =>
      task.milestoneIds.includes(milestoneId)
    );
    if (milestoneTasks.length === 0) return 0;

    const completedTasks = milestoneTasks.filter(task => task.status === "done").length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  };

  // Helper function to get milestone status
  const getMilestoneStatus = (milestoneId: string) => {
    const milestone = mockMilestones.find(m => m.id === milestoneId);
    if (!milestone) return "pending";

    const progress = getMilestoneProgress(milestoneId);
    const dueDate = new Date(milestone.dueDate);
    const today = new Date();

    if (progress === 100) return "completed";
    if (progress > 0) return "in-progress";
    if (today > dueDate) return "overdue";
    return "pending";
  };

  // Create hierarchical data structure
  const createHierarchicalData = () => {
    // Filter milestones for this specific project
    const projectMilestones = mockMilestones.filter(milestone =>
      milestone.projectId === project.id
    );

    const filteredMilestones = projectMilestones.map(milestone => {
      const milestoneTasks = tasks.filter(task =>
        task.milestoneIds.includes(milestone.id)
      );

      // Filter tasks within milestone
      const filteredTasks = milestoneTasks.filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          milestone.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || task.status === statusFilter;

        const matchesAssignee =
          assigneeFilter === "all" ||
          (assigneeFilter === "unassigned" && !task.assignee) ||
          task.assignee === assigneeFilter;

        return matchesSearch && matchesStatus && matchesAssignee;
      });

      // Sort tasks
      const sortedTasks = filteredTasks.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a];
        let bValue: any = b[sortBy as keyof typeof b];

        if (sortBy === "endDate" || sortBy === "startDate") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (sortBy === "assignee") {
          aValue = getMemberName(aValue || "").toLowerCase();
          bValue = getMemberName(bValue || "").toLowerCase();
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      return {
        ...milestone,
        tasks: sortedTasks,
        progress: getMilestoneProgress(milestone.id),
        status: getMilestoneStatus(milestone.id)
      };
    });

    // Get tasks without milestones
    const tasksWithoutMilestones = tasks.filter(task =>
      !task.milestoneIds || task.milestoneIds.length === 0
    );

    // Filter tasks without milestones
    const filteredTasksWithoutMilestones = tasksWithoutMilestones.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" && !task.assignee) ||
        task.assignee === assigneeFilter;

      return matchesSearch && matchesStatus && matchesAssignee;
    });

    // Sort tasks without milestones
    const sortedTasksWithoutMilestones = filteredTasksWithoutMilestones.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === "endDate" || sortBy === "startDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === "assignee") {
        aValue = getMemberName(aValue || "").toLowerCase();
        bValue = getMemberName(bValue || "").toLowerCase();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Return milestones and unassigned tasks separately
    return {
      milestones: filteredMilestones.filter(milestone =>
        // Only show milestones that have matching tasks or match search
        milestone.tasks.length > 0 ||
        milestone.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      unassignedTasks: sortedTasksWithoutMilestones
    };
  };

  const hierarchicalData = createHierarchicalData();

  return (
    <div className="milestone-list">
      <div className="milestone-header">
        <div className="header-title">
          <h2>Danh sách các cột mốc và công việc</h2>
          <p>Tổng cộng {tasks.length} công việc</p>
        </div>
        {canCreateTask && (
          <button
            className="create-task-header-btn"
            onClick={() => openCreateTaskModal()}
            title="Tạo công việc mới"
          >
            <Plus size={14} />
            Tạo công việc mới
          </button>
        )}
      </div>
      <div className="milestone-container">
        {/* Unassigned Tasks - Same level as milestones */}
        {hierarchicalData.unassignedTasks.map((task) => (
          <div key={task.id} className="task-item">
            <div className="task-card-full" onClick={() => openDetailTaskModal(task)}>
              <div className="task-header-full">
                <div className="task-icon">
                  <CheckCircle size={16} />
                </div>
                <div className="task-info-full">
                  <div className="task-id-modern">{task.id}</div>
                  <div className="task-name-modern">{task.title}</div>
                  <div className="task-description-modern">{task.description}</div>
                </div>
                <div className="task-stats">
                  <div className="status-badge-full">
                    <span
                      className="status-badge-modern"
                      style={{
                        background: `linear-gradient(135deg, ${getStatusColor(task.status)}20, ${getStatusColor(task.status)}10)`,
                        color: getStatusColor(task.status),
                        borderColor: getStatusColor(task.status),
                      }}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  <div className="assignee-info-full">
                    {task.assignee ? (
                      <div className="assignee-modern">
                        <div className="assignee-avatar-modern">
                          <span>{getMemberName(task.assignee).charAt(0)}</span>
                        </div>
                        <span className="assignee-name">{getMemberName(task.assignee)}</span>
                      </div>
                    ) : (
                      <div className="unassigned-modern">
                        <div className="unassigned-icon">
                          <User size={16} />
                        </div>
                        <span className="unassigned-text">Chưa giao</span>
                      </div>
                    )}
                  </div>
                  <div className="task-dates">
                    <div className="date-info-modern">
                      <div className="date-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M8 2V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 2V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3 10H21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="date-text">
                        <span className="date-label">Bắt đầu</span>
                        <span className="date-value">
                          {task.startDate
                            ? new Date(task.startDate).toLocaleDateString("vi-VN")
                            : "Chưa có"}
                        </span>
                      </div>
                    </div>
                    <div className="date-info-modern">
                      <div className="date-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M8 2V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 2V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3 10H21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="date-text">
                        <span className="date-label">Kết thúc</span>
                        <span className="date-value">
                          {task.endDate
                            ? new Date(task.endDate).toLocaleDateString("vi-VN")
                            : "Chưa có"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="action-buttons-modern">
                    {canEditDelete && (
                      <button
                        className="action-btn-modern edit-btn"
                        title="Chỉnh sửa"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailTaskModal(task);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {canEditDelete && (
                      <button
                        className="action-btn-modern delete-btn"
                        title="Xóa"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteTaskModal(task.id, task.title);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Milestones */}
        {hierarchicalData.milestones.map((milestone) => (
          <div key={milestone.id} className="milestone-item">
            {/* Milestone Card */}
            <div className="milestone-card-full">
              <div className="milestone-header-full">
                <button
                  className="expand-btn-modern"
                  onClick={() => toggleMilestone(milestone.id)}
                >
                  <div className="expand-icon">
                    <ChevronRight
                      size={20}
                      style={{
                        transform: expandedMilestones.has(milestone.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </div>
                </button>
                <div className="milestone-icon">
                  <Layers size={24} />
                </div>
                <div className="milestone-info-full">
                  <div className="milestone-name">{milestone.name}</div>
                  <div className="milestone-description">{milestone.description}</div>
                  <div className="milestone-meta">
                    <span className="task-count">{milestone.tasks.length} tasks</span>
                    <div className="milestone-due">
                      <Calendar size={12} />
                      <span>{new Date(milestone.dueDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </div>
                <div className="milestone-stats">
                  <div className="status-badge-full">
                    <span
                      className="milestone-status-badge-modern"
                      style={{
                        background: `linear-gradient(135deg, ${getStatusColor(milestone.status)}20, ${getStatusColor(milestone.status)}10)`,
                        color: getStatusColor(milestone.status),
                        borderColor: getStatusColor(milestone.status),
                      }}
                    >
                      {getStatusLabel(milestone.status)}
                    </span>
                  </div>
                  <div className="progress-container-full">
                    <div className="progress-header">
                      <span className="progress-label">Tiến độ</span>
                      <span className="progress-percentage">{milestone.progress}%</span>
                    </div>
                    <div className="progress-bar-modern">
                      <div
                        className="progress-fill-modern"
                        style={{
                          width: `${milestone.progress}%`,
                          background: `linear-gradient(90deg, #ff8c42 0%, #ff6b1a 100%)`
                        }}
                      ></div>
                      <div className="progress-glow" style={{ width: `${milestone.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="milestone-actions">
                    {canEditDelete && (
                      <button
                        className="action-btn-modern edit-btn"
                        title="Chỉnh sửa Milestone"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUpdateMilestoneModal(milestone);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {canEditDelete && (
                      <button
                        className="action-btn-modern delete-btn"
                        title="Xóa Milestone"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteMilestoneModal(milestone.id, milestone.name, milestone.tasks.length);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Task List - Outside milestone card */}
            {expandedMilestones.has(milestone.id) && (
              <div className="task-list">
                {milestone.tasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-card-full" onClick={() => openDetailTaskModal(task)}>
                      <div className="task-header-full">
                        <div className="task-icon">
                          <CheckCircle size={16} />
                        </div>
                        <div className="task-info-full">
                          <div className="task-id-modern">{task.id}</div>
                          <div className="task-name-modern">{task.title}</div>
                          <div className="task-description-modern">{task.description}</div>
                        </div>
                        <div className="task-stats">
                          <div className="status-badge-full">
                            <span
                              className="status-badge-modern"
                              style={{
                                background: `linear-gradient(135deg, ${getStatusColor(task.status)}20, ${getStatusColor(task.status)}10)`,
                                color: getStatusColor(task.status),
                                borderColor: getStatusColor(task.status),
                              }}
                            >
                              {getStatusLabel(task.status)}
                            </span>
                          </div>
                          <div className="assignee-info-full">
                            {task.assignee ? (
                              <div className="assignee-modern">
                                <div className="assignee-avatar-modern">
                                  <span>{getMemberName(task.assignee).charAt(0)}</span>
                                </div>
                                <span className="assignee-name">{getMemberName(task.assignee)}</span>
                              </div>
                            ) : (
                              <div className="unassigned-modern">
                                <div className="unassigned-icon">
                                  <User size={16} />
                                </div>
                                <span className="unassigned-text">Chưa giao</span>
                              </div>
                            )}
                          </div>
                          <div className="task-dates">
                            <div className="date-info-modern">
                              <div className="date-icon">
                                <Calendar size={12} />
                              </div>
                              <div className="date-text">
                                <span className="date-label">Bắt đầu</span>
                                <span className="date-value">
                                  {task.startDate
                                    ? new Date(task.startDate).toLocaleDateString("vi-VN")
                                    : "Chưa có"}
                                </span>
                              </div>
                            </div>
                            <div className="date-info-modern">
                              <div className="date-icon">
                                <Calendar size={12} />
                              </div>
                              <div className="date-text">
                                <span className="date-label">Kết thúc</span>
                                <span className="date-value">
                                  {task.endDate
                                    ? new Date(task.endDate).toLocaleDateString("vi-VN")
                                    : "Chưa có"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="action-buttons-modern">
                            {canEditDelete && (
                              <button
                                className="action-btn-modern edit-btn"
                                title="Chỉnh sửa"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetailTaskModal(task);
                                }}
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {canEditDelete && (
                              <button
                                className="action-btn-modern delete-btn"
                                title="Xóa"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteTaskModal(task.id, task.title);
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createTaskModal.isOpen}
        onClose={closeCreateTaskModal}
        milestoneId={createTaskModal.milestoneId}
        onCreateTask={handleCreateTask}
      />

      {/* Delete Milestone Modal */}
      <DeleteMilestoneModal
        isOpen={deleteMilestoneModal.isOpen}
        onClose={closeDeleteMilestoneModal}
        onConfirm={handleDeleteMilestone}
        milestoneName={deleteMilestoneModal.milestoneName || ""}
        taskCount={deleteMilestoneModal.taskCount || 0}
      />

      {/* Update Milestone Modal */}
      <UpdateMilestoneModal
        isOpen={updateMilestoneModal.isOpen}
        onClose={closeUpdateMilestoneModal}
        onUpdateMilestone={handleUpdateMilestone}
        milestone={updateMilestoneModal.milestone}
      />

      {/* Delete Task Modal */}
      <DeleteTaskModal
        isOpen={deleteTaskModal.isOpen}
        onClose={closeDeleteTaskModal}
        onConfirm={handleDeleteTask}
        taskTitle={deleteTaskModal.taskTitle || ""}
        taskId={deleteTaskModal.taskId || ""}
      />


      {/* Detail Task Modal */}
      <DetailTaskModal
        isOpen={detailTaskModal.isOpen}
        onClose={closeDetailTaskModal}
        onEdit={handleUpdateTask}
        onDelete={openDeleteTaskModal}
        task={detailTaskModal.task}
      />

      <style jsx>{`
        .milestone-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 0; /* Allow flex item to shrink */
          min-height: 0; /* Allow flex item to shrink */
          height: 100%; /* Ensure full height */
          max-height: 100vh; /* Prevent overflow beyond viewport */
        }

        .milestone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 12px 12px 0 0;
          min-width: 0; /* Allow header to shrink */
        }

        .header-title h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .header-title p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .create-task-header-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: white;
          color: #ff8c42;
          border: 2px solid #ff8c42;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.2);
          white-space: nowrap; /* Prevent button text from wrapping */
        }

        .create-task-header-btn:hover {
          transform: translateY(-1px);
          background: #ff8c42;
          color: white;
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.4);
        }

        .milestone-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0; /* Allow container to shrink */
          min-height: 0; /* Allow container to shrink */
          height: 0; /* Force flex item to respect parent height */
          max-height: calc(100vh - 200px); /* Reserve space for header and padding */
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: #cbd5e1 #f1f5f9; /* Firefox */
          position: relative; /* Ensure proper stacking context */
        }

        /* Webkit scrollbar styling */
        .milestone-container::-webkit-scrollbar {
          width: 8px;
        }

        .milestone-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .milestone-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .milestone-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }


        .milestone-item {
          background: transparent;
          border-radius: 16px;
          overflow: visible;
          transition: all 0.3s ease;
          min-width: 0; /* Allow milestone item to shrink */
          margin-bottom: 16px;
          position: relative; /* Ensure proper stacking */
          z-index: 1; /* Ensure proper layering */
        }

        .milestone-item:hover .milestone-card-full {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .milestone-card-full {
          background: linear-gradient(135deg, #fff8f0 0%, #ffede0 100%);
          border-left: 3px solid #ff8c42;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: visible; /* Allow content to be visible */
          transition: all 0.3s ease;
        }

        .milestone-header-full {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: visible; /* Allow content to be visible */
        }

        .milestone-info-full {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0; /* Allow text to shrink */
        }

        .milestone-stats {
          display: grid;
          grid-template-columns: 120px 200px auto;
          gap: 20px;
          align-items: center;
          min-width: 450px;
          overflow: visible; /* Allow content to be visible */
        }

        .status-badge-full,
        .priority-badge-full {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          overflow: hidden; /* Prevent badges from overflowing */
        }

        .progress-container-full {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 120px;
          width: 100%;
          overflow: hidden; /* Prevent progress container from overflowing */
        }

        .milestone-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0; /* Prevent actions from shrinking */
          overflow: hidden; /* Prevent milestone actions from overflowing */
        }

        .task-list {
          padding: 16px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: visible; /* Allow task list to be visible */
          margin-top: 16px;
          border-top: 1px solid #e2e8f0;
          position: relative; /* Ensure proper positioning */
          z-index: 2; /* Ensure tasks appear above milestone cards */
        }

        .task-item {
          position: relative;
          overflow: visible; /* Allow task item to be visible */
          z-index: 3; /* Ensure task items appear above everything */
        }

        .task-card-full {
          background: white;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          overflow: visible; /* Allow task card to be visible */
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          margin-left: 16px;

        }

        .task-card-full:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .task-header-full {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: visible; /* Allow content to be visible */
        }

        .task-info-full {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0; /* Allow text to shrink */
        }

        .task-stats {
          display: grid;
          grid-template-columns: 120px 150px 140px 100px;
          gap: 16px;
          align-items: center;
          min-width: 520px;
          overflow: visible; /* Allow content to be visible */
        }

        .status-badge-full {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .assignee-info-full {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          overflow: hidden; /* Prevent assignee info from overflowing */
        }

        .task-progress-modern {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          overflow: hidden; /* Prevent task progress from overflowing */
        }

        .task-dates {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 120px;
          width: 100%;
          overflow: hidden; /* Prevent task dates from overflowing */
        }

        .action-buttons-modern {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          width: 100%;
          flex-shrink: 0; /* Prevent action buttons from shrinking */
          overflow: hidden; /* Prevent action buttons from overflowing */
        }


        /* Milestone Card */
        .milestone-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          overflow: hidden; /* Prevent milestone card from overflowing */
        }

        .milestone-header {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden; /* Prevent milestone header from overflowing */
        }

        .expand-btn-modern {
          width: 32px;
          height: 32px;
          border: none;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
          flex-shrink: 0; /* Prevent expand button from shrinking */
        }

        .expand-btn-modern:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 140, 66, 0.4);
          flex-shrink: 0; /* Prevent expand button hover from shrinking */
        }

        .expand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden; /* Prevent expand icon from overflowing */
        }

        .milestone-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.3);
          flex-shrink: 0; /* Prevent milestone icon from shrinking */
        }

        .milestone-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0; /* Allow milestone info to shrink */
        }

        .milestone-name {
          font-weight: 800;
          color: #1e293b;
          font-size: 16px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .milestone-description {
          font-size: 13px;
          color: #64748b;
          line-height: 1.4;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .milestone-meta {
          display: flex;
          gap: 16px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .task-count {
          font-size: 11px;
          color: #ff8c42;
          background: #fff8f0;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .milestone-due {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Status Badges */
        .status-container {
          display: flex;
          justify-content: center;
          overflow: hidden; /* Prevent status container from overflowing */
        }

        .milestone-status-badge-modern,
        .status-badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          border: 1px solid;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0; /* Prevent status dot from shrinking */
        }

        /* Assignee Modern */
        .milestone-assignee-modern,
        .assignee-modern {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden; /* Prevent assignee modern from overflowing */
        }

        .assignee-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0; /* Prevent assignee icon from shrinking */
        }

        .assignee-avatar-modern {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(251, 146, 60, 0.3);
          flex-shrink: 0; /* Prevent assignee avatar from shrinking */
        }

        .assignee-info {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 0; /* Allow text to shrink */
        }

        .assignee-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .assignee-role {
          font-size: 11px;
          color: #64748b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .unassigned-modern {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden; /* Prevent unassigned modern from overflowing */
        }

        .unassigned-icon {
          width: 24px;
          height: 24px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          flex-shrink: 0; /* Prevent unassigned icon from shrinking */
        }

        .unassigned-text {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
          font-style: italic;
        }

        /* Priority Modern */
        .milestone-priority-modern,
        .priority-container {
          display: flex;
          justify-content: center;
          overflow: hidden; /* Prevent priority container from overflowing */
        }

        .priority-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0; /* Prevent priority icon from shrinking */
        }

        .priority-badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0; /* Prevent priority dot from shrinking */
        }

        /* Progress Modern */
        .progress-container-modern {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0; /* Allow progress container to shrink */
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-width: 0; /* Allow progress header to shrink */
        }

        .progress-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .progress-percentage {
          font-size: 12px;
          color: #1e293b;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .progress-bar-modern {
          position: relative;
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          min-width: 0; /* Allow progress bar to shrink */
        }

        .progress-fill-modern {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Task Progress Circle */
        .task-progress-modern {
          display: flex;
          justify-content: center;
        }

        .progress-circle {
          position: relative;
          width: 40px;
          height: 40px;
          flex-shrink: 0; /* Prevent progress circle from shrinking */
        }

        .progress-text-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 700;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Date Info Modern */
        .date-info-modern {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden; /* Prevent date info modern from overflowing */
        }

        .date-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0; /* Prevent date icon from shrinking */
        }

        .date-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0; /* Allow date text to shrink */
        }

        .date-label {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .date-value {
          font-size: 12px;
          color: #1e293b;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Task Card */
        .task-card {
          background: white;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden; /* Prevent task card from overflowing */
        }

        .task-header {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden; /* Prevent task header from overflowing */
        }

        .task-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          flex-shrink: 0; /* Prevent task icon from shrinking */
        }

        .task-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0; /* Allow task info to shrink */
        }

        .task-id-modern {
          font-size: 10px;
          color: #ff8c42;
          font-weight: 700;
          letter-spacing: 0.5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-name-modern {
          font-weight: 700;
          color: #1e293b;
          font-size: 13px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-description-modern {
          font-size: 12px;
          color: #64748b;
          line-height: 1.4;
          max-width: 280px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-word;
        }

        /* Action Buttons Modern */
        .action-buttons-modern {
          display: flex;
          gap: 6px;
          justify-content: center;
          overflow: hidden; /* Prevent action buttons modern from overflowing */
        }

        .action-btn-modern {
          width: 32px;
          height: 32px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0; /* Prevent action button from shrinking */
        }

        .action-btn-modern.create-task-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          flex-shrink: 0; /* Prevent create task button from shrinking */
        }

        .action-btn-modern.create-task-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
          flex-shrink: 0; /* Prevent create task button hover from shrinking */
        }

        .action-btn-modern.edit-btn {
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.3);
          flex-shrink: 0; /* Prevent edit button from shrinking */
        }

        .action-btn-modern.edit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.4);
          flex-shrink: 0; /* Prevent edit button hover from shrinking */
        }

        .action-btn-modern.delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
          flex-shrink: 0; /* Prevent delete button from shrinking */
        }

        .action-btn-modern.delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
          flex-shrink: 0; /* Prevent delete button hover from shrinking */
        }

        /* Responsive Design */
        
        /* Large Desktop (1200px+) */
        @media (min-width: 1200px) {
          .milestone-stats {
            grid-template-columns: 140px 220px auto;
            gap: 24px;
          }

          .task-stats {
            grid-template-columns: 140px 170px 160px 120px;
            gap: 20px;
          }
        }

        /* Desktop (1024px - 1199px) */
        @media (max-width: 1199px) and (min-width: 1024px) {
          .milestone-stats {
            grid-template-columns: 120px 200px auto;
            gap: 20px;
          }

          .task-stats {
            grid-template-columns: 120px 150px 140px 100px;
            gap: 16px;
          }
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 768px) {
          .milestone-header {
            padding: 16px 20px;
          }

          .milestone-container {
            padding: 16px;
            gap: 12px;
            max-height: calc(100vh - 180px); /* Adjust for smaller header */
          }

          .milestone-stats {
            grid-template-columns: 100px 160px auto;
            gap: 16px;
            min-width: auto;
          }

          .task-stats {
            grid-template-columns: 100px 120px 120px 80px;
            gap: 12px;
            min-width: auto;
          }

          .milestone-card-full,
          .task-card-full {
            padding: 16px;
          }

          .milestone-header-full,
          .task-header-full {
            gap: 12px;
          }

          .milestone-name {
            font-size: 15px;
          }

          .task-name-modern {
            font-size: 13px;
          }

          .task-description-modern {
            font-size: 11px;
            max-width: 200px;
          }

          .progress-circle {
            width: 36px;
            height: 36px;
          }

          .progress-text-circle {
            font-size: 9px;
          }

          .task-dates {
            min-width: 100px;
          }
        }

        /* Mobile Large (481px - 767px) */
        @media (max-width: 767px) and (min-width: 481px) {
          .milestone-header {
            padding: 12px 16px;
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .header-title h2 {
            font-size: 18px;
          }

          .create-task-header-btn {
            padding: 10px 16px;
            font-size: 13px;
          }

          .milestone-container {
            padding: 12px;
            gap: 10px;
            max-height: calc(100vh - 160px); /* Adjust for mobile header */
          }

          .milestone-stats {
            grid-template-columns: 1fr;
            gap: 12px;
            min-width: auto;
          }

          .task-stats {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            min-width: auto;
          }

          .milestone-card-full,
          .task-card-full {
            padding: 12px;
          }

          .milestone-header-full,
          .task-header-full {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .milestone-info-full,
          .task-info-full {
            width: 100%;
          }

          .milestone-name {
            font-size: 14px;
          }

          .task-name-modern {
            font-size: 13px;
          }

          .task-description-modern {
            font-size: 11px;
            max-width: none;
          }

          .progress-circle {
            width: 32px;
            height: 32px;
          }

          .progress-text-circle {
            font-size: 8px;
          }

          .milestone-icon,
          .task-icon {
            width: 32px;
            height: 32px;
          }

          .assignee-avatar-modern {
            width: 28px;
            height: 28px;
            font-size: 11px;
          }

          .action-btn-modern {
            width: 28px;
            height: 28px;
          }

          .task-dates {
            min-width: auto;
            flex-direction: row;
            gap: 8px;
          }

          .date-info-modern {
            flex: 1;
          }

          .expand-btn-modern {
            width: 28px;
            height: 28px;
          }
        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .milestone-header {
            padding: 10px 12px;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .header-title h2 {
            font-size: 16px;
          }

          .header-title p {
            font-size: 12px;
          }

          .create-task-header-btn {
            padding: 8px 12px;
            font-size: 12px;
            width: 100%;
            justify-content: center;
          }

          .milestone-container {
            padding: 8px;
            gap: 8px;
            max-height: calc(100vh - 140px); /* Adjust for small mobile header */
          }

          .milestone-stats {
            grid-template-columns: 1fr;
            gap: 8px;
            min-width: auto;
          }

          .task-stats {
            grid-template-columns: 1fr;
            gap: 8px;
            min-width: auto;
          }

          .milestone-card-full,
          .task-card-full {
            padding: 10px;
          }

          .milestone-header-full,
          .task-header-full {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .milestone-info-full,
          .task-info-full {
            width: 100%;
          }

          .milestone-name {
            font-size: 13px;
          }

          .task-name-modern {
            font-size: 12px;
          }

          .task-description-modern {
            font-size: 10px;
            max-width: none;
          }

          .progress-circle {
            width: 28px;
            height: 28px;
          }

          .progress-text-circle {
            font-size: 7px;
          }

          .milestone-icon,
          .task-icon {
            width: 28px;
            height: 28px;
          }

          .assignee-avatar-modern {
            width: 24px;
            height: 24px;
            font-size: 10px;
          }

          .action-btn-modern {
            width: 24px;
            height: 24px;
          }

          .expand-btn-modern {
            width: 24px;
            height: 24px;
          }

          .task-dates {
            min-width: auto;
            flex-direction: column;
            gap: 4px;
          }

          .date-info-modern {
            flex: none;
          }

          .status-badge-modern,
          .priority-badge-modern,
          .milestone-status-badge-modern {
            font-size: 10px;
            padding: 6px 8px;
          }

          .assignee-name {
            font-size: 11px;
          }

          .assignee-role {
            font-size: 9px;
          }

          .progress-label {
            font-size: 9px;
          }

          .progress-percentage {
            font-size: 10px;
          }

          .date-label {
            font-size: 8px;
          }

          .date-value {
            font-size: 10px;
          }

          .task-count {
            font-size: 9px;
            padding: 1px 6px;
          }

          .milestone-due {
            font-size: 9px;
            gap: 2px;
          }
        }

        /* Extra Small Mobile (max-width: 320px) */
        @media (max-width: 320px) {
          .milestone-header {
            padding: 8px 10px;
          }

          .milestone-container {
            padding: 6px;
            gap: 6px;
          }

          .milestone-card-full,
          .task-card-full {
            padding: 8px;
          }

          .header-title h2 {
            font-size: 14px;
          }

          .milestone-name {
            font-size: 12px;
          }

          .task-name-modern {
            font-size: 11px;
          }

          .task-description-modern {
            font-size: 9px;
          }

          .progress-circle {
            width: 24px;
            height: 24px;
          }

          .progress-text-circle {
            font-size: 6px;
          }

          .milestone-icon,
          .task-icon {
            width: 24px;
            height: 24px;
          }

          .assignee-avatar-modern {
            width: 20px;
            height: 20px;
            font-size: 8px;
          }

          .action-btn-modern {
            width: 20px;
            height: 20px;
          }

          .expand-btn-modern {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};
