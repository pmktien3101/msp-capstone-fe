'use client';

import { getProjectStats } from '@/constants/mockData';

export const StatusOverview = () => {
  const stats = getProjectStats();
  
  const statusData = [
    { status: 'Hoàn thành', count: stats.completed, color: '#10b981', percentage: Math.round((stats.completed / stats.total) * 100) },
    { status: 'Đang làm', count: stats.inProgress, color: '#fb923c', percentage: Math.round((stats.inProgress / stats.total) * 100) },
    { status: 'Cần làm', count: stats.todo, color: '#6b7280', percentage: Math.round((stats.todo / stats.total) * 100) },
    { status: 'Đang review', count: stats.review, color: '#fbbf24', percentage: Math.round((stats.review / stats.total) * 100) }
  ];

  const totalItems = stats.total;

  return (
    <div className="status-overview">
      <div className="section-header">
        <div className="section-title">
          <h3>Tổng quan trạng thái</h3>
          <p>Xem tổng quan trạng thái các công việc của bạn.</p>
        </div>
        <a href="#" className="view-all-link">Xem tất cả công việc</a>
      </div>

      <div className="status-content">
        <div className="donut-chart">
          <div className="chart-container">
            <svg width="120" height="120" viewBox="0 0 120 120" className="chart-svg">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              
              {/* Status segments */}
              {statusData.map((item, index) => {
                const circumference = 2 * Math.PI * 50;
                const strokeDasharray = circumference;
                const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
                const rotation = statusData.slice(0, index).reduce((acc, prev) => acc + prev.percentage, 0) * 3.6;
                
                return (
                  <circle
                    key={item.status}
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation} 60 60)`}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="chart-center">
              <div className="center-text">
                <span className="center-number">{totalItems}</span>
                <span className="center-label">công việc</span>
              </div>
            </div>
          </div>
        </div>

        <div className="status-legend">
          {statusData.map((item) => (
            <div key={item.status} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: item.color }}></div>
              <div className="legend-info">
                <span className="legend-status">{item.status}</span>
                <span className="legend-count">{item.count} công việc</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .status-overview {
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
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .view-all-link {
          font-size: 14px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #2563eb;
        }

        .status-content {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .donut-chart {
          flex-shrink: 0;
        }

        .chart-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-svg {
          transform: rotate(-90deg);
        }

        .chart-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .center-text {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .center-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .center-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .status-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .legend-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .legend-status {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .legend-count {
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .status-content {
            flex-direction: column;
            gap: 24px;
          }

          .status-legend {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};