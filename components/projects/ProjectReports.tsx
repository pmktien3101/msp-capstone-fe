'use client';

import { Project } from '@/types/project';

interface ProjectReportsProps {
  project: Project;
}

export const ProjectReports = ({ project }: ProjectReportsProps) => {
  // Mock reports data
  const reports = [
    {
      id: '1',
      title: 'Báo cáo tiến độ tuần',
      description: 'Tổng hợp tiến độ công việc trong tuần',
      type: 'progress',
      lastUpdated: '2025-10-08',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Báo cáo chất lượng',
      description: 'Đánh giá chất lượng code và testing',
      type: 'quality',
      lastUpdated: '2025-10-05',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Báo cáo tài nguyên',
      description: 'Phân tích sử dụng tài nguyên và chi phí',
      type: 'resource',
      lastUpdated: '2025-10-03',
      status: 'in-progress'
    },
    {
      id: '4',
      title: 'Báo cáo rủi ro',
      description: 'Đánh giá và theo dõi các rủi ro dự án',
      type: 'risk',
      lastUpdated: '2025-09-28',
      status: 'pending'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'quality':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'resource':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'risk':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.29 3.86L1.82 18C1.64547 18.3024 1.5729 18.6453 1.60217 18.9873C1.63144 19.3293 1.76126 19.6587 1.97688 19.9261C2.1925 20.1935 2.48534 20.3872 2.81463 20.4835C3.14392 20.5798 3.49584 20.5743 3.82148 20.4678L12 18L20.1785 20.4678C20.5042 20.5743 20.8561 20.5798 21.1854 20.4835C21.5147 20.3872 21.8075 20.1935 22.0231 19.9261C22.2387 19.6587 22.3686 19.3293 22.3978 18.9873C22.4271 18.6453 22.3545 18.3024 22.18 18L13.71 3.86C13.5317 3.56631 13.2807 3.32312 12.9812 3.15447C12.6817 2.98582 12.3435 2.89746 12 2.89746C11.6565 2.89746 11.3183 2.98582 11.0188 3.15447C10.7193 3.32312 10.4683 3.56631 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'progress':
        return '#3b82f6';
      case 'quality':
        return '#10b981';
      case 'resource':
        return '#f59e0b';
      case 'risk':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang tạo';
      case 'pending':
        return 'Chờ tạo';
      default:
        return status;
    }
  };

  return (
    <div className="project-reports">
      <div className="reports-header">
        <h3>Báo Cáo Dự Án</h3>
        <p>Xem và quản lý các báo cáo của dự án {project.name}</p>
        <button className="btn btn-primary">Tạo báo cáo mới</button>
      </div>

      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div 
                className="report-icon"
                style={{ color: getTypeColor(report.type) }}
              >
                {getTypeIcon(report.type)}
              </div>
              <div 
                className="report-status"
                style={{ color: getStatusColor(report.status) }}
              >
                {getStatusLabel(report.status)}
              </div>
            </div>

            <div className="report-content">
              <h4 className="report-title">{report.title}</h4>
              <p className="report-description">{report.description}</p>
            </div>

            <div className="report-footer">
              <div className="report-meta">
                <span className="report-type">
                  {report.type === 'progress' && 'Tiến độ'}
                  {report.type === 'quality' && 'Chất lượng'}
                  {report.type === 'resource' && 'Tài nguyên'}
                  {report.type === 'risk' && 'Rủi ro'}
                </span>
                <span className="report-date">
                  Cập nhật: {new Date(report.lastUpdated).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              <div className="report-actions">
                <button className="btn btn-sm btn-secondary">Xem</button>
                <button className="btn btn-sm btn-primary">Tải xuống</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .project-reports {
          width: 100%;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .reports-header h3 {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .reports-header p {
          color: #6b7280;
          margin: 0;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: transparent;
          color: #FF5E13;
          border: 1px solid #FF5E13;
        }

        .btn-primary:hover {
          background: #FF5E13;
          color: white;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .report-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .report-card:hover {
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.2);
          transform: translateY(-1px);
          border-color: #FF5E13;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .report-icon {
          width: 40px;
          height: 40px;
          background: #f9fafb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-status {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.1);
        }

        .report-content {
          margin-bottom: 16px;
        }

        .report-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .report-description {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .report-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .report-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .report-type {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }

        .report-date {
          font-size: 12px;
          color: #9ca3af;
        }

        .report-actions {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};
