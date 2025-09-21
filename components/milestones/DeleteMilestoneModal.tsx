"use client";

import { X, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  milestoneName: string;
  taskCount: number;
}

export const DeleteMilestoneModal = ({
  isOpen,
  onClose,
  onConfirm,
  milestoneName,
  taskCount,
}: DeleteMilestoneModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <AlertTriangle size={24} />
            <h2>Xóa cột mốc</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="warning-icon">
            <AlertTriangle size={48} />
          </div>
          
          <div className="warning-message">
            <h3>Bạn có chắc chắn muốn xóa cột mốc này?</h3>
            <p>
              Cột mốc <strong>"{milestoneName}"</strong> sẽ bị xóa vĩnh viễn.
            </p>
            {taskCount > 0 && (
              <div className="task-warning">
                <p>
                  <strong>Cảnh báo:</strong> Cột mốc này có {taskCount} công việc. 
                  Các công việc sẽ không còn thuộc cột mốc này nữa.
                </p>
              </div>
            )}
            <p className="final-warning">
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn-delete" onClick={onConfirm}>
            <Trash2 size={16} />
            Xóa cột mốc
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
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 480px;
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
          color: #ef4444;
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
          text-align: center;
        }

        .warning-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .warning-icon svg {
          color: #f59e0b;
        }

        .warning-message h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .warning-message p {
          margin: 0 0 12px 0;
          color: #64748b;
          line-height: 1.5;
        }

        .task-warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 12px;
          margin: 16px 0;
        }

        .task-warning p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
        }

        .final-warning {
          color: #ef4444 !important;
          font-weight: 600;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding: 20px 24px 24px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel,
        .btn-delete {
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

        .btn-delete {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .btn-delete:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
        }

        .btn-delete:active {
          transform: translateY(0);
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

          .modal-actions {
            flex-direction: column;
            padding: 20px 20px 20px 20px;
          }

          .btn-cancel,
          .btn-delete {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
