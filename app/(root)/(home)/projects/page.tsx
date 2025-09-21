'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { EditProjectModal } from '@/components/projects/modals/EditProjectModal';
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { useProjectModal } from '@/contexts/ProjectModalContext';
import { mockProject, mockMembers, mockTasks } from '@/constants/mockData';
import '@/app/styles/projects.scss';
import { Project } from '@/types/project';

const ProjectsPage = () => {
  const router = useRouter();
  const { isCreateModalOpen, closeCreateModal } = useProjectModal();
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Handlers

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setShowEditProjectModal(true);
  };
  
  const handleCloseEditProject = () => {
    setSelectedProject(null);
    setShowEditProjectModal(false);
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

  // Calculate progress based on tasks
  const calculateProjectProgress = () => {
    const completedTasks = mockTasks.filter(task => task.status === 'done').length;
    const totalTasks = mockTasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Mock data - using data from constants/mockData.ts
  const projects: Project[] = [
    {
      id: mockProject.id,
      name: mockProject.name,
      description: mockProject.description,
      status: mockProject.status as 'active' | 'planning' | 'completed' | 'on-hold',
      startDate: mockProject.startDate,
      endDate: mockProject.endDate,
      manager: 'Quang Long', // From mockMembers
      members: mockMembers.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email,
        avatar: `/avatars/${member.avatar.toLowerCase()}.png`
      })),
      progress: calculateProjectProgress()
    }
  ];

  return (
    <div className="pm-projects">
      <ProjectHeader />
      
      <ProjectsTable 
        projects={projects}
        onEditProject={handleEditProject}
        onAddMeeting={handleAddMeeting}
        onViewProject={handleViewProject}
      />

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
      />
      
      {showEditProjectModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditProjectModal}
          onClose={handleCloseEditProject}
          project={selectedProject}
        />
      )}
    </div>
  )
}

export default ProjectsPage