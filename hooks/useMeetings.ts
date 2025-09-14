import { useState, useEffect, useCallback } from 'react';
import { Meeting, CreateMeetingDto, UpdateMeetingDto, MeetingStatus } from '@/types/meeting';
import { meetingService } from '@/services/meetingService';

export const useMeetings = (projectId?: string) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load meetings
  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = projectId 
        ? meetingService.getMeetingsByProject(projectId)
        : meetingService.getAllMeetings();
      
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Create meeting
  const createMeeting = async (meetingData: CreateMeetingDto): Promise<Meeting | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const newMeeting = meetingService.createMeeting(meetingData);
      setMeetings(prev => [...prev, newMeeting]);
      
      return newMeeting;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update meeting
  const updateMeeting = async (id: string, updateData: UpdateMeetingDto): Promise<Meeting | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedMeeting = meetingService.updateMeeting(id, updateData);
      
      if (updatedMeeting) {
        setMeetings(prev => 
          prev.map(meeting => 
            meeting.id === id ? updatedMeeting : meeting
          )
        );
      }
      
      return updatedMeeting;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meeting');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete meeting
  const deleteMeeting = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const success = meetingService.deleteMeeting(id);
      
      if (success) {
        setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meeting');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update meeting status
  const updateMeetingStatus = async (id: string, status: MeetingStatus): Promise<Meeting | null> => {
    return updateMeeting(id, { status });
  };

  // Get meetings by milestone
  const getMeetingsByMilestone = (milestoneId: string): Meeting[] => {
    return meetingService.getMeetingsByMilestone(milestoneId);
  };

  // Get upcoming meetings
  const getUpcomingMeetings = (): Meeting[] => {
    return meetingService.getUpcomingMeetings();
  };

  // Get past meetings
  const getPastMeetings = (): Meeting[] => {
    return meetingService.getPastMeetings();
  };

  // Search meetings
  const searchMeetings = (query: string): Meeting[] => {
    return meetingService.searchMeetings(query);
  };

  // Load meetings on mount
  useEffect(() => {
    loadMeetings();
  }, [projectId, loadMeetings]);

  return {
    meetings,
    loading,
    error,
    loadMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    updateMeetingStatus,
    getMeetingsByMilestone,
    getUpcomingMeetings,
    getPastMeetings,
    searchMeetings
  };
};
