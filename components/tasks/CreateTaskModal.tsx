"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Flag, FileText, Layers } from "lucide-react";
import { milestoneService } from "@/services/milestoneService";
import { projectService } from "@/services/projectService";
import type { MilestoneBackend } from "@/types/milestone";
import type { ProjectMember } from "@/types/project";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId?: string;
  defaultStatus?: string;
  onCreateTask: (taskData: any) => void;
  projectId?: string; // Added projectId prop
  taskToEdit?: any; // Added taskToEdit prop for editing
}

export const CreateTaskModal = ({ 
  isOpen, 
  onClose, 
  milestoneId, 
  defaultStatus = "Chưa bắt đầu",
  onCreateTask,
  projectId, // Destructured projectId
  taskToEdit // Destructured taskToEdit
}: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || "",
    description: taskToEdit?.description || "",
    milestoneIds: taskToEdit?.milestoneIds || (milestoneId ? [milestoneId] : []),
    status: taskToEdit?.status || defaultStatus,
    assignee: taskToEdit?.assignee || "",
    startDate: taskToEdit?.startDate || "",
    endDate: taskToEdit?.endDate || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Fetch milestones when projectId is available
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!projectId) return;
      
      setIsLoadingMilestones(true);
      try {
        const response = await milestoneService.getMilestonesByProjectId(projectId);
        if (response.success && response.data) {
          setMilestones(response.data);
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setIsLoadingMilestones(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  // Fetch project members (only role Member)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) return;
      
      setIsLoadingMembers(true);
      try {
        const response = await projectService.getProjectMembers(projectId);
        console.log('[CreateTaskModal] Fetched members response:', response);
        
        if (response.success && response.data) {
          console.log('[CreateTaskModal] All members:', response.data);
          
          // Log each member to see structure
          response.data.forEach(pm => {
            console.log('[CreateTaskModal] Member:', {
              id: pm.id,
              userId: pm.userId,
              role: pm.member?.role,
              fullName: pm.member?.fullName,
              email: pm.member?.email
            });
          });
          
          // Filter only users with role "Member"
          const memberUsers = response.data.filter(pm => 
            pm.member?.role === "Member"
          );
          console.log('[CreateTaskModal] Filtered members (role=Member):', memberUsers);
          console.log('[CreateTaskModal] Total filtered:', memberUsers.length);
          setMembers(memberUsers);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  // Update form data when taskToEdit changes
  useEffect(() => {
    if (taskToEdit) {
      // Handle milestoneIds - could be milestoneIds array or milestones object array
      let milestoneIdsArray: string[] = [];
      if (taskToEdit.milestoneIds && Array.isArray(taskToEdit.milestoneIds)) {
        milestoneIdsArray = taskToEdit.milestoneIds.map((id: any) => id.toString());
      } else if (taskToEdit.milestones && Array.isArray(taskToEdit.milestones)) {
        // If it's GetTaskResponse format with milestones array
        milestoneIdsArray = taskToEdit.milestones.map((m: any) => m.id?.toString() || m);
      } else if (milestoneId) {
        milestoneIdsArray = [milestoneId];
      }

      // Handle assignee - could be assignee string or userId
      let assigneeId = "";
      if (taskToEdit.assignee) {
        assigneeId = taskToEdit.assignee;
      } else if (taskToEdit.userId) {
        assigneeId = taskToEdit.userId;
      }

      // Handle dates - convert from ISO to yyyy-MM-dd for input
      const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        try {
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0]; // Get yyyy-MM-dd part
        } catch {
          return "";
        }
      };

      setFormData({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        milestoneIds: milestoneIdsArray,
        status: taskToEdit.status || defaultStatus,
        assignee: assigneeId,
        startDate: formatDateForInput(taskToEdit.startDate || ""),
        endDate: formatDateForInput(taskToEdit.endDate || "")
      });
    }
  }, [taskToEdit, milestoneId, defaultStatus]);

  const getStatusLabel = (status: string) => {
    // Status in DB: "Chưa bắt đầu", "Đang làm", "Tạm dừng", "Hoàn thành"
    return status;
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCreateTask(formData);
      setFormData({
        title: "",
        description: "",
        milestoneIds: milestoneId ? [milestoneId] : [],
        status: "Chưa bắt đầu",
        assignee: "",
        startDate: "",
        endDate: ""
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      milestoneIds: milestoneId ? [milestoneId] : [],
      status: defaultStatus,
      assignee: "",
      startDate: "",
      endDate: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {taskToEdit ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
          </h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form id="task-form" onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
            {/* Task Title */}
            <div className="form-group full-width">
              <label className="form-label">
                <FileText size={16} />
                Tiêu đề công việc *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`form-input ${errors.title ? "error" : ""}`}
                placeholder="Nhập tiêu đề công việc"
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
                placeholder="Mô tả chi tiết về công việc"
                rows={3}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Milestones */}
            <div className="form-group full-width">
              <label className="form-label">
                <Layers size={16} />
                Cột mốc liên quan
              </label>
              {isLoadingMilestones ? (
                <div className="loading-state">Đang tải cột mốc...</div>
              ) : milestones.length === 0 ? (
                <div className="empty-state">Không có cột mốc nào</div>
              ) : (
                <div className="milestone-selection">
                  {milestones.map((milestone) => (
                    <label key={milestone.id} className="milestone-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.milestoneIds.includes(milestone.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange("milestoneIds", [...formData.milestoneIds, milestone.id.toString()]);
                          } else {
                            handleInputChange("milestoneIds", formData.milestoneIds.filter((id: string) => id !== milestone.id.toString()));
                          }
                        }}
                      />
                      <span className="milestone-name">{milestone.name}</span>
                    </label>
                  ))}
                </div>
              )}
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
                <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                <option value="Đang làm">Đang làm</option>
                <option value="Tạm dừng">Tạm dừng</option>
                <option value="Hoàn thành">Hoàn thành</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="form-group full-width">
              <label className="form-label">
                <User size={16} />
                Người thực hiện
              </label>
              {isLoadingMembers ? (
                <div className="loading-state">Đang tải thành viên...</div>
              ) : (
                <select
                  value={formData.assignee}
                  onChange={(e) => handleInputChange("assignee", e.target.value)}
                  className="form-select"
                >
                  <option value="">Chưa giao</option>
                  {members.map((projectMember) => (
                    <option key={projectMember.id} value={projectMember.userId}>
                      {projectMember.member?.fullName || projectMember.member?.email || 'Unknown'}
                    </option>
                  ))}
                </select>
              )}
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
          </form>
        </div>

        <div className="modal-footer">
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" form="task-form">
              {taskToEdit ? "Cập nhật công việc" : "Tạo công việc"}
            </button>
          </div>
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
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .modal-footer {
          flex-shrink: 0;
          border-top: 1px solid #e5e7eb;
          padding: 20px 24px;
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
          padding: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
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

        .status-display {
          padding: 12px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }

        .status-badge {
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-todo {
          background: #6b7280;
        }

        .status-in-progress {
          background: #f59e0b;
        }

        .status-review {
          background: #3b82f6;
        }

        .status-done {
          background: #10b981;
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
        }

        .btn-submit:hover {
          transform: translateY(-1px);
          background: #ff8c42;
          color: white;
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.3);
        }

        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
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
