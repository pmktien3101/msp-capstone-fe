'use client';

import { useState } from 'react';
import { Meeting } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import '@/app/styles/meeting-modals.scss';

interface MeetingDetailModalProps {
  meeting: Meeting;
  onClose: () => void;
  onSave: (meetingData: Partial<Meeting>) => void;
  onDelete: (meetingId: string) => void;
}

export const MeetingDetailModal = ({ meeting, onClose, onSave, onDelete }: MeetingDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: meeting.title,
    description: meeting.description,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    location: meeting.location,
    status: meeting.status
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
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Thời gian bắt đầu là bắt buộc';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Thời gian kết thúc là bắt buộc';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (start >= end) {
        newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Địa điểm là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: meeting.location,
      status: meeting.status
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
      onDelete(meeting.id);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'in-progress': return 'Đang diễn ra';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Chỉnh sửa cuộc họp' : 'Chi tiết cuộc họp'}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <form className="edit-form">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề cuộc họp *</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
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
                  rows={3}
                />
              </div>

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
                  <label htmlFor="endTime">Thời gian kết thúc *</label>
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
                <label htmlFor="location">Địa điểm *</label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <option value="scheduled">Đã lên lịch</option>
                  <option value="in-progress">Đang diễn ra</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </Select>
              </div>
            </form>
          ) : (
            <div className="view-form">
              <div className="meeting-info">
                <div className="info-item">
                  <label>Tiêu đề:</label>
                  <span>{meeting.title}</span>
                </div>
                
                {meeting.description && (
                  <div className="info-item">
                    <label>Mô tả:</label>
                    <span>{meeting.description}</span>
                  </div>
                )}

                <div className="info-item">
                  <label>Thời gian bắt đầu:</label>
                  <span>{new Date(meeting.startTime).toLocaleString('vi-VN')}</span>
                </div>

                <div className="info-item">
                  <label>Thời gian kết thúc:</label>
                  <span>{new Date(meeting.endTime).toLocaleString('vi-VN')}</span>
                </div>

                <div className="info-item">
                  <label>Địa điểm:</label>
                  <span>{meeting.location}</span>
                </div>

                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(meeting.status) }}
                  >
                    {getStatusLabel(meeting.status)}
                  </span>
                </div>

                <div className="info-item">
                  <label>Thành viên tham gia:</label>
                  <div className="attendees-list">
                    {meeting.attendees.map((attendee, index) => (
                      <div key={index} className="attendee-item">
                        <div className="attendee-avatar">
                          {attendee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="attendee-info">
                          <div className="attendee-name">{attendee.name}</div>
                          <div className="attendee-role">{attendee.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleDelete} className="delete-btn">
                Xóa cuộc họp
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
