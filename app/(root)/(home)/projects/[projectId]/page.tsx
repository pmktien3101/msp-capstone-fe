'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { TaskDetailModal } from '@/components/projects/TaskDetailModal';
import { CreateMilestoneModal } from '@/components/milestones/CreateMilestoneModal';
import { Project } from '@/types/project';
import { Task } from '@/types/milestone';
import { Member } from '@/types/member';
import { mockProject, mockMembers, addMilestone } from '@/constants/mockData';
import { Plus, Calendar, Users, Target } from 'lucide-react';
import '@/app/styles/project-detail.scss';

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("summary");

  // Mock current user - replace with actual auth
  const currentUser: Member = mockMembers[0]; // Quang Long as current user

  // Handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleAddComment = (taskId: string, content: string) => {
    // Mock comment addition - replace with actual API call
    console.log('Adding comment to task:', taskId, 'Content:', content);
    // In real implementation, this would call an API to add the comment
  };

  const handleEditComment = (commentId: string, content: string) => {
    // Mock comment edit - replace with actual API call
    console.log('Editing comment:', commentId, 'New content:', content);
  };

  const handleDeleteComment = (commentId: string) => {
    // Mock comment deletion - replace with actual API call
    console.log('Deleting comment:', commentId);
  };

  const handleCreateTask = () => {
    // Mock task creation - replace with actual API call
    console.log('Creating new task for project:', projectId);
    // In real implementation, this would open a create task modal or navigate to create task page
    alert('Tính năng tạo task sẽ được triển khai!');
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


  // Load project data from mockData
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (projectId === mockProject.id) {
        // Convert mockProject to Project type with members data
        const projectWithMembers: Project = {
          ...mockProject,
          status: mockProject.status as "active" | "planning" | "on-hold" | "completed",
          manager: mockMembers[0].name, // Quang Long as manager
          members: mockMembers.map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            avatar: member.avatar
          })),
          progress: 75 // Mock progress
        };
        setProject(projectWithMembers);
      } else {
        setProject(null);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [projectId]);

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
              <span>{project.members.length} thành viên</span>
            </div>
            <div className="meta-item">
              <Target size={16} />
              <span>Tiến độ: {project.progress}%</span>
            </div>
          </div>
        </div>
        <div className="project-actions">
          {(activeTab === "board" || activeTab === "list") && (
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
        onTabChange={handleTabChange}
        initialActiveTab={activeTab}
      />
      
      {/* Task Detail Modal */}
      {selectedTask && project && (
        <TaskDetailModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          task={selectedTask}
          projectMembers={project.members}
          currentUser={currentUser}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
      )}

      {/* Create Milestone Modal */}
      <CreateMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={handleCloseMilestoneModal}
        onCreateMilestone={handleSubmitMilestone}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectDetailPage;
