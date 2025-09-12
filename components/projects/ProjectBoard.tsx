'use client';

import { Project } from '@/types/project';

interface ProjectBoardProps {
  project: Project;
}

export const ProjectBoard = ({ project }: ProjectBoardProps) => {
  // Mock board data
  const columns = [
    {
      id: 'todo',
      title: 'Cần làm',
      color: '#6b7280',
      tasks: [
        {
          id: '1',
          title: 'Thiết kế database schema',
          description: 'Tạo cấu trúc cơ sở dữ liệu cho hệ thống',
          assignee: 'John Doe',
          priority: 'high',
          dueDate: '2025-10-15'
        },
        {
          id: '2',
          title: 'Setup CI/CD pipeline',
          description: 'Thiết lập quy trình tích hợp và triển khai liên tục',
          assignee: 'Jane Smith',
          priority: 'medium',
          dueDate: '2025-10-20'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'Đang làm',
      color: '#f59e0b',
      tasks: [
        {
          id: '3',
          title: 'Phát triển API endpoints',
          description: 'Xây dựng các API cho quản lý dự án',
          assignee: 'John Doe',
          priority: 'high',
          dueDate: '2025-10-10'
        }
      ]
    },
    {
      id: 'review',
      title: 'Đang review',
      color: '#3b82f6',
      tasks: [
        {
          id: '4',
          title: 'Thiết kế UI components',
          description: 'Tạo các component giao diện người dùng',
          assignee: 'Jane Smith',
          priority: 'medium',
          dueDate: '2025-10-12'
        }
      ]
    },
    {
      id: 'done',
      title: 'Hoàn thành',
      color: '#10b981',
      tasks: [
        {
          id: '5',
          title: 'Setup project structure',
          description: 'Khởi tạo cấu trúc dự án và cài đặt dependencies',
          assignee: 'John Doe',
          priority: 'low',
          dueDate: '2025-09-30'
        }
      ]
    }
  ];

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

  return (
    <div className="project-board">
      <div className="board-header">
        <h3>Bảng Dự Án</h3>
        <p>Quản lý công việc theo từng giai đoạn</p>
      </div>

      <div className="board-container">
        <div className="board-columns">
          {columns.map((column) => (
            <div key={column.id} className="board-column">
              <div className="column-header">
                <div className="column-title">
                  <div 
                    className="column-indicator"
                    style={{ backgroundColor: column.color }}
                  ></div>
                  <span>{column.title}</span>
                </div>
                <span className="column-count">{column.tasks.length}</span>
              </div>

              <div className="column-content">
                {column.tasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <h4 className="task-title">{task.title}</h4>
                      <div 
                        className="task-priority"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {getPriorityLabel(task.priority)}
                      </div>
                    </div>
                    
                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-meta">
                      <div className="task-assignee">
                        <div className="assignee-avatar">
                          {task.assignee.charAt(0)}
                        </div>
                        <span>{task.assignee}</span>
                      </div>
                      
                      <div className="task-due-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .project-board {
          width: 100%;
        }

        .board-header {
          margin-bottom: 24px;
        }

        .board-header h3 {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .board-header p {
          color: #6b7280;
          margin: 0;
        }

        .board-container {
          overflow-x: auto;
          padding-bottom: 20px;
        }

        .board-columns {
          display: flex;
          gap: 20px;
          min-width: max-content;
        }

        .board-column {
          min-width: 300px;
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .column-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
        }

        .column-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .column-count {
          background: #e5e7eb;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .column-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .task-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .task-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          flex: 1;
        }

        .task-priority {
          color: white;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .task-description {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #9ca3af;
        }

        .task-assignee {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .assignee-avatar {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .task-due-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};
