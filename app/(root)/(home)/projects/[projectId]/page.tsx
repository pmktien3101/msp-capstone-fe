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
import { mockProjects, mockMembers, mockTasks, addMilestone } from '@/constants/mockData';
import { Plus, Calendar, Users, Target } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import '@/app/styles/project-detail.scss';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const ProjectDetailPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const { role } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Mock data for available project managers
  const availableProjectManagers = [
    { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@company.com' },
    { id: '2', name: 'Trần Thị B', email: 'tranthib@company.com' },
    { id: '3', name: 'Lê Văn C', email: 'levanc@company.com' },
    { id: '4', name: 'Phạm Thị D', email: 'phamthid@company.com' },
    { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@company.com' },
  ];

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

  const handleSubmitTask = (taskData: any) => {
    // Mock task creation - replace with actual API call
    console.log('Creating new task:', taskData);
    // In real implementation, this would call API to create task
    alert('Tạo công việc thành công!');
    setIsCreateTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    // Find task to get title for confirmation
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete({ id: taskId, title: task.title });
      setIsDeleteTaskModalOpen(true);
    }
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      // Mock task deletion - replace with actual API call
      console.log('Deleting task:', taskToDelete.id);
      // In real implementation, this would call API to delete task
      alert(`Đã xóa công việc: ${taskToDelete.title}`);
      setTaskToDelete(null);
      setIsDeleteTaskModalOpen(false);
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

  const handleUpdateTask = (taskData: any) => {
    // Mock task update - replace with actual API call
    console.log('Updating task:', taskData);
    // In real implementation, this would call API to update task
    alert('Cập nhật công việc thành công!');
    setIsEditTaskModalOpen(false);
    setTaskToEdit(null);
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

  const handleSubmitMilestone = (milestoneData: any) => {
    try {
      // Add milestone to mockData
      const newMilestone = addMilestone(milestoneData);
      console.log('Created new milestone:', newMilestone);
      
      // Trigger UI refresh by updating refreshKey
      setRefreshKey(prev => prev + 1);
      
      // Milestone created successfully - UI will automatically refresh
      // No need for alert since user can see the new milestone in the list
    } catch (error) {
      console.error('Error creating milestone:', error);
      alert('Có lỗi xảy ra khi tạo cột mốc. Vui lòng thử lại!');
    }
  };

  // Calculate project progress based on tasks for specific project
  const calculateProjectProgress = (projectId: string) => {
    // Get tasks for this specific project based on milestoneIds
    const projectMilestones = mockProjects.find(p => p.id === projectId)?.milestones || [];
    const projectTasks = mockTasks.filter(task => 
      task.milestoneIds.some(milestoneId => projectMilestones.includes(milestoneId))
    );
    
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const totalTasks = projectTasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Load project data from mockData
  useEffect(() => {
    // Get tab from URL parameters
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['summary', 'board', 'list', 'documents', 'meetings', 'settings'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Find the specific project
      const currentMockProject = mockProjects.find(p => p.id === projectId);
      
      if (currentMockProject) {
        // Convert mockProject to Project type with members data
        const projectWithMembers: Project = {
          ...currentMockProject,
          status: currentMockProject.status as "active" | "planning" | "on-hold" | "completed",
          manager: mockMembers[0].name,
          members: mockMembers.filter(member => 
            currentMockProject.members.includes(member.id)
          ).map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            avatar: member.avatar
          })),
          // Initialize with default project managers
          projectManagers: [
            { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@company.com' },
            { id: '2', name: 'Trần Thị B', email: 'tranthib@company.com' }
          ],
          progress: calculateProjectProgress(projectId)
        };
        setProject(projectWithMembers);
      } else {
        setProject(null);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [projectId, searchParams]);

  if (loading) {
    return (
      <div className="project-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dự án...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-error">
        <h2>Không tìm thấy dự án</h2>
        <p>Dự án với ID "{projectId}" không tồn tại.</p>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="project-header">
        <div className="project-info">
          <div className="project-title-section">
            <h1 className="project-title">{project.name}</h1>
            <span className={`status-badge status-${project.status}`}>
              {project.status === 'active' && 'Đang hoạt động'}
              {project.status === 'planning' && 'Đang lập kế hoạch'}
              {project.status === 'on-hold' && 'Tạm dừng'}
              {project.status === 'completed' && 'Hoàn thành'}
            </span>
          </div>
          <p className="project-description">{project.description}</p>
          <div className="project-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>{new Date(project.startDate).toLocaleDateString('vi-VN')} - {new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="meta-item">
              <Users size={16} />
              <span>{project?.members?.length} thành viên</span>
            </div>
            <div className="meta-item">
              <Target size={16} />
              <span>Tiến độ: {project.progress}%</span>
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
      />
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <DetailTaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onEdit={(task) => {
            console.log('Editing task:', task);
            // Handle task edit - you can implement actual edit logic here
          }}
          onDelete={(taskId, taskTitle) => {
            console.log('Deleting task:', taskId, taskTitle);
            // Handle task delete - you can implement actual delete logic here
          }}
          task={selectedTask}
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
