import { Meeting, CreateMeetingDto, UpdateMeetingDto, MeetingStatus } from '@/types/meeting';

// Mock meetings data directly in service to avoid import issues
const mockMeetingsData: Meeting[] = [
  {
    id: 'meeting-1',
    projectId: '1',
    milestoneId: 'milestone-1',
    title: 'Họp kick-off dự án',
    description: 'Cuộc họp khởi động dự án MSP với toàn bộ team',
    startTime: '2025-09-15T09:00:00Z',
    endTime: '2025-09-15T10:30:00Z',
    status: 'Finished',
    roomUrl: 'https://meet.google.com/abc-defg-hij',
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2025-09-15T10:30:00Z'
  },
  {
    id: 'meeting-2',
    projectId: '1',
    milestoneId: 'milestone-1',
    title: 'Review thiết kế UI/UX',
    description: 'Review và feedback về thiết kế giao diện đăng nhập',
    startTime: '2025-09-20T14:00:00Z',
    endTime: '2025-09-20T15:30:00Z',
    status: 'Scheduled',
    roomUrl: 'https://meet.google.com/xyz-uvw-rst',
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-09-10T10:00:00Z'
  },
  {
    id: 'meeting-3',
    projectId: '1',
    milestoneId: 'milestone-2',
    title: 'Demo tích hợp Payment',
    description: 'Demo tính năng tích hợp thanh toán VNPay',
    startTime: '2025-09-25T10:00:00Z',
    endTime: '2025-09-25T11:00:00Z',
    status: 'Scheduled',
    roomUrl: 'https://meet.google.com/mno-pqr-stu',
    createdAt: '2025-09-15T14:00:00Z',
    updatedAt: '2025-09-15T14:00:00Z'
  },
  {
    id: 'meeting-4',
    projectId: '1',
    milestoneId: null,
    title: 'Họp hàng tuần',
    description: 'Họp cập nhật tiến độ dự án hàng tuần',
    startTime: '2025-09-22T09:00:00Z',
    endTime: '2025-09-22T10:00:00Z',
    status: 'Ongoing',
    roomUrl: 'https://meet.google.com/weekly-standup',
    createdAt: '2025-09-18T15:00:00Z',
    updatedAt: '2025-09-22T09:00:00Z'
  },
  {
    id: 'meeting-5',
    projectId: '1',
    milestoneId: 'milestone-1',
    title: 'Code review session',
    description: 'Review code cho module authentication',
    startTime: '2025-09-18T15:00:00Z',
    endTime: '2025-09-18T16:30:00Z',
    status: 'Finished',
    roomUrl: 'https://meet.google.com/code-review-123',
    createdAt: '2025-09-16T10:00:00Z',
    updatedAt: '2025-09-18T16:30:00Z'
  },
  {
    id: 'meeting-6',
    projectId: '1',
    milestoneId: 'milestone-2',
    title: 'Testing session',
    description: 'Test tích hợp payment gateway',
    startTime: '2025-09-28T14:00:00Z',
    endTime: null,
    status: 'Scheduled',
    roomUrl: 'https://meet.google.com/testing-session',
    createdAt: '2025-09-20T11:00:00Z',
    updatedAt: '2025-09-20T11:00:00Z'
  }
];

// In-memory storage for demo purposes
let meetings: Meeting[] = [...mockMeetingsData];



export const meetingService = {
  // Get all meetings
  getAllMeetings: (): Meeting[] => {
    return meetings;
  },

  // Get meetings by project ID
  getMeetingsByProject: (projectId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.projectId === projectId);
  },

  // Get meetings by milestone ID
  getMeetingsByMilestone: (milestoneId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.milestoneId === milestoneId);
  },

  // Get meeting by ID
  getMeetingById: (id: string): Meeting | null => {
    return meetings.find(meeting => meeting.id === id) || null;
  },

  // Create new meeting
  createMeeting: (meetingData: CreateMeetingDto): Meeting => {
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      ...meetingData,
      status: MeetingStatus.SCHEDULED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    meetings.push(newMeeting);
    return newMeeting;
  },

  // Update meeting
  updateMeeting: (id: string, updateData: UpdateMeetingDto): Meeting | null => {
    const meetingIndex = meetings.findIndex(meeting => meeting.id === id);
    
    if (meetingIndex === -1) {
      return null;
    }

    meetings[meetingIndex] = {
      ...meetings[meetingIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return meetings[meetingIndex];
  },

  // Delete meeting
  deleteMeeting: (id: string): boolean => {
    const meetingIndex = meetings.findIndex(meeting => meeting.id === id);
    
    if (meetingIndex === -1) {
      return false;
    }

    meetings.splice(meetingIndex, 1);
    return true;
  },

  // Update meeting status
  updateMeetingStatus: (id: string, status: MeetingStatus): Meeting | null => {
    return meetingService.updateMeeting(id, { status });
  },

  // Get meetings by status
  getMeetingsByStatus: (status: MeetingStatus): Meeting[] => {
    return meetings.filter(meeting => meeting.status === status);
  },

  // Get upcoming meetings (scheduled and ongoing)
  getUpcomingMeetings: (): Meeting[] => {
    const now = new Date();
    return meetings.filter(meeting => {
      const meetingTime = new Date(meeting.startTime);
      return (meeting.status === MeetingStatus.SCHEDULED || meeting.status === MeetingStatus.ONGOING) 
             && meetingTime >= now;
    });
  },

  // Get past meetings (finished)
  getPastMeetings: (): Meeting[] => {
    return meetings.filter(meeting => meeting.status === MeetingStatus.FINISHED);
  },

  // Search meetings by title or description
  searchMeetings: (query: string): Meeting[] => {
    const lowercaseQuery = query.toLowerCase();
    return meetings.filter(meeting => 
      meeting.title.toLowerCase().includes(lowercaseQuery) ||
      meeting.description.toLowerCase().includes(lowercaseQuery)
    );
  }
};