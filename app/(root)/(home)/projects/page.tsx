'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectsTable } from '@/components/projects/ProjectsTable';
import { EditProjectModal } from '@/components/projects/modals/EditProjectModal';
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { useProjectModal } from '@/contexts/ProjectModalContext';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/hooks/useAuth';
import '@/app/styles/projects.scss';
import '@/app/styles/projects-table.scss';
import { Project } from '@/types/project';

const ProjectsPage = () => {
  const router = useRouter();
  const { isCreateModalOpen, closeCreateModal } = useProjectModal();
  const { user, isAuthenticated } = useAuth();
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch projects on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProjects();
    } else {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem dự án');
    }
  }, [isAuthenticated, user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching all projects...');
      
      const result = await projectService.getAllProjects();
      
      if (result.success && result.data) {
        console.log('Projects fetched successfully:', result.data.items);
        setProjects(result.data.items);
      } else {
        console.error('Failed to fetch projects:', result.error);
        setError(result.error || 'Không thể tải danh sách dự án');
      }
    } catch (error: any) {
      console.error('Fetch projects error:', error);
      setError(error.message || 'Đã xảy ra lỗi khi tải dự án');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditProjectModal(true);
  };
  
  const handleCloseEditProject = () => {
    setSelectedProject(null);
    setShowEditProjectModal(false);
  };

  const handleUpdateProject = async (updatedProjectData: any) => {
    if (!selectedProject) return;

    try {
      const result = await projectService.updateProject({
        id: selectedProject.id,
        name: updatedProjectData.name,
        description: updatedProjectData.description,
        status: updatedProjectData.status,
        startDate: updatedProjectData.startDate,
        endDate: updatedProjectData.endDate
      });

      if (result.success && result.data) {
        // Update local state
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === selectedProject.id ? result.data! : project
          )
        );
        setShowEditProjectModal(false);
        setSelectedProject(null);
      } else {
        alert(result.error || 'Không thể cập nhật dự án');
      }
    } catch (error) {
      console.error('Update project error:', error);
      alert('Đã xảy ra lỗi khi cập nhật dự án');
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = async (newProject: Project) => {
    console.log('New project created:', newProject);
    
    // Refresh projects list to get updated data from backend
    await fetchProjects();
    
    closeCreateModal();
  };

  const handleAddMeeting = (project: Project) => {
    // Navigate to meeting page or open meeting modal
    router.push(`/meeting/new?projectId=${project.id}`);
  };

  if (loading) {
    return (
      <div className="projects-page">
        <ProjectHeader />
        <div className="projects-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dự án...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <ProjectHeader />
        <div className="projects-content">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchProjects} className="retry-button">Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <ProjectHeader />
      
      <div className="projects-content">
        <ProjectsTable 
          projects={projects}
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