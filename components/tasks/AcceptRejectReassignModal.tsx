"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { taskReassignRequestService } from "@/services/taskReassignRequestService";
import { TaskReassignRequest } from "@/types/taskReassignRequest";
import { toast } from "react-toastify";

// interface TaskReassignRequest {
//   id: string;
//   taskId: string;
//   fromUserId: string;
//   toUserId: string;
//   description: string;
//   status: string;
//   responseMessage?: string;
//   createdAt: string;
//   updatedAt: string;
//   task?: {
//     id: string;
//     title: string;
//     description?: string;
//     status: string;
//   };
//   fromUser?: {
//     id: string;
//     fullName: string;
//     email: string;
//   };
//   toUser?: {
//     id: string;
//     fullName: string;
//     email: string;
//   };
// }

interface AcceptRejectReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TaskReassignRequest;
  onSuccess: () => void;
}
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý";
      case "Accepted":
        return "Đã chấp nhận";
      case "Rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Accepted":
        return "#10b981";
      case "Rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };
export const AcceptRejectReassignModal = ({
  isOpen,
  onClose,
  request,
  onSuccess,
}: AcceptRejectReassignModalProps) => {
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleActionClick = (selectedAction: "accept" | "reject") => {
    setAction(selectedAction);
    setShowConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    setAction(null);
  };

  const handleSubmit = async () => {
    if (!action) {
      setError("Vui lòng chọn hành động");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setShowConfirm(false);

    try {
      const response = action === "accept"
        ? await taskReassignRequestService.acceptTaskReassignRequest(request.id, {
            responseMessage: responseMessage.trim() || undefined,
          })
        : await taskReassignRequestService.rejectTaskReassignRequest(request.id, {
            responseMessage: responseMessage.trim() || undefined,
          });
          console.log("111", response);
          
      if (response.success) {
        // Show success toast based on action
        if (action === "accept") {
          toast.success(response.message || "Đã chấp nhận yêu cầu chuyển giao công việc!");
        } else {
          toast.success(response.message || "Đã từ chối yêu cầu chuyển giao công việc!");
        }
        onSuccess();
      } else {
        setError(response.message || `Không thể ${action === "accept" ? "chấp nhận" : "từ chối"} yêu cầu`);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error(`Error ${action === "accept" ? "accepting" : "rejecting"} request:`, error);
      const errorMsg = `Có lỗi xảy ra khi ${action === "accept" ? "chấp nhận" : "từ chối"} yêu cầu`;
      setError(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAction(null);
    setResponseMessage("");
    setError("");
    setShowConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Xử lý yêu cầu chuyển giao công việc</h2>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Request Info */}
          <div className="request-info-section">
            <h3 className="section-title">Thông tin yêu cầu</h3>
            <div className="request-info">
              <div className="info-item">
                <span className="info-label">Công việc:</span>
                <span className="info-value">{request.task?.title || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Người gửi:</span>
                <span className="info-value">
                  {request.fromUser?.fullName || request.fromUserId}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Người nhận:</span>
                <span className="info-value">
                  {request.toUser?.fullName || request.toUserId}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Lý do:</span>
                <span className="info-value">{request.description || "-"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Trạng thái:</span>
                <span className="info-value">{getStatusLabel(request.status)}</span>
              </div>
            </div>
          </div>

          {/* Response Message Form - Always visible */}
          <div className="response-form-section">
            <div className="form-group">
              <label htmlFor="responseMessage" className="form-label">
                Lời nhắn <span className="optional-text">(không bắt buộc)</span>
              </label>
              <textarea
                id="responseMessage"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="form-textarea"
                rows={4}
                placeholder="Nhập lời nhắn của bạn..."
                disabled={isSubmitting || showConfirm}
              />
            </div>
          </div>

          {/* Action Selection */}
          <div className="action-selection">
            <h3 className="section-title">Chọn hành động</h3>
            <div className="action-buttons">
              <button
                type="button"
                className="action-button accept-button"
                onClick={() => handleActionClick("accept")}
                disabled={isSubmitting || showConfirm}
              >
                <CheckCircle2 size={20} />
                Chấp nhận
              </button>
              <button
                type="button"
                className="action-button reject-button"
                onClick={() => handleActionClick("reject")}
                disabled={isSubmitting || showConfirm}
              >
                <XCircle size={20} />
                Từ chối
              </button>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirm && action && (
            <div className="confirm-dialog">
              <div className="confirm-content">
                <h4 className="confirm-title">
                  {action === "accept" ? "Xác nhận chấp nhận" : "Xác nhận từ chối"}
                </h4>
                <p className="confirm-message">
                  {action === "accept"
                    ? "Bạn có chắc chắn muốn nhận công việc này không? Sau khi nhận, bạn sẽ không thể chuyển giao công việc này cho người khác."
                    : "Bạn có chắc chắn muốn từ chối yêu cầu chuyển giao công việc này không? Người gửi sẽ được thông báo về quyết định của bạn."}
                </p>
                <div className="confirm-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={handleConfirmCancel}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className={`button-primary ${action === "accept" ? "accept-submit" : "reject-submit"}`}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Đang xử lý..."
                      : action === "accept"
                      ? "Xác nhận chấp nhận"
                      : "Xác nhận từ chối"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
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

        .request-info-section {
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

        .request-info {
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
          min-width: 100px;
        }

        .info-value {
          color: #1f2937;
        }

        .response-form-section {
          margin-bottom: 24px;
        }

        .action-selection {
          margin-bottom: 24px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .accept-button {
          color: #10b981;
          border-color: #10b981;
        }

        .accept-button:hover {
          background: #f0fdf4;
          border-color: #10b981;
        }

        .reject-button {
          color: #ef4444;
          border-color: #ef4444;
        }

        .reject-button:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .response-form {
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

        .optional-text {
          color: #6b7280;
          font-weight: 400;
          font-size: 13px;
        }

        .form-textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #1f2937;
          transition: all 0.2s ease;
          resize: vertical;
          font-family: inherit;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #ff5e13;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
        }

        .form-textarea:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .confirm-dialog {
          margin-top: 24px;
          padding: 20px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
        }

        .confirm-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .confirm-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .confirm-message {
          font-size: 14px;
          color: #374151;
          line-height: 1.6;
          margin: 0;
        }

        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .error-message {
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
          margin-top: 16px;
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

        .button-primary.accept-submit {
          background: #10b981;
        }

        .button-primary.accept-submit:hover:not(:disabled) {
          background: #059669;
        }

        .button-primary.reject-submit {
          background: #ef4444;
        }

        .button-primary.reject-submit:hover:not(:disabled) {
          background: #dc2626;
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

          .action-buttons {
            flex-direction: column;
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

