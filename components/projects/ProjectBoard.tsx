import { useState, useEffect, useCallback } from "react";
import { Project } from "@/types/project";
import { BoardHeader } from "./BoardHeader";
import { Trash2, Eye, Edit, MoreVertical, UserPlus } from "lucide-react";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { GetTaskResponse } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import Pagination from "@/components/ui/Pagination";
import { TaskStatus, getTaskStatusLabel, getTaskStatusColor } from "@/constants/status";
import { ReassignTaskModal } from "../tasks/ReassignTaskModal";

interface ProjectBoardProps {
  project: Project;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
  onDeleteTask?: (taskId: string, taskTitle: string) => void;
  onEditTask?: (task: any) => void;
  refreshKey?: number;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng trong JS từ 0-11
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const ProjectBoard = ({
  project,
  onTaskClick,
  onCreateTask,
  onDeleteTask,
  onEditTask,
  refreshKey = 0,
}: ProjectBoardProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  
  // State for tasks and members
  const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Pagination state for each group
  const [groupPages, setGroupPages] = useState<Record<string, number>>({});

  const projectId = project?.id?.toString();
  const userRole = user?.role;
  const userId = user?.userId;
  // Check if user is Member (Member can reassign tasks, but cannot create/delete)
  const isMember = userRole === UserRole.MEMBER || userRole === 'Member';
  const isProjectManager = userRole === UserRole.PROJECT_MANAGER || userRole === 'ProjectManager' || 
                           userRole === UserRole.BUSINESS_OWNER || userRole === 'BusinessOwner' ||
                           userRole === UserRole.ADMIN || userRole === 'Admin';
  // Modal state for reassign
  const [selectedTask, setSelectedTask] = useState<GetTaskResponse | null>(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);


  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!projectId || !userRole || !userId) {
      setIsLoadingTasks(false);
      return;
    }

