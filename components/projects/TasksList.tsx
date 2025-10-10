'use client';

import { Project } from '@/types/project';
import { mockTasks, mockMembers, mockMilestones } from '@/constants/mockData';

interface TasksListProps {
  project: Project;
}

export const TasksList = ({ project }: TasksListProps) => {
  // Kiểm tra project có tồn tại không
  if (!project) {
    return (
      <div className="tasks-list">
        <div className="section-header">
          <div className="section-title">
            <h3>Công việc cần review</h3>
          </div>
        </div>
        <div className="no-data-message">
          <p>Không có thông tin dự án</p>
        </div>
      </div>
    );
  }

  // Filter tasks for this specific project
  const projectMilestones = mockMilestones.filter(m => m.projectId === project.id);
  const projectTasks = mockTasks.filter(task => 
    task.milestoneIds.some(milestoneId => projectMilestones.some(m => m.id === milestoneId))
  );
  // Lấy thông tin member và milestone
  const getMemberInfo = (memberId: string) => {
    return mockMembers.find(member => member.id === memberId);
  };

  const getMilestoneInfo = (milestoneIds: string[]) => {
    return milestoneIds.map(id => mockMilestones.find(milestone => milestone.id === id)).filter(Boolean);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.2)'
        };
      case 'in-progress':
        return {
          background: 'rgba(251, 146, 60, 0.1)',
          color: '#fb923c',
          border: 'rgba(251, 146, 60, 0.2)'
        };
      case 'review':
        return {
          background: 'rgba(251, 191, 36, 0.1)',
          color: '#fbbf24',
          border: 'rgba(251, 191, 36, 0.2)'
        };
      case 'todo':
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
      case 'done':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang làm';
      case 'review':
        return 'Đang review';
      case 'todo':
        return 'Cần làm';
      default:
        return status;
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority;
    }
  };

  // Lọc chỉ các tasks cần review
  const reviewTasks = projectTasks.filter(task => task.status === 'review');
  
  // Sắp xếp tasks theo priority và status
  const sortedTasks = [...reviewTasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const statusOrder = { todo: 4, 'in-progress': 3, review: 2, done: 1 };
    
    if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    }
    
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
  });

  return (
    <div className="tasks-list">
      <div className="section-header">
        <div className="section-title">
          <h3>Công việc cần review</h3>
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
          Xem tất cả
        </a>
      </div>

      <div className="tasks-content">
          {sortedTasks.length === 0 ? (
            <div className="no-tasks-message">
              <div className="no-tasks-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Không có công việc nào cần review</h4>
              <p>Tất cả công việc đã được hoàn thành hoặc đang trong quá trình thực hiện.</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
            const member = getMemberInfo(task.assignee);
            const milestones = getMilestoneInfo(task.milestoneIds || []);
            
            return (
              <div key={task.id} className="task-item">
                <div className="task-content">
                  <h4 className="task-title">{task.title}</h4>
                </div>
                
                <div className="task-assignee">
                  {member ? (
                    <div className="assignee-info">
                      <div className="assignee-avatar">
                        {member.avatar}
                      </div>
                      <span className="assignee-name">{member.name}</span>
                    </div>
                  ) : (
                    <div className="assignee-info">
                      <div className="assignee-placeholder">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="assignee-name">Chưa giao</span>
                    </div>
                  )}
                </div>
                
                <div className="task-deadline">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{new Date(task.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                
                <div 
                  className="task-status"
                  style={{ 
                    backgroundColor: getStatusColor(task.status).background,
                    color: getStatusColor(task.status).color,
                    borderColor: getStatusColor(task.status).border
                  }}
                >
                  {getStatusLabel(task.status)}
                </div>
              </div>
            );
          })
          )}
      </div>

      <style jsx>{`
        .tasks-list {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .tasks-list::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #FF5E13 0%, #FF8C42 50%, #FFB366 100%);
          border-radius: 16px 16px 0 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
          padding-top: 8px;
        }

        .section-title h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
          letter-spacing: -0.025em;
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

        .tasks-content {
          max-height: 600px;
          overflow-y: auto;
        }

        .no-tasks-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #6b7280;
        }

        .no-tasks-icon {
          margin-bottom: 16px;
          color: #d1d5db;
        }

        .no-tasks-message h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .no-tasks-message p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          display: grid;
          grid-template-columns: 1fr 140px 120px 100px;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .task-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #FF5E13 0%, #FF8C42 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .task-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .task-item:hover::before {
          opacity: 1;
        }

        .task-content {
          min-width: 0;
          overflow: hidden;
        }

        .task-title {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }

        .task-assignee {
          display: flex;
          align-items: center;
          width: 140px;
          overflow: hidden;
        }

        .assignee-info {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          min-width: 0;
        }

        .assignee-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(251, 146, 60, 0.3);
          flex-shrink: 0;
        }

        .assignee-placeholder {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #d1d5db;
          flex-shrink: 0;
        }

        .assignee-name {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .task-deadline {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
          background: #f9fafb;
          padding: 6px 10px;
          border-radius: 6px;
          width: 120px;
          justify-content: center;
          flex-shrink: 0;
        }

        .task-status {
          font-size: 9px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          text-align: center;
          width: 100px;
          flex-shrink: 0;
          line-height: 1.2;
          background: rgba(251, 146, 60, 0.1);
          color: #fb923c;
          border: 1px solid rgba(251, 146, 60, 0.2);
        }

        /* Scrollbar styling */
        .tasks-content::-webkit-scrollbar {
          width: 6px;
        }

        .tasks-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .tasks-content::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 3px;
        }

        .tasks-content::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }

        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .tasks-list {
            padding: 20px;
          }

          .task-item {
            grid-template-columns: 1fr 120px 100px 80px;
            gap: 12px;
            padding: 14px;
          }

          .task-title {
            font-size: 14px;
          }

          .assignee-avatar {
            width: 24px;
            height: 24px;
            font-size: 10px;
          }

          .assignee-name {
            font-size: 12px;
          }

          .task-deadline {
            width: 100px;
            font-size: 11px;
            padding: 5px 8px;
          }

          .task-status {
            width: 80px;
            font-size: 8px;
            padding: 2px 5px;
          }
        }

        /* Mobile Large (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .tasks-list {
            padding: 16px;
          }

          .section-header {
            margin-bottom: 20px;
          }

          .section-title h3 {
            font-size: 15px;
          }

          .section-title p {
            font-size: 13px;
          }

          .task-item {
            grid-template-columns: 1fr;
            gap: 12px;
            align-items: flex-start;
            padding: 12px;
          }

          .task-content {
            order: 1;
          }

          .task-title {
            font-size: 14px;
            margin-bottom: 8px;
          }

          .task-assignee {
            width: auto;
            order: 2;
            justify-content: flex-start;
          }

          .assignee-info {
            gap: 6px;
          }

          .assignee-avatar {
            width: 24px;
            height: 24px;
            font-size: 10px;
          }

          .assignee-name {
            font-size: 12px;
          }

          .task-deadline {
            width: auto;
            justify-content: flex-start;
            order: 3;
            font-size: 11px;
            padding: 5px 8px;
          }

          .task-status {
            width: auto;
            align-self: flex-start;
            order: 4;
            font-size: 8px;
            padding: 2px 5px;
          }
        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .tasks-list {
            padding: 12px;
          }

          .section-header {
            margin-bottom: 16px;
          }

          .section-title h3 {
            font-size: 14px;
          }

          .section-title p {
            font-size: 12px;
          }

          .view-all-link {
            font-size: 12px;
          }

          .task-item {
            grid-template-columns: 1fr;
            gap: 10px;
            padding: 10px;
          }

          .task-title {
            font-size: 13px;
            margin-bottom: 6px;
          }

          .task-assignee {
            width: auto;
            order: 2;
          }

          .assignee-info {
            gap: 5px;
          }

          .assignee-avatar {
            width: 22px;
            height: 22px;
            font-size: 9px;
          }

          .assignee-name {
            font-size: 11px;
          }

          .task-deadline {
            width: auto;
            order: 3;
            font-size: 10px;
            padding: 4px 6px;
          }

          .task-status {
            width: auto;
            order: 4;
            font-size: 7px;
            padding: 1px 4px;
          }
        }
      `}</style>
    </div>
  );
};
