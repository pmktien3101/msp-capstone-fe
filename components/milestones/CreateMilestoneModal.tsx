"use client";

import { useState } from "react";
import { X, Calendar, FileText, Target } from "lucide-react";

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMilestone: (milestoneData: any) => void;
  projectId: string;
}

export const CreateMilestoneModal = ({
  isOpen,
  onClose,
  onCreateMilestone,
  projectId,
}: CreateMilestoneModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
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

    if (!formData.name.trim()) {
      newErrors.name = "Tên cột mốc là bắt buộc";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Tên cột mốc phải có ít nhất 3 ký tự";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Ngày hết hạn là bắt buộc";
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = "Ngày hết hạn không được là ngày trong quá khứ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const milestoneData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      projectId: projectId
    };

    onCreateMilestone(milestoneData);
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      dueDate: "",
    });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      dueDate: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <Target size={24} />
            <h2>Tạo cột mốc mới</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <FileText size={16} />
              Tên cột mốc *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Nhập tên cột mốc..."
              maxLength={100}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <FileText size={16} />
              Mô tả *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`form-textarea ${errors.description ? "error" : ""}`}
              placeholder="Mô tả chi tiết về cột mốc này..."
              rows={4}
              maxLength={500}
            />
            <div className="char-count">
              {formData.description.length}/500 ký tự
            </div>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dueDate" className="form-label">
              <Calendar size={16} />
              Ngày hết hạn *
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className={`form-input ${errors.dueDate ? "error" : ""}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              <Target size={16} />
              Tạo cột mốc
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
          max-width: 500px;
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

        .modal-form {
          padding: 0 24px 24px 24px;
        }

        .form-group {
          margin-bottom: 20px;
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
          flex-shrink: 0;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
          box-sizing: border-box;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .form-input.error,
        .form-textarea.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        .char-count {
          text-align: right;
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .error-message {
          display: block;
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
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
        .btn-submit {
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

        .btn-submit {
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.3);
        }

        .btn-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.4);
        }

        .btn-submit:active {
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

          .modal-form {
            padding: 0 20px 20px 20px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
