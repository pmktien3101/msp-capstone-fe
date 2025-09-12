'use client';

import { mockTasks } from '@/constants/mockData';

export const TeamWorkload = () => {
  const assigneeCounts = mockTasks.reduce((acc, task) => {
    const assignee = task.assignee || 'unassigned';
    acc[assignee] = (acc[assignee] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTasks = mockTasks.length;
  
  const workloadData = Object.entries(assigneeCounts).map(([assignee, count]) => ({
    assignee: assignee === 'unassigned' ? 'Chưa giao' : assignee,
    percentage: Math.round((count / totalTasks) * 100),
    color: assignee === 'unassigned' ? '#6b7280' : '#3b82f6',
    avatar: assignee === 'unassigned' ? null : assignee
  }));

  return (
    <div className="team-workload">
      <div className="section-header">
        <div className="section-title">
          <h3>Khối lượng công việc nhóm</h3>
          <p>Phân bổ công việc theo thành viên.</p>
        </div>
      </div>

      <div className="workload-content">
        <div className="workload-chart">
          {workloadData.map((item, index) => (
            <div key={item.assignee} className="workload-item">
              <div className="workload-header">
                <div className="assignee-info">
                  {item.avatar ? (
                    <div className="assignee-avatar" style={{ backgroundColor: item.color }}>
                      {item.avatar}
                    </div>
                  ) : (
                    <div className="assignee-placeholder">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <span className="assignee-name">{item.assignee}</span>
                </div>
                <span className="workload-percentage">{item.percentage}%</span>
              </div>
              <div className="workload-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="workload-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng thành viên</span>
            <span className="summary-value">{workloadData.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Công việc đã giao</span>
            <span className="summary-value">{totalTasks - (assigneeCounts.unassigned || 0)}/{totalTasks}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .team-workload {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 24px;
        }

        .section-title h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .section-title p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .workload-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .workload-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .workload-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .workload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .assignee-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .assignee-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
        }

        .assignee-placeholder {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .assignee-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .workload-percentage {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .workload-bar {
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .workload-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-label {
          font-size: 14px;
          color: #6b7280;
        }

        .summary-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .workload-content {
            gap: 20px;
          }

          .workload-chart {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};