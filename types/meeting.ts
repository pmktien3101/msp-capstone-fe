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
