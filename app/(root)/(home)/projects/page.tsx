'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { EditProjectModal } from '@/components/projects/modals/EditProjectModal';
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { useProjectModal } from '@/contexts/ProjectModalContext';
import { mockProjects, mockMembers, mockTasks } from '@/constants/mockData';
import '@/app/styles/projects.scss';
import '@/app/styles/projects-table.scss';
import { Project } from '@/types/project';

const ProjectsPage = () => {
  const router = useRouter();
  const { isCreateModalOpen, closeCreateModal } = useProjectModal();
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // State để quản lý danh sách projects
  const [projects, setProjects] = useState<Project[]>(
    mockProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status as 'active' | 'planning' | 'completed' | 'on-hold',
      startDate: project.startDate,
      endDate: project.endDate,
      milestones: project.milestones,
      meetings: project.meetings,
      members: mockMembers.filter(member => project.members?.includes(member.id)),
      manager: mockMembers.find(member => member.role === 'Project Manager')?.name || '',
    }))
  );

  // Handlers

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setShowEditProjectModal(true);
  };
  
  const handleCloseEditProject = () => {
    setSelectedProject(null);
    setShowEditProjectModal(false);
  };

  const handleUpdateProject = (updatedProjectData: any) => {
    const selectedMembersData = mockMembers.filter(member => 
      updatedProjectData.members?.includes(member.id)
    );
    
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === selectedProject?.id 
          ? {
              ...project,
              name: updatedProjectData.name,
              description: updatedProjectData.description,
              status: updatedProjectData.status,
              startDate: updatedProjectData.startDate,
              endDate: updatedProjectData.endDate,
              members: selectedMembersData,
              manager: selectedMembersData.find(member => member.role === 'Project Manager')?.name || selectedMembersData[0]?.name || '',
            }
          : project
      )
    );
    setShowEditProjectModal(false);
    setSelectedProject(null);
  };

  const handleAddMeeting = (project: any) => {
    setSelectedProject(project);
    setShowAddMeetingModal(true);
  };

  const handleCloseMeeting = () => {
    setSelectedProject(null);
    setShowAddMeetingModal(false);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Handler để tạo project mới
  const handleCreateProject = (newProjectData: any) => {
    const selectedMembersData = mockMembers.filter(member => 
      newProjectData.members?.includes(member.id)
    );
    
    const newProject: Project = {
      id: Date.now().toString(), // Tạo ID đơn giản
      name: newProjectData.name,
      description: newProjectData.description,
      status: newProjectData.status,
      startDate: newProjectData.startDate,
      endDate: newProjectData.endDate,
      milestones: [],
      meetings: [],
      members: selectedMembersData,
      manager: selectedMembersData.find(member => member.role === 'Project Manager')?.name || selectedMembersData[0]?.name || '',
    };
    
    setProjects(prevProjects => [...prevProjects, newProject]);
    closeCreateModal();
  };

  // Calculate progress based on tasks
  const calculateProjectProgress = () => {
    const completedTasks = mockTasks.filter(task => task.status === 'done').length;
    const totalTasks = mockTasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Thêm progress cho mỗi project
  const projectsWithProgress = projects.map(project => ({
    ...project,
    progress: calculateProjectProgress()
  }));

  return (
    <div className="projects-page">
      <ProjectHeader />
      
      <div className="projects-content">
        <ProjectsTable 
          projects={projectsWithProgress}
          onEditProject={handleEditProject}
          onAddMeeting={handleAddMeeting}
          onViewProject={handleViewProject}
        />
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreateProject={handleCreateProject}
      />
      
      {showEditProjectModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditProjectModal}
          onClose={handleCloseEditProject}
          project={selectedProject}
          onUpdateProject={handleUpdateProject}
        />
      )}

      <style jsx>{`
        .projects-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 0;
        }

        .projects-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px 40px 24px;
        }

        @media (max-width: 768px) {
          .projects-content {
            padding: 0 16px 24px 16px;
          }
        }

        @media (max-width: 480px) {
          .projects-content {
            padding: 0 12px 20px 12px;
          }
        }
      `}</style>
    </div>
  )
}

export default ProjectsPage