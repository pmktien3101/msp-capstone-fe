'use client';

import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';

interface RecentProjectsProps {
  projects: Project[];
}

export const RecentProjects = ({ projects }: RecentProjectsProps) => {
  const router = useRouter();
  
  // Lấy 4 dự án gần đây nhất (có thể sắp xếp theo startDate hoặc id)
  const recentProjects = projects.slice(0, 4);

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return {
          background: 'rgba(251, 146, 60, 0.1)',
          color: '#fb923c',
          border: 'rgba(251, 146, 60, 0.2)'
        };
      case 'completed':
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.2)'
        };
      case 'planning':
        return {
          background: 'rgba(107, 114, 128, 0.1)',
          color: '#6b7280',
          border: 'rgba(107, 114, 128, 0.2)'
        };
      case 'on-hold':
        return {
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.2)'
        };
      default:
        return {
          background: 'rgba(107, 114, 128, 0.1)',
          color: '#6b7280',
          border: 'rgba(107, 114, 128, 0.2)'
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'planning': return 'Lập kế hoạch';
      case 'on-hold': return 'Tạm dừng';
      default: return status;
    }
  };

  return (
    <div className="recent-projects">
      <div className="section-header">
        <div className="section-title">
          <h3>Dự án gần đây</h3>
          <p>Xem các dự án đang được quản lý.</p>
        </div>
        <a 
          href="#" 
          className="view-all-link"
          onClick={(e) => {
            e.preventDefault();
            router.push('/projects');
          }}
        >
          Xem tất cả
        </a>
      </div>

      <div className="projects-list">
        {recentProjects.map((project) => (
          <div 
            key={project.id} 
            className="project-item"
            onClick={() => handleProjectClick(project.id)}
          >
            <div className="project-header">
              <div className="project-info">
                <h4 className="project-title">{project.name}</h4>
                <p className="project-description">{project.description}</p>
              </div>
              <div className="project-status">
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(project.status).background,
                    color: getStatusColor(project.status).color,
                    borderColor: getStatusColor(project.status).border
                  }}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>

            <div className="project-progress-bar">
              <div className="progress-container">
                <div 
                  className="progress-fill"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <div className="progress-text">{project.progress}%</div>
            </div>

            <div className="project-details">
              <div className="project-meta">
                <span className="project-members">{project.members?.length ?? 0} thành viên</span>
              </div>
              <div className="project-dates">
                <span className="start-date">Bắt đầu: {new Date(project.startDate).toLocaleDateString('vi-VN')}</span>
                <span className="end-date">Kết thúc: {new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .recent-projects {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .section-title h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .section-title p {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }

        .view-all-link {
          font-size: 13px;
          color: #fb923c;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #f97316;
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .project-item {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .project-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #fb923c, #fbbf24);
        }

        .project-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .project-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .project-description {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }

        .status-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: 1px solid;
        }

        .project-progress-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .progress-container {
          flex: 1;
          height: 6px;
          background: #f1f5f9;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #fb923c, #fbbf24);
          border-radius: 6px;
          transition: width 0.3s ease;
          box-shadow: 0 1px 2px rgba(251, 146, 60, 0.3);
        }

        .progress-text {
          font-size: 11px;
          font-weight: 600;
          color: #fb923c;
          min-width: 35px;
          text-align: right;
        }

        .project-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 11px;
          color: #6b7280;
          padding: 8px 10px;
          background: rgba(251, 146, 60, 0.05);
          border-radius: 6px;
          border: 1px solid rgba(251, 146, 60, 0.1);
        }

        .project-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .project-dates {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: right;
        }

        @media (max-width: 768px) {
          .recent-projects {
            padding: 20px;
          }

          .section-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .project-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .project-details {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .project-dates {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};
