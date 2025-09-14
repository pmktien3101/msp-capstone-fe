'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { Meeting } from '@/types/meeting';
import { mockMeetings } from '@/constants/mockData';
import { Button } from '@/components/ui/button';
import { CreateMeetingModal } from './modals/CreateMeetingModal';
import { MeetingDetailModal } from './modals/MeetingDetailModal';

interface MeetingTabProps {
  project: Project;
}

export const MeetingTab = ({ project }: MeetingTabProps) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load meetings for this project
  useEffect(() => {
    const projectMeetings = mockMeetings.filter(meeting => 
      meeting.projectId === project.id
    );
    setMeetings(projectMeetings);
    setLoading(false);
  }, [project.id]);

  const handleCreateMeeting = (meetingData: Partial<Meeting>) => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      projectId: project.id,
      title: meetingData.title || '',
      description: meetingData.description || '',
      startTime: meetingData.startTime || '',
      endTime: meetingData.endTime || '',
      location: meetingData.location || '',
      attendees: meetingData.attendees || [],
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMeetings(prev => [...prev, newMeeting]);
    setShowCreateModal(false);
  };

  const handleUpdateMeeting = (meetingData: Partial<Meeting>) => {
    if (!selectedMeeting) return;

    const updatedMeeting = {
      ...selectedMeeting,
      ...meetingData,
      updatedAt: new Date().toISOString()
    };

    setMeetings(prev => 
      prev.map(meeting => 
        meeting.id === selectedMeeting.id ? updatedMeeting : meeting
      )
    );
    setShowDetailModal(false);
    setSelectedMeeting(null);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
    }
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
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

  if (loading) {
    return (
      <div className="meeting-tab-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải cuộc họp...</p>
      </div>
    );
  }

  return (
    <div className="meeting-tab">
      <div className="meeting-header">
        <div className="meeting-title">
          <h3>Cuộc họp dự án</h3>
          <p>Quản lý các cuộc họp của dự án {project.name}</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="create-meeting-btn"
        >
          ➕ Tạo cuộc họp
        </Button>
      </div>

      <div className="meeting-stats">
        <div className="stat-card">
          <div className="stat-number">{meetings.length}</div>
          <div className="stat-label">Tổng cuộc họp</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {meetings.filter(m => m.status === 'scheduled').length}
          </div>
          <div className="stat-label">Đã lên lịch</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {meetings.filter(m => m.status === 'completed').length}
          </div>
          <div className="stat-label">Hoàn thành</div>
        </div>
      </div>

      <div className="meeting-list">
        {meetings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h4>Chưa có cuộc họp nào</h4>
            <p>Tạo cuộc họp đầu tiên cho dự án này</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Tạo cuộc họp
            </Button>
          </div>
        ) : (
          <div className="meeting-table">
            <div className="table-header">
              <div className="col-title">Tiêu đề</div>
              <div className="col-time">Thời gian</div>
              <div className="col-location">Địa điểm</div>
              <div className="col-attendees">Thành viên</div>
              <div className="col-status">Trạng thái</div>
              <div className="col-actions">Thao tác</div>
            </div>
            {meetings.map((meeting) => (
              <div key={meeting.id} className="table-row">
                <div className="col-title">
                  <div className="meeting-title-text">{meeting.title}</div>
                  <div className="meeting-description">{meeting.description}</div>
                </div>
                <div className="col-time">
                  <div className="time-info">
                    <div className="start-time">
                      {new Date(meeting.startTime).toLocaleString('vi-VN')}
                    </div>
                    <div className="end-time">
                      {new Date(meeting.endTime).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="col-location">
                  <span className="location-text">{meeting.location}</span>
                </div>
                <div className="col-attendees">
                  <div className="attendees-list">
                    {meeting.attendees.slice(0, 3).map((attendee, index) => (
                      <div key={index} className="attendee-avatar">
                        {attendee.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {meeting.attendees.length > 3 && (
                      <div className="attendee-more">
                        +{meeting.attendees.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(meeting.status) }}
                  >
                    {getStatusLabel(meeting.status)}
                  </span>
                </div>
                <div className="col-actions">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewMeeting(meeting)}
                  >
                    Xem
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteMeeting(meeting.id)}
                    className="delete-btn"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateMeetingModal
          project={project}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateMeeting}
        />
      )}

      {showDetailModal && selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMeeting(null);
          }}
          onSave={handleUpdateMeeting}
          onDelete={handleDeleteMeeting}
        />
      )}

      <style jsx>{`
        .meeting-tab {
          padding: 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .meeting-title h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .meeting-title p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .create-meeting-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .meeting-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          flex: 1;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #1f2937;
        }

        .empty-state p {
          margin: 0 0 16px 0;
          font-size: 14px;
        }

        .meeting-table {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px;
          background: #f8f9fa;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .meeting-title-text {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .meeting-description {
          font-size: 12px;
          color: #6b7280;
        }

        .time-info {
          font-size: 12px;
        }

        .start-time {
          color: #1f2937;
          font-weight: 500;
        }

        .end-time {
          color: #6b7280;
        }

        .location-text {
          color: #374151;
          font-size: 14px;
        }

        .attendees-list {
          display: flex;
          gap: 4px;
        }

        .attendee-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .attendee-more {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .col-actions {
          display: flex;
          gap: 8px;
        }

        .delete-btn {
          color: #ef4444;
          border-color: #ef4444;
        }

        .delete-btn:hover {
          background: #ef4444;
          color: white;
        }

        .meeting-tab-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
