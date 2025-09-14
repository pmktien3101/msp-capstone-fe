'use client';

import { useState } from 'react';

interface MilestoneGroupProps {
  milestone: any;
  tasks: any[];
  onTaskClick?: (task: any) => void;
  onTaskToggle?: (taskId: string) => void;
}

export const MilestoneGroup = ({ milestone, tasks, onTaskClick, onTaskToggle }: MilestoneGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'delayed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '🏁';
      case 'in-progress': return '🚧';
      case 'pending': return '⏳';
      case 'delayed': return '⚠️';
      default: return '🏁';
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="milestone-group">
      {/* Milestone Header */}
      <div 
        className="milestone-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ backgroundColor: getStatusColor(milestone.status) }}
      >
        <div className="milestone-header-content">
          <div className="milestone-info">
            <span className="milestone-icon">{getStatusIcon(milestone.status)}</span>
            <div className="milestone-details">
              <h4 className="milestone-title">{milestone.name || milestone.title}</h4>
              <span className="milestone-date">
                {new Date(milestone.dueDate || milestone.endDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
          <div className="milestone-stats">
            <span className="task-count">{completedTasks}/{totalTasks}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <button className="expand-btn">
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isExpanded && (
        <div className="milestone-tasks">
          {tasks.map((task, index) => (
            <div 
              key={task.id}
              className="milestone-task"
              style={{ top: index * 50 + 60 }}
              onClick={() => onTaskClick?.(task)}
            >
              <input 
                type="checkbox" 
                checked={task.status === 'done'}
                onChange={() => onTaskToggle?.(task.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className="task-assignee">{task.assignee || 'Unassigned'}</span>
                  <span className="task-due-date">
                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
              <div className="task-status">
                <span className={`status-badge status-${task.status}`}>
                  {task.status === 'todo' && 'Chờ xử lý'}
                  {task.status === 'in-progress' && 'Đang thực hiện'}
                  {task.status === 'done' && 'Hoàn thành'}
                  {task.status === 'review' && 'Đang review'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .milestone-group {
          margin-bottom: 16px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .milestone-header {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .milestone-header:hover {
          opacity: 0.9;
        }

        .milestone-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          color: white;
        }

        .milestone-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .milestone-icon {
          font-size: 20px;
        }

        .milestone-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .milestone-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .milestone-date {
          font-size: 12px;
          opacity: 0.9;
        }

        .milestone-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .task-count {
          font-size: 14px;
          font-weight: 600;
        }

        .progress-bar {
          width: 60px;
          height: 6px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .expand-btn {
          background: none;
          border: none;
          color: white;
          font-size: 12px;
          cursor: pointer;
          padding: 4px;
        }

        .milestone-tasks {
          background: white;
          position: relative;
        }

        .milestone-task {
          position: absolute;
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .milestone-task:hover {
          background: #f8fafc;
        }

        .milestone-task:last-child {
          border-bottom: none;
        }

        .task-content {
          flex: 1;
          margin-left: 12px;
        }

        .task-title {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .task-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
        }

        .task-assignee {
          font-weight: 500;
        }

        .task-due-date {
          color: #9ca3af;
        }

        .task-status {
          margin-left: 12px;
        }

        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-todo {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-in-progress {
          background: #fef3c7;
          color: #d97706;
        }

        .status-done {
          background: #d1fae5;
          color: #059669;
        }

        .status-review {
          background: #dbeafe;
          color: #2563eb;
        }
      `}</style>
    </div>
  );
};
