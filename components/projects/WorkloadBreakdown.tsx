'use client';

import { mockTasks } from '@/constants/mockData';

export const WorkloadBreakdown = () => {
  const priorityCounts = mockTasks.reduce((acc, task) => {
    const priority = task.priority;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTasks = mockTasks.length;
  
  const workloadData = [
    { 
      priority: 'Cao', 
      count: priorityCounts.high || 0, 
      percentage: Math.round(((priorityCounts.high || 0) / totalTasks) * 100), 
      color: '#ef4444' 
    },
    { 
      priority: 'Trung bình', 
      count: priorityCounts.medium || 0, 
      percentage: Math.round(((priorityCounts.medium || 0) / totalTasks) * 100), 
      color: '#f59e0b' 
    },
    { 
      priority: 'Thấp', 
      count: priorityCounts.low || 0, 
      percentage: Math.round(((priorityCounts.low || 0) / totalTasks) * 100), 
      color: '#10b981' 
    }
  ];

  return (
    <div className="workload-breakdown">
      <div className="section-header">
        <div className="section-title">
          <h3>Khối lượng công việc</h3>
          <p>Phân bổ theo độ ưu tiên.</p>
        </div>
      </div>

      <div className="workload-content">
        <div className="workload-chart">
          {workloadData.map((item, index) => (
            <div key={item.priority} className="workload-bar">
              <div className="bar-header">
                <span className="bar-label">{item.priority}</span>
                <span className="bar-count">{item.count} công việc</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
              <div className="bar-percentage">{item.percentage}%</div>
            </div>
          ))}
        </div>

        <div className="workload-summary">
          <div className="summary-item">
            <span className="summary-label">Tổng cộng</span>
            <span className="summary-value">{totalTasks} công việc</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Đã hoàn thành</span>
            <span className="summary-value">{mockTasks.filter(task => task.status === 'done').length} công việc</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .workload-breakdown {
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

        .workload-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bar-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .bar-count {
          font-size: 12px;
          color: #6b7280;
        }

        .bar-container {
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .bar-percentage {
          font-size: 12px;
          color: #6b7280;
          text-align: right;
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