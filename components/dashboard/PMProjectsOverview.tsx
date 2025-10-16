'use client';

import { Project } from '@/types/project';
import { useRouter } from 'next/navigation';

interface PMProjectsOverviewProps {
  projects: Project[];
}

export function PMProjectsOverview({ projects }: PMProjectsOverviewProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang hoạt động':
        return '#10b981';
      case 'Chưa bắt đầu':
        return '#f59e0b';
      case 'Tạm dừng':
        return '#ef4444';
      case 'Hoàn thành':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'Đang hoạt động':
        return '#dcfce7';
      case 'Chưa bắt đầu':
        return '#fef3c7';
      case 'Tạm dừng':
        return '#fee2e2';
      case 'Hoàn thành':
        return '#dcfce7';
      default:
        return '#f3f4f6';
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="pm-projects-overview">
      <div className="section-header">
        <h2>Dự Án Của Bạn</h2>
        <button 
          className="view-all-btn"
          onClick={() => router.push('/projects')}
        >
          Xem tất cả →
        </button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="project-card"
            onClick={() => handleProjectClick(project.id)}
          >
            <div className="project-header">
              <div className="project-title">
                <h3>{project.name}</h3>
                <div 
                  className="status-badge"
                  style={{ 
                    color: getStatusColor(project.status),
                    backgroundColor: getStatusBackgroundColor(project.status),
                    borderColor: getStatusBackgroundColor(project.status)
                  }}
                >
                  {project.status}
                </div>
              </div>
              {/* <div className="project-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `0%` }}
                  ></div>
                </div>
                <span className="progress-text">0%</span>
              </div> */}
            </div>

            <div className="project-content">
              <p className="project-description">{project.description}</p>
              
              <div className="project-meta">
                <div className="meta-item">
                  <span className="meta-label">Ngày bắt đầu:</span>
                  <span className="meta-value">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '-'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Ngày kết thúc:</span>
                  <span className="meta-value">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : '-'}
                  </span>
                </div>
              </div>

              {/* <div className="project-team">
                <div className="team-avatars">
                  <div className="team-avatar">
                    <span>?</span>
                  </div>
                </div>
                <span className="team-text">
                  0 thành viên
                </span>
              </div> */}
            </div>

            <div className="project-actions">
              <button 
                className="action-btn primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProjectClick(project.id);
                }}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pm-projects-overview {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #FF5E13;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          background: #fef3c7;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .project-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
        }

        .project-card:hover {
          border-color: #FF5E13;
          box-shadow: 0 4px 6px -1px rgba(255, 94, 19, 0.2);
          transform: translateY(-2px);
        }

        .project-header {
          margin-bottom: 16px;
        }

        .project-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .project-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          flex: 1;
          margin-right: 12px;
        }

        .status-badge {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          white-space: nowrap;
          border: 1px solid;
        }

        .project-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #FF5E13;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          min-width: 35px;
        }

        .project-content {
          margin-bottom: 16px;
        }

        .project-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .project-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .meta-label {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
        }

        .meta-value {
          font-size: 12px;
          color: #374151;
          font-weight: 500;
        }

        .project-team {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .team-avatars {
          display: flex;
          gap: -4px;
        }

        .team-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #6366f1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          border: 2px solid white;
          margin-left: -4px;
        }

        .team-avatar:first-child {
          margin-left: 0;
        }

        .team-avatar.more {
          background: #9ca3af;
        }

        .team-text {
          font-size: 12px;
          color: #6b7280;
        }

        .project-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .action-btn.primary {
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
        }

        .action-btn.primary:hover {
          background: #FF5E13;
          color: white;
        }

        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }

          .project-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .project-title h3 {
            margin-right: 0;
          }
        }
      `}</style>
    </div>
  );
}
