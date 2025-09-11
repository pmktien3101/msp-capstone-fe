'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectSummary } from '@/components/projects/ProjectSummary';
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal';
import { EditProjectModal } from '@/components/projects/modals/EditProjectModal';
import { AddMeetingModal } from '@/components/projects/modals/AddMeetingModal';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import '@/app/styles/projects.css';
import { Project } from '@/types/project';

const ProjectsPage = () => {
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Handlers
  const handleCreateProject = () => setShowCreateProjectModal(true);
  const handleCloseCreateProject = () => setShowCreateProjectModal(false);

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

  // Mock data - replace with actual API calls later
  const projects: Project[] = [
    {
      id: '1',
      name: 'Project Management System',
      description: 'A system to manage company projects and resources',
      status: 'active' as const,
      startDate: '2025-09-01',
      endDate: '2025-12-31',
      manager: 'John Doe',
      members: [
        { id: '1', name: 'John Doe', role: 'Project Manager', email: 'john.doe@example.com', avatar: '/avatars/john.png' },
        { id: '2', name: 'Jane Smith', role: 'Developer', email: 'jane.smith@example.com', avatar: '/avatars/jane.png' }
      ],
      progress: 75
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Q4 Digital Marketing Campaign',
      status: 'planning' as const,
      startDate: '2025-10-01',
      endDate: '2025-12-15',
      manager: 'Jane Smith',
      members: [
        { id: '3', name: 'Mike Johnson', role: 'Marketing Lead', email: 'mike.johnson@example.com', avatar: '/avatars/mike.png' },
        { id: '4', name: 'Sarah Wilson', role: 'Content Creator', email: 'sarah.wilson@example.com', avatar: '/avatars/sarah.png' }
      ],
      progress: 25
    },
    {
      id: '3',
      name: 'Mobile App Development',
      description: 'Customer service mobile application',
      status: 'completed' as const,
      startDate: '2025-06-01',
      endDate: '2025-09-30',
      manager: 'Tom Brown',
      members: [
        { id: '5', name: 'Tom Brown', role: 'Tech Lead', email: 'tom.brown@example.com', avatar: '/avatars/tom.png' },
        { id: '6', name: 'Emma Davis', role: 'Developer', email: 'emma.davis@example.com', avatar: '/avatars/emma.png' }
      ],
      progress: 100
    }
  ];

  return (
    <div className="pm-projects">
      <ProjectHeader onCreateProject={handleCreateProject} />
      <ProjectFilters />
      
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard 
            key={project.id}
            project={project}
            onEditProject={() => handleEditProject(project)}
            onAddMeeting={() => handleAddMeeting(project)}
          />
        ))}
      </div>

      <ProjectSummary projects={projects} />

      {/* Modals */}
      {showCreateProjectModal && (
        <CreateProjectModal 
          isOpen={showCreateProjectModal} 
          onClose={handleCloseCreateProject}
        />
      )}

      {showEditProjectModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditProjectModal}
          onClose={handleCloseEditProject}
          project={selectedProject}
        />
      )}

      {showAddMeetingModal && selectedProject && (
        <AddMeetingModal
          isOpen={showAddMeetingModal}
          onClose={handleCloseMeeting}
          project={selectedProject}
        />
      )}
    </div>
  )
}

export default ProjectsPage