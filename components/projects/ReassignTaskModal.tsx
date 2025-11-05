"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { GetTaskResponse } from "@/types/task";
import { taskReassignRequestService } from "@/services/taskReassignRequestService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

interface ReassignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: GetTaskResponse;
  onSuccess: () => void;
}

interface AvailableUser {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export const ReassignTaskModal = ({
  isOpen,
  onClose,
  task,
  onSuccess,
}: ReassignTaskModalProps) => {
  const { user } = useAuth();
  const fromUserId = user?.userId || "";

  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch available users when modal opens
  useEffect(() => {
    if (isOpen && task.id && fromUserId) {
      fetchAvailableUsers();
    } else {
      // Reset form when modal closes
      setSelectedUserId("");
      setDescription("");
      setError("");
      setAvailableUsers([]);
    }
  }, [isOpen, task.id, fromUserId]);

  const fetchAvailableUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await taskReassignRequestService.getAvailableUsersForReassignment(
        task.id,
        fromUserId
      );

      console.log("Available users response:", response);
      if (response.data.success && response.data.data) {
        // Handle both array and object with items
        const users = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data.items || [];
        setAvailableUsers(users);
      } else {
        setError(response.message || "Không thể tải danh sách người dùng");
        setAvailableUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching available users:", error);
      setError("Có lỗi xảy ra khi tải danh sách người dùng");
      setAvailableUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError("Vui lòng chọn người nhận");
      return;
    }

    if (!description.trim()) {
      setError("Vui lòng nhập lý do chuyển giao");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await taskReassignRequestService.createTaskReassignRequest({
        taskId: task.id,
        fromUserId: fromUserId,
        toUserId: selectedUserId,
        description: description.trim(),
      });
      console.log(response);
      
      if (response.success) {
        toast.success(response.message || "Yêu cầu chuyển giao công việc đã được gửi!");
        onSuccess();

      } else {
        setError(response.message || "Không thể tạo yêu cầu chuyển giao");
      }
    } catch (error: any) {
      console.error("Error creating reassignment request:", error);
      setError("Có lỗi xảy ra khi tạo yêu cầu chuyển giao");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Chuyển giao công việc</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Task Info */}
          <div className="task-info-section">
            <h3 className="section-title">Thông tin công việc</h3>
            <div className="task-info">
              <div className="info-item">
                <span className="info-label">Tiêu đề:</span>
                <span className="info-value">{task.title}</span>
              </div>
              {task.description && (
                <div className="info-item">
                  <span className="info-label">Mô tả:</span>
                  <span className="info-value">{task.description}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Trạng thái:</span>
                <span className="info-value">{task.status}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="reassign-form">
            <div className="form-group">
              <label htmlFor="toUserId" className="form-label">
                Chọn người nhận <span className="required">*</span>
              </label>
              {isLoading ? (
                <div className="loading-text">Đang tải danh sách người dùng...</div>
              ) : (
                <select
                  id="toUserId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="form-select"
                  disabled={isSubmitting || availableUsers.length === 0}
                >
                  <option value="">
                    {availableUsers.length === 0
                      ? "Không có người dùng nào"
                      : "-- Chọn người nhận --"}
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user.id || user.userId} value={user.userId || user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Lý do chuyển giao <span className="required">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                rows={4}
                placeholder="Nhập lý do chuyển giao công việc..."
                disabled={isSubmitting}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={isSubmitting || !selectedUserId || !description.trim()}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
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
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .modal-body {
          padding: 24px;
        }

        .task-info-section {
          margin-bottom: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .task-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item {
          display: flex;
          gap: 8px;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
          min-width: 80px;
        }

        .info-value {
          color: #1f2937;
        }

        .reassign-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .required {
          color: #ef4444;
        }

        .form-select,
        .form-textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #1f2937;
          transition: all 0.2s ease;
        }

        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #ff5e13;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
        }

        .form-select:disabled,
        .form-textarea:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .loading-text {
          padding: 10px;
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }

        .error-message {
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .button-primary,
        .button-secondary {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .button-primary {
          background: #ff5e13;
          color: white;
        }

        .button-primary:hover:not(:disabled) {
          background: #e54d00;
        }

        .button-primary:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .button-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .button-secondary:hover:not(:disabled) {
          background: #f9fafb;
        }

        .button-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 10px;
            max-width: calc(100% - 20px);
          }

          .modal-header {
            padding: 16px 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .button-primary,
          .button-secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

