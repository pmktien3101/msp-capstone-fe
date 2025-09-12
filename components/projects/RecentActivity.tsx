'use client';

import { mockActivities } from '@/constants/mockData';

export const RecentActivity = () => {
  const activities = mockActivities.map((activity, index) => {
    const getTimeAgo = (timestamp: string) => {
      const now = new Date();
      const activityTime = new Date(timestamp);
      const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Vừa xong';
      if (diffInHours < 24) return `khoảng ${diffInHours} giờ trước`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `khoảng ${diffInDays} ngày trước`;
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'done':
          return '#10b981';
        case 'in-progress':
          return '#3b82f6';
        case 'review':
          return '#f59e0b';
        case 'todo':
          return '#6b7280';
        default:
          return '#6b7280';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'done':
          return 'HOÀN THÀNH';
        case 'in-progress':
          return 'ĐANG LÀM';
        case 'review':
          return 'ĐANG REVIEW';
        case 'todo':
          return 'CẦN LÀM';
        default:
          return status.toUpperCase();
      }
    };

    return {
      id: activity.id,
      type: activity.type,
      description: activity.description,
      user: activity.user,
      timestamp: getTimeAgo(activity.timestamp),
      status: activity.status || 'todo',
      statusColor: getStatusColor(activity.status || 'todo'),
      statusLabel: getStatusLabel(activity.status || 'todo'),
      taskId: activity.taskId
    };
  });

  return (
    <div className="recent-activity">
      <div className="section-header">
        <div className="section-title">
          <h3>Hoạt động gần đây</h3>
          <p>Cập nhật những gì đang xảy ra trong dự án.</p>
        </div>
        <button className="expand-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 8V5C21 3.89543 20.1046 3 19 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 21H19C20.1046 21 21 20.1046 21 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="activity-list">
        <div className="activity-group">
          <div className="group-header">
            <h4>Hôm nay</h4>
          </div>
          <div className="group-activities">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">
                  <span className="avatar-text">{activity.user.charAt(0)}</span>
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="user-name">{activity.user}</span>
                    <span className="activity-description">{activity.description}</span>
                  </div>
                  <div className="activity-task">
                    <div className="task-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="task-id">{activity.taskId}</span>
                    <span className="task-title">{activity.description.split('"')[1] || activity.description}</span>
                    <span 
                      className="task-status"
                      style={{ backgroundColor: activity.statusColor }}
                    >
                      {activity.statusLabel}
                    </span>
                  </div>
                  <div className="activity-time">{activity.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .recent-activity {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          height: 400px;
          display: flex;
          flex-direction: column;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
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

        .expand-button {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s ease;
        }

        .expand-button:hover {
          color: #374151;
        }

        .activity-list {
          flex: 1;
          overflow-y: auto;
        }

        .activity-group {
          margin-bottom: 20px;
        }

        .group-header {
          margin-bottom: 12px;
        }

        .group-header h4 {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .group-activities {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .activity-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-text {
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-main {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #3b82f6;
          cursor: pointer;
        }

        .user-name:hover {
          text-decoration: underline;
        }

        .activity-description {
          font-size: 14px;
          color: #374151;
        }

        .activity-task {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .task-icon {
          color: #8b5cf6;
          display: flex;
          align-items: center;
        }

        .task-id {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          font-family: monospace;
        }

        .task-title {
          font-size: 12px;
          color: #3b82f6;
          cursor: pointer;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-title:hover {
          text-decoration: underline;
        }

        .task-status {
          font-size: 10px;
          font-weight: 600;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .activity-time {
          font-size: 12px;
          color: #9ca3af;
        }

        /* Scrollbar styling */
        .activity-list::-webkit-scrollbar {
          width: 6px;
        }

        .activity-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .activity-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .activity-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 768px) {
          .recent-activity {
            height: 350px;
          }

          .activity-item {
            gap: 8px;
          }

          .activity-avatar {
            width: 28px;
            height: 28px;
          }

          .avatar-text {
            font-size: 11px;
          }

          .task-title {
            max-width: 120px;
          }
        }
      `}</style>
    </div>
  );
};