'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { 
  Plus, 
  FileText,
  Settings,
  ArrowRight
} from 'lucide-react';
import { CreateProjectModal } from '@/components/projects/modals/CreateProjectModal';

interface QuickActionsProps {
  projects: Project[];
}

export const QuickActions = ({ projects }: QuickActionsProps) => {
  const [recentProjects] = useState(() => {
    // Mock: Lấy 3 dự án gần nhất mà PM đang xem
    return projects.slice(0, 3);
  });
  
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  const quickActions = [
    {
      id: 'create-project',
      title: 'Tạo dự án mới',
      description: 'Khởi tạo một dự án mới',
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
      description: 'Trang tổng quan',
      icon: <Settings size={20} />,
      path: '/dashboard/pm'
    },
    {
      id: 'projects',
      title: 'Dự án',
      description: 'Quản lý dự án',
      icon: <FileText size={20} />,
      path: '/projects'
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      description: 'Cài đặt hệ thống',
      icon: <Settings size={20} />,
      path: '/settings'
    }
  ];

  return (
    <div className="quick-actions">
      {/* Header */}
      <div className="section-header">
        <h2>Thao tác nhanh</h2>
        <p>Các thao tác thường dùng và truy cập nhanh</p>
      </div>

      <div className="actions-grid">
        {/* Quick Actions */}
        <div className="actions-section">
          <h3>Thao tác nhanh</h3>
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
          <h3>Truy cập nhanh</h3>
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
          <h3>Dự án gần đây</h3>
          <div className="recent-projects-list">
            {recentProjects.length === 0 ? (
              <div className="empty-state">
                <FileText size={24} />
                <p>Chưa có dự án nào</p>
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
                      <span className="status-text">{project.status}</span>
                    </div>
                  </div>
                  <div className="project-status">
                    <div 
                      className="status-dot"
                      style={{ 
                        backgroundColor: project.status === 'Đang hoạt động' ? '#10b981' : 
                                        project.status === 'Hoàn thành' ? '#3b82f6' :
                                        project.status === 'Chưa bắt đầu' ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-header h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 24px;
        }

        .actions-section h3,
        .shortcuts-section h3,
        .recent-projects-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .quick-actions-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }

        .action-button:hover {
          border-color: var(--action-color);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--action-color);
          color: white;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
        }

        .action-content h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .action-content p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .action-arrow {
          color: #9ca3af;
          transition: all 0.2s;
        }

        .action-button:hover .action-arrow {
          color: var(--action-color);
          transform: translateX(2px);
        }

        .shortcuts-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shortcut-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          text-decoration: none;
          transition: all 0.2s;
        }

        .shortcut-link:hover {
          background: #f9fafb;
          border-color: #3b82f6;
        }

        .shortcut-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #6b7280;
          flex-shrink: 0;
        }

        .shortcut-content h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .shortcut-content p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .recent-projects-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .recent-project-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          text-decoration: none;
          transition: all 0.2s;
        }

        .recent-project-item:hover {
          background: #f9fafb;
          border-color: #3b82f6;
        }

        .project-avatar {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .project-info {
          flex: 1;
        }

        .project-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .project-meta {
          display: flex;
          gap: 8px;
          font-size: 11px;
          color: #6b7280;
        }

        .project-status {
          display: flex;
          align-items: center;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 12px;
          color: #6b7280;
          text-align: center;
        }

        .empty-state p {
          margin: 8px 0 0 0;
          font-size: 12px;
        }

        @media (max-width: 1024px) {
          .actions-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .actions-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .action-button {
            padding: 12px;
          }

          .action-icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
      
      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreateProject={(project) => {
          console.log('Project created:', project);
          setIsCreateProjectModalOpen(false);
        }}
      />
    </div>
  );
};
