"use client";

import { Task } from "@/types/milestone";
import { mockMilestones } from "@/constants/mockData";
import { Calendar } from "lucide-react";

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

  const getMilestoneInfo = (milestoneId: string) => {
    const milestone = mockMilestones.find(m => m.id === milestoneId);
    if (!milestone) return { name: "Không xác định", color: "#6b7280" };
    
    // Màu sắc dựa trên milestone
    const colors = {
      "milestone-1": "#3b82f6", // Xanh dương cho milestone đầu tiên
      "milestone-2": "#10b981", // Xanh lá cho milestone thứ hai
    };
    
    return {
      name: milestone.name,
      color: colors[milestoneId as keyof typeof colors] || "#6b7280"
    };
  };

  const getAllMilestoneInfo = (milestoneIds: string[]) => {
    return milestoneIds.map(milestoneId => getMilestoneInfo(milestoneId));
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest(
        '.task-menu-btn'
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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

      <div className="task-tags">
        {task.epic && (
          <span className="epic-tag">{task.epic}</span>
        )}
        {getAllMilestoneInfo(task.milestoneIds || []).map((milestone, index) => (
          <span 
            key={index}
            className="milestone-tag" 
            style={{ backgroundColor: milestone.color }}
            title={milestone.name}
          >
            {milestone.name}
          </span>
        ))}
      </div>

      <div className="task-meta">
        <div className="task-due-date">
          <Calendar size={12} />
          <span>
            {task.dueDate && new Date(task.dueDate).toLocaleDateString("vi-VN")}
          </span>
        </div>

        <div className="task-id">
          <span className="task-id-text">{task.id}</span>
        </div>
      </div>

      <div className="task-footer">
        <div className="task-assignee">
          {task.assignedTo ? (
            <div className="assignee-info">
              <div className="assignee-avatar" title={task.assignedTo.name}>
                {task.assignedTo.avatar}
              </div>
              <span className="assignee-name">{task.assignedTo.name}</span>
            </div>
          ) : task.assignee ? (
            <div className="assignee-info">
              <div className="assignee-avatar" title={task.assignee}>
                {task.assignee.charAt(0).toUpperCase()}
              </div>
              <span className="assignee-name">{task.assignee}</span>
            </div>
          ) : (
            <div className="assignee-placeholder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
              <span className="unassigned-text">Chưa giao</span>
            </div>
          )}
        </div>

      </div>

      <style jsx>{`
        .task-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .task-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
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
          margin-bottom: 6px;
        }

        .task-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          flex: 1;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-menu-btn {
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          transition: all 0.2s ease;
        }

        .task-menu-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .task-tags {
          margin-bottom: 8px;
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .epic-tag {
          display: inline-block;
          background: #8b5cf6;
          color: white;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 3px;
          text-transform: uppercase;
        }

        .milestone-tag {
          display: inline-block;
          color: white;
          font-size: 9px;
          font-weight: 500;
          padding: 2px 5px;
          border-radius: 3px;
          text-transform: uppercase;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 3px;
        }

        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 11px;
          color: #6b7280;
        }

        .task-due-date {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .task-id {
          display: flex;
          align-items: center;
        }

        .task-id-text {
          font-weight: 500;
          color: #6b7280;
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

        .assignee-info {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .assignee-avatar {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(251, 146, 60, 0.3);
        }

        .assignee-name {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        .assignee-placeholder {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .assignee-placeholder svg {
          width: 20px;
          height: 20px;
          background: #f3f4f6;
          color: #9ca3af;
          border-radius: 50%;
          padding: 3px;
        }

        .unassigned-text {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
          font-style: italic;
        }


        /* Responsive Design */
        
        /* Tablet (768px - 1023px) */
        @media (max-width: 1023px) and (min-width: 769px) {
          .task-card {
            padding: 10px;
            border-radius: 5px;
          }

          .task-title {
            font-size: 13px;
          }

          .task-menu-btn {
            width: 18px;
            height: 18px;
          }

          .epic-tag {
            font-size: 9px;
            padding: 1px 5px;
          }

          .milestone-tag {
            font-size: 8px;
            padding: 1px 4px;
            max-width: 70px;
          }

          .task-meta {
            font-size: 10px;
            margin-bottom: 6px;
          }

          .assignee-avatar {
            width: 18px;
            height: 18px;
            font-size: 8px;
          }

          .assignee-name {
            font-size: 10px;
          }

          .assignee-placeholder svg {
            width: 18px;
            height: 18px;
          }

          .unassigned-text {
            font-size: 10px;
          }

        }

        /* Mobile Large (481px - 768px) */
        @media (max-width: 768px) and (min-width: 481px) {
          .task-card {
            padding: 8px;
            border-radius: 4px;
          }

          .task-header {
            margin-bottom: 4px;
          }

          .task-title {
            font-size: 12px;
            line-height: 1.2;
          }

          .task-menu-btn {
            width: 16px;
            height: 16px;
          }

          .task-tags {
            margin-bottom: 6px;
            gap: 3px;
          }

          .epic-tag {
            font-size: 8px;
            padding: 1px 4px;
          }

          .milestone-tag {
            font-size: 7px;
            padding: 1px 3px;
            max-width: 60px;
          }

          .task-meta {
            font-size: 9px;
            margin-bottom: 5px;
          }

          .task-footer {
            gap: 4px;
          }

          .assignee-info {
            gap: 3px;
          }

          .assignee-avatar {
            width: 16px;
            height: 16px;
            font-size: 7px;
          }

          .assignee-name {
            font-size: 9px;
          }

          .assignee-placeholder svg {
            width: 16px;
            height: 16px;
          }

          .unassigned-text {
            font-size: 9px;
          }

        }

        /* Mobile Small (320px - 480px) */
        @media (max-width: 480px) {
          .task-card {
            padding: 6px;
            border-radius: 3px;
          }

          .task-header {
            margin-bottom: 3px;
          }

          .task-title {
            font-size: 11px;
            line-height: 1.1;
          }

          .task-menu-btn {
            width: 14px;
            height: 14px;
          }

          .task-tags {
            margin-bottom: 4px;
            gap: 2px;
          }

          .epic-tag {
            font-size: 7px;
            padding: 1px 3px;
          }

          .milestone-tag {
            font-size: 6px;
            padding: 1px 2px;
            max-width: 50px;
          }

          .task-meta {
            font-size: 8px;
            margin-bottom: 4px;
          }

          .task-footer {
            gap: 3px;
          }

          .assignee-info {
            gap: 2px;
          }

          .assignee-avatar {
            width: 14px;
            height: 14px;
            font-size: 6px;
          }

          .assignee-name {
            font-size: 8px;
          }

          .assignee-placeholder svg {
            width: 14px;
            height: 14px;
          }

          .unassigned-text {
            font-size: 8px;
          }

        }
      `}</style>
    </div>
  );
};
