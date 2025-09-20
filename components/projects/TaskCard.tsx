"use client";

import { Task } from "@/types/milestone";

interface TaskCardProps {
  task: Task;
  onMove: (newStatus: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onTaskClick?: (task: Task) => void;
  isDragging?: boolean;
}

export const TaskCard = ({
  task,
  onMove,
  onDragStart,
  onTaskClick,
  isDragging,
}: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest(
        '.task-menu-btn, .link-btn, input[type="checkbox"]'
      )
    ) {
      return;
    }
    onTaskClick?.(task);
  };

  return (
    <div
      className={`task-card ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
      onClick={handleCardClick}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <button className="task-menu-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="19"
              cy="12"
              r="1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="5"
              cy="12"
              r="1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="task-epic">
        <span className="epic-tag">{task.epic}</span>
      </div>

      <div className="task-meta">
        <div className="task-due-date">
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
            {task.dueDate && new Date(task.dueDate).toLocaleDateString("vi-VN")}
          </span>
        </div>

        <div className="task-id">
          <input type="checkbox" id={`task-${task.id}`} />
          <label htmlFor={`task-${task.id}`}>{task.id}</label>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-assignee">
          {task.assignee ? (
            <div className="assignee-avatar">{task.assignee}</div>
          ) : (
            <div className="assignee-placeholder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="task-links">
          <button className="link-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9319 14.9411 13.6467 14.9923C14.3614 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11C13.5705 10.4259 13.0226 9.95085 12.3934 9.60707C11.7643 9.26329 11.0681 9.05886 10.3533 9.00766C9.63864 8.95645 8.92037 9.05972 8.24861 9.31026C7.57685 9.5608 6.96684 9.953 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.666 2.05659 16.977C2.06799 18.288 2.59383 19.542 3.52087 20.469C4.44791 21.396 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .task-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .task-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .task-card:active {
          cursor: grabbing;
        }

        .task-card.dragging {
          opacity: 0.5;
          transform: rotate(5deg);
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
          line-height: 1.4;
        }

        .task-menu-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .task-menu-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .task-epic {
          margin-bottom: 12px;
        }

        .epic-tag {
          display: inline-block;
          background: #8b5cf6;
          color: white;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 12px;
          color: #6b7280;
        }

        .task-due-date {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .task-id {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .task-id input[type="checkbox"] {
          margin: 0;
        }

        .task-id label {
          cursor: pointer;
          font-weight: 500;
        }

        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .task-assignee {
          display: flex;
          align-items: center;
        }

        .assignee-avatar {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .assignee-placeholder {
          width: 24px;
          height: 24px;
          background: #f3f4f6;
          color: #9ca3af;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .task-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .link-btn {
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .link-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>
    </div>
  );
};
