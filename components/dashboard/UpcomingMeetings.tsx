'use client';

import { Meeting, MeetingStatus } from '@/types/meeting';
import { Project } from '@/types/project';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  selectedProject: Project | null;
  projects: Project[];
  onJoinMeeting: (meetingId: string) => void;
  onViewSummary: (meetingId: string) => void;
  onCreateMeeting: () => void;
}

export default function UpcomingMeetings({ 
  meetings, 
  selectedProject,
  projects,
  onJoinMeeting, 
  onViewSummary, 
  onCreateMeeting 
}: UpcomingMeetingsProps) {
  // Mock data - trong thực tế sẽ lấy từ API với projectId
  const meetingsWithProject = meetings.map(meeting => ({
    ...meeting,
    projectId: meeting.id === '1' ? '1' : meeting.id === '2' ? '2' : '1' // Mock project assignment
  }));

  const upcomingMeetings = meetingsWithProject
    .filter(meeting => {
      const isScheduled = meeting.status === MeetingStatus.SCHEDULED;
      const matchesProject = !selectedProject || meeting.projectId === selectedProject.id;
      return isScheduled && matchesProject;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(date));
  };

  const getTimeUntilMeeting = (startTime: Date) => {
    const now = new Date();
    const meetingTime = new Date(startTime);
    const diffMs = meetingTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ngày nữa`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ nữa`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes} phút nữa` : 'Đang diễn ra';
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="upcoming-meetings">
      <div className="section-header">
        <h3>Cuộc họp sắp tới</h3>
        <button 
          className="create-meeting-btn"
          onClick={onCreateMeeting}
          title="Tạo cuộc họp mới"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="meetings-list">
        {upcomingMeetings.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="empty-icon">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Không có cuộc họp nào sắp tới</p>
            <button className="btn-primary" onClick={onCreateMeeting}>
              Tạo cuộc họp
            </button>
          </div>
        ) : (
          upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="meeting-item">
              <div className="meeting-info">
                <h4 className="meeting-title">{meeting.title}</h4>
                {!selectedProject && (
                  <p className="meeting-project">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {getProjectName(meeting.projectId)}
                  </p>
                )}
                <p className="meeting-time">{formatTime(meeting.startTime)}</p>
                <p className="meeting-countdown">{getTimeUntilMeeting(meeting.startTime)}</p>
                <p className="meeting-participants">
                  {meeting.participants.length} người tham gia
                </p>
              </div>
              <div className="meeting-actions">
                <button 
                  className="btn-join"
                  onClick={() => onJoinMeeting(meeting.id)}
                >
                  Join
                </button>
                <button 
                  className="btn-view"
                  onClick={() => onViewSummary(meeting.id)}
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
