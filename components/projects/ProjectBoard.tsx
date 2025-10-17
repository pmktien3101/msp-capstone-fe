import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { BoardHeader } from "./BoardHeader";
import { mockTasks, mockMembers } from "@/constants/mockData";
import { Trash2, Eye, Edit, MoreVertical } from "lucide-react";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { GetTaskResponse } from "@/types/task";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";

interface ProjectBoardProps {
  project: Project;
  onTaskClick?: (task: any) => void;
  onCreateTask?: () => void;
  onDeleteTask?: (taskId: string, taskTitle: string) => void;
  onEditTask?: (task: any) => void;
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
}: ProjectBoardProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  
  // State for tasks and members
  const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const projectId = project?.id?.toString();
  const userRole = user?.role;
  const userId = user?.userId;

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId || !userRole || !userId) {
        setIsLoadingTasks(false);
        return;
      }

      setIsLoadingTasks(true);
      try {
        let response;
        
        // DEBUG: Log user info to check role value
        // console.log(`[ProjectBoard] 🔍 User Info:`, { userId, userRole, projectId });
        // console.log(`[ProjectBoard] 🔍 Role type:`, typeof userRole);
        // console.log(`[ProjectBoard] 🔍 Role comparison - userRole === 'ProjectManager':`, userRole === 'ProjectManager');
        // console.log(`[ProjectBoard] 🔍 Role comparison - userRole === UserRole.PROJECT_MANAGER:`, userRole === UserRole.PROJECT_MANAGER);
        // console.log(`[ProjectBoard] 🔍 Role comparison - userRole === 'Member':`, userRole === 'Member');
        // console.log(`[ProjectBoard] 🔍 Role comparison - userRole === UserRole.MEMBER:`, userRole === UserRole.MEMBER);
        // console.log(`[ProjectBoard] 🔍 UserRole enum values:`, { 
        //   PROJECT_MANAGER: UserRole.PROJECT_MANAGER, 
        //   MEMBER: UserRole.MEMBER 
        // });
        
        // ProjectManager: Get all tasks in project
        // Member: Get only tasks assigned to this user in project
        if (userRole === UserRole.PROJECT_MANAGER || userRole === 'ProjectManager') {
          // console.log(`[ProjectBoard] ✅ Fetching ALL tasks for ProjectManager in project: ${projectId}`);
          response = await taskService.getTasksByProjectId(projectId);
        } else {
          // console.log(`[ProjectBoard] ✅ Fetching ASSIGNED tasks for ${userRole} (user: ${userId}) in project: ${projectId}`);
          response = await taskService.getTasksByUserIdAndProjectId(userId, projectId);
        }
        
        if (response.success && response.data) {
          // Extract items from PagingResponse
          const taskList = response.data.items || [];
          // console.log(`[ProjectBoard] ✅ Successfully loaded ${taskList.length} tasks for role "${userRole}"`);
          // console.log(`[ProjectBoard] 📋 Task list:`, taskList.map(t => ({ 
          //   id: t.id, 
          //   title: t.title, 
          //   userId: t.userId,
          //   assignedTo: t.user?.fullName || t.userId 
          // })));
          setTasks(taskList);
        } else {
          // console.error('[ProjectBoard] ❌ Failed to fetch tasks:', response.error);
          setTasks([]);
        }
      } catch (error) {
        // console.error('[ProjectBoard] Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [projectId, userRole, userId]); // Will re-fetch when projectId, userRole, or userId changes

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) {
        setIsLoadingMembers(false);
        return;
      }

      setIsLoadingMembers(true);
      try {
        // console.log(`[ProjectBoard] Fetching members for project: ${projectId}`);
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
          
          // console.log(`[ProjectBoard] Loaded ${transformedMembers.length} members`);
          setMembers(transformedMembers);
        } else {
          // console.error('[ProjectBoard] Failed to fetch members:', response.error);
          setMembers([]);
        }
      } catch (error) {
        // console.error('[ProjectBoard] Error fetching members:', error);
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

  // Helper functions
  const getStatusLabel = (status: string) => {
    // Status in DB: "Chưa bắt đầu", "Đang làm", "Tạm dừng", "Hoàn thành"
    return status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Chưa bắt đầu":
        return "#6b7280";
      case "Đang làm":
        return "#f59e0b";
      case "Tạm dừng":
        return "#ef4444";
      case "Hoàn thành":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

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
          groupKey = getStatusLabel(task.status);
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
      {onCreateTask && (
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
            {onCreateTask && (
              <button onClick={onCreateTask}>Tạo công việc đầu tiên</button>
            )}
          </div>
        ) : (
          Object.entries(groupedTasks).map(([groupName, tasks]) => (
          <div key={groupName} className="task-group">
            {groupBy !== "none" && (
              <div className="group-header">
                <h3 className="group-title">{groupName}</h3>
                <span className="group-count">({tasks.length} công việc)</span>
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
                {tasks.map((task, index) => (
                  <tr key={task.id}>
                    <td className="stt-cell">{index + 1}</td>
                    <td className="title-cell" title={task.title}>
                      <span className="title-text">{task.title}</span>
                    </td>
                    <td className="description-cell" title={task.description}>
                      <span className="description-text">{task.description}</span>
                    </td>
                    <td className="status-cell">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {getStatusLabel(task.status)}
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
                        <button
                          className="action-btn edit-btn"
                          onClick={(e) => handleEditTask(e, task)}
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                          title="Xóa công việc"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ))
        )}
      </div>

      <style jsx>{`
        .project-board {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 24px;
          gap: 24px;
        }
        
        .create-task-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
        }
        
        .create-task-container button {
          background: linear-gradient(135deg, #FF5E13 0%, #FF8C42 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .create-task-container button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 94, 19, 0.3);
          background: linear-gradient(135deg, #FF8C42 0%, #FF5E13 100%);
        }
        
        .task-list {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          backdrop-filter: blur(10px);
          padding: 24px;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #64748b;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #FF5E13;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p,
        .empty-state p {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 500;
        }

        .empty-state button {
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .empty-state button:hover {
          background: #FF5E13;
          color: white;
        }
          backdrop-filter: blur(10px);
        }
        
        .task-group {
          margin-bottom: 24px;
        }
        
        .task-group:last-child {
          margin-bottom: 0;
        }
        
        .group-header {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 16px 20px;
          border-bottom: 2px solid #ea580c;
          margin-bottom: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .group-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.025em;
        }
        
        .group-count {
          background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(234, 88, 12, 0.3);
        }
        
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 14px;
          table-layout: fixed;
        }
        
        thead {
          background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        th {
          color: white;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.025em;
          text-transform: uppercase;
          padding: 20px 16px;
          text-align: left;
          border: none;
          position: relative;
        }
        
        th:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background: rgba(255, 255, 255, 0.2);
        }
        
        tbody tr {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        }
        
        tbody tr:nth-child(even) {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        tbody tr:hover {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.15);
        }
        
        td {
          padding: 16px;
          border: none;
          vertical-align: middle;
          position: relative;
        }
        
        td:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background: rgba(240, 226, 233, 0.3);
        }
        
        /* Cố định độ rộng cột với responsive */
        .stt-cell { 
          width: 60px; 
          text-align: center;
          font-weight: 600;
          color: #64748b;
        }
        
        .title-cell { 
          width: 200px; 
          font-weight: 600;
          color: #1e293b;
        }
        
        .description-cell { 
          width: 300px; 
          color: #64748b;
          line-height: 1.5;
        }
        
        .status-cell { 
          width: 120px; 
          text-align: center;
        }
        
        .assignee-cell { 
          width: 140px; 
          text-align: center;
          color: #475569;
        }
        
        .date-cell { 
          width: 110px; 
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }
        
        .actions-cell { 
          width: 120px; 
          text-align: center;
        }
        
        /* Text overflow handling */
        .title-text, .description-text, .assignee-text {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .description-text {
          white-space: normal;
          line-height: 1.4;
          max-height: 2.8em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        /* Status badges */
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: white;
          text-align: center;
          min-width: 80px;
        }
        
        /* Action buttons */
        .action-buttons {
          display: flex;
          gap: 6px;
          justify-content: center;
          align-items: center;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .view-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }
        
        .view-btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
        
        .edit-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }
        
        .edit-btn:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
        }
        
        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }
        
        .delete-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }
        
        /* Responsive design */
        @media (max-width: 1200px) {
          .project-board {
            padding: 16px;
          }
          
          .description-cell { width: 250px; }
          .title-cell { width: 180px; }
        }
        
        @media (max-width: 768px) {
          .project-board {
            padding: 12px;
          }
          
          table {
            font-size: 12px;
          }
          
          td {
            padding: 12px 8px;
          }
          
          .stt-cell { width: 50px; }
          .title-cell { width: 150px; }
          .description-cell { width: 200px; }
          .status-cell { width: 100px; }
          .assignee-cell { width: 120px; }
          .date-cell { width: 90px; }
          .actions-cell { width: 100px; }
          
          .action-buttons {
            gap: 4px;
          }
          
          .action-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
};
