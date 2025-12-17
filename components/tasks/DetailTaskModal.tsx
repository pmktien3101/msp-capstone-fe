"use client";

import React, { useState, useEffect } from "react";
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
  EyeOff,
  MessageCircle,
  Send,
  MoreVertical,
} from "lucide-react";
import { TaskStatus, getTaskStatusColor, TASK_STATUS_LABELS } from "@/constants/status";
import { useUser } from "@/hooks/useUser";
import { formatDate as formatDateHelper, formatTime, formatDateTime } from '@/lib/formatDate';
import { projectService } from "@/services/projectService";
import type { GetTaskResponse } from "@/types/task";
import type { ProjectMember } from "@/types/project";
import type { MilestoneBackend } from "@/types/milestone";
import ReassignmentHistoryTable from "./ReassignmentHistoryTable";

interface DetailTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: GetTaskResponse | null;
  projectId?: string;
}

export const DetailTaskModal = ({ 
  isOpen, 
  onClose, 
  task,
  projectId
}: DetailTaskModalProps) => {
  const { role } = useUser();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch members when modal opens (for displaying assignee name)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) return;
      
      setIsLoadingMembers(true);
      try {
        const response = await projectService.getProjectMembers(projectId);
        if (response.success && response.data) {
          // Filter out members who have left the project
          const activeMembers = response.data.filter((pm: any) => !pm.leftAt);
          setMembers(activeMembers);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId]);

  if (!isOpen || !task) return null;

  const getStatusBgColor = (status: string) => {
    const color = getTaskStatusColor(status);
    // Convert hex to light background
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Lighten the color for background
    const lightR = Math.min(255, r + (255 - r) * 0.85);
    const lightG = Math.min(255, g + (255 - g) * 0.85);
    const lightB = Math.min(255, b + (255 - b) * 0.85);
    
    return `rgb(${Math.round(lightR)}, ${Math.round(lightG)}, ${Math.round(lightB)})`;
  };

  const getMemberName = (userId?: string) => {
    if (!userId) return "Chưa giao";
    
    // First try to get from task.user
    if (task.user && task.userId === userId) {
      return task.user.fullName || task.user.email;
    }
    
    // Then try to find in members list
    const member = members.find(pm => pm.userId === userId);
    return member?.member?.fullName || member?.member?.email || "Không xác định";
  };

  const getMemberRole = (userId?: string) => {
    if (!userId) return "";
    
    const member = members.find(pm => pm.userId === userId);
    return member?.member?.role || "";
  };

  const getMilestoneNames = () => {
    if (!task.milestones || task.milestones.length === 0) {
      return ["Không có cột mốc"];
    }
    return task.milestones.map(m => m.name);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có";
    // use shared helper for consistent dd/mm/yyyy output
    return formatDateHelper(dateString);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <div className="header-info">
              <div className="task-title-section">
                <label className="field-label">Tên công việc</label>
                <div className="read-only-title">{task.title}</div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-content">
          {/* Status Row (Read-only) */}
          <div className="info-row">
            <div className="info-item">
              <div className="info-label">
                <Flag size={16} />
                Trạng thái
              </div>
              <div 
                className="status-badge-modern"
                style={{
                  background: getStatusBgColor(task.status),
                  color: getTaskStatusColor(task.status),
                  padding: '6px 12px',
                  borderRadius: '6px',
                  display: 'inline-block'
                }}
              >
                {TASK_STATUS_LABELS[task.status as TaskStatus]}
              </div>
            </div>
          </div>

          {/* Description (Read-only) */}
          <div className="description-section">
            <div className="section-header">
              <FileText size={16} />
              <span>Mô tả</span>
            </div>
            <div className="description-content">
              <div className="read-only-description">{task.description || "Không có mô tả"}</div>
            </div>
          </div>

          {/* Assignee (Read-only) */}
          <div className="info-row">
            <div className="info-item full-width">
              <div className="info-label">
                <User size={16} />
                Người thực hiện
              </div>
              <div className="assignee-info">
                <div className="read-only-assignee">
                  {task.userId ? (
                    <div className="assignee-display">
                      <div className="assignee-avatar">
                        <span>{getMemberName(task.userId)?.charAt(0) || 'U'}</span>
                      </div>
                      <span>{getMemberName(task.userId)}</span>
                    </div>
                  ) : (
                    <span className="unassigned-text">Chưa giao</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Milestones (Read-only) */}
          <div className="milestones-section">
            <div className="section-header">
              <Layers size={16} />
              <span>Cột mốc liên quan</span>
            </div>
            <div className="milestones-grid">
              {task.milestones && task.milestones.length > 0 ? (
                task.milestones.map((milestone) => (
                  <div key={milestone.id} className="milestone-card">
                    <div className="milestone-icon">
                      <CheckCircle size={14} />
                    </div>
                    <div className="milestone-info">
                      <div className="milestone-name">{milestone.name}</div>
                      {milestone.dueDate && (
                        <div className="milestone-date">
                          <Clock size={12} />
                          <span>{new Date(milestone.dueDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-milestones-empty">
                  <AlertCircle size={20} />
                  <span>Chưa có cột mốc nào</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates (Read-only) */}
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
                <div className="read-only-date">
                  {task.startDate ? new Date(task.startDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                </div>
              </div>
              <div className="date-item">
                <div className="date-label">
                  <CheckCircle size={14} />
                  Ngày kết thúc
                </div>
                <div className="read-only-date">
                  {task.endDate ? new Date(task.endDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                </div>
              </div>
            </div>
          </div>

          {/* Add reassignment history table (uses API to fetch and render) */}
          {task.id && (
            <ReassignmentHistoryTable taskId={task.id} />
          )}
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
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
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
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
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
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .info-item {
          display: flex;
          flex-direction: row;
          align-items: center;
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
          padding: 4px 8px;
          border-radius: 12px;
          border: 1px solid;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: fit-content;
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

        .milestones-section {
          margin-bottom: 24px;
        }

        .milestones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .milestone-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #fff7ed 0%, #fff3e6 100%);
          border: 2px solid #fed7aa;
          border-radius: 10px;
          transition: all 0.2s ease;
          cursor: default;
        }

        .milestone-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 146, 60, 0.2);
          border-color: #fb923c;
        }

        .milestone-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          border-radius: 8px;
          color: white;
          flex-shrink: 0;
        }

        .milestone-info {
          flex: 1;
          min-width: 0;
        }

        .milestone-name {
          font-size: 14px;
          font-weight: 600;
          color: #78350f;
          margin-bottom: 4px;
          line-height: 1.4;
          word-break: break-word;
        }

        .milestone-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #92400e;
          font-weight: 500;
        }

        .no-milestones-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px;
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
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


        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
        }

         .task-title-section {
           margin-bottom: 8px;
         }

         .field-label {
           display: block;
           font-size: 12px;
           font-weight: 600;
           color: #6b7280;
           margin-bottom: 4px;
           text-transform: uppercase;
           letter-spacing: 0.5px;
         }

         /* Read-only styles */
         .read-only-title {
           font-size: 18px;
           font-weight: 600;
           color: #1f2937;
           padding: 8px 0;
           border-bottom: 2px solid transparent;
         }

         .read-only-description {
           font-size: 14px;
           color: #4b5563;
           line-height: 1.6;
           padding: 12px;
           background: #f9fafb;
           border-radius: 8px;
           border: 1px solid #e5e7eb;
         }

         .read-only-assignee {
           display: flex;
           align-items: center;
         }

         .assignee-display {
           display: flex;
           align-items: center;
           gap: 8px;
         }

         .assignee-avatar {
           width: 32px;
           height: 32px;
           background: linear-gradient(135deg, #fb923c, #fbbf24);
           color: white;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 12px;
           font-weight: 700;
         }

         .unassigned-text {
           color: #9ca3af;
           font-style: italic;
         }

         .read-only-milestones {
           display: flex;
           flex-wrap: wrap;
           gap: 8px;
         }

         .milestone-tag {
           display: flex;
           align-items: center;
           gap: 4px;
           background: #f3f4f6;
           color: #374151;
           padding: 4px 8px;
           border-radius: 6px;
           font-size: 12px;
           font-weight: 500;
         }

         .no-milestones {
           color: #9ca3af;
           font-style: italic;
         }

         .read-only-date {
           font-size: 14px;
           color: #374151;
           padding: 8px 12px;
           background: #f9fafb;
           border-radius: 6px;
           border: 1px solid #e5e7eb;
         }

         .read-only-value {
           display: flex;
           align-items: center;
         }

         .milestones-checkbox-container {
           display: flex;
           flex-direction: column;
           gap: 8px;
           padding: 12px;
           background: #f8fafc;
           border: 1px solid #e2e8f0;
           border-radius: 8px;
           max-height: 200px;
           overflow-y: auto;
         }

         .milestones-checkbox-container::-webkit-scrollbar {
           width: 6px;
         }

         .milestones-checkbox-container::-webkit-scrollbar-track {
           background: #f1f5f9;
           border-radius: 3px;
         }

         .milestones-checkbox-container::-webkit-scrollbar-thumb {
           background: #cbd5e1;
           border-radius: 3px;
         }

         .milestones-checkbox-container::-webkit-scrollbar-thumb:hover {
           background: #94a3b8;
         }

         .milestone-checkbox-item {
           display: flex;
           align-items: center;
           gap: 8px;
           cursor: pointer;
           padding: 6px 10px;
           background: white;
           border: 1px solid #e5e7eb;
           border-radius: 6px;
           transition: all 0.2s ease;
           min-height: 32px;
         }

         .milestone-checkbox-item:hover {
           background: #f9fafb;
           border-color: #d1d5db;
         }

         .milestone-checkbox {
           width: 14px;
           height: 14px;
           accent-color: #3b82f6;
           cursor: pointer;
           flex-shrink: 0;
         }

         .milestone-checkbox-label {
           font-size: 13px;
           font-weight: 500;
           color: #374151;
           cursor: pointer;
           user-select: none;
           line-height: 1.4;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
         }

         .milestone-checkbox-item:has(.milestone-checkbox:checked) {
           background: #eff6ff;
           border-color: #3b82f6;
         }

         .milestone-checkbox-item:has(.milestone-checkbox:checked) .milestone-checkbox-label {
           color: #1e40af;
           font-weight: 600;
         }

        .btn-edit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          background: #3b82f6;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-right: 12px;
        }

        .btn-edit:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
