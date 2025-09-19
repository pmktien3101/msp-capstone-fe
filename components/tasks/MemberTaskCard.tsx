'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarDays, 
  Star, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  FolderOpen
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  project: string;
  status: string;
  assignee: string;
  dueDate?: string;
  priority?: string;
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
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return {
          color: '#10b981',
          text: 'Hoàn thành',
          icon: CheckCircle2,
          bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          glowColor: 'rgba(16, 185, 129, 0.3)'
        };
      case 'in-progress':
        return {
          color: '#3b82f6',
          text: 'Đang thực hiện',
          icon: PlayCircle,
          bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          glowColor: 'rgba(59, 130, 246, 0.3)'
        };
      case 'todo':
      case 'pending':
        return {
          color: '#f59e0b',
          text: 'Chờ thực hiện',
          icon: Clock,
          bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          glowColor: 'rgba(245, 158, 11, 0.3)'
        };
      default:
        return {
          color: '#6b7280',
          text: status,
          icon: AlertCircle,
          bgGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          glowColor: 'rgba(107, 114, 128, 0.3)'
        };
    }
  };

  const getPriorityColor = (priority?: string) => {
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

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return '';
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div 
      className="member-task-card"
      onClick={handleTaskClick}
    >
      <div className="task-glow" style={{ background: statusConfig.glowColor }}></div>
      <div className="task-content">
        {/* Task Header */}
        <div className="task-header">
          <div className="task-title-section">
            <div className="task-title-row">
              <h4 className="task-title">{task.title}</h4>
              <div 
                className="status-badge"
                style={{ background: statusConfig.bgGradient }}
              >
                <StatusIcon size={14} />
                <span>{statusConfig.text}</span>
              </div>
            </div>
            <div className="task-meta">
              <span className="task-id">#{task.id}</span>
              <span className="task-project">{task.project}</span>
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

            {task.priority && (
              <div className="task-info-item">
                <div className="info-icon">
                  <Star size={14} />
                </div>
                <div className="info-content">
                  <span className="info-label">Độ ưu tiên</span>
                  <span 
                    className="priority-badge"
                    style={{ color: getPriorityColor(task.priority) }}
                  >
                    {getPriorityText(task.priority)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="task-progress">
          <div className="progress-header">
            <span className="progress-label">Tiến độ</span>
            <span className="progress-percentage">
              {task.status === 'completed' || task.status === 'done' ? '100%' : 
               task.status === 'in-progress' ? '60%' : '20%'}
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: task.status === 'completed' || task.status === 'done' ? '100%' : 
                       task.status === 'in-progress' ? '60%' : '20%',
                background: statusConfig.bgGradient
              }}
            ></div>
          </div>
        </div>

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

        .task-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 22px;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: -1;
          filter: blur(8px);
        }

        .member-task-card:hover .task-glow {
          opacity: 1;
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
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .task-meta {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .task-id {
          font-family: 'Monaco', 'Menlo', monospace;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #475569;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #cbd5e1;
        }

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

        .task-progress {
          width: 100%;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .progress-label {
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
        }

        .progress-percentage {
          color: #1e293b;
          font-size: 11px;
          font-weight: 700;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }


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
