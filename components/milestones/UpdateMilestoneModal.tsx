"use client";

import { useState, useEffect } from "react";
import { X, Save, Calendar, FileText, Target, Plus, Trash2, CheckCircle } from "lucide-react";
import { mockTasks } from "@/constants/mockData";

interface UpdateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateMilestone: (milestoneData: any) => void;
  milestone: {
    id: string;
    name: string;
    description: string;
    dueDate: string;
    status: string;
    tasks: string[];
    projectId: string;
    meetings: string[];
  } | null;
}

export const UpdateMilestoneModal = ({
  isOpen,
  onClose,
  onUpdateMilestone,
  milestone,
}: UpdateMilestoneModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    status: "pending",
  });

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when milestone changes
  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name,
        description: milestone.description,
        dueDate: milestone.dueDate,
        status: milestone.status,
      });
      
      // Initialize selectedTasks with task IDs
      if (milestone.tasks && Array.isArray(milestone.tasks)) {
        if (milestone.tasks.length > 0 && typeof milestone.tasks[0] === 'object') {
          // milestone.tasks is array of task objects, extract IDs
          setSelectedTasks(milestone.tasks.map((task: any) => task.id));
        } else {
          // milestone.tasks is array of task IDs
          setSelectedTasks(milestone.tasks);
        }
      } else {
        setSelectedTasks([]);
      }
    }
  }, [milestone]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        dueDate: "",
        status: "pending",
      });
      setSelectedTasks([]);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Get tasks that are not currently selected in this milestone
  const getAvailableTasks = () => {
    return mockTasks.filter(task => 
      !selectedTasks.includes(task.id)
    );
  };

  // Get tasks that are currently assigned to this milestone
  const getSelectedTaskObjects = () => {
    if (!milestone?.id) return [];
    return mockTasks.filter(task => 
      task.milestoneIds.includes(milestone.id)
    );
  };

  // Add task to milestone
  const addTaskToMilestone = (taskId: string) => {
    setSelectedTasks(prev => [...prev, taskId]);
  };

  // Remove task from milestone
  const removeTaskFromMilestone = (taskId: string) => {
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  };

  // Get current tasks in milestone (from selectedTasks state for real-time updates)
  const getCurrentTasksInMilestone = () => {
    if (!selectedTasks || selectedTasks.length === 0) return [];
    
    // Get task objects from selectedTasks (which contains task IDs)
    return mockTasks.filter(task => selectedTasks.includes(task.id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Tên cột mốc là bắt buộc";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Tên cột mốc phải có ít nhất 3 ký tự";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Tên cột mốc không được vượt quá 100 ký tự";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    } else if (formData.description.trim().length > 500) {
      newErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    // Due date validation
    if (!formData.dueDate) {
      newErrors.dueDate = "Ngày hết hạn là bắt buộc";
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = "Ngày hết hạn phải là ngày trong tương lai";
      }
    }

    // Status validation
    const validStatuses = ["pending", "in-progress", "completed", "overdue"];
    if (!validStatuses.includes(formData.status)) {
      newErrors.status = "Trạng thái không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare milestone data with all required fields
      const milestoneData = {
        id: milestone?.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate,
        status: formData.status,
        tasks: selectedTasks, // selectedTasks now contains the correct task IDs
        projectId: milestone?.projectId || "1",
        meetings: milestone?.meetings || []
      };

      onUpdateMilestone(milestoneData);
    } catch (error) {
      console.error('Error updating milestone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !milestone) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <Target size={24} />
            <h2>Chỉnh sửa cột mốc</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <FileText size={16} />
              Tên cột mốc *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Nhập tên cột mốc..."
              maxLength={100}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
            <div className="char-counter">
              {formData.name.length}/100
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <FileText size={16} />
              Mô tả *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Nhập mô tả chi tiết cho cột mốc..."
              rows={4}
              maxLength={500}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
            <div className="char-counter">
              {formData.description.length}/500
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                <Calendar size={16} />
                Ngày hết hạn *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`form-input ${errors.dueDate ? 'error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                <Target size={16} />
                Trạng thái *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`form-select ${errors.status ? 'error' : ''}`}
              >
                <option value="pending">Chờ thực hiện</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="overdue">Quá hạn</option>
              </select>
              {errors.status && <span className="error-message">{errors.status}</span>}
            </div>
          </div>

          {/* Task Management Section */}
          <div className="task-management-section">
            <div className="section-header">
              <h3>Quản lý công việc</h3>
              <p>Thêm hoặc xóa công việc khỏi cột mốc này</p>
            </div>

            {/* Selected Tasks */}
            <div className="task-section">
              <div className="task-section-header">
                <h4>Công việc trong cột mốc ({selectedTasks.length})</h4>
              </div>
              <div className="task-list">
                {getCurrentTasksInMilestone().map((task) => (
                  <div key={task.id} className="task-item selected">
                    <div className="task-info">
                      <div className="task-icon">
                        <CheckCircle size={16} />
                      </div>
                      <div className="task-details">
                        <div className="task-id">{task.id}</div>
                        <div className="task-title">{task.title}</div>
                        <div className="task-status">
                          <span className={`status-badge ${task.status}`}>
                            {task.status === "todo" ? "Cần làm" : 
                             task.status === "in-progress" ? "Đang làm" :
                             task.status === "review" ? "Đang review" : "Hoàn thành"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-task-btn"
                      onClick={() => removeTaskFromMilestone(task.id)}
                      title="Xóa khỏi cột mốc"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {selectedTasks.length === 0 && (
                  <div className="empty-state">
                    <p>Chưa có công việc nào trong cột mốc này</p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Tasks */}
            <div className="task-section">
              <div className="task-section-header">
                <h4>Công việc có thể thêm ({getAvailableTasks().length})</h4>
              </div>
              <div className="task-list">
                {getAvailableTasks().map((task) => (
                  <div key={task.id} className="task-item available">
                    <div className="task-info">
                      <div className="task-icon">
                        <CheckCircle size={16} />
                      </div>
                      <div className="task-details">
                        <div className="task-id">{task.id}</div>
                        <div className="task-title">{task.title}</div>
                        <div className="task-status">
                          <span className={`status-badge ${task.status}`}>
                            {task.status === "todo" ? "Cần làm" : 
                             task.status === "in-progress" ? "Đang làm" :
                             task.status === "review" ? "Đang review" : "Hoàn thành"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="add-task-btn"
                      onClick={() => addTaskToMilestone(task.id)}
                      title="Thêm vào cột mốc"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
                {getAvailableTasks().length === 0 && (
                  <div className="empty-state">
                    <p>Tất cả công việc đã được gán cho cột mốc này</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-save" 
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật cột mốc"}
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
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 600px;
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

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .modal-title svg {
          color: #ff8c42;
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
          transition: all 0.2s ease;
          color: #64748b;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .modal-content {
          padding: 0 24px 24px 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-label svg {
          color: #ff8c42;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .form-input.error,
        .form-textarea.error,
        .form-select.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .error-message {
          display: block;
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }

        .char-counter {
          text-align: right;
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel,
        .btn-save {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
          color: #374151;
        }

        .btn-save {
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.3);
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Task Management Styles */
        .task-management-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .section-header p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .task-section {
          margin-bottom: 20px;
        }

        .task-section-header {
          margin-bottom: 12px;
        }

        .task-section-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          background: #f9fafb;
        }

        .task-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .task-item.selected {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .task-item.available {
          border-color: #e5e7eb;
          background: white;
        }

        .task-item:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .task-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .task-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .task-details {
          flex: 1;
          min-width: 0;
        }

        .task-id {
          font-size: 11px;
          color: #ff8c42;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .task-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-status {
          display: flex;
          align-items: center;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.todo {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-badge.in-progress {
          background: #fef3c7;
          color: #f59e0b;
        }

        .status-badge.review {
          background: #dbeafe;
          color: #3b82f6;
        }

        .status-badge.done {
          background: #dcfce7;
          color: #10b981;
        }

        .add-task-btn,
        .remove-task-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .add-task-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .add-task-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .remove-task-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .remove-task-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 20px;
          color: #9ca3af;
          font-size: 14px;
          font-style: italic;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .modal-overlay {
            padding: 16px;
          }

          .modal-container {
            max-width: 100%;
          }

          .modal-header {
            padding: 20px 20px 0 20px;
          }

          .modal-content {
            padding: 0 20px 20px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .modal-actions {
            flex-direction: column;
            padding: 20px 20px 20px 20px;
          }

          .btn-cancel,
          .btn-save {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
