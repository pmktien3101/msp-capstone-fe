'use client';

import { Project } from '@/types/project';
import { TASK_STATUS_LABELS, TaskStatus } from '@/constants/status';

interface StatusOverviewProps {
  project: Project;
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    onHold: number;
    readyToReview?: number;
    reOpened?: number;
    cancelled?: number;
    completionRate: number;
  };
}

export const StatusOverview = ({ project, stats }: StatusOverviewProps) => {
  
  // Prevent division by zero
  const total = stats.total || 0;
  const safePercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100) || 0;
  };

  const statusData = [
    { status: TASK_STATUS_LABELS[TaskStatus.Done], count: stats.completed || 0, color: '#10b981', percentage: safePercentage(stats.completed) },
    { status: TASK_STATUS_LABELS[TaskStatus.InProgress], count: stats.inProgress || 0, color: '#fb923c', percentage: safePercentage(stats.inProgress) },
    { status: TASK_STATUS_LABELS[TaskStatus.NotStarted], count: stats.todo || 0, color: '#6b7280', percentage: safePercentage(stats.todo) },
    { status: TASK_STATUS_LABELS[TaskStatus.ReadyToReview], count: stats.readyToReview || 0, color: '#8b5cf6', percentage: safePercentage(stats.readyToReview || 0) }
  ];

  const totalItems = total;

  return (
    <div className="status-overview">
      <div className="section-header">
        <div className="section-title">
          <h3>Status Overview</h3>
          <p>View the status overview of your tasks.</p>
        </div>
        <a 
          href="#" 
          className="view-all-link"
          onClick={(e) => {
            e.preventDefault();
            // Navigate to board tab
            const event = new CustomEvent('navigateToTab', { detail: { tab: 'board' } });
            window.dispatchEvent(event);
          }}
        >
          View all tasks
        </a>
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
                
                // Safely calculate strokeDashoffset, default to circumference if NaN
                const percentage = isNaN(item.percentage) ? 0 : item.percentage;
                const strokeDashoffset = circumference - (percentage / 100) * circumference;
                
                // Safely calculate rotation
                const rotation = statusData
                  .slice(0, index)
                  .reduce((acc, prev) => {
                    const prevPercentage = isNaN(prev.percentage) ? 0 : prev.percentage;
                    return acc + prevPercentage;
                  }, 0) * 3.6;
                
                // Skip rendering if percentage is 0
                if (percentage === 0) return null;
                
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
                <span className="center-label">tasks</span>
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
                <span className="legend-count">{item.count} {item.count === 1 ? 'task' : 'tasks'}</span>
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
          font-size: 13px;
          color: #fb923c;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #f97316;
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