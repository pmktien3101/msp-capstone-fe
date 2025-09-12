'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Project } from '@/types/project';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

interface ProjectSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const ProjectSection = ({ isExpanded, onToggle }: ProjectSectionProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockProjects: Project[] = [
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

    setProjects(mockProjects);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'planning':
        return '#f59e0b';
      case 'on-hold':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleViewAllProjects = () => {
    router.push('/projects');
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    // Auto navigate to the new project
    router.push(`/projects/${newProject.id}`);
  };

  const isProjectActive = (projectId: string) => {
    return pathname.includes(`/projects/${projectId}`);
  };

  const isAnyProjectActive = projects.some(project => isProjectActive(project.id));

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
              <button 
                className="create-project-btn"
                onClick={handleCreateProject}
              >
                Tạo dự án
              </button>
            </div>
          ) : (
            <>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`project-item ${isProjectActive(project.id) ? 'active' : ''}`}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="project-indicator">
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    ></div>
                  </div>
                  <div className="project-content">
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">
                      <span className="project-key">PMS-{project.id}</span>
                      <span className="project-progress">{project.progress}%</span>
                    </div>
                  </div>
                  {isProjectActive(project.id) && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              ))}
              
              <div className="view-all-section">
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

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleProjectCreated}
      />

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
          padding: 6px 8px;
          margin-bottom: 2px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .project-item:hover {
          background: #f9fafb;
        }

        .project-item.active {
          background: #fdf0d2;
          color: #ff5e13;
        }

        .project-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .project-content {
          flex: 1;
          min-width: 0;
        }

        .project-name {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-item.active .project-name {
          color: #ff5e13;
          font-weight: 600;
        }

        .project-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .project-key {
          font-family: 'Monaco', 'Menlo', monospace;
          font-weight: 500;
        }

        .project-progress {
          font-weight: 500;
        }

        .active-indicator {
          width: 3px;
          height: 16px;
          background: #ff5e13;
          border-radius: 2px;
          position: absolute;
          right: 0;
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
