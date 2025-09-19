'use client';

import { Project } from '@/types/project';
import { FolderOpen, PlayCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface PMDashboardHeaderProps {
  projects: Project[];
  averageProgress: number;
}

export function PMDashboardHeader({ 
  projects, 
  averageProgress 
}: PMDashboardHeaderProps) {

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;

  return (
    <div className="pm-dashboard-header">
      <div className="header-content">
        <div className="pm-info">
          <div className="pm-avatar">
            <div className="avatar-circle">
              <span>PM</span>
            </div>
          </div>
          <div className="pm-details">
            <h1>Dashboard Quản Lý Dự Án</h1>
            <p>Quản lý và theo dõi tất cả dự án của bạn</p>
          </div>
        </div>
        
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon projects">
            <FolderOpen size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{projects.length}</div>
            <div className="stat-label">Tổng Dự Án</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <PlayCircle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{activeProjects}</div>
            <div className="stat-label">Đang Thực Hiện</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{completedProjects}</div>
            <div className="stat-label">Hoàn Thành</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{averageProgress}%</div>
            <div className="stat-label">Tiến Độ TB</div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .pm-dashboard-header {
          background: white;
          color: #1f2937;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .pm-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pm-avatar {
          display: flex;
          align-items: center;
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          border: 3px solid #e5e7eb;
          color: #6b7280;
        }

        .pm-details h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .pm-details p {
          margin: 4px 0 0 0;
          font-size: 16px;
          color: #6b7280;
        }


        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          background: #f3f4f6;
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
        }

        .stat-icon.projects { 
          background: rgba(59, 130, 246, 0.1); 
          color: #3b82f6;
        }
        .stat-icon.active { 
          background: rgba(34, 197, 94, 0.1); 
          color: #22c55e;
        }
        .stat-icon.completed { 
          background: rgba(16, 185, 129, 0.1); 
          color: #10b981;
        }
        .stat-icon.progress { 
          background: rgba(245, 158, 11, 0.1); 
          color: #f59e0b;
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .pm-details h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
