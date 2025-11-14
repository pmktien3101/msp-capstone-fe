'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Star, FolderOpen } from 'lucide-react';
import { getTaskStatusLabel, getTaskStatusColor } from '@/constants/status';

interface Task {
  title: string;
  project?: string;
  dueDate?: string;
  status?: string;
}

interface MemberTaskCardProps {
  task: Task;
  index?: number;
}

export function MemberTaskCard({ task, index = 0 }: MemberTaskCardProps) {
  const router = useRouter();

  const handleTaskClick = () => {
    // Navigate to calendar with the task's due date
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const dateString = taskDate.toISOString().split('T')[0];
      router.push(`/calendar?date=${dateString}`);
    } else {
      // If no due date, go to calendar with current date
      router.push('/calendar');
    }
  };

  // status removed: no status-related UI

  return (
    <div 
      className="member-task-card"
      onClick={handleTaskClick}
    >
  {/* simplified card: no status glow */}
      <div className="task-content">
        {/* Task Header */}
        <div className="task-header">
          <div className="task-title-section">
            <div className="task-title-row">
              <h4 className="task-title">{task.title}</h4>
              {task.status && (
                <div className="status-badge" style={{ background: getTaskStatusColor(task.status), color: '#fff' }}>
                  {getTaskStatusLabel(task.status)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="task-details">
          <div className="task-info-grid">
            <div className="task-info-item">
              <div className="info-icon">
                <FolderOpen size={14} />
              </div>
              <div className="info-content">
                <span className="info-label">Dự án</span>
                <span className="info-value">{task.project || 'N/A'}</span>
              </div>
            </div>

            {task.dueDate && (
              <div className="task-info-item">
                <div className="info-icon">
                  <CalendarDays size={14} />
                </div>
                <div className="info-content">
                  <span className="info-label">Hạn chót</span>
                  <span className="info-value">{new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* progress removed - not available in task type */}

      </div>

      <style jsx>{`
        .member-task-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          cursor: pointer;
        }


        .member-task-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff5e13 0%, #ff7c3a 100%);
          border-radius: 16px 16px 0 0;
        }

        .member-task-card:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px) scale(1.02);
          border-color: transparent;
        }

        .task-content {
          width: 100%;
        }

        .task-header {
          margin-bottom: 12px;
        }

        .task-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
          gap: 10px;
        }

        .task-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
          flex: 1;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: none;
          white-space: nowrap;
        }


        .task-meta {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        /* task-id removed */

        .task-project {
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          background: #f8fafc;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .task-details {
          margin-bottom: 12px;
        }

        .task-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
        }

        .task-info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .info-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #ff5e13 0%, #ff7c3a 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.25);
          transition: all 0.3s ease;
        }

        .task-info-item:hover .info-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 6px 20px rgba(255, 94, 19, 0.4);
        }

        .task-info-item:first-child {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          border: 1px solid #fdba74;
        }

        .task-info-item:first-child .info-icon {
          background: linear-gradient(135deg, #ff5e13 0%, #ff7c3a 100%);
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .info-label {
          color: #64748b;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .info-value {
          color: #1e293b;
          font-size: 12px;
          font-weight: 500;
        }

        .priority-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.05);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* status and progress styles removed - task type doesn't include these fields */


        @media (max-width: 768px) {
          .member-task-card {
            padding: 12px;
            margin-bottom: 8px;
          }

          .task-title-row {
            flex-direction: column;
            gap: 6px;
            align-items: flex-start;
          }

          .task-meta {
            flex-wrap: wrap;
            gap: 6px;
          }

          .task-info-grid {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .task-info-item {
            padding: 6px;
          }

          .info-icon {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
}
