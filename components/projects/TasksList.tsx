'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { TaskStatus, getTaskStatusColor, getTaskStatusLabel } from '@/constants/status';
import { GetTaskResponse } from '@/types/task';
import { taskService } from '@/services/taskService';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
import '@/app/styles/tasks-list.scss';

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

  // Lọc các tasks đang làm
  const inProgressTasks = tasks.filter(task => task.status === TaskStatus.InProgress);
  
  // Sắp xếp tasks theo endDate (gần deadline nhất lên đầu)
  const sortedTasks = [...inProgressTasks].sort((a, b) => {
    if (!a.endDate) return 1;
    if (!b.endDate) return -1;
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });

  // Use pagination hook
  const pagination = usePagination({
    data: sortedTasks,
    itemsPerPage: 5,
  });

  // Kiểm tra project có tồn tại không
  if (!project) {
    return (
      <div className="tasks-list">
        <div className="section-header">
          <div className="section-title">
            <h3>Công việc đang làm</h3>
          </div>
        </div>
        <div className="no-data-message">
          <p>Không có thông tin dự án</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="tasks-list">
        <div className="section-header">
          <div className="section-title">
            <h3>Công việc đang làm</h3>
          </div>
        </div>
        <div className="tasks-content">
          <div className="no-tasks-message">
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-list">
      <div className="section-header">
        <div className="section-title">
          <h3>Công việc đang làm</h3>
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
            <h4>Không có công việc nào đang làm</h4>
            <p>Tất cả công việc đang chờ bắt đầu hoặc đã hoàn thành.</p>
          </div>
        ) : (
          <div className="tasks-list-items">
            {pagination.paginatedData.map((task, index) => {
            const actualIndex = pagination.startIndex + index;
            return (
              <div key={task.id} className="task-item">
                <div className="task-number">#{actualIndex + 1}</div>
                <div className="task-content">
                  <h4 className="task-title">{task.title}</h4>
                </div>
                
                <div className="task-assignee">
                  {task.user ? (
                    <div className="assignee-info">
                      <div className="assignee-avatar">
                        {task.user.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="assignee-name">{task.user.fullName || 'Unknown'}</span>
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
                  <span>{task.endDate ? new Date(task.endDate).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                </div>
                
                <div 
                  className="task-status"
                  style={{ 
                    backgroundColor: getStatusColorLegacy(task.status).background,
                    color: getStatusColorLegacy(task.status).color,
                    borderColor: getStatusColorLegacy(task.status).border
                  }}
                >
                  {getTaskStatusLabel(task.status)}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedTasks.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={5}
          onPageChange={pagination.setCurrentPage}
          showInfo={true}
        />
      )}
    </div>
  );
};
