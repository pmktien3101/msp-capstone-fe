import { api } from './api';
import type {
  GetCommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '@/types/comment';
import type { PagingRequest, PagingResponse } from '@/types/project';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const commentService = {
  // Create new comment
  async createComment(data: CreateCommentRequest): Promise<{ success: boolean; data?: GetCommentResponse; error?: string }> {
    try {
      const response = await api.post<ApiResponse<GetCommentResponse>>('/comments', data);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to create comment' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to create comment' };
    }
  },

  // Update comment
  async updateComment(data: UpdateCommentRequest): Promise<{ success: boolean; data?: GetCommentResponse; error?: string }> {
    try {
      const response = await api.put<ApiResponse<GetCommentResponse>>('/comments', data);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to update comment' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to update comment' };
    }
  },

  // Delete comment
  async deleteComment(commentId: string, userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse>(`/comments/${commentId}`, {
        params: { userId }
      });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message || 'Failed to delete comment' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to delete comment' };
    }
  },

  // Get comment by ID
  async getCommentById(commentId: string): Promise<{ success: boolean; data?: GetCommentResponse; error?: string }> {
    try {
      const response = await api.get<ApiResponse<GetCommentResponse>>(`/comments/${commentId}`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch comment' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch comment' };
    }
  },

  // Get comments by task ID with paging
  async getCommentsByTaskId(taskId: string, params?: PagingRequest): Promise<{ success: boolean; data?: PagingResponse<GetCommentResponse>; error?: string }> {
    try {
      const response = await api.get<ApiResponse<PagingResponse<GetCommentResponse>>>(`/comments/task/${taskId}`, { params });
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch comments by task' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch comments by task' };
    }
  },

  // Get comment count by task ID
  async getCommentCountByTaskId(taskId: string): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      const response = await api.get<ApiResponse<number>>(`/comments/task/${taskId}/count`);
      if (response.data.success && response.data.data !== undefined) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch comment count' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch comment count' };
    }
  },
};