'use client';

import { Meeting, MeetingStatus } from '@/types/meeting';
import { Project } from '@/types/project';

interface RecentMeetingsProps {
  meetings: Meeting[];
  selectedProject: Project | null;
  projects: Project[];
  onViewSummary: (meetingId: string) => void;
}

export default function RecentMeetings({ meetings, selectedProject, projects, onViewSummary }: RecentMeetingsProps) {
  // Mock data - trong thực tế sẽ lấy từ API với projectId
  const meetingsWithProject = meetings.map(meeting => ({
    ...meeting,
    projectId: meeting.id === '1' ? '1' : meeting.id === '2' ? '2' : '1' // Mock project assignment
  }));

  const recentMeetings = meetingsWithProject
    .filter(meeting => {
      const isCompleted = meeting.status === MeetingStatus.COMPLETED;
      const matchesProject = !selectedProject || meeting.projectId === selectedProject.id;
      return isCompleted && matchesProject;
    })
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
    .slice(0, 3);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getDuration = (startTime: Date, endTime: Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} phút`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="recent-meetings">
      <div className="section-header">
        <h3>Cuộc họp gần đây</h3>
      </div>

      <div className="meetings-list">
        {recentMeetings.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="empty-icon">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Chưa có cuộc họp nào</p>
          </div>
        ) : (
          recentMeetings.map((meeting) => (
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
                <p className="meeting-time">{formatDate(meeting.endTime)}</p>
                <p className="meeting-duration">
                  Thời lượng: {getDuration(meeting.startTime, meeting.endTime)}
                </p>
                <p className="meeting-participants">
                  {meeting.participants.length} người tham gia
                </p>
              </div>
              <div className="meeting-actions">
                <button 
                  className="btn-view"
                  onClick={() => onViewSummary(meeting.id)}
                >
                  Xem Summary
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
