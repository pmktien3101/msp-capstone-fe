'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { ProjectStatus, getProjectStatusLabel, getProjectStatusColor } from '@/constants/status';
import { 
  Plus, 
  FileText,
  Settings,
  ArrowRight
} from 'lucide-react';
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal';
import '@/app/styles/quick-actions.scss';

interface QuickActionsProps {
  projects: Project[];
}

export const QuickActions = ({ projects }: QuickActionsProps) => {
  const [recentProjects] = useState(() => {
    // Mock: Get 3 most recent projects that PM is viewing
    return projects.slice(0, 3);
  });
  
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  const quickActions = [
    {
      id: 'create-project',
      title: 'Create New Project',
      description: 'Initialize a new project',
      icon: <Plus size={24} />,
      color: '#3b82f6',
      action: () => {
        setIsCreateProjectModalOpen(true);
      }
    }
  ];

  const shortcuts = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Overview page',
      icon: <Settings size={20} />,
      path: '/dashboard/pm'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Manage projects',
      icon: <FileText size={20} />,
      path: '/projects'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System settings',
      icon: <Settings size={20} />,
      path: '/settings'
    }
  ];

  return (
    <div className="quick-actions">
      {/* Header */}
      <div className="section-header">
        <h2>Quick Actions</h2>
        <p>Frequently used actions and quick access</p>
      </div>

      <div className="actions-grid">
        {/* Quick Actions */}
        <div className="actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                className="action-button"
                onClick={action.action}
                style={{ '--action-color': action.color } as React.CSSProperties}
              >
                <div className="action-icon">
                  {action.icon}
                </div>
                <div className="action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="shortcuts-section">
          <h3>Quick Access</h3>
          <div className="shortcuts-grid">
            {shortcuts.map(shortcut => (
              <a
                key={shortcut.id}
                href={shortcut.path}
                className="shortcut-link"
              >
                <div className="shortcut-icon">
                  {shortcut.icon}
                </div>
                <div className="shortcut-content">
                  <h4>{shortcut.title}</h4>
                  <p>{shortcut.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="recent-projects-section">
          <h3>Recent Projects</h3>
          <div className="recent-projects-list">
            {recentProjects.length === 0 ? (
              <div className="empty-state">
                <FileText size={24} />
                <p>No projects yet</p>
              </div>
            ) : (
              recentProjects.map(project => (
                <a
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="recent-project-item"
                >
                  <div className="project-avatar">
                    {project.name.charAt(0)}
                  </div>
                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <div className="project-meta">
                      {/* <span className="progress">0%</span>
                      <span className="members">0 thành viên</span> */}
                      <span className="status-text">{getProjectStatusLabel(project.status)}</span>
                    </div>
                  </div>
                  <div className="project-status">
                    <div 
                      className="status-dot"
                      style={{ 
                        backgroundColor: getProjectStatusColor(project.status)
                      }}
                    />
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
      />
    </div>
  );
};

export default QuickActions;
