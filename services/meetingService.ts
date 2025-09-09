import { api } from './api';
import type { Meeting, CreateMeetingDto, UpdateMeetingDto } from '@/types';

export const meetingService = {
    async getAllMeetings() {
        const response = await api.get('/meetings');
        return response.data;
    },

    async getMeetingById(id: string) {
        const response = await api.get(`/meetings/${id}`);
        return response.data;
    },

    async createMeeting(meetingData: CreateMeetingDto) {
        const response = await api.post('/meetings', meetingData);
        return response.data;
    },

    async updateMeeting(id: string, meetingData: UpdateMeetingDto) {
        const response = await api.put(`/meetings/${id}`, meetingData);
        return response.data;
    },

    async deleteMeeting(id: string) {
        await api.delete(`/meetings/${id}`);
    }
};
