import { api } from './api';
import type {
  CreateTaskAttachmentRequest,
  TaskAttachmentResponse,
} from '@/types/attachment';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const attachmentService = {
  /**
   * Create attachment metadata for a task
   * (File already uploaded to Cloudinary by frontend)
   */
  async createAttachment(
    taskId: string,
    data: CreateTaskAttachmentRequest
  ): Promise<{ success: boolean; data?: TaskAttachmentResponse; error?: string }> {
    try {
      const response = await api.post<ApiResponse<TaskAttachmentResponse>>(
        `/tasks/${taskId}/attachments`,
        data
      );

      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to create attachment',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to create attachment',
      };
    }
  },

  /**
   * Get all attachments of a task
   */
  async getAttachmentsByTaskId(
    taskId: string
  ): Promise<{ success: boolean; data?: TaskAttachmentResponse[]; error?: string }> {
    try {
      const response = await api.get<ApiResponse<TaskAttachmentResponse[]>>(
        `/tasks/${taskId}/attachments`
      );

      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to fetch attachments',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch attachments',
      };
    }
  },

  /**
   * Delete attachment
   */
  async deleteAttachment(
    attachmentId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse>(
        `/tasks/attachments/${attachmentId}`
      );

      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to delete attachment',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete attachment',
      };
    }
  },
};
