'use client';

import { mockTasks, mockMembers, mockMilestones } from '@/constants/mockData';

export const TasksList = () => {
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

  // Sắp xếp tasks theo priority và status
  const sortedTasks = [...mockTasks].sort((a, b) => {
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
          <h3>Danh sách công việc</h3>
        </div>
        <a href="#" className="view-all-link">Xem tất cả</a>
      </div>

      <div className="tasks-content">
          {sortedTasks.map((task) => {
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
          })}
      </div>

      <style jsx>{`
        .tasks-list {
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

        .tasks-content {
          max-height: 600px;
          overflow-y: auto;
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
          gap: 16px;
          padding: 16px;
          background: #fafafa;
          border: 1px solid #f3f4f6;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .task-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
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
          padding: 4px 8px;
          border-radius: 10px;
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

        @media (max-width: 768px) {
          .task-item {
            grid-template-columns: 1fr;
            gap: 12px;
            align-items: flex-start;
          }

          .task-assignee {
            width: auto;
          }

          .task-deadline {
            width: auto;
            justify-content: flex-start;
          }

          .task-status {
            width: auto;
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
