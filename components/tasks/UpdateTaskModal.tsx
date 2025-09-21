"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Flag, FileText, Layers, Save } from "lucide-react";
import { mockMembers, mockMilestones } from "@/constants/mockData";

interface UpdateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskData: any) => void;
  task: any;
}

export const UpdateTaskModal = ({ 
  isOpen, 
  onClose, 
  onUpdateTask,
  task
}: UpdateTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    milestoneIds: [] as string[],
    status: "todo",
    priority: "medium",
    assignee: "",
    startDate: "",
    endDate: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        milestoneIds: task.milestoneIds || [],
        status: task.status || "todo",
        priority: task.priority || "medium",
        assignee: task.assignee || "",
        startDate: task.startDate || "",
        endDate: task.endDate || ""
      });
    }
  }, [task]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        milestoneIds: [] as string[],
        status: "todo",
        priority: "medium",
        assignee: "",
        startDate: "",
        endDate: ""
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề task là bắt buộc";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả task là bắt buộc";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (startDate >= endDate) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const taskData = {
        ...formData,
        id: task.id // Preserve the original task ID
      };
      
      await onUpdateTask(taskData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        milestoneIds: [] as string[],
        status: "todo",
        priority: "medium",
        assignee: "",
        startDate: "",
        endDate: ""
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Có lỗi xảy ra khi cập nhật task. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      milestoneIds: [],
      status: "todo",
      priority: "medium",
      assignee: "",
      startDate: "",
      endDate: ""
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "Cần làm";
      case "in-progress":
        return "Đang thực hiện";
      case "review":
        return "Đang review";
      case "done":
        return "Hoàn thành";
      default:
        return "Cần làm";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Cập nhật Task</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Task Title */}
            <div className="form-group full-width">
              <label className="form-label">
                <FileText size={16} />
                Tiêu đề Task *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`form-input ${errors.title ? "error" : ""}`}
                placeholder="Nhập tiêu đề task"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label className="form-label">
                <FileText size={16} />
                Mô tả *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={`form-textarea ${errors.description ? "error" : ""}`}
                placeholder="Mô tả chi tiết về task"
                rows={3}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Milestones */}
            <div className="form-group full-width">
              <label className="form-label">
                <Layers size={16} />
                Milestones
              </label>
              <div className="milestone-selection">
                {mockMilestones.map((milestone) => (
                  <label key={milestone.id} className="milestone-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.milestoneIds.includes(milestone.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange("milestoneIds", [...formData.milestoneIds, milestone.id]);
                        } else {
                          handleInputChange("milestoneIds", formData.milestoneIds.filter(id => id !== milestone.id));
                        }
                      }}
                    />
                    <span className="milestone-name">{milestone.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">
                <Flag size={16} />
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="form-select"
              >
                <option value="todo">Cần làm</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="review">Đang review</option>
                <option value="done">Hoàn thành</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">
                <Flag size={16} />
                Độ ưu tiên
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="form-select"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="form-group full-width">
              <label className="form-label">
                <User size={16} />
                Người thực hiện
              </label>
              <select
                value={formData.assignee}
                onChange={(e) => handleInputChange("assignee", e.target.value)}
                className="form-select"
              >
                <option value="">Chưa giao</option>
                {mockMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="form-group date-range-group">
              <label className="form-label">
                <Calendar size={16} />
                Thời gian thực hiện *
              </label>
              <div className="date-range-inputs">
                <div className="date-input-group">
                  <label className="date-label">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className={`form-input ${errors.startDate ? "error" : ""}`}
                  />
                  {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                </div>
                <div className="date-input-group">
                  <label className="date-label">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className={`form-input ${errors.endDate ? "error" : ""}`}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              <Save size={16} />
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật Task"}
            </button>
          </div>
        </form>
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
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        /* Hide scrollbar only for modal container */
        .modal-container {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .modal-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .close-btn {
          width: 32px;
          height: 32px;
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

        .modal-form {
          padding: 0 24px 24px 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: all 0.2s ease;
          width: 100%;
        }

        .form-select {
          min-width: 200px;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .form-input.error,
        .form-textarea.error {
          border-color: #ef4444;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .error-message {
          font-size: 12px;
          color: #ef4444;
          font-weight: 500;
        }

        .milestone-selection {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 120px;
          overflow-y: auto;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 12px;
          background: #f9fafb;
        }

        .milestone-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px 0;
        }

        .milestone-checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff8c42;
        }

        .milestone-name {
          font-size: 14px;
          color: #374151;
        }

        .date-range-group {
          grid-column: 1 / -1;
        }

        .date-range-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .date-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .date-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel {
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

        .btn-cancel:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-submit {
          padding: 12px 24px;
          border: 2px solid #ff8c42;
          border-radius: 8px;
          background: white;
          color: #ff8c42;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #ff8c42;
          color: white;
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .modal-container {
            width: 95%;
            margin: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .date-range-inputs {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
