import { useState, useEffect, useCallback } from "react";
import { Project } from "@/types/project";
import { TaskListHeader } from "./TaskListHeader";
import { Trash2, Eye, Edit, MoreVertical, UserPlus } from "lucide-react";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { GetTaskResponse } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import Pagination from "@/components/ui/Pagination";
import { TaskStatus, getTaskStatusLabel, getTaskStatusColor } from "@/constants/status";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import "@/app/styles/project-task-table.scss";
import { formatDate } from "@/lib/formatDate";
import { toast } from "react-toastify";

interface ProjectTaskTableProps {
  project: Project;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
  onDeleteTask?: (taskId: string, taskTitle: string) => void;
  onEditTask?: (task: any) => void;
  refreshKey?: number;
  readOnly?: boolean;
}

// Calculate overdue days
const calculateOverdueDays = (endDate: string, status: string): number => {
  if (!endDate || status === 'Done' || status === 'Cancelled') {
    return 0;
  }
  
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - end.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

export const ProjectTaskTable = ({
  project,
  onTaskClick,
  onCreateTask,
  onDeleteTask,
  onEditTask,
  refreshKey = 0,
  readOnly = false,
}: ProjectTaskTableProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  
  // Filter states for members (removed "all" from filterType)
  const [filterType, setFilterType] = useState<"my" | "status" | "dueDate">("my");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState<"overdue" | "today" | "week" | "all">("all");
  
  // PM filter states (multi-select)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState<string>("");
  const [dateRangeEnd, setDateRangeEnd] = useState<string>("");
  const [quickFilter, setQuickFilter] = useState<"all" | "overdue" | "readyToReview" | null>(null);
  
  // State for tasks and members
  const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Pagination state for each group
  const [groupPages, setGroupPages] = useState<Record<string, number>>({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GetTaskResponse | null>(null);

  // Create task modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Confirm delete state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  const projectId = project?.id?.toString();
  const userRole = user?.role;
  const userId = user?.userId;
  // Check if user is Member (Member can reassign tasks, but cannot create/delete)
  const isMember = userRole === UserRole.MEMBER || userRole === 'Member';
  const isProjectManager = userRole === UserRole.PROJECT_MANAGER || userRole === 'ProjectManager' || 
                           userRole === UserRole.BUSINESS_OWNER || userRole === 'BusinessOwner' ||
                           userRole === UserRole.ADMIN || userRole === 'Admin';



  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!projectId || !userRole || !userId) {
      setIsLoadingTasks(false);
      return;
    }

    setIsLoadingTasks(true);
    try {
      let allTasks: GetTaskResponse[] = [];
      
      // ProjectManager & BusinessOwner: Get all tasks in project
      // Member: Get only tasks assigned to this user in project
      if (userRole === UserRole.PROJECT_MANAGER || userRole === 'ProjectManager' || 
          userRole === UserRole.BUSINESS_OWNER || userRole === 'BusinessOwner') {
        // Fetch all pages from API
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
          const response = await taskService.getTasksByProjectId(projectId, {
            pageIndex: currentPage,
            pageSize: 100
          });
          
          if (response.success && response.data) {
            const items = response.data.items || [];
            allTasks = [...allTasks, ...items];
            
            // Check if there are more pages
            const totalItems = response.data.totalItems || 0;
            hasMorePages = allTasks.length < totalItems;
            currentPage++;
          } else {
            hasMorePages = false;
          }
        }
      } else {
        // For members, fetch their assigned tasks with pagination
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages) {
          const response = await taskService.getTasksByUserIdAndProjectId(userId, projectId, {
            pageIndex: currentPage,
            pageSize: 100
          });
          
          if (response.success && response.data) {
            const items = response.data.items || [];
            allTasks = [...allTasks, ...items];
            
            // Check if there are more pages
            const totalItems = response.data.totalItems || 0;
            hasMorePages = allTasks.length < totalItems;
            currentPage++;
          } else {
            hasMorePages = false;
          }
        }
      }
      
      setTasks(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [projectId, userRole, userId, refreshKey]); // Add refreshKey to dependencies

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) {
        setIsLoadingMembers(false);
        return;
      }

      setIsLoadingMembers(true);
      try {
        const response = await projectService.getProjectMembers(projectId);
        
        if (response.success && response.data) {
          // Transform to simple format for display
          const transformedMembers = response.data
            .filter((pm: any) => pm.member)
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
              role: pm.member.role
            }));
          
          setMembers(transformedMembers);
        } else {
          setMembers([]);
        }
      } catch (error) {
        setMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  // Create member map for quick lookup
  const memberMap = Object.fromEntries(
    members.map((m) => [m.id, m.name])
  );

  // Filter tasks by search query and filters
  const filteredTasks = tasks.filter((task) => {
    // Search query filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    // For members: allow both single-select member filters OR PM-style multi-filters.
    if (isMember) {
      // If PM-style filters are used by the header (selectedStatuses/dateRange/quickFilter), prefer them
      const usingPmStyleFilters = (selectedStatuses && selectedStatuses.length > 0) || dateRangeStart || dateRangeEnd || (quickFilter && quickFilter !== 'all');

      if (usingPmStyleFilters) {
        // Quick filter (overrides other filters when not null or "all")
        if (quickFilter && quickFilter !== "all") {
          if (quickFilter === "overdue") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endDate = task.endDate ? new Date(task.endDate) : null;
            if (!endDate) return false;
            endDate.setHours(0, 0, 0, 0);
            if (endDate >= today || task.status === 'Done' || task.status === 'Cancelled') return false;
          } else if (quickFilter === "readyToReview") {
            if (task.status !== 'ReadyToReview') return false;
          }
        }

        // Status filter (if any selected)
        if (selectedStatuses && selectedStatuses.length > 0) {
          if (!selectedStatuses.includes(task.status)) return false;
        }

        // Date range filter
        if (dateRangeStart || dateRangeEnd) {
          const taskEndDate = task.endDate ? new Date(task.endDate) : null;
          if (!taskEndDate) return false;
          taskEndDate.setHours(0, 0, 0, 0);
          if (dateRangeStart) {
            const startDate = new Date(dateRangeStart);
            startDate.setHours(0, 0, 0, 0);
            if (taskEndDate < startDate) return false;
          }
          if (dateRangeEnd) {
            const endDate = new Date(dateRangeEnd);
            endDate.setHours(0, 0, 0, 0);
            if (taskEndDate > endDate) return false;
          }
        }
      } else {
        // Fallback to original single-select member filters
        // Filter by type
        if (filterType === "my" && task.userId !== userId) {
          return false;
        }

        // Status filter
        if (filterType === "status" && statusFilter !== "all") {
          if (task.status !== statusFilter) {
            return false;
          }
        }

        // Due date filter
        if (filterType === "dueDate" && dueDateFilter !== "all") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endDate = task.endDate ? new Date(task.endDate) : null;
          if (!endDate) return false;
          endDate.setHours(0, 0, 0, 0);
          if (dueDateFilter === "overdue") {
            if (endDate >= today) return false;
          } else if (dueDateFilter === "today") {
            if (endDate.getTime() !== today.getTime()) return false;
          } else if (dueDateFilter === "week") {
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            if (endDate > weekFromNow || endDate < today) return false;
          }
        }
      }
    } else {
      // For PM/BO: apply multi-select filters
      
      // Quick filter (overrides other filters when not null or "all")
      if (quickFilter && quickFilter !== "all") {
        if (quickFilter === "overdue") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const endDate = task.endDate ? new Date(task.endDate) : null;
          
          if (!endDate) return false;
          endDate.setHours(0, 0, 0, 0);
          
          // Task is overdue if end date is before today and status is not Done/Cancelled
          if (endDate >= today || task.status === 'Done' || task.status === 'Cancelled') {
            return false;
          }
        } else if (quickFilter === "readyToReview") {
          if (task.status !== 'ReadyToReview') {
            return false;
          }
        }
      }
      
      // Member filter (if any selected)
      if (selectedMemberIds.length > 0) {
        if (!task.userId || !selectedMemberIds.includes(task.userId)) {
          return false;
        }
      }
      
      // Status filter (if any selected)
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(task.status)) {
          return false;
        }
      }
      
      // Date range filter
      if (dateRangeStart || dateRangeEnd) {
        const taskEndDate = task.endDate ? new Date(task.endDate) : null;
        if (!taskEndDate) return false;
        
        taskEndDate.setHours(0, 0, 0, 0);
        
        if (dateRangeStart) {
          const startDate = new Date(dateRangeStart);
          startDate.setHours(0, 0, 0, 0);
          if (taskEndDate < startDate) return false;
        }
        
        if (dateRangeEnd) {
          const endDate = new Date(dateRangeEnd);
          endDate.setHours(0, 0, 0, 0);
          if (taskEndDate > endDate) return false;
        }
      }
    }

    return true;
  });

  // Helper to get assignee info from task
  const getTaskAssignee = (task: GetTaskResponse): string => {
    // Backend returns task.user object or task.userId
    if (task.user) {
      return task.user.fullName || task.user.email || task.userId || '';
    }
    if (task.userId) {
      return memberMap[task.userId] || task.userId;
    }
    return "Unassigned"; // Return "Unassigned" if no assignee
  };

  // Helper to get milestone IDs from task
  const getTaskMilestoneIds = (task: GetTaskResponse): string[] => {
    if (task.milestones && Array.isArray(task.milestones)) {
      return task.milestones.map((m: any) => m.id.toString());
    }
    return [];
  };

  // Group tasks based on groupBy selection
  const groupTasks = (tasks: GetTaskResponse[]) => {
    if (groupBy === "none") {
      return { "All": tasks };
    }

    const grouped: Record<string, GetTaskResponse[]> = {};
    
    tasks.forEach(task => {
      let groupKey = "";
      
      switch (groupBy) {
        case "status":
          groupKey = getTaskStatusLabel(task.status);
          break;
        case "assignee":
          const assignee = getTaskAssignee(task);
          groupKey = assignee || "Unassigned";
          break;
        case "milestone":
          const milestoneIds = getTaskMilestoneIds(task);
          if (milestoneIds.length > 0) {
            groupKey = milestoneIds.length === 1 ? "Single Milestone" : "Multiple Milestones";
          } else {
            groupKey = "No Milestone";
          }
          break;
        default:
          groupKey = "All";
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });
    
    return grouped;
  };

  const groupedTasks = groupTasks(filteredTasks);

  // Reset pagination when groupBy changes
  useEffect(() => {
    setGroupPages({});
  }, [groupBy]);

  // Helper to get current page for a group
  const getGroupPage = (groupName: string) => groupPages[groupName] || 1;

  // Helper to set page for a group
  const setGroupPage = (groupName: string, page: number) => {
    setGroupPages(prev => ({ ...prev, [groupName]: page }));
  };

  // Calculate paginated data for each group (client-side pagination)
  const paginatedGroups = Object.entries(groupedTasks).reduce((acc, [groupName, groupTasks]) => {
    const itemsPerPage = 5;
    const currentPage = getGroupPage(groupName);
    const totalPages = Math.ceil(groupTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = groupTasks.slice(startIndex, endIndex);

    acc[groupName] = {
      allTasks: groupTasks,
      paginatedData,
      currentPage,
      totalPages,
      totalItems: groupTasks.length,
      startIndex,
      endIndex,
      itemsPerPage,
    };

    return acc;
  }, {} as Record<string, {
    allTasks: GetTaskResponse[];
    paginatedData: GetTaskResponse[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    itemsPerPage: number;
  }>);

  const handleDeleteTask = (e: React.MouseEvent, taskId: string, taskTitle: string) => {
    e.stopPropagation();
    setTaskToDelete({ id: taskId, title: taskTitle });
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await taskService.deleteTask(taskToDelete.id);

      if (response.success) {
        toast.success(`Task deleted: ${taskToDelete.title}`);
        // Refresh task list after successful deletion
        await fetchTasks();
        setIsConfirmDeleteOpen(false);
        setTaskToDelete(null);
      } else {
        toast.error(`Error: ${response.error || "Unable to delete task"}`);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("An error occurred while deleting task. Please try again!");
    }
  };

  const handleRowClick = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = () => {
    fetchTasks(); // Refresh the task list after saving
  };

  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateTaskSuccess = () => {
    fetchTasks(); // Refresh the task list after creating
  };

  return (
    <div className="project-board">
      <TaskListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        members={members}
        userRole={userRole}
        // Member-specific filters
        isMember={isMember}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dueDateFilter={dueDateFilter}
        onDueDateFilterChange={setDueDateFilter}
        // PM-specific filters (multi-select)
        selectedMemberIds={selectedMemberIds}
        onMemberIdsChange={setSelectedMemberIds}
        selectedStatuses={selectedStatuses}
        onStatusesChange={setSelectedStatuses}
        dateRangeStart={dateRangeStart}
        onDateRangeStartChange={setDateRangeStart}
        dateRangeEnd={dateRangeEnd}
        onDateRangeEndChange={setDateRangeEnd}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
      />
      {isProjectManager && !readOnly && (
        <div className="create-task-container">
          <button onClick={handleCreateTask}>Create New Task</button>
        </div>
      )}

      {/* Task List Table */}
      <div className="task-list">
        {isLoadingTasks ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading task list...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks in this project yet</p>
          {isProjectManager && !readOnly && (
            <div className="create-task-container">
              <button onClick={handleCreateTask}>Create New Task</button>
            </div>
          )}
          </div>
        ) : (
          Object.entries(paginatedGroups).map(([groupName, pagination]) => {
            return (
              <div key={groupName} className="task-group">
                {groupBy !== "none" && (
                  <div className="group-header">
                    <h3 className="group-title">{groupName}</h3>
                    <span className="group-count">({pagination.totalItems} tasks)</span>
                  </div>
                )}
                
                <table>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Overdue Days</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagination.paginatedData.map((task, index) => {
                      const actualIndex = pagination.startIndex + index;
                      const overdueDays = calculateOverdueDays(task.endDate || '', task.status);
                      return (
                        <tr 
                          key={task.id} 
                          onClick={() => handleRowClick(task)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="stt-cell">{actualIndex + 1}</td>
                          <td className="title-cell" title={task.title}>
                            <span className="title-text">{task.title}</span>
                          </td>
                          <td className="description-cell" title={task.description}>
                            <span className="description-text">{task.description}</span>
                          </td>
                          <td className="status-cell">
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getTaskStatusColor(task.status) }}
                            >
                              {getTaskStatusLabel(task.status)}
                            </span>
                          </td>
                          <td className="assignee-cell" title={getTaskAssignee(task) || "Unassigned"}>
                            <span className="assignee-text">
                              {getTaskAssignee(task) || "Unassigned"}
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(task.startDate || '')}</td>
                          <td className="date-cell">
                            <span style={{ 
                              color: overdueDays > 0 ? '#dc2626' : undefined, 
                              fontWeight: overdueDays > 0 ? '600' : undefined 
                            }}>
                              {formatDate(task.endDate || '')}
                            </span>
                          </td>
                          <td className="overdue-cell">
                            {overdueDays > 0 ? (
                              <span className="overdue-badge">
                                {overdueDays} {overdueDays === 1 ? 'day' : 'days'}
                              </span>
                            ) : (
                              <span className="on-time">-</span>
                            )}
                          </td>
                          <td className="actions-cell">
                            <div className="action-buttons">
                            {/* Member or readOnly sees View icon, PM/BO sees Delete icon */}
                            {isMember || readOnly ? (
                              <button
                                className="action-btn view-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(task);
                                }}
                                title="View task details"
                              >
                                <Eye size={14} />
                              </button>
                            ) : (
                              isProjectManager && onDeleteTask && (
                                <button
                                  className="action-btn delete-btn"
                                  onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                                  title="Delete task"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                  </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination for this group */}
                {pagination.totalItems > 0 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={(page) => setGroupPage(groupName, page)}
                    showInfo={true}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        projectId={projectId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateTaskSuccess}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode="edit"
          onSave={handleSaveTask}
        />
      )}

      {/* Confirm Delete Task Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Delete task"
        description={`Are you sure to delete task "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};
