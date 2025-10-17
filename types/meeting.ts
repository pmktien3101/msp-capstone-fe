export interface Meeting {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: { id: string; name: string }[];
  createdBy: string;
  status: MeetingStatus;
  roomUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  milestoneId?: string | number;
}

export enum MeetingStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
}

export interface CreateMeetingDto {
  projectId: string;
  milestoneId?: string | null;
  title: string;
  description: string;
  startTime: string;
  endTime?: string | null;
  roomUrl: string;
}

export interface UpdateMeetingDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string | null;
  status?: MeetingStatus;
  roomUrl?: string;
  milestoneId?: string | null;
}

export interface CreateMeetingRequest {
  createdById: string;
  projectId: string;
  milestoneId?: string | null;
  title: string;
  description: string;
  startTime: string;
  attendeeIds: string[];
}

export interface UpdateMeetingRequest {
  meetingId: string;
  createdById?: string;
  projectId?: string;
  milestoneId?: string | null;
  title?: string;
  description?: string;
  startTime?: string;
  attendeeIds?: string[];
  status?: MeetingStatus;
  summary?: string;
  transcription?: string;
  recordUrl?: string;
}

export interface MeetingItem {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status: "Scheduled" | "Ongoing" | "Finished" | "Cancel" | string;
  createdById?: string;
  createdByEmail?: string;
  projectId?: string;
  projectName?: string;
  milestoneId?: string;
  milestoneName?: string;
  createdAt?: string;
  updatedAt?: string;
  summary?: string;
  transcription?: string;
  recordUrl?: string;
  attendees?: {
    id: string;
    email: string;
    avatarUrl?: string | null;
    fullName?: string;
  }[];
}
