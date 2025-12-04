'use client';

import { mockTasks, mockProjects, mockMilestones } from '@/constants/mockData';
// import PieChart from './PieChart';

interface TaskStatusChartProps {
  projectId?: string;
}

export const TaskStatusChart = ({ projectId = "1" }: TaskStatusChartProps) => {
  // Lấy tasks của project cụ thể
  const projectMilestones = mockMilestones.filter(m => m.projectId === projectId);
  const projectTasks = mockTasks.filter(task => 
    task.milestoneIds.some(milestoneId => projectMilestones.some(m => m.id === milestoneId))
  );

  // Tính toán dữ liệu cho biểu đồ trạng thái task
  const taskStatusData = {
    todo: projectTasks.filter(task => task.status === 'todo').length,
    'in-progress': projectTasks.filter(task => task.status === 'in-progress').length,
    review: projectTasks.filter(task => task.status === 'review').length,
    done: projectTasks.filter(task => task.status === 'done').length
  };

  // Tính toán dữ liệu cho biểu đồ theo priority
  const priorityData = {
    high: projectTasks.filter(task => task.priority === 'high').length,
    medium: projectTasks.filter(task => task.priority === 'medium').length,
    low: projectTasks.filter(task => task.priority === 'low').length
  };


  // Chuẩn bị dữ liệu cho PieChart
  const statusChartData = {
    labels: ['Chờ làm', 'Đang làm', 'Đang xem xét', 'Hoàn thành'],
    values: [
      taskStatusData.todo,
      taskStatusData['in-progress'],
      taskStatusData.review,
      taskStatusData.done
    ],
    colors: ['#6b7280', '#3b82f6', '#f59e0b', '#10b981']
  };

  const priorityChartData = {
    labels: ['Cao', 'Trung bình', 'Thấp'],
    values: [
      priorityData.high,
      priorityData.medium,
      priorityData.low
    ],
    colors: ['#ef4444', '#f59e0b', '#10b981']
  };


  const totalTasks = projectTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((taskStatusData.done / totalTasks) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return '#6b7280';
      case 'in-progress':
        return '#3b82f6';
      case 'review':
        return '#f59e0b';
      case 'done':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="task-status-chart">
      <div className="chart-header">
        <h3>Phân Tích Công Việc</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Tổng công việc:</span>
            <span className="stat-value">{totalTasks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Hoàn thành:</span>
            <span className="stat-value">{completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Biểu đồ trạng thái task */}
        <div className="chart-section">
          <div className="section-header">
            <h4>Trạng Thái Công Việc</h4>
            <div className="status-legend">
              {Object.entries(taskStatusData).map(([status, count]) => (
                <div key={status} className="legend-item">
                  <div 
                    className="legend-dot"
                    style={{ backgroundColor: getStatusColor(status) }}
                  ></div>
                  <span className="legend-label">
                    {status === 'in-progress' ? 'Đang làm' : 
                     status === 'todo' ? 'Chờ làm' : 
                     status === 'review' ? 'Đang xem xét' :
                     status === 'done' ? 'Hoàn thành' :
                     status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  <span className="legend-count">({count})</span>
                </div>
              ))}
            </div>
          </div>
          {/* <PieChart 
            title=""
            data={statusChartData}
            height={150}
          /> */}
        </div>

        {/* Biểu đồ priority */}
        <div className="chart-section">
          <div className="section-header">
            <h4>Mức Độ Ưu Tiên</h4>
            <div className="priority-legend">
              {Object.entries(priorityData).map(([priority, count]) => (
                <div key={priority} className="legend-item">
                  <div 
                    className="legend-dot"
                    style={{ backgroundColor: getPriorityColor(priority) }}
                  ></div>
                  <span className="legend-label">
                    {priority === 'high' ? 'Cao' :
                     priority === 'medium' ? 'Trung bình' :
                     priority === 'low' ? 'Thấp' :
                     priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                  <span className="legend-count">({count})</span>
                </div>
              ))}
            </div>
          </div>
          {/* <PieChart 
            title=""
            data={priorityChartData}
            height={150}
          /> */}
        </div>
      </div>


      <style jsx>{`
        .task-status-chart {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .summary-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-label {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .chart-section {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px;
          background: #f9fafb;
        }

        .section-header {
          margin-bottom: 10px;
        }

        .section-header h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .status-legend,
        .priority-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .legend-label {
          font-size: 10px;
          color: #374151;
          font-weight: 500;
        }

        .legend-count {
          font-size: 10px;
          color: #6b7280;
        }


        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .chart-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .summary-stats {
            gap: 16px;
          }

          .assignee-item {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .assignee-stats {
            width: 100%;
            justify-content: space-between;
          }

          .progress-bar {
            width: 80px;
          }
        }
      `}</style>
    </div>
  );
};
