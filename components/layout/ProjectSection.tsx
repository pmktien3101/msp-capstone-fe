'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Project } from '@/types/project';
import { useProjectModal } from '@/contexts/ProjectModalContext';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/rbac';
import { getProjectStatusColor, getProjectStatusLabel } from '@/constants/status';
import '@/app/styles/project-section.scss';

interface ProjectSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const ProjectSection = ({ isExpanded, onToggle }: ProjectSectionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { openCreateModal, projectRefreshTrigger } = useProjectModal();
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Fetch projects from API - wrapped in useCallback to prevent infinite loop
  const fetchProjects = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !user?.userId || !user?.role) {
      console.log('User not authenticated, skipping project fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let result;
      
      // Fetch projects based on user role
      if (user.role === UserRole.PROJECT_MANAGER || user.role === 'ProjectManager') {
        // console.log('[Sidebar] Fetching projects managed by ProjectManager:', user.userId);
        result = await projectService.getProjectsByManagerId(user.userId);
      } else if (user.role === UserRole.MEMBER || user.role === 'Member') {
        // console.log('[Sidebar] Fetching projects where Member participates:', user.userId);
        result = await projectService.getProjectsByMemberId(user.userId);
      } else {
        // console.log('[Sidebar] Unknown role, fetching all projects');
        result = await projectService.getAllProjects();
      }

      if (result.success && result.data) {
        // console.log('[Sidebar] Fetched projects successfully:', result.data.items.length, 'projects');
        setProjects(result.data.items);
      } else {
        // console.error('[Sidebar] Failed to fetch projects:', result.error);
        setProjects([]);
      }
    } catch (error) {
      // console.error('[Sidebar] Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.role, isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, projectRefreshTrigger]);

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleViewAllProjects = () => {
    router.push('/projects');
  };

  const handleShowMoreProjects = () => {
    setShowAllProjects(true);
  };

  const handleShowLessProjects = () => {
    setShowAllProjects(false);
  };

  const handleCreateProject = () => {
    openCreateModal();
  };

  const isProjectActive = (projectId: string) => {
    return pathname.includes(`/projects/${projectId}`);
  };

  const isAnyProjectActive = projects.some(project => isProjectActive(project.id));

  // Sort projects: Active projects with nearest deadline first
  const sortedProjects = [...projects].sort((a, b) => {
    // 1. Prioritize InProgress projects first
    const statusPriority = {
      'InProgress': 1,
      'NotStarted': 2,
      'OnHold': 3,
      'Completed': 4,
      'Cancelled': 5
    };
    
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 5;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 5;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // 2. For same status, sort by nearest endDate (deadline)
    if (a.endDate && b.endDate) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    
    // 3. Projects with endDate come before those without
    if (a.endDate && !b.endDate) return -1;
    if (!a.endDate && b.endDate) return 1;
    
    // 4. Finally, sort by startDate
    if (a.startDate && b.startDate) {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    
    return 0;
  });

  return (
    <div className="project-section">
      {/* Section Header */}
      <div 
        className={`section-header ${isAnyProjectActive ? 'has-active' : ''}`}
        onClick={onToggle}
      >
        <div className="section-title">
          <div className="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Projects</span>
          <span className="project-count">{projects.length}</span>
        </div>
        <div className="section-actions">
          {/* Chỉ hiện nút tạo dự án cho PM */}
          {(user?.role === UserRole.PROJECT_MANAGER || user?.role === 'ProjectManager') && (
            <button 
              className="add-project-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateProject();
              }}
              title="Create new project"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div 
            className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className={`projects-list ${isExpanded ? 'open' : ''} ${showAllProjects ? 'show-all' : ''}`}>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Loading...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet</p>
              {/* Only show create project button for PM */}
              {(user?.role === UserRole.PROJECT_MANAGER || user?.role === 'ProjectManager') && (
                <button 
                  className="create-project-btn"
                  onClick={handleCreateProject}
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <>
              {(showAllProjects ? sortedProjects : sortedProjects.slice(0, 3)).map((project, idx) => (
                <div
                  key={project.id}
                  className={`project-item animated ${isProjectActive(project.id) ? 'active' : ''}`}
                  onClick={() => handleProjectClick(project.id)}
                  style={{ ['--delay' as any]: `${idx * 40}ms` }}
                >
                  <div className="project-content">
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">
                      <div 
                        className="status-dot" 
                        style={{ backgroundColor: getProjectStatusColor(project.status) }}
                      ></div>
                      <span className="project-status">
                        {getProjectStatusLabel(project.status)}
                      </span>
                      {project.endDate ? (
                        <span className="project-deadline">• {new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
                      ) : null}
                    </div>
                  </div>
                  {isProjectActive(project.id) && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              ))}
              
              <div className="view-all-section">
                {sortedProjects.length > 3 && (
                  <button
                    className="view-all-btn"
                    onClick={() => (showAllProjects ? handleShowLessProjects() : handleShowMoreProjects())}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      {showAllProjects ? (
                        <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                    </svg>
                    <span>{showAllProjects ? 'Show less' : `Show more (${sortedProjects.length - 3})`}</span>
                  </button>
                )}

                <button
                  className="view-all-btn open-projects-page"
                  onClick={handleViewAllProjects}
                  title="Open project management page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>View all projects</span>
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  );
};
