'use client';

import { useState } from 'react';
import { Project } from '@/types/project';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
}

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    startDate: '',
    endDate: '',
    manager: '',
    template: 'blank',
    visibility: 'private',
    category: 'development'
  });
  const [isLoading, setIsLoading] = useState(false);

  const projectTemplates = [
    {
      id: 'blank',
      name: 'Dự án trống',
      description: 'Bắt đầu từ đầu với dự án hoàn toàn mới',
      icon: '📋',
      color: '#6b7280'
    },
    {
      id: 'software',
      name: 'Phát triển phần mềm',
      description: 'Template cho dự án phát triển phần mềm',
      icon: '💻',
      color: '#3b82f6'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Template cho chiến dịch marketing',
      icon: '📢',
      color: '#10b981'
    },
    {
      id: 'design',
      name: 'Thiết kế',
      description: 'Template cho dự án thiết kế UI/UX',
      icon: '🎨',
      color: '#f59e0b'
    },
    {
      id: 'research',
      name: 'Nghiên cứu',
      description: 'Template cho dự án nghiên cứu và phân tích',
      icon: '🔬',
      color: '#8b5cf6'
    }
  ];

  const categories = [
    { id: 'development', name: 'Phát triển', icon: '💻' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'design', name: 'Thiết kế', icon: '🎨' },
    { id: 'research', name: 'Nghiên cứu', icon: '🔬' },
    { id: 'operations', name: 'Vận hành', icon: '⚙️' },
    { id: 'other', name: 'Khác', icon: '📁' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      manager: formData.manager,
      members: [
        {
          id: '1',
          name: formData.manager,
          role: 'Project Manager',
          email: `${formData.manager.toLowerCase().replace(' ', '.')}@example.com`,
          avatar: '/avatars/default.png'
        }
      ],
      progress: 0
    };

    onProjectCreated?.(newProject);
    setIsLoading(false);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      status: 'planning',
      startDate: '',
      endDate: '',
      manager: '',
      template: 'blank',
      visibility: 'private',
      category: 'development'
    });
    setCurrentStep(1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.template !== '';
      case 2:
        return formData.description.trim() !== '' && formData.manager.trim() !== '';
      case 3:
        return formData.startDate !== '' && formData.endDate !== '';
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <h2>Tạo dự án mới</h2>
            <p>Thiết lập dự án của bạn trong vài bước đơn giản</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {/* Progress Steps */}
          <div className="progress-steps">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                <div className="step-number">{step}</div>
                <div className="step-label">
                  {step === 1 && 'Thông tin cơ bản'}
                  {step === 2 && 'Chi tiết dự án'}
                  {step === 3 && 'Thời gian & Cài đặt'}
                </div>
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="form-section">
                <h3>Chọn template dự án</h3>
                <div className="template-grid">
                  {projectTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`template-card ${formData.template === template.id ? 'selected' : ''}`}
                      onClick={() => handleInputChange('template', template.id)}
                    >
                      <div className="template-icon" style={{ backgroundColor: template.color }}>
                        {template.icon}
                      </div>
                      <div className="template-info">
                        <h4>{template.name}</h4>
                        <p>{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Tên dự án</h3>
                <input
                  type="text"
                  placeholder="Nhập tên dự án..."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-section">
                <h3>Danh mục</h3>
                <div className="category-grid">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`category-btn ${formData.category === category.id ? 'selected' : ''}`}
                      onClick={() => handleInputChange('category', category.id)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="form-section">
                <h3>Mô tả dự án</h3>
                <textarea
                  placeholder="Mô tả chi tiết về dự án của bạn..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="form-textarea"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <h3>Quản lý dự án</h3>
                  <input
                    type="text"
                    placeholder="Tên người quản lý..."
                    value={formData.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <h3>Trạng thái</h3>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="form-select"
                  >
                    <option value="planning">Đang lập kế hoạch</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="on-hold">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>Quyền riêng tư</h3>
                <div className="visibility-options">
                  <label className="visibility-option">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                    />
                    <div className="option-content">
                      <div className="option-title">Riêng tư</div>
                      <div className="option-description">Chỉ thành viên dự án mới có thể xem</div>
                    </div>
                  </label>
                  <label className="visibility-option">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                    />
                    <div className="option-content">
                      <div className="option-title">Công khai</div>
                      <div className="option-description">Mọi người trong tổ chức có thể xem</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Timeline & Settings */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="form-row">
                <div className="form-group">
                  <h3>Ngày bắt đầu</h3>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <h3>Ngày kết thúc</h3>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Thiết lập nâng cao</h3>
                <div className="advanced-settings">
                  <label className="setting-item">
                    <input type="checkbox" defaultChecked />
                    <div className="setting-content">
                      <div className="setting-title">Tự động tạo milestone</div>
                      <div className="setting-description">Tạo các cột mốc dựa trên thời gian dự án</div>
                    </div>
                  </label>
                  <label className="setting-item">
                    <input type="checkbox" defaultChecked />
                    <div className="setting-content">
                      <div className="setting-title">Thông báo email</div>
                      <div className="setting-description">Gửi thông báo qua email khi có cập nhật</div>
                    </div>
                  </label>
                  <label className="setting-item">
                    <input type="checkbox" />
                    <div className="setting-content">
                      <div className="setting-title">Tích hợp Slack</div>
                      <div className="setting-description">Kết nối với kênh Slack của team</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            {currentStep > 1 && (
              <button className="btn btn-secondary" onClick={handlePrevious}>
                Quay lại
              </button>
            )}
          </div>
          <div className="footer-right">
            <button className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            {currentStep < 3 ? (
              <button 
                className="btn btn-primary" 
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Tiếp theo
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={!isStepValid() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Đang tạo...
                  </>
                ) : (
                  'Tạo dự án'
                )}
              </button>
            )}
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
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .modal-title p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
          position: relative;
        }

        .progress-steps::before {
          content: '';
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e5e7eb;
          z-index: 1;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .step.active .step-number {
          background: #ff5e13;
          color: white;
        }

        .step-label {
          margin-top: 8px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          font-weight: 500;
        }

        .step.active .step-label {
          color: #ff5e13;
        }

        .step-content {
          min-height: 400px;
        }

        .form-section {
          margin-bottom: 24px;
        }

        .form-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #ff5e13;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .template-card {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .template-card:hover {
          border-color: #ff5e13;
          background: #fdf0d2;
        }

        .template-card.selected {
          border-color: #ff5e13;
          background: #fdf0d2;
        }

        .template-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .template-info h4 {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 4px 0;
        }

        .template-info p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 500;
        }

        .category-btn:hover {
          border-color: #ff5e13;
          background: #fdf0d2;
        }

        .category-btn.selected {
          border-color: #ff5e13;
          background: #fdf0d2;
          color: #ff5e13;
        }

        .category-icon {
          font-size: 20px;
        }

        .visibility-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .visibility-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .visibility-option:hover {
          border-color: #ff5e13;
          background: #fdf0d2;
        }

        .visibility-option input[type="radio"] {
          accent-color: #ff5e13;
        }

        .option-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .option-description {
          font-size: 12px;
          color: #6b7280;
        }

        .advanced-settings {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .setting-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }

        .setting-item input[type="checkbox"] {
          accent-color: #ff5e13;
          margin-top: 2px;
        }

        .setting-title {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .setting-description {
          font-size: 12px;
          color: #6b7280;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .footer-left {
          flex: 1;
        }

        .footer-right {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-primary {
          background: #ff5e13;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #e54e0a;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .modal-container {
            margin: 10px;
            max-height: 95vh;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .template-grid {
            grid-template-columns: 1fr;
          }

          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
