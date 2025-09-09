export interface Meeting {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    participants: string[];
    createdBy: string;
    status: MeetingStatus;
}

export enum MeetingStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export type CreateMeetingDto = Omit<Meeting, 'id' | 'createdBy'>;
export type UpdateMeetingDto = Partial<CreateMeetingDto>;
