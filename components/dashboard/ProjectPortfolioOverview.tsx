'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { mockProjects } from '@/constants/mockData';
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react';

interface ProjectPortfolioOverviewProps {
  projects: Project[];
}

export const ProjectPortfolioOverview = ({ projects }: ProjectPortfolioOverviewProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Tính toán thống kê theo trạng thái
  const statusStats = {
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
  };

  const totalProjects = projects.length;
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / projects.length)
    : 0;

  // Lọc dự án theo trạng thái
  const filteredProjects = statusFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'rgba(16, 185, 129, 0.1)';
      case 'completed': return 'rgba(59, 130, 246, 0.1)';
      case 'planning': return 'rgba(245, 158, 11, 0.1)';
      case 'on-hold': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'planning': return '#f59e0b';
      case 'on-hold': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang triển khai';
      case 'completed': return 'Hoàn thành';
      case 'planning': return 'Lập kế hoạch';
      case 'on-hold': return 'Tạm dừng';
      default: return status;
    }
  };

  return (
    <div className="project-portfolio-overview">
      {/* Header */}
      <div className="section-header">
        <div className="section-title">
          <h2>Thông tin tổng quan dự án</h2>
          <p>Quản lý và theo dõi tất cả dự án của bạn</p>
        </div>
        <div className="filter-controls">
          <Filter size={16} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Tất cả dự án</option>
            <option value="active">Đang triển khai</option>
            <option value="completed">Hoàn thành</option>
            <option value="planning">Lập kế hoạch</option>
            <option value="on-hold">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FolderOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalProjects}</h3>
            <p>Tổng dự án</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{statusStats.active}</h3>
            <p>Đang triển khai</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{statusStats.completed}</h3>
            <p>Hoàn thành</p>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{averageProgress}%</h3>
            <p>Tiến độ trung bình</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="projects-list">
        <h3>Danh sách dự án ({filteredProjects.length})</h3>
        <div className="dashboard-projects-table-container">
          <table className="dashboard-projects-table">
            <thead>
              <tr>
                <th>Tên dự án</th>
                <th>Trạng thái</th>
                <th>Thành viên</th>
                <th>Tiến độ</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id} className="project-row" onClick={() => handleProjectClick(project.id)}>
                  <td className="project-name-cell">
                    <div className="project-name-info">
                      <h4>{project.name}</h4>
                      <p>{project.description}</p>
                    </div>
                  </td>
                  <td className="status-cell">
                    <div 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(project.status),
                        color: getStatusTextColor(project.status)
                      }}
                    >
                      {getStatusLabel(project.status)}
                    </div>
                  </td>
                  <td className="members-cell">
                    <div className="members-info">
                      <Users size={16} />
                      <span>{project.members?.length ?? 0} thành viên</span>
                    </div>
                  </td>
                  <td className="progress-cell">
                    <div className="progress-info">
                      <div className="progress-header">
                        <span>{(project.progress ?? 0)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${project.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-info">
                      <Calendar size={16} />
                      <span>{new Date(project.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-info">
                      <Calendar size={16} />
                      <span>{new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .project-portfolio-overview {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-title h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .section-title p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-filter {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          color: #6b7280;
        }

        .stat-icon.active {
          background: #dcfce7;
          color: #10b981;
        }

        .stat-icon.completed {
          background: #dbeafe;
          color: #3b82f6;
        }

        .stat-icon.warning {
          background: #fef2f2;
          color: #ef4444;
        }


        .stat-content h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .stat-content p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .projects-list h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .dashboard-projects-table-container {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .dashboard-projects-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .dashboard-projects-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }

        .dashboard-projects-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
        }

        .project-row {
          cursor: pointer;
        }

        .project-row:hover {
          background: #f9fafb;
        }

        .project-row:last-child td {
          border-bottom: none;
        }

        .project-name-cell {
          min-width: 250px;
        }

        .project-name-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .project-name-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
        }

        .status-cell {
          min-width: 120px;
          text-align: center;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
          border: 1px solid transparent;
          min-width: 100px;
          text-align: center;
          white-space: nowrap;
        }

        .members-cell {
          min-width: 120px;
        }

        .members-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6b7280;
        }

        .progress-cell {
          min-width: 150px;
        }

        .progress-info {
          width: 100%;
        }

        .progress-header {
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          transition: width 0.3s ease;
        }

        .date-cell {
          min-width: 120px;
        }

        .date-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6b7280;
        }


        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .dashboard-projects-table th,
          .dashboard-projects-table td {
            padding: 8px 12px;
            font-size: 12px;
          }

          .project-name-cell {
            min-width: 200px;
          }

          .status-cell,
          .members-cell,
          .date-cell {
            min-width: 100px;
          }

          .progress-cell {
            min-width: 120px;
          }

        }
      `}</style>
    </div>
  );
};
