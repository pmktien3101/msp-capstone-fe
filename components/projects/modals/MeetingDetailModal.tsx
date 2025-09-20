"use client";

import { useState } from "react";
import { Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "@/app/styles/meeting-modals.scss";

interface MeetingDetailModalProps {
  meeting: Meeting;
  onClose: () => void;
  onSave: (meetingData: Partial<Meeting>) => void;
  onDelete: (meetingId: string) => void;
}

export const MeetingDetailModal = ({
  meeting,
  onClose,
  onSave,
  onDelete,
}: MeetingDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: meeting.title,
    description: meeting.description,
    startTime: meeting.startTime
      ? new Date(meeting.startTime).toISOString().slice(0, 16)
      : "",
    endTime: meeting.endTime
      ? new Date(meeting.endTime).toISOString().slice(0, 16)
      : "",
    roomUrl: meeting.roomUrl || "",
    status: meeting.status,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Thời gian bắt đầu là bắt buộc";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);

      if (start >= end) {
        newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }

    if (!formData.roomUrl.trim()) {
      newErrors.roomUrl = "URL phòng họp là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const meetingData = {
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: formData.endTime
        ? new Date(formData.endTime).toISOString()
        : undefined,
      roomUrl: formData.roomUrl,
      status: formData.status,
    };

    onSave(meetingData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime
        ? new Date(meeting.startTime).toISOString().slice(0, 16)
        : "",
      endTime: meeting.endTime
        ? new Date(meeting.endTime).toISOString().slice(0, 16)
        : "",
      roomUrl: meeting.roomUrl || "",
      status: meeting.status,
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa cuộc họp này?")) {
      onDelete(meeting.id);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "#3b82f6";
      case "Ongoing":
        return "#f59e0b";
      case "Finished":
        return "#10b981";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "Đã lên lịch";
      case "Ongoing":
        return "Đang diễn ra";
      case "Finished":
        return "Hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? "Chỉnh sửa cuộc họp" : "Chi tiết cuộc họp"}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "error" : ""}
                />
                {errors.title && (
                  <span className="error-text">{errors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
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
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    className={errors.startTime ? "error" : ""}
                  />
                  {errors.startTime && (
                    <span className="error-text">{errors.startTime}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="endTime">Thời gian kết thúc *</label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    className={errors.endTime ? "error" : ""}
                  />
                  {errors.endTime && (
                    <span className="error-text">{errors.endTime}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="roomUrl">URL phòng họp *</label>
                <Input
                  id="roomUrl"
                  value={formData.roomUrl}
                  onChange={(e) => handleInputChange("roomUrl", e.target.value)}
                  className={errors.roomUrl ? "error" : ""}
                />
                {errors.roomUrl && (
                  <span className="error-text">{errors.roomUrl}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="status-select"
                >
                  <option value="Scheduled">Đã lên lịch</option>
                  <option value="Ongoing">Đang diễn ra</option>
                  <option value="Finished">Hoàn thành</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
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
                  <span>
                    {new Date(meeting.startTime).toLocaleString("vi-VN")}
                  </span>
                </div>

                {meeting.endTime && (
                  <div className="info-item">
                    <label>Thời gian kết thúc:</label>
                    <span>
                      {new Date(meeting.endTime).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}

                <div className="info-item">
                  <label>URL phòng họp:</label>
                  <a
                    href={meeting.roomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="room-link"
                  >
                    {meeting.roomUrl}
                  </a>
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

                {meeting.milestoneId && (
                  <div className="info-item">
                    <label>Milestone:</label>
                    <span>Milestone {meeting.milestoneId}</span>
                  </div>
                )}
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
              <Button onClick={handleSave}>Lưu thay đổi</Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="delete-btn"
              >
                Xóa cuộc họp
              </Button>
              <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
