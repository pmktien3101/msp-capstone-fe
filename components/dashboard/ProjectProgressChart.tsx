'use client';

import { mockTasks, mockProjects, mockMilestones } from '@/constants/mockData';
import { calculateMilestoneProgress } from '@/constants/mockData';

interface ProjectProgressChartProps {
  projectId?: string;
}

export const ProjectProgressChart = ({ projectId = "1" }: ProjectProgressChartProps) => {
  // Lấy dữ liệu project cụ thể
  const currentProject = mockProjects.find(p => p.id === projectId);
  
  if (!currentProject) {
    return <div>Project not found</div>;
  }

  // Lấy milestones của project này
  const projectMilestones = mockMilestones.filter(m => m.projectId === projectId);
  
  // Tính toán dữ liệu cho biểu đồ tiến độ dự án
  const projectData = {
    name: currentProject.name,
    startDate: currentProject.startDate,
    endDate: currentProject.endDate,
    milestones: projectMilestones.map(milestone => ({
      id: milestone.id,
      name: milestone.name,
      dueDate: milestone.dueDate,
      progress: calculateMilestoneProgress(milestone.id),
      status: milestone.status,
      tasks: milestone.tasks.length
    }))
  };

  // Tính tổng tiến độ dự án
  const totalProgress = projectData.milestones.length > 0 
    ? Math.round(projectData.milestones.reduce((sum, m) => sum + m.progress, 0) / projectData.milestones.length)
    : 0;

  // Tính số ngày đã trôi qua
  const startDate = new Date(projectData.startDate);
  const endDate = new Date(projectData.endDate);
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, totalDays - elapsedDays);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      case 'overdue':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'pending':
        return 'Chưa bắt đầu';
      case 'overdue':
        return 'Trễ hạn';
      default:
        return status;
    }
  };

  return (
    <div className="project-progress-chart">
      <div className="chart-header">
        <h3>Tiến Độ Dự Án</h3>
        <div className="project-info">
          <span className="project-name">{projectData.name}</span>
          <span className="project-dates">
            {new Date(projectData.startDate).toLocaleDateString('vi-VN')} - {new Date(projectData.endDate).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      <div className="overall-progress">
        <div className="progress-header">
          <span className="progress-label">Tiến độ tổng thể</span>
          <span className="progress-percentage">{totalProgress}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
        <div className="progress-details">
          <span className="elapsed-days">Đã trôi qua: {elapsedDays} ngày</span>
          <span className="remaining-days">Còn lại: {remainingDays} ngày</span>
        </div>
      </div>

      <div className="milestones-section">
        <h4>Các cột mốc</h4>
        <div className="milestones-list">
          {projectData.milestones.map((milestone, index) => (
            <div key={milestone.id} className="milestone-item">
              <div className="milestone-header">
                <div className="milestone-info">
                  <span className="milestone-number">{index + 1}</span>
                  <div className="milestone-details">
                    <h5 className="milestone-name">{milestone.name}</h5>
                    <span className="milestone-due-date">
                      Hạn: {new Date(milestone.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="milestone-status">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(milestone.status)}20`,
                      color: getStatusColor(milestone.status)
                    }}
                  >
                    {getStatusText(milestone.status)}
                  </span>
                </div>
              </div>
              
              <div className="milestone-progress">
                <div className="progress-info">
                  <span className="progress-text">{milestone.progress}% hoàn thành</span>
                  <span className="tasks-count">{milestone.tasks} công việc</span>
                </div>
                <div className="milestone-progress-bar">
                  <div 
                    className="milestone-progress-fill"
                    style={{ 
                      width: `${milestone.progress}%`,
                      backgroundColor: getStatusColor(milestone.status)
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .project-progress-chart {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-header {
          margin-bottom: 16px;
        }

        .chart-header h3 {
          margin: 0 0 6px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .project-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .project-name {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .project-dates {
          font-size: 12px;
          color: #6b7280;
        }

        .overall-progress {
          margin-bottom: 20px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .progress-percentage {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .progress-bar-container {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        .progress-details {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #6b7280;
        }

        .milestones-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .milestone-item {
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .milestone-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .milestone-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }

        .milestone-details {
          flex: 1;
        }

        .milestone-name {
          margin: 0 0 2px 0;
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .milestone-due-date {
          font-size: 11px;
          color: #6b7280;
        }

        .milestone-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .milestone-progress {
          margin-top: 12px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-text {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .tasks-count {
          font-size: 12px;
          color: #6b7280;
        }

        .milestone-progress-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .milestone-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .project-progress-chart {
            padding: 16px;
          }

          .milestone-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .milestone-status {
            align-self: flex-end;
          }

          .progress-details {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};
