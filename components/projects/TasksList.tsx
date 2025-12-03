'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { TaskStatus, getTaskStatusColor, getTaskStatusLabel } from '@/constants/status';
import { GetTaskResponse } from '@/types/task';
import { taskService } from '@/services/taskService';

interface TasksListProps {
  project: Project;
}

export const TasksList = ({ project }: TasksListProps) => {
  const [tasks, setTasks] = useState<GetTaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      if (!project?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await taskService.getTasksByProjectId(project.id);
        if (result.success && result.data) {
          setTasks(result.data.items || []);
        } else {
          setTasks([]);
        }
      } catch (error) {
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [project?.id]);

  const getStatusColorLegacy = (status: string) => {
    const hexColor = getTaskStatusColor(status);
    
    // Convert hex to rgba for background
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    return {
      background: `rgba(${r}, ${g}, ${b}, 0.1)`,
      color: hexColor,
      border: `rgba(${r}, ${g}, ${b}, 0.2)`
    };
  };

  // Helper function to check if task deadline is within 3 days
  const isDeadlineNear = (endDate: string | undefined): boolean => {
    if (!endDate) return false;
    
    const now = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 3; // Within 3 days and not overdue
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Lọc các tasks đang làm và sắp đến hạn (trong 3 ngày)
  const upcomingDeadlineTasks = tasks
    .filter(task => task.status === TaskStatus.InProgress && isDeadlineNear(task.endDate))
    .sort((a, b) => {
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });

  // Check if project exists
  if (!project) {
    return (
      <div className="tasks-list-summary">
        <div className="task-section-header">
          <div className="task-section-title">
            <h3>Upcoming Deadlines</h3>
            <p>Tasks due within 3 days</p>
          </div>
        </div>
        <div className="no-data-message">
          <p>No project information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-list-summary">
      <div className="task-section-header">
        <div className="task-section-title">
          <h3>Upcoming Deadlines</h3>
          <p>Tasks due within 3 days</p>
        </div>
      </div>

      <div className="tasks-content">
        {isLoading ? (
          <div className="loading-state">
            <p>Loading tasks...</p>
          </div>
        ) : upcomingDeadlineTasks.length > 0 ? (
          <div className="tasks-list-items">
            {upcomingDeadlineTasks.map((task) => {
              const daysUntilDeadline = task.endDate 
                ? Math.ceil((new Date(task.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={task.id} className="task-item">
                  <div className="task-deadline-badge">
                    <div className="deadline-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 7V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="deadline-content">
                      <div className="deadline-date">{task.endDate ? formatDate(task.endDate) : 'N/A'}</div>
                      <div className="deadline-text">
                        {daysUntilDeadline === 0 ? 'Today' : daysUntilDeadline === 1 ? 'Tomorrow' : `${daysUntilDeadline} days`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="task-content">
                    <div className="task-header">
                      <h4 className="task-title">{task.title}</h4>
                      <div 
                        className="task-status-badge"
                        style={{ 
                          backgroundColor: getStatusColorLegacy(task.status).background,
                          color: getStatusColorLegacy(task.status).color,
                        }}
                      >
                        <div className="status-dot"></div>
                        <span>{getTaskStatusLabel(task.status)}</span>
                      </div>
                    </div>
                    
                    <div className="task-assignee">
                      {task.user ? (
                        <>
                          <div className="assignee-avatar">
                            {task.user.avatarUrl ? (
                              <img src={task.user.avatarUrl} alt={task.user.fullName || 'User'} />
                            ) : (
                              task.user.fullName?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <span className="assignee-name">{task.user.fullName || 'Unknown'}</span>
                        </>
                      ) : (
                        <>
                          <div className="assignee-avatar unassigned">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span className="assignee-name">Unassigned</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-tasks">
            <div className="no-tasks-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>No tasks with upcoming deadlines</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .tasks-list-summary {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .task-section-header {
          margin-bottom: 24px;
        }

        .task-section-title h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .task-section-title p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .tasks-content {
          max-height: 400px;
          overflow-y: auto;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .loading-state p {
          color: #6b7280;
          font-size: 14px;
        }

        .tasks-list-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .task-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #ef4444, #f59e0b);
        }

        .task-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        .task-deadline-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #ef4444, #f59e0b);
          color: white;
          padding: 6px 8px;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3);
          flex-shrink: 0;
        }

        .deadline-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .deadline-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .deadline-date {
          font-size: 9px;
          opacity: 0.9;
          font-weight: 500;
          line-height: 1.2;
        }

        .deadline-text {
          font-size: 11px;
          font-weight: 600;
          line-height: 1.2;
        }

        .task-content {
          flex: 1;
          min-width: 0;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .task-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-status-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 1px 6px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }

        .status-dot {
          width: 3px;
          height: 3px;
          background: currentColor;
          border-radius: 50%;
        }

        .task-assignee {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #64748b;
        }

        .assignee-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 600;
          border: 1px solid white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .assignee-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .assignee-avatar.unassigned {
          background: #f1f5f9;
          color: #94a3b8;
        }

        .assignee-name {
          font-weight: 500;
        }

        .no-tasks {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .no-tasks-icon {
          color: #9ca3af;
          margin-bottom: 16px;
        }

        .no-tasks p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
      `}</style>
    </div>
  );
};
