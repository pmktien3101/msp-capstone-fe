'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { 
  Plus, 
  FileText,
  Settings,
  ArrowRight,
  Video
} from 'lucide-react';
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal';
import { CreateMeetingModal } from '@/components/projects/modals/CreateMeetingModal';
import '@/app/styles/quick-actions.scss';

interface QuickActionsProps {
  projects: Project[];
}

export const QuickActions = ({ projects }: QuickActionsProps) => {
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);

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
    },
    {
      id: 'create-meeting',
      title: 'Create New Meeting',
      description: 'Schedule a meeting',
      icon: <Video size={24} />,
      color: '#10b981',
      action: () => {
        setIsCreateMeetingModalOpen(true);
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
      id: 'meetings',
      title: 'Meetings',
      description: 'View meetings',
      icon: <Video size={20} />,
      path: '/meetings'
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Manage projects',
      icon: <FileText size={20} />,
      path: '/projects'
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
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
      />

      {isCreateMeetingModalOpen && (
        <CreateMeetingModal
          onClose={() => setIsCreateMeetingModalOpen(false)}
          requireProjectSelection={true}
        />
      )}
    </div>
  );
};

export default QuickActions;
