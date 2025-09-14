'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Meeting, MeetingStatus } from '@/types/meeting';
import { useMeetings } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import { CreateMeetingModal } from './modals/CreateMeetingModal';
import { MeetingDetailModal } from './modals/MeetingDetailModal';
import '@/app/styles/meeting-tab.scss';

interface MeetingTabProps {
  project: Project;
}

export const MeetingTab = ({ project }: MeetingTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    meetings,
    loading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateMeetingStatus
  } = useMeetings(project.id);



  const handleCreateMeeting = async (meetingData: any) => {
    const newMeeting = await createMeeting({
      projectId: project.id,
      milestoneId: meetingData.milestoneId || null,
      title: meetingData.title,
      description: meetingData.description,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime || null,
      roomUrl: meetingData.roomUrl || `https://meet.google.com/${Date.now()}`
    });

    if (newMeeting) {
      setShowCreateModal(false);
    }
  };

  const handleUpdateMeeting = async (meetingData: any) => {
    if (!selectedMeeting) return;

    const updatedMeeting = await updateMeeting(selectedMeeting.id, {
      title: meetingData.title,
      description: meetingData.description,
      startTime: meetingData.startTime,
      endTime: meetingData.endTime,
      roomUrl: meetingData.roomUrl,
      milestoneId: meetingData.milestoneId
    });

    if (updatedMeeting) {
      setShowEditModal(false);
      setShowDetailModal(false);
      setSelectedMeeting(null);
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowEditModal(true);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
      await deleteMeeting(meetingId);
    }
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const handleStatusChange = async (meetingId: string, status: MeetingStatus) => {
    await updateMeetingStatus(meetingId, status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return '#3b82f6';
      case 'Ongoing': return '#f59e0b';
      case 'Finished': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'Đã lên lịch';
      case 'Ongoing': return 'Đang diễn ra';
      case 'Finished': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
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

  if (error) {
    return (
      <div className="meeting-tab-error">
        <h3>Lỗi tải cuộc họp</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
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
          onClick={() => {
            console.log('Create meeting button clicked');
            setShowCreateModal(true);
          }}
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
            {meetings.filter(m => m.status === 'Scheduled').length}
          </div>
          <div className="stat-label">Đã lên lịch</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {meetings.filter(m => m.status === 'Finished').length}
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
              <div className="col-milestone">Milestone</div>
              <div className="col-room">Phòng họp</div>
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
                    {meeting.endTime && (
                      <div className="end-time">
                        {new Date(meeting.endTime).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-milestone">
                  <span className="milestone-text">
                    {meeting.milestoneId ? `Milestone ${meeting.milestoneId}` : 'Không có'}
                  </span>
                </div>
                <div className="col-room">
                  <a 
                    href={meeting.roomUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="room-link"
                  >
                    Tham gia
                  </a>
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
                    onClick={() => handleEditMeeting(meeting)}
                    className="edit-btn"
                  >
                    Sửa
                  </Button>
                  {meeting.status === 'Scheduled' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(meeting.id, MeetingStatus.ONGOING)}
                      className="status-btn"
                    >
                      Bắt đầu
                    </Button>
                  )}
                  {meeting.status === 'Ongoing' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(meeting.id, MeetingStatus.FINISHED)}
                      className="status-btn"
                    >
                      Kết thúc
                    </Button>
                  )}
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

      {showEditModal && selectedMeeting && (
        <CreateMeetingModal
          project={project}
          meeting={selectedMeeting}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMeeting(null);
          }}
          onSave={handleUpdateMeeting}
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

    </div>
  );
};

