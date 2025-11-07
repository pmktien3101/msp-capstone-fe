'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Project } from '@/types/project';
import { useProjectModal } from '@/contexts/ProjectModalContext';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/rbac';
import { getProjectStatusColor, getProjectStatusLabel } from '@/constants/status';

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
      'Scheduled': 2,
      'Paused': 3,
      'Completed': 4
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
          <span>Dự án</span>
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
              title="Tạo dự án mới"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <div 
            className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {isExpanded && (
        <div className="projects-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Đang tải...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có dự án</p>
              {/* Chỉ hiện nút tạo dự án cho PM */}
              {(user?.role === UserRole.PROJECT_MANAGER || user?.role === 'ProjectManager') && (
                <button 
                  className="create-project-btn"
                  onClick={handleCreateProject}
                >
                  Tạo dự án
                </button>
              )}
            </div>
          ) : (
            <>
              {(showAllProjects ? sortedProjects : sortedProjects.slice(0, 3)).map((project) => (
                <div
                  key={project.id}
                  className={`project-item ${isProjectActive(project.id) ? 'active' : ''}`}
                  onClick={() => handleProjectClick(project.id)}
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
                    </div>
                  </div>
                  {isProjectActive(project.id) && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              ))}
              
              <div className="view-all-section">
                {!showAllProjects && sortedProjects.length > 3 ? (
                  <button 
                    className="view-all-btn"
                    onClick={handleShowMoreProjects}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Xem thêm ({sortedProjects.length - 3} dự án)</span>
                  </button>
                ) : showAllProjects && sortedProjects.length > 3 ? (
                  <button 
                    className="view-all-btn"
                    onClick={handleShowLessProjects}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Ẩn bớt</span>
                  </button>
                ) : null}
                
                <button 
                  className="view-all-btn"
                  onClick={handleViewAllProjects}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Xem tất cả dự án</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}


      <style jsx>{`
        .project-section {
          width: 100%;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .section-header:hover {
          background: #f3f4f6;
        }

        .section-header.has-active {
          background: #fdf0d2;
          color: #ff5e13;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .section-icon {
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .section-header.has-active .section-icon {
          color: #ff5e13;
        }

        .section-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .add-project-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .add-project-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .expand-icon {
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .expand-icon.expanded {
          transform: rotate(90deg);
        }

        .projects-list {
          margin-left: 20px;
          border-left: 1px solid #e5e7eb;
          padding-left: 12px;
        }

        .project-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          margin-bottom: 3px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          border: 1px solid transparent;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }

        .project-item:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-color: #e2e8f0;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .project-item.active {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #fbbf24;
          color: #92400e;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
        }


        .project-content {
          flex: 1;
          min-width: 0;
        }

        .project-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .project-item.active .project-name {
          color: #92400e;
          font-weight: 700;
        }

        .project-meta {
          display: flex;
          align-items: center;
          font-size: 10px;
          color: #6b7280;
          margin-top: 2px;
          gap: 4px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .project-status {
          font-weight: 500;
          font-size: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .active-indicator {
          width: 3px;
          height: 16px;
          background: linear-gradient(180deg, #fbbf24, #f59e0b);
          border-radius: 2px;
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          box-shadow: 0 1px 3px rgba(251, 191, 36, 0.3);
        }

        .loading-state {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          color: #6b7280;
          font-size: 12px;
        }

        .loading-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #ff5e13;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .empty-state {
          text-align: center;
          padding: 16px 8px;
          color: #6b7280;
        }

        .empty-state p {
          font-size: 12px;
          margin: 0 0 8px 0;
        }

        .create-project-btn {
          background: #ff5e13;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .create-project-btn:hover {
          background: #e54e0a;
        }

        .view-all-section {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 12px;
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
