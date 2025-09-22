"use client";

import { Project } from "@/types/project";
import {
  mockMilestones,
  mockTasks,
  calculateMilestoneProgress,
  getMilestoneStatus,
} from "@/constants/mockData";

interface MilestoneProgressProps {
  project: Project;
}

export const MilestoneProgress = ({ project }: MilestoneProgressProps) => {
  // Kiểm tra project có tồn tại không
  if (!project) {
    return (
      <div className="milestone-progress">
        <div className="section-header">
          <div className="section-title">
            <h3>Tiến độ cột mốc</h3>
            <p>Theo dõi tiến độ hoàn thành các cột mốc dự án.</p>
          </div>
        </div>
        <div className="no-data-message">
          <p>Không có thông tin dự án</p>
        </div>
      </div>
    );
  }

  // Filter milestones for this specific project
  const projectMilestones = mockMilestones.filter(m => m.projectId === project.id);
  
  const milestones = projectMilestones.map((milestone) => {
    const progress = calculateMilestoneProgress(milestone.id);
    const status = getMilestoneStatus(milestone.id);

    return {
      ...milestone,
      progress: progress,
      status: status,
      tasks: milestone.tasks.map((taskId) => {
        const task = mockTasks.find(t => t.id === taskId);
        return {
          id: taskId,
          title: task?.title || `Task ${taskId}`,
          completed: task?.status === "done",
        };
      }),
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.2)'
        };
      case "in-progress":
        return {
          background: 'rgba(251, 146, 60, 0.1)',
          color: '#fb923c',
          border: 'rgba(251, 146, 60, 0.2)'
        };
      case "pending":
        return {
          background: 'rgba(107, 114, 128, 0.1)',
          color: '#6b7280',
          border: 'rgba(107, 114, 128, 0.2)'
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
      case "completed":
        return "Hoàn thành";
      case "in-progress":
        return "Đang thực hiện";
      case "pending":
        return "Chờ bắt đầu";
      default:
        return status;
    }
  };

  return (
    <div className="milestone-progress">
      <div className="section-header">
        <div className="section-title">
          <h3>Tiến độ cột mốc</h3>
          <p>Xem tiến độ các mốc quan trọng trong dự án.</p>
        </div>
        <a 
          href="#" 
          className="view-all-link"
          onClick={(e) => {
            e.preventDefault();
            // Navigate to list tab
            const event = new CustomEvent('navigateToTab', { detail: { tab: 'list' } });
            window.dispatchEvent(event);
          }}
        >
          Xem tất cả
        </a>
      </div>

      <div className="milestones-list">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="milestone-item">
            <div className="milestone-header">
              <div className="milestone-info">
                <h4 className="milestone-title">{milestone.name}</h4>
                <p className="milestone-description">{milestone.description}</p>
              </div>
              <div className="milestone-status">
                <span
                  className="status-badge"
                  style={{ 
                    backgroundColor: getStatusColor(milestone.status).background,
                    color: getStatusColor(milestone.status).color,
                    borderColor: getStatusColor(milestone.status).border
                  }}
                >
                  {getStatusLabel(milestone.status)}
                </span>
              </div>
            </div>

            <div className="milestone-progress-bar">
              <div className="progress-container">
                <div
                  className="progress-fill"
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{milestone.progress}%</span>
            </div>

            <div className="milestone-details">
              <div className="milestone-due-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 10H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  Hạn: {new Date(milestone.dueDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="milestone-tasks">
                <span>
                  {milestone.tasks.filter((task) => task.completed).length}/
                  {milestone.tasks.length} công việc
                </span>
              </div>
            </div>

            <div className="milestone-tasks-list">
              {milestone.tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div
                    className={`task-checkbox ${
                      task.completed ? "completed" : ""
                    }`}
                  >
                    {task.completed && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`task-title ${
                      task.completed ? "completed" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .milestone-progress {
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

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .milestone-item {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .milestone-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #fb923c, #fbbf24);
        }

        .milestone-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .milestone-info {
          flex: 1;
        }

        .milestone-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .milestone-description {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }

        .milestone-status {
          flex-shrink: 0;
        }

        .status-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          background: rgba(251, 146, 60, 0.1);
          color: #fb923c;
          border: 1px solid rgba(251, 146, 60, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .milestone-progress-bar {
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

        .milestone-details {
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

        .milestone-due-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .milestone-tasks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .task-checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .task-checkbox.completed {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .task-title {
          font-size: 13px;
          color: #374151;
        }

        .task-title.completed {
          text-decoration: line-through;
          color: #9ca3af;
        }

        @media (max-width: 768px) {
          .milestone-header {
            flex-direction: column;
            gap: 12px;
          }

          .milestone-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};
