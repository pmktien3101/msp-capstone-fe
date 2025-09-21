"use client";

import React, { useState } from "react";
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
  MoreVertical
} from "lucide-react";
import { mockMembers, mockMilestones, mockComments } from "@/constants/mockData";

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
  const [editedValues, setEditedValues] = useState<{[key: string]: any}>({});
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  // Update comments when task changes
  React.useEffect(() => {
    if (task) {
      setComments(mockComments.filter(comment => comment.taskId === task.id));
      setNewComment(""); // Reset comment input when switching tasks
    }
  }, [task?.id]);

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


  const isOverdue = () => {
    if (!task.endDate) return false;
    const endDate = new Date(task.endDate);
    const today = new Date();
    return endDate < today && task.status !== "done";
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldSave = (field: string) => {
    if (onEdit && editedValues[field] !== undefined) {
      const updatedTask = {
        ...task,
        [field]: editedValues[field]
      };
      onEdit(updatedTask);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleFieldSave(field);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: `comment-${Date.now()}`,
        taskId: task.id,
        authorId: "member-1", // Current user - có thể lấy từ context
        content: newComment.trim(),
        timestamp: new Date().toISOString(),
        isEdited: false
      };
      setComments(prev => [...prev, comment]);
      setNewComment("");
    }
  };

  const handleKeyPressComment = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const formatCommentTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <div className="header-info">
              <div className="task-title-section">
                <label className="field-label">Tên công việc</label>
                <input
                  type="text"
                  value={editedValues.title !== undefined ? editedValues.title : task.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'title')}
                  onBlur={() => handleFieldSave('title')}
                  className="edit-title-input"
                  placeholder="Nhập tên công việc..."
                />
              </div>
              <div className="task-id">ID: {task.id}</div>
            </div>
          </div>
          <div className="header-actions">
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
              <select
                value={editedValues.status !== undefined ? editedValues.status : task.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'status')}
                onBlur={() => handleFieldSave('status')}
                className="edit-select"
              >
                <option value="todo">Cần làm</option>
                <option value="in-progress">Đang làm</option>
                <option value="review">Đang review</option>
                <option value="done">Hoàn thành</option>
              </select>
            </div>
            <div className="info-item">
              <div className="info-label">
                <AlertCircle size={16} />
                Độ ưu tiên
              </div>
              <select
                value={editedValues.priority !== undefined ? editedValues.priority : task.priority}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'priority')}
                onBlur={() => handleFieldSave('priority')}
                className="edit-select"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>


          {/* Description */}
          <div className="description-section">
            <div className="section-header">
              <FileText size={16} />
              <span>Mô tả</span>
            </div>
            <div className="description-content">
              <textarea
                value={editedValues.description !== undefined ? editedValues.description : task.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'description')}
                onBlur={() => handleFieldSave('description')}
                className="edit-textarea"
                rows={4}
                placeholder="Nhập mô tả công việc..."
              />
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
                <select
                  value={editedValues.assignee !== undefined ? editedValues.assignee : (task.assignedTo?.id || task.assignee || '')}
                  onChange={(e) => handleFieldChange('assignee', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'assignee')}
                  onBlur={() => handleFieldSave('assignee')}
                  className="edit-select"
                >
                  <option value="">Chưa được giao</option>
                  {mockMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="info-row">
            <div className="info-item full-width">
              <div className="info-label">
                <Layers size={16} />
                Cột mốc liên quan
              </div>
              <div className="milestones-checkbox-container">
                {mockMilestones.map((milestone) => {
                  const currentMilestoneIds = editedValues.milestoneIds !== undefined ? editedValues.milestoneIds : (task.milestoneIds || []);
                  const isChecked = currentMilestoneIds.includes(milestone.id);
                  
                  
                  return (
                    <label key={milestone.id} className="milestone-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentIds = editedValues.milestoneIds !== undefined ? editedValues.milestoneIds : (task.milestoneIds || []);
                          let newIds;
                          if (e.target.checked) {
                            newIds = [...currentIds, milestone.id];
                          } else {
                            newIds = currentIds.filter((id: string) => id !== milestone.id);
                          }
                          handleFieldChange('milestoneIds', newIds);
                        }}
                        onBlur={() => handleFieldSave('milestoneIds')}
                        className="milestone-checkbox"
                      />
                      <span className="milestone-checkbox-label">{milestone.name}</span>
                    </label>
                  );
                })}
              </div>
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
                 <input
                   type="date"
                   value={editedValues.startDate !== undefined ? (editedValues.startDate ? editedValues.startDate.split('T')[0] : '') : (task.startDate ? task.startDate.split('T')[0] : '')}
                   onChange={(e) => handleFieldChange('startDate', e.target.value)}
                   onKeyPress={(e) => handleKeyPress(e, 'startDate')}
                   onBlur={() => handleFieldSave('startDate')}
                   className="edit-date-input"
                 />
               </div>
               <div className="date-item">
                 <div className="date-label">
                   <CheckCircle size={14} />
                   Ngày kết thúc
                 </div>
                 <input
                   type="date"
                   value={editedValues.endDate !== undefined ? (editedValues.endDate ? editedValues.endDate.split('T')[0] : '') : (task.endDate ? task.endDate.split('T')[0] : '')}
                   onChange={(e) => handleFieldChange('endDate', e.target.value)}
                   onKeyPress={(e) => handleKeyPress(e, 'endDate')}
                   onBlur={() => handleFieldSave('endDate')}
                   className="edit-date-input"
                 />
               </div>
             </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <div className="section-header">
              <MessageCircle size={16} />
              <span>Bình luận ({comments.length})</span>
            </div>
            
            {/* Comments List */}
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => {
                  const author = mockMembers.find(m => m.id === comment.authorId);
                  return (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar">
                        {author ? author.name.charAt(0) : 'U'}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{author ? author.name : 'Unknown'}</span>
                          <span className="comment-time">{formatCommentTime(comment.timestamp)}</span>
                        </div>
                        <div className="comment-text">{comment.content}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-comments">
                  <MessageCircle size={24} />
                  <span>Chưa có bình luận nào</span>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="add-comment">
              <div className="comment-input-container">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPressComment}
                  placeholder="Thêm bình luận..."
                  className="comment-textarea"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="comment-send-btn"
                >
                  <Send size={16} />
                </button>
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

         .edit-title-input {
           font-size: 18px;
           font-weight: 600;
           color: #1f2937;
           border: 1px solid #d1d5db;
           border-radius: 8px;
           padding: 10px 12px;
           width: 100%;
           background: white;
           outline: none;
           transition: border-color 0.2s ease;
         }

         .edit-title-input:focus {
           border-color: #3b82f6;
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
         }

         .edit-select {
           font-size: 12px;
           font-weight: 600;
           padding: 4px 8px;
           border-radius: 12px;
           border: 1px solid #d1d5db;
           background: white;
           color: #374151;
           min-width: 120px;
           outline: none;
           transition: border-color 0.2s ease;
         }

         .edit-select:focus {
           border-color: #3b82f6;
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
         }

         .edit-textarea {
           width: 100%;
           min-height: 100px;
           padding: 12px;
           border: 1px solid #d1d5db;
           border-radius: 8px;
           font-size: 14px;
           line-height: 1.6;
           color: #374151;
           background: white;
           resize: vertical;
           outline: none;
           transition: border-color 0.2s ease;
         }

         .edit-textarea:focus {
           border-color: #3b82f6;
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
         }

         .edit-date-input {
           font-size: 14px;
           color: #374151;
           border: 1px solid #d1d5db;
           border-radius: 6px;
           padding: 6px 8px;
           background: white;
           outline: none;
           transition: border-color 0.2s ease;
         }

         .edit-date-input:focus {
           border-color: #3b82f6;
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

         .comments-section {
           margin-bottom: 24px;
         }

         .comments-list {
           max-height: 300px;
           overflow-y: auto;
           margin-bottom: 16px;
         }

         .comments-list::-webkit-scrollbar {
           width: 6px;
         }

         .comments-list::-webkit-scrollbar-track {
           background: #f1f5f9;
           border-radius: 3px;
         }

         .comments-list::-webkit-scrollbar-thumb {
           background: #cbd5e1;
           border-radius: 3px;
         }

         .comments-list::-webkit-scrollbar-thumb:hover {
           background: #94a3b8;
         }

         .comment-item {
           display: flex;
           gap: 12px;
           padding: 12px 0;
           border-bottom: 1px solid #f1f5f9;
         }

         .comment-item:last-child {
           border-bottom: none;
         }

         .comment-avatar {
           width: 32px;
           height: 32px;
           background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
           font-weight: 600;
           font-size: 14px;
           flex-shrink: 0;
         }

         .comment-content {
           flex: 1;
         }

         .comment-header {
           display: flex;
           align-items: center;
           gap: 8px;
           margin-bottom: 4px;
         }

         .comment-author {
           font-size: 14px;
           font-weight: 600;
           color: #1e293b;
         }

         .comment-time {
           font-size: 12px;
           color: #64748b;
         }

         .comment-text {
           font-size: 14px;
           color: #374151;
           line-height: 1.5;
         }

         .no-comments {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 8px;
           padding: 24px;
           color: #9ca3af;
           font-size: 14px;
         }

         .add-comment {
           border-top: 1px solid #e5e7eb;
           padding-top: 16px;
         }

         .comment-input-container {
           display: flex;
           gap: 8px;
           align-items: flex-end;
         }

         .comment-textarea {
           flex: 1;
           padding: 12px;
           border: 1px solid #d1d5db;
           border-radius: 8px;
           font-size: 14px;
           line-height: 1.5;
           color: #374151;
           background: white;
           resize: vertical;
           outline: none;
           transition: border-color 0.2s ease;
           min-height: 60px;
         }

         .comment-textarea:focus {
           border-color: #3b82f6;
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
         }

         .comment-send-btn {
           width: 40px;
           height: 40px;
           background: #3b82f6;
           color: white;
           border: none;
           border-radius: 8px;
           display: flex;
           align-items: center;
           justify-content: center;
           cursor: pointer;
           transition: all 0.2s ease;
           flex-shrink: 0;
         }

         .comment-send-btn:hover:not(:disabled) {
           background: #2563eb;
           transform: scale(1.05);
         }

         .comment-send-btn:disabled {
           background: #9ca3af;
           cursor: not-allowed;
           transform: none;
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
