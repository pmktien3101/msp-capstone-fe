"use client";

import { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import { getTaskStatusColor } from "@/constants/status";
import { taskService } from "@/services/taskService";
import { taskReassignRequestService } from "@/services/taskReassignRequestService";
import { ReassignmentHistoryTable } from "@/components/tasks/ReassignmentHistoryTable";
import { TaskReassignRequest } from "@/types/taskReassignRequest";
import { GetTaskResponse } from "@/types/task";

interface ReassignmentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle?: string;
}

const formatDateOnly = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

export const ReassignmentHistoryModal = ({
  isOpen,
  onClose,
  taskId,
  taskTitle = "Công việc",
}: ReassignmentHistoryModalProps) => {
  const [task, setTask] = useState<GetTaskResponse | null>(null);
  const [history, setHistory] = useState<TaskReassignRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && taskId) {
      fetchData();
    }
  }, [isOpen, taskId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Fetch task details
      const taskResponse = await taskService.getTaskById(taskId);
      if (taskResponse.success && taskResponse.data) {
        setTask(taskResponse.data);
      }

      // Fetch reassignment history
      const historyResponse = await taskReassignRequestService.getAcceptedTaskReassignRequestsByTaskId(taskId);
      
      if (historyResponse.success && historyResponse.data) {
        let historyData: TaskReassignRequest[] = [];
        if (Array.isArray(historyResponse.data)) {
          historyData = historyResponse.data;
        } else if (historyResponse.data.items) {
          historyData = historyResponse.data.items;
        }
        setHistory(historyData);
      } else {
        setError(historyResponse.message || "Không thể tải lịch sử chuyển giao");
        setHistory([]);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-section">
            <div>
              <h2 className="modal-title">Thông tin chi tiết</h2>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={fetchData}>
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {/* Task Details Section */}
              {task && (
                <div className="task-details-section">
                  <h3 className="section-title">Thông tin công việc</h3>
                  <div className="task-info-grid">
                    <div className="task-info-item">
                      <span className="info-label">Tiêu đề:</span>
                      <span className="info-value">{task.title}</span>
                    </div>
                    <div className="task-info-item">
                      <span className="info-label">Người phụ trách hiện tại:</span>
                      <span className="info-value assigned-user-value">
                        {task.user?.fullName || task.userId || "Chưa giao"}
                      </span>
                    </div>
                    <div className="task-info-item">
                      <span className="info-label">Trạng thái:</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getTaskStatusColor(task.status) }}
                      >
                        {task.status}
                      </span>
                    </div>
                    <div className="task-info-item">
                      <span className="info-label">Mô tả:</span>
                      <span className="info-value">{task.description || "-"}</span>
                    </div>
                    <div className="task-info-item">
                      <span className="info-label">Ngày bắt đầu:</span>
                      <span className="info-value">{formatDateOnly(task.startDate || "")}</span>
                    </div>
                    <div className="task-info-item">
                      <span className="info-label">Ngày kết thúc:</span>
                      <span className="info-value">{formatDateOnly(task.endDate || "")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* History Table Section */}
              <div className="history-section">
                <h3 className="section-title">Lịch sử chuyển giao ({history.length})</h3>
                <ReassignmentHistoryTable 
                  history={history}
                  isLoading={false}
                />
              </div>
            </>
          )}
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
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                      0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 2px solid #e5e7eb;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          color: #fdf0d2;
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .close-button:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .modal-body {
          padding: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #e5e7eb;
        }

        .task-details-section {
          margin-bottom: 32px;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .task-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }

        .task-info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .task-info-item:nth-child(3) {
          grid-column: 1;
        }

        .task-info-item:nth-child(4) {
          grid-column: 2;
        }

        .task-info-item:nth-child(5) {
          grid-column: 1;
        }

        .task-info-item:nth-child(6) {
          grid-column: 2;
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 14px;
          color: #1f2937;
          font-weight: 500;
        }

        .assigned-user-value {
          background: #fdf0d2;
          padding: 8px;
          border-radius: 4px;
          line-height: 1.5;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          width: fit-content;
        }

        .history-section {
          margin-top: 32px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #64748b;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0369a1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          margin: 0;
          font-size: 14px;
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          text-align: center;
        }

        .error-message {
          color: #dc2626;
          font-size: 14px;
          margin: 0 0 20px 0;
        }

        .retry-button {
          background: #fdf0d2;
          color: #92400e;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background: #fde68a;
        }

        @media (max-width: 1024px) {
          .task-info-grid {
            grid-template-columns: 1fr;
          }

          .task-info-item:nth-child(3) {
            grid-column: 1;
          }

          .task-info-item:nth-child(4) {
            grid-column: 1;
          }

          .task-info-item:nth-child(5) {
            grid-column: 1;
          }

          .task-info-item:nth-child(6) {
            grid-column: 1;
          }
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 10px;
            max-width: calc(100% - 20px);
          }

          .modal-header {
            padding: 16px;
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .header-title-section {
            width: 100%;
          }

          .close-button {
            align-self: flex-end;
            margin-top: -8px;
          }

          .modal-body {
            padding: 16px;
          }

          .task-details-section {
            padding: 16px;
          }

          .task-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
