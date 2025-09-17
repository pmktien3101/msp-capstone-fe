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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang thực hiện';
      case 'planning':
        return 'Lập kế hoạch';
      case 'on-hold':
        return 'Tạm dừng';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
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
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {getStatusText(project.status)}
                </div>
              </div>
              <div className="project-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{project.progress}%</span>
              </div>
            </div>

            <div className="project-content">
              <p className="project-description">{project.description}</p>
              
              <div className="project-meta">
                <div className="meta-item">
                  <span className="meta-label">Ngày bắt đầu:</span>
                  <span className="meta-value">
                    {new Date(project.startDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Ngày kết thúc:</span>
                  <span className="meta-value">
                    {new Date(project.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Thành viên:</span>
                  <span className="meta-value">{project.members.length} người</span>
                </div>
              </div>

              <div className="project-team">
                <div className="team-avatars">
                  {project.members.slice(0, 3).map((member, index) => (
                    <div key={member.id} className="team-avatar">
                      <span>{member.name.charAt(0)}</span>
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="team-avatar more">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="team-text">
                  {project.members.length} thành viên
                </span>
              </div>
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
          color: #6366f1;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          background: #f3f4f6;
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
          border-color: #6366f1;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
          color: white;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          white-space: nowrap;
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
          background: #6366f1;
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
          background: #6366f1;
          color: white;
        }

        .action-btn.primary:hover {
          background: #4f46e5;
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
