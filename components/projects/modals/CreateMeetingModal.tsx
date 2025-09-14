'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/types/project';
import { Meeting, CreateMeetingDto, UpdateMeetingDto, MeetingStatus } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { mockMilestones } from '@/constants/mockData';
import '@/app/styles/meeting-modals.scss';

interface CreateMeetingModalProps {
  project: Project;
  meeting?: Meeting | null; // For edit mode
  onClose: () => void;
  onSave: (meetingData: CreateMeetingDto | UpdateMeetingDto) => void;
}

export const CreateMeetingModal = ({ project, meeting, onClose, onSave }: CreateMeetingModalProps) => {
  const isEditMode = !!meeting;
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    roomUrl: '',
    milestoneId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description,
        startTime: meeting.startTime ? new Date(meeting.startTime).toISOString().slice(0, 16) : '',
        endTime: meeting.endTime ? new Date(meeting.endTime).toISOString().slice(0, 16) : '',
        roomUrl: meeting.roomUrl,
        milestoneId: meeting.milestoneId || ''
      });
    }
  }, [isEditMode, meeting]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const generateRoomUrl = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    setFormData(prev => ({
      ...prev,
      roomUrl: `https://meet.google.com/${randomId}`
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Thời gian bắt đầu là bắt buộc';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (start >= end) {
        newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }

    if (!formData.roomUrl.trim()) {
      newErrors.roomUrl = 'URL phòng họp là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const meetingData = {
      projectId: project.id,
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      roomUrl: formData.roomUrl,
      milestoneId: formData.milestoneId || null
    };

    onSave(meetingData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2>{isEditMode ? 'Chỉnh sửa cuộc họp' : 'Tạo cuộc họp mới'}</h2>
              <p>{isEditMode ? 'Cập nhật thông tin cuộc họp' : 'Thêm cuộc họp mới cho dự án'}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-group">
              <label htmlFor="title">Tiêu đề cuộc họp *</label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nhập tiêu đề cuộc họp"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nhập mô tả cuộc họp"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="milestoneId">Milestone (tùy chọn)</label>
              <div className="milestone-selector">
                <select
                  id="milestoneId"
                  value={formData.milestoneId}
                  onChange={(e) => handleInputChange('milestoneId', e.target.value)}
                  className="milestone-dropdown"
                >
                  <option value="">Không có milestone</option>
                  {mockMilestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </option>
                  ))}
                </select>
                <div className="milestone-preview">
                  {formData.milestoneId ? (
                    <div className="selected-milestone">
                      <div className="milestone-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <span className="milestone-text">
                        {mockMilestones.find(m => m.id === formData.milestoneId)?.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInputChange('milestoneId', '')}
                        className="remove-milestone"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="no-milestone">
                      <div className="milestone-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="milestone-text">Chọn milestone</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Thời gian và địa điểm</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Thời gian bắt đầu *</label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={errors.startTime ? 'error' : ''}
                />
                {errors.startTime && <span className="error-text">{errors.startTime}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endTime">Thời gian kết thúc</label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={errors.endTime ? 'error' : ''}
                />
                {errors.endTime && <span className="error-text">{errors.endTime}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="roomUrl">URL phòng họp *</label>
              <div className="input-with-button">
                <Input
                  id="roomUrl"
                  value={formData.roomUrl}
                  onChange={(e) => handleInputChange('roomUrl', e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className={errors.roomUrl ? 'error' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRoomUrl}
                  className="generate-btn"
                >
                  Tạo tự động
                </Button>
              </div>
              {errors.roomUrl && <span className="error-text">{errors.roomUrl}</span>}
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="submit-btn">
            {isEditMode ? 'Cập nhật cuộc họp' : 'Tạo cuộc họp'}
          </Button>
        </div>

      </div>
    </div>
  );
};
