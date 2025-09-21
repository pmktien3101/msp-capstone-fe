"use client";

import { useState } from "react";
import { 
  X, 
  Calendar, 
  User, 
  Flag, 
  FileText, 
  Layers, 
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { mockMembers, mockMilestones } from "@/constants/mockData";

interface DetailTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string, taskTitle: string) => void;
  task: any;
}

export const DetailTaskModal = ({ 
  isOpen, 
  onClose, 
  onEdit,
  onDelete,
  task
}: DetailTaskModalProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!isOpen || !task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "review":
        return "#3b82f6";
      case "done":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#f3f4f6";
      case "in-progress":
        return "#fef3c7";
      case "review":
        return "#dbeafe";
      case "done":
        return "#dcfce7";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "Cần làm";
      case "in-progress":
        return "Đang làm";
      case "review":
        return "Đang review";
      case "done":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "high":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      default:
        return "Trung bình";
    }
  };

  const getMemberName = (memberId: string) => {
    const member = mockMembers.find(m => m.id === memberId);
    return member ? member.name : "Không xác định";
  };

  const getMemberRole = (memberId: string) => {
    const member = mockMembers.find(m => m.id === memberId);
    return member ? member.role : "";
  };

  const getMilestoneNames = (milestoneIds: string[]) => {
    return milestoneIds.map(id => {
      const milestone = mockMilestones.find(m => m.id === id);
      return milestone ? milestone.name : "Không xác định";
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "todo":
        return 0;
      case "in-progress":
        return 50;
      case "review":
        return 75;
      case "done":
        return 100;
      default:
        return 0;
    }
  };

  const isOverdue = () => {
    if (!task.endDate) return false;
    const endDate = new Date(task.endDate);
    const today = new Date();
    return endDate < today && task.status !== "done";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-left">
            <div className="task-icon" style={{ background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="header-info">
              <h2 className="modal-title">{task.title}</h2>
              <div className="task-id">ID: {task.id}</div>
            </div>
          </div>
          <div className="header-actions">
            {onEdit && (
              <button 
                className="action-btn edit-btn" 
                onClick={() => onEdit(task)}
                title="Chỉnh sửa"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button 
                className="action-btn delete-btn" 
                onClick={() => onDelete(task.id, task.title)}
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-content">
          {/* Status and Priority Row */}
          <div className="info-row">
            <div className="info-item">
              <div className="info-label">
                <Flag size={16} />
                Trạng thái
              </div>
              <div 
                className="status-badge-modern" 
                style={{ 
                  background: `linear-gradient(135deg, ${getStatusColor(task.status)}20, ${getStatusColor(task.status)}10)`,
                  color: getStatusColor(task.status),
                  borderColor: getStatusColor(task.status),
                }}
              >
                <div className="status-dot" style={{ backgroundColor: getStatusColor(task.status) }}></div>
                {getStatusLabel(task.status)}
              </div>
            </div>
            <div className="info-item">
              <div className="info-label">
                <AlertCircle size={16} />
                Độ ưu tiên
              </div>
              <div 
                className="priority-badge-modern" 
                style={{ 
                  background: `linear-gradient(135deg, ${getPriorityColor(task.priority)}20, ${getPriorityColor(task.priority)}10)`,
                  color: getPriorityColor(task.priority),
                  borderColor: getPriorityColor(task.priority),
                }}
              >
                <div className="priority-dot" style={{ backgroundColor: getPriorityColor(task.priority) }}></div>
                {getPriorityLabel(task.priority)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Tiến độ</span>
              <span className="progress-percentage">{getProgressPercentage(task.status)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${getProgressPercentage(task.status)}%`,
                  background: `linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%)`
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="description-section">
            <div className="section-header">
              <FileText size={16} />
              <span>Mô tả</span>
            </div>
            <div className="description-content">
              <p className={`description-text ${showFullDescription ? 'expanded' : ''}`}>
                {task.description}
              </p>
              {task.description && task.description.length > 200 && (
                <button 
                  className="toggle-description-btn"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? (
                    <>
                      <EyeOff size={14} />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Xem thêm
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="info-row">
            <div className="info-item full-width">
              <div className="info-label">
                <User size={16} />
                Người thực hiện
              </div>
              <div className="assignee-info">
                {task.assignee ? (
                  <div className="assignee-card">
                    <div className="assignee-avatar" style={{ background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%)' }}>
                      {getMemberName(task.assignee).charAt(0)}
                    </div>
                    <div className="assignee-details">
                      <div className="assignee-name">{getMemberName(task.assignee)}</div>
                      <div className="assignee-role">{getMemberRole(task.assignee)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="unassigned">
                    <User size={16} />
                    <span>Chưa được giao</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="milestones-section">
            <div className="section-header">
              <Layers size={16} />
              <span>Cột mốc</span>
            </div>
            <div className="milestones-content">
              {task.milestoneIds && task.milestoneIds.length > 0 ? (
                <div className="milestones-list">
                  {getMilestoneNames(task.milestoneIds).map((milestoneName, index) => (
                    <div key={index} className="milestone-tag">
                      {milestoneName}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-milestones">
                  <Layers size={16} />
                  <span>Chưa thuộc cột mốc nào</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="dates-section">
            <div className="section-header">
              <Calendar size={16} />
              <span>Thời gian</span>
            </div>
            <div className="dates-grid">
              <div className="date-item">
                <div className="date-label">
                  <Clock size={14} />
                  Ngày bắt đầu
                </div>
                <div className="date-value">{formatDate(task.startDate)}</div>
              </div>
              <div className="date-item">
                <div className="date-label">
                  <CheckCircle size={14} />
                  Ngày kết thúc
                </div>
                <div className={`date-value ${isOverdue() ? 'overdue' : ''}`}>
                  {formatDate(task.endDate)}
                  {isOverdue() && <span className="overdue-indicator">Quá hạn</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <div className="info-grid">
              <div className="info-card">
                <div className="info-card-header">
                  <Clock size={16} />
                  <span>Thời gian tạo</span>
                </div>
                <div className="info-card-value">
                  {new Date().toLocaleDateString("vi-VN")}
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-header">
                  <User size={16} />
                  <span>Người tạo</span>
                </div>
                <div className="info-card-value">
                  {task.assignee ? getMemberName(task.assignee) : "Hệ thống"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .task-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
        }

        .header-info {
          flex: 1;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .task-id {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: #f0f9ff;
          color: #0369a1;
        }

        .edit-btn:hover {
          background: #e0f2fe;
          transform: scale(1.05);
        }

        .delete-btn {
          background: #fef2f2;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #fee2e2;
          transform: scale(1.05);
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #374151;
        }

        .modal-content {
          padding: 0 24px 24px 24px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .status-badge-modern,
        .priority-badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: fit-content;
        }

        .status-dot,
        .priority-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .progress-percentage {
          font-size: 14px;
          font-weight: 700;
          color: #ff8c42;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .description-section,
        .milestones-section,
        .dates-section {
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .description-content {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .description-text {
          margin: 0;
          color: #374151;
          line-height: 1.6;
          font-size: 14px;
        }

        .description-text:not(.expanded) {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .toggle-description-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 6px 12px;
          background: #e2e8f0;
          border: none;
          border-radius: 6px;
          color: #374151;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-description-btn:hover {
          background: #cbd5e1;
        }

        .assignee-info {
          margin-top: 8px;
        }

        .assignee-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
        }

        .assignee-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.3);
        }

        .assignee-details {
          flex: 1;
        }

        .assignee-name {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .assignee-role {
          font-size: 12px;
          color: #64748b;
        }

        .unassigned {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #6b7280;
          font-size: 14px;
        }

        .milestones-content {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .milestones-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .milestone-tag {
          padding: 6px 12px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
        }

        .no-milestones {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
        }

        .dates-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .date-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .date-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .date-value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .date-value.overdue {
          color: #dc2626;
        }

        .overdue-indicator {
          display: inline-block;
          margin-left: 8px;
          padding: 2px 6px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        .additional-info {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .info-card-value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .modal-footer {
          padding: 20px 24px 24px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }

        .btn-close {
          padding: 12px 24px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 16px;
          }

          .modal-container {
            max-width: 100%;
          }

          .modal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-left {
            width: 100%;
          }

          .header-actions {
            align-self: flex-end;
          }

          .info-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .dates-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .modal-footer {
            padding: 16px 20px 20px 20px;
          }

          .btn-close {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
