'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Meeting } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface CreateMeetingModalProps {
  project: Project;
  onClose: () => void;
  onSave: (meetingData: Partial<Meeting>) => void;
}

export const CreateMeetingModal = ({ project, onClose, onSave }: CreateMeetingModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: [] as string[]
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

  const handleAttendeeChange = (value: string) => {
    const attendeeIds = value.split(',').map(id => id.trim()).filter(id => id);
    setFormData(prev => ({
      ...prev,
      attendees: attendeeIds
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert attendee IDs to attendee objects
    const attendees = formData.attendees.map(id => {
      const member = project.members.find(m => m.id === id);
      return member ? {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role
      } : {
        id,
        name: `Member ${id}`,
        email: '',
        role: 'Member'
      };
    });

    onSave({
      ...formData,
      attendees
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tạo cuộc họp mới</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
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
              placeholder="Nhập địa điểm cuộc họp"
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="attendees">Thành viên tham gia</label>
            <Select
              value={formData.attendees.join(', ')}
              onValueChange={handleAttendeeChange}
            >
              <option value="">Chọn thành viên</option>
              {project.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </Select>
            <div className="attendees-preview">
              {formData.attendees.map((attendeeId) => {
                const member = project.members.find(m => m.id === attendeeId);
                return member ? (
                  <span key={attendeeId} className="attendee-tag">
                    {member.name}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          attendees: prev.attendees.filter(id => id !== attendeeId)
                        }));
                      }}
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            Tạo cuộc họp
          </Button>
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
          }

          .modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 24px 0 24px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 24px;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
          }

          .close-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #6b7280;
            border-radius: 4px;
          }

          .close-btn:hover {
            background: #f3f4f6;
            color: #374151;
          }

          .modal-body {
            padding: 0 24px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: #374151;
            font-size: 14px;
          }

          .error-text {
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
            display: block;
          }

          .attendees-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
          }

          .attendee-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #e5e7eb;
            color: #374151;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
          }

          .attendee-tag button {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            padding: 0;
            margin-left: 4px;
          }

          .attendee-tag button:hover {
            color: #ef4444;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 24px;
            border-top: 1px solid #e5e7eb;
            margin-top: 24px;
          }

          @media (max-width: 640px) {
            .form-row {
              grid-template-columns: 1fr;
            }
            
            .modal-content {
              width: 95%;
              margin: 16px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