    setIsLoadingTasks(true);
    try {
      let response;
      // ProjectManager & BusinessOwner: Get all tasks in project
      // Member: Get only tasks assigned to this user in project
      if (userRole === UserRole.PROJECT_MANAGER || userRole === 'ProjectManager' || 
          userRole === UserRole.BUSINESS_OWNER || userRole === 'BusinessOwner') {
        // console.log(`[ProjectBoard] ✅ Fetching ALL tasks for ${userRole} in project: ${projectId}`);
        response = await taskService.getTasksByProjectId(projectId);
      } else {
        // console.log(`[ProjectBoard] ✅ Fetching ASSIGNED tasks for ${userRole} (user: ${userId}) in project: ${projectId}`);
        response = await taskService.getTasksByUserIdAndProjectId(userId, projectId);
      }
      
      if (response.success && response.data) {
        // Extract items from PagingResponse
        const taskList = response.data.items || [];
        setTasks(taskList);
      } else {
        setTasks([]);
      }
    } catch (error) {
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

  // Filter tasks by search query
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to get assignee info from task
  const getTaskAssignee = (task: GetTaskResponse): string => {
    // Backend returns task.user object or task.userId
    if (task.user) {
      return task.user.fullName || task.user.email || task.userId || '';
    }
    if (task.userId) {
      return memberMap[task.userId] || task.userId;
    }
    return "Chưa giao"; // Return "Chưa giao" if no assignee
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
      return { "Tất cả": tasks };
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
          groupKey = assignee || "Chưa giao";
          break;
        case "milestone":
          const milestoneIds = getTaskMilestoneIds(task);
          if (milestoneIds.length > 0) {
            groupKey = milestoneIds.length === 1 ? "Cột mốc đơn" : "Nhiều cột mốc";
          } else {
            groupKey = "Không có cột mốc";
          }
          break;
        default:
          groupKey = "Tất cả";
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
    e.stopPropagation(); // Ngăn chặn event bubbling để không trigger onTaskClick
    if (onDeleteTask) {
      onDeleteTask(taskId, taskTitle);
    }
  };

  const handleEditTask = (e: React.MouseEvent, task: any) => {
    e.stopPropagation(); // Ngăn chặn event bubbling để không trigger onTaskClick
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const handleViewTask = (e: React.MouseEvent, task: any) => {
    e.stopPropagation(); // Ngăn chặn event bubbling để không trigger onTaskClick
    if (onTaskClick) {
      onTaskClick(task);
    }
  };
  const handleReassignClick = (e: React.MouseEvent, task: GetTaskResponse) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsReassignModalOpen(true);
  };

  const handleReassignSuccess = () => {
    setIsReassignModalOpen(false);
    setSelectedTask(null);
    // Refresh tasks
    fetchTasks();
  };
  return (
    <div className="project-board">
      <BoardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        members={members}
        userRole={userRole}
      />
      {onCreateTask &&  isProjectManager && (
        <div className="create-task-container">
          <button onClick={onCreateTask}>Tạo công việc mới</button>
        </div>
      )}

      {/* List table công việc */}
      <div className="task-list">
        {isLoadingTasks ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách công việc...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có công việc nào trong dự án này</p>
          {onCreateTask && isProjectManager && (
            <div className="create-task-container">
              <button onClick={onCreateTask}>Tạo công việc mới</button>
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
                    <span className="group-count">({pagination.totalItems} công việc)</span>
                  </div>
                )}
                
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tiêu đề</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th>Người thực hiện</th>
                      <th>Bắt đầu</th>
                      <th>Kết thúc</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagination.paginatedData.map((task, index) => {
                      const actualIndex = pagination.startIndex + index;
                      return (
                        <tr key={task.id}>
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
                          <td className="assignee-cell" title={getTaskAssignee(task) || "Chưa giao"}>
                            <span className="assignee-text">
                              {getTaskAssignee(task) || "Chưa giao"}
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(task.startDate || '')}</td>
                          <td className="date-cell">{formatDate(task.endDate || '')}</td>
                          <td className="actions-cell">
                            <div className="action-buttons">
                              <button
                                className="action-btn view-btn"
                                onClick={(e) => handleViewTask(e, task)}
                                title="Xem chi tiết"
                              >
                              <Eye size={14} />
                              </button>
                            {onEditTask && (
                              <button
                                className="action-btn edit-btn"
                                onClick={(e) => handleEditTask(e, task)}
                                title="Chỉnh sửa"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                            {isProjectManager && onDeleteTask && (
                              <button
                                className="action-btn delete-btn"
                                onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                                title="Xóa công việc"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                            {/* nếu PM sẽ là isProjectManager */}
                            {((task.status !== "OverDue" && task.userId === userId)) && (
                              <button
                                className="action-btn reassign-btn"
                                onClick={(e) => handleReassignClick(e, task)}
                                title="Chuyển giao công việc"
                              >
                                <UserPlus size={14} /> 
                              </button>
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
      {/* Reassign Task Modal */}
      {isReassignModalOpen && selectedTask && (
        <ReassignTaskModal
          isOpen={isReassignModalOpen}
          onClose={() => {
            setIsReassignModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSuccess={handleReassignSuccess}
        />
      )}
      <style jsx>{`
        .project-board {
          width: 100%;
        }
        
        .create-task-container {
          padding: 16px 0;
          margin-bottom: 16px;
        }
        
        .create-task-container button {
          background: #ff5e13;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .create-task-container button:hover {
          background: #e54d00;
        }
        
        .task-list {
          width: 100%;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 48px;
          color: #6b7280;
          font-size: 14px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #FF5E13;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p,
        .empty-state p {
          margin: 0 0 20px 0;
        }

        .empty-state button {
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
          border-radius: 8px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .empty-state button:hover {
          background: #FF5E13;
          color: white;
        }
        
        .task-group {
          margin-bottom: 24px;
        }
        
        .task-group:last-child {
          margin-bottom: 0;
        }
        
        .group-header {
          background: #f9fafb;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .group-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        
        .group-count {
          background: #ff5e13;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }
        
        thead {
          background: #f9fafb;
        }
        
        th {
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }
        
        td {
          padding: 12px;
          font-size: 13px;
          color: #1f2937;
          border-bottom: 1px solid #f3f4f6;
        }
        
        tr:hover {
          background: #f9fafb;
        }
        
        /* Cố định độ rộng cột */
        .stt-cell { 
          width: 60px; 
          text-align: center;
        }
        
        .title-cell { 
          max-width: 200px;
        }
        
        .description-cell { 
          max-width: 250px;
        }
        
        .status-cell { 
          white-space: nowrap;
        }
        
        .assignee-cell { 
          white-space: nowrap;
        }
        
        .date-cell { 
          white-space: nowrap;
          font-size: 12px;
          color: #6b7280;
        }
        
        .actions-cell { 
          white-space: nowrap;
        }
        
        /* Text overflow handling */
        .title-text {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .description-text {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .assignee-text {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Status badges */
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          font-weight: 600;
        }
        
        /* Action buttons */
        .action-buttons {
          display: flex;
          gap: 6px;
          align-items: center;
          justify-content: center;
          flex-wrap: nowrap;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.7;
        }
        
        .action-btn:hover {
          opacity: 1;
          transform: scale(1.05);
        }
        
        .view-btn {
          background: #eff6ff;
          color: #3b82f6;
          border-color: #bfdbfe;
        }
        
        .view-btn:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .edit-btn {
          background: #fffbeb;
          color: #f59e0b;
          border-color: #fde68a;
        }
        
        .edit-btn:hover {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
        }
        
        .delete-btn {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fecaca;
        }
        
        .delete-btn:hover {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .reassign-btn {
          background: #fff7ed;
          color: #ff5e13;
          border-color: #fed7aa;
        }

        .reassign-btn:hover {
          background: #ff5e13;
          color: white;
          border-color: #ff5e13;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          table {
            min-width: 800px;
          }
          
          .task-list {
            overflow-x: scroll;
          }
        }
      `}</style>
    </div>
  );
};
