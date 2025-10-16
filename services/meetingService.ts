import { api } from "./api";
import type {
  MeetingItem,
  CreateMeetingRequest,
  UpdateMeetingRequest,
} from "@/types/meeting";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const meetingService = {
  // Create new meeting
  async createMeeting(
    data: CreateMeetingRequest
  ): Promise<{ success: boolean; data?: MeetingItem; error?: string }> {
    try {
      // Convert startTime to ISO 8601 UTC format if needed
      const requestData = {
        ...data,
        startTime: (data as any).startTime
          ? new Date((data as any).startTime).toISOString()
          : undefined,
      };

      const response = await api.post<ApiResponse<MeetingItem>>(
        "/meetings",
        requestData
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to create meeting",
        };
      }
    } catch (error: any) {
      console.error("Create meeting error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create meeting",
      };
    }
  },

  // Update meeting
  async updateMeeting(
    data: UpdateMeetingRequest
  ): Promise<{ success: boolean; data?: MeetingItem; error?: string }> {
    try {
      const { meetingId, ...rest } = data;
      const requestData = {
        ...rest,
        startTime: rest.startTime
          ? new Date(rest.startTime).toISOString()
          : undefined,
      };

      const response = await api.put<ApiResponse<MeetingItem>>(
        `/meetings/${meetingId}`,
        requestData
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to update meeting",
        };
      }
    } catch (error: any) {
      console.error("Update meeting error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update meeting",
      };
    }
  },

  // Delete meeting
  async deleteMeeting(
    meetingId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse>(`/meetings/${meetingId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to delete meeting",
        };
      }
    } catch (error: any) {
      console.error("Delete meeting error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete meeting",
      };
    }
  },

  // Get meeting by ID
  async getMeetingById(
    meetingId: string
  ): Promise<{ success: boolean; data?: MeetingItem; error?: string }> {
    try {
      const response = await api.get<ApiResponse<MeetingItem>>(
        `/meetings/${meetingId}`
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to fetch meeting",
        };
      }
    } catch (error: any) {
      console.error("Get meeting error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch meeting",
      };
    }
  },

  // Get meetings by project ID
  async getMeetingsByProjectId(
    projectId: string
  ): Promise<{ success: boolean; data?: MeetingItem[]; error?: string }> {
    try {
      const response = await api.get<ApiResponse<MeetingItem[]>>(
        `/meetings/by-project/${projectId}`
      );

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || "Failed to fetch meetings",
        };
      }
    } catch (error: any) {
      console.error("Get meetings by project error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch meetings",
      };
    }
  },
};
