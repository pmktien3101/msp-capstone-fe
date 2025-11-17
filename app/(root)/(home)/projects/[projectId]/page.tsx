'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { DetailTaskModal } from '@/components/tasks/DetailTaskModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { DeleteTaskModal } from '@/components/tasks/DeleteTaskModal';
import { CreateMilestoneModal } from '@/components/milestones/CreateMilestoneModal';
import { Project } from '@/types/project';
import { Task } from '@/types/milestone';
import { mockTasks, addMilestone } from '@/constants/mockData';
import { Plus, Calendar, Users, Target } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import '@/app/styles/project-detail.scss';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';
import { taskService } from '@/services/taskService';
import { toast } from 'react-toastify';
import { useProjectModal } from '@/contexts/ProjectModalContext';
import { ProjectStatus, TaskStatus, getProjectStatusLabel } from '@/constants/status';

const ProjectDetailPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { triggerProjectRefresh } = useProjectModal();
  const projectId = params.projectId as string;
  const { role } = useUser();
  const { user } = useAuth();
  const [project, setProject] = useState<any | null>(null); // Extended project with members
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("summary");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [projectProgress, setProjectProgress] = useState(0);

  // Mock data for available project managers (kept for compatibility)
  const availableProjectManagers = allUsers.filter(user => 
    user.role?.toLowerCase() === 'projectmanager' || user.role?.toLowerCase() === 'project manager'
  );

  // Check if user has permission to create milestones
  const canCreateMilestone = role && role.toLowerCase() !== 'member';

  // Handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleCreateTask = () => {
    setIsCreateTaskModalOpen(true);
  };

  const handleCloseCreateTaskModal = () => {
    setIsCreateTaskModalOpen(false);
  };

  const handleSubmitTask = async (taskData: any) => {
    try {
      if (!user?.userId) {
        toast.error('Không tìm thấy thông tin người dùng');
        return;
      }

      // console.log('Creating new task:', taskData);
      
      // Prepare request data
      const requestData = {
        projectId: projectId,
        userId: taskData.assignee || undefined, // Only include userId if assignee is selected
        actorId: user.userId,
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || TaskStatus.NotStarted,
        startDate: taskData.startDate || undefined,
        endDate: taskData.endDate || undefined,
        milestoneIds: taskData.milestoneIds || []
      };

      const response = await taskService.createTask(requestData);
      
      if (response.success) {
        toast.success('Tạo công việc thành công!');
        setIsCreateTaskModalOpen(false);
        // Trigger refresh
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(`Lỗi: ${response.error || 'Không thể tạo công việc'}`);
      }
    } catch (error: any) {
      // console.error('Error creating task:', error);
      toast.error('Có lỗi xảy ra khi tạo công việc. Vui lòng thử lại!');
    }
  };

  const handleDeleteTask = (taskId: string, taskTitle?: string) => {
    // Set task to delete for confirmation modal
    setTaskToDelete({ 
      id: taskId, 
      title: taskTitle || 'công việc này' 
    });
    setIsDeleteTaskModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      console.log('Deleting task:', taskToDelete.id);
      
      const response = await taskService.deleteTask(taskToDelete.id);
      
      if (response.success) {
        toast.success(`Đã xóa công việc: ${taskToDelete.title}`);
        setTaskToDelete(null);
        setIsDeleteTaskModalOpen(false);
        // Trigger refresh to reload task list
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(`Lỗi: ${response.error || 'Không thể xóa công việc'}`);
      }
    } catch (error: any) {
      // console.error('Error deleting task:', error);
      toast.error('Có lỗi xảy ra khi xóa công việc. Vui lòng thử lại!');
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditTaskModalOpen(true);
  };

  const handleCloseEditTaskModal = () => {
    setIsEditTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleUpdateTask = async (taskData: any) => {
    try {
      if (!taskToEdit?.id) {
        toast.error('Không tìm thấy thông tin công việc');
        return;
      }

      // console.log('Updating task:', taskData);
      
      // Prepare request data
      const requestData = {
        id: taskToEdit.id,
        projectId: projectId,
        userId: taskData.assignee || undefined, // Only include userId if assignee is selected
        actorId: user?.userId,
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        startDate: taskData.startDate || undefined,
        endDate: taskData.endDate || undefined,
        milestoneIds: taskData.milestoneIds || []
      };

      const response = await taskService.updateTask(requestData);
      
      if (response.success) {
        toast.success('Cập nhật công việc thành công!');
        setIsEditTaskModalOpen(false);
        setTaskToEdit(null);
        // Trigger refresh
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(`Lỗi: ${response.error || 'Không thể cập nhật công việc'}`);
      }
    } catch (error: any) {
      // console.error('Error updating task:', error);
      toast.error('Có lỗi xảy ra khi cập nhật công việc. Vui lòng thử lại!');
    }
  };

  const handleCreateMilestone = () => {
    setIsMilestoneModalOpen(true);
  };

  const handleCloseMilestoneModal = () => {
    setIsMilestoneModalOpen(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleProjectUpdate = () => {
    // Trigger refresh by updating refreshKey
    setRefreshKey(prev => prev + 1);
    // Also trigger sidebar refresh
    triggerProjectRefresh();
  };

  const handleSubmitMilestone = (milestoneData: any) => {
    try {
      // Add milestone to mockData
      const newMilestone = addMilestone(milestoneData);
      // console.log('Created new milestone:', newMilestone);
      
      // Trigger UI refresh by updating refreshKey
      setRefreshKey(prev => prev + 1);
      
      // Milestone created successfully - UI will automatically refresh
      // No need for alert since user can see the new milestone in the list
    } catch (error) {
      // console.error('Error creating milestone:', error);
      toast.error('Có lỗi xảy ra khi tạo cột mốc. Vui lòng thử lại!');
    }
  };

  // Load project data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError('');

      // Get tab from URL parameters
      const tabFromUrl = searchParams.get('tab');
      if (tabFromUrl && ['summary', 'board', 'list', 'documents', 'meetings', 'settings'].includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }

      try {
        // Validate projectId first
        if (!projectId || projectId === 'undefined' || projectId === 'null') {
          // console.error('Invalid projectId:', projectId);
          setError('ID dự án không hợp lệ');
          setLoading(false);
          return;
        }

        // console.log('Fetching project with ID:', projectId);

        // Check if user is authenticated and has userId
        if (!user || !user.userId) {
          console.error('User not authenticated');
          setError('Vui lòng đăng nhập để xem dự án');
          setLoading(false);
          return;
        }

        // Fetch all users first (for member lookup) - only if user is BusinessOwner
        if (user.role?.toLowerCase() === 'businessowner') {
          try {
            const usersResult = await userService.getMembersByBO(user.userId);
            if (usersResult.success && usersResult.data) {
              setAllUsers(usersResult.data);
            } else {
              console.warn('Failed to fetch members:', usersResult.error);
              // Continue anyway, just with empty users list
            }
          } catch (err: any) {
            // console.warn('Error fetching members (403 expected for non-BO):', err);
            // 403 is expected if user is not BusinessOwner, continue with empty list
          }
        }

        // Fetch project details from API
        const result = await projectService.getProjectById(projectId);
        
        if (result.success && result.data) {
          // console.log('Project fetched successfully:', result.data);
          
          // Fetch project members
          let membersResult;
          try {
            membersResult = await projectService.getProjectMembers(projectId);
            
            if (membersResult.success && membersResult.data) {
              if (membersResult.data.length === 0) {
                console.log('Project has no members yet (newly created project)');
              } else {
                // console.log('Members fetched:', membersResult.data);
              }
            } else {
              console.warn('Failed to fetch members:', membersResult.error);
            }
          } catch (memberErr: any) {
            console.error('Error fetching members:', memberErr);
            membersResult = { success: true, data: [] };
          }
          
          // Combine project data with members
          const projectWithMembers = {
            ...result.data,
            members: membersResult.success && membersResult.data 
              ? membersResult.data.map((memberResponse: any) => ({
                  userId: memberResponse.id,
                  fullName: memberResponse.fullName,
                  email: memberResponse.email,
                  role: memberResponse.roleName,
                  image: memberResponse.avatarUrl || ''
                }))
              : [],
            progress: 0, // TODO: Calculate from tasks/milestones
            manager: result.data.owner?.fullName || result.data.createdBy?.fullName || 'N/A',
            milestones: [], // TODO: Fetch milestones
            projectManagers: [] // TODO: Fetch project managers if needed
          };
          
          setProject(projectWithMembers);
        } else {
          setError(result.error || 'Không thể tải dự án');
          setProject(null);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Đã xảy ra lỗi khi tải dự án');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, searchParams, refreshKey]);

  // Fetch tasks and calculate progress
  useEffect(() => {
    const fetchProgress = async () => {
      if (!projectId) return;

      try {
        const tasksResult = await taskService.getTasksByProjectId(projectId);
        
        if (tasksResult.success && tasksResult.data) {
          const tasks = (tasksResult.data as any).items || tasksResult.data;
          const taskArray = Array.isArray(tasks) ? tasks : [];
          
          const totalTasks = taskArray.length;
          const completedTasks = taskArray.filter((task: any) => 
            task.status === TaskStatus.Done
          ).length;
          
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          setProjectProgress(progress);
        }
      } catch (error) {
        console.error('Error fetching tasks for progress:', error);
        setProjectProgress(0);
      }
    };

    fetchProgress();
  }, [projectId, refreshKey]); // Re-fetch when refreshKey changes

  if (loading) {
    return (
      <div className="project-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-error">
        <h2>Không tìm thấy dự án</h2>
        <p>{error || `Dự án với ID "${projectId}" không tồn tại.`}</p>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="project-header">
        <div className="project-info">
          <div className="project-title-section">
            <h1 className="project-title">{project.name}</h1>
            <span className={`status-badge ${
              project.status === ProjectStatus.InProgress ? 'status-active' :
              project.status === ProjectStatus.Scheduled ? 'status-planning' :
              project.status === ProjectStatus.Paused ? 'status-on-hold' :
              project.status === ProjectStatus.Completed ? 'status-completed' : ''
            }`}>
              {getProjectStatusLabel(project.status)}
            </span>
          </div>
          <p className="project-description">{project.description}</p>
          <div className="project-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>
                {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            <div className="meta-item">
              <Users size={16} />
              <span>{project.members?.length || 0} thành viên</span>
            </div>
            <div className="meta-item">
              <Target size={16} />
              <span>Tiến độ: {projectProgress}%</span>
            </div>
          </div>
        </div>
        <div className="project-actions">
          {(activeTab === "board" || activeTab === "list") && canCreateMilestone && (
            <button 
              className="create-milestone-btn"
              onClick={handleCreateMilestone}
              title="Tạo cột mốc mới"
            >
              <Plus size={16} />
              Tạo cột mốc
            </button>
          )}
        </div>
      </div>

      <ProjectTabs 
        key={refreshKey}
        project={project} 
        onTaskClick={handleTaskClick} 
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
        onTabChange={handleTabChange}
        initialActiveTab={activeTab}
        availableProjectManagers={availableProjectManagers}
        refreshKey={refreshKey}
        onProjectUpdate={handleProjectUpdate}
      />
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <DetailTaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          task={selectedTask as any}
          projectId={projectId}
        />
      )}

      {/* Create Milestone Modal */}
      <CreateMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={handleCloseMilestoneModal}
        onCreateMilestone={handleSubmitMilestone}
        projectId={projectId}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={handleCloseCreateTaskModal}
        onCreateTask={handleSubmitTask}
        projectId={projectId}
      />

      {/* Edit Task Modal */}
      {taskToEdit && (
        <CreateTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={handleCloseEditTaskModal}
          onCreateTask={handleUpdateTask}
          projectId={projectId}
          taskToEdit={taskToEdit}
        />
      )}

      {/* Delete Task Modal */}
      {taskToDelete && (
        <DeleteTaskModal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => {
            setIsDeleteTaskModalOpen(false);
            setTaskToDelete(null);
          }}
          onConfirm={confirmDeleteTask}
          taskTitle={taskToDelete.title}
          taskId={taskToDelete.id}
        />
      )}

      {/* Confirm Remove Manager Dialog */}
      {/* <ConfirmDialog
        isOpen={isConfirmRemoveOpen}
        onClose={() => {
          setIsConfirmRemoveOpen(false);
          setManagerToRemove(null);
        }}
        onConfirm={confirmRemoveManager}
        title="Xóa Project Manager"
        description={`Bạn có chắc chắn muốn xóa ${managerToRemove?.name} khỏi dự án này không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      /> */}
    </div>
  );
};

export default ProjectDetailPage;
