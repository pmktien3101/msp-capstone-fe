export interface Meeting {
    id: string;
    projectId: string;
    milestoneId?: string | null;
    title: string;
    description: string;
    startTime: string; // ISO string format
    endTime?: string | null; // ISO string format, optional
    status: MeetingStatus;
    roomUrl: string;
    createdAt: string; // ISO string format
    updatedAt: string; // ISO string format
}

export enum MeetingStatus {
    SCHEDULED = 'Scheduled',
    ONGOING = 'Ongoing', 
    FINISHED = 'Finished',
    CANCELLED = 'Cancelled'
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
