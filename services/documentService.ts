import { api } from './api';
import type {
  GetDocumentResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from '@/types/document';
import type { PagingRequest, PagingResponse } from '@/types/project';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const documentService = {
  // Create new document
  async createDocument(data: CreateDocumentRequest): Promise<{ success: boolean; data?: GetDocumentResponse; error?: string }> {
    try {
      const response = await api.post<ApiResponse<GetDocumentResponse>>('/documents', data);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to create document' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to create document' };
    }
  },

  // Update document
  async updateDocument(data: UpdateDocumentRequest): Promise<{ success: boolean; data?: GetDocumentResponse; error?: string }> {
    try {
      const response = await api.put<ApiResponse<GetDocumentResponse>>('/documents', data);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to update document' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to update document' };
    }
  },

  // Delete document
  async deleteDocument(documentId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse>(`/documents/${documentId}`);
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.message || 'Failed to delete document' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to delete document' };
    }
  },

  // Get document by ID
  async getDocumentById(documentId: string): Promise<{ success: boolean; data?: GetDocumentResponse; error?: string }> {
    try {
      const response = await api.get<ApiResponse<GetDocumentResponse>>(`/documents/${documentId}`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch document' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch document' };
    }
  },

  // Get all documents with paging
  async getAllDocuments(params?: PagingRequest): Promise<{ success: boolean; data?: PagingResponse<GetDocumentResponse>; error?: string }> {
    try {
      const response = await api.get<ApiResponse<PagingResponse<GetDocumentResponse>>>('/documents', { params });
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch documents' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch documents' };
    }
  },

  // Get documents by project ID with paging
  async getDocumentsByProjectId(projectId: string, params?: PagingRequest): Promise<{ success: boolean; data?: PagingResponse<GetDocumentResponse>; error?: string }> {
    try {
      const response = await api.get<ApiResponse<PagingResponse<GetDocumentResponse>>>(`/documents/by-project/${projectId}`, { params });
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch documents by project' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch documents by project' };
    }
  },

  // Get documents by owner ID with paging
  async getDocumentsByOwnerId(ownerId: string, params?: PagingRequest): Promise<{ success: boolean; data?: PagingResponse<GetDocumentResponse>; error?: string }> {
    try {
      const response = await api.get<ApiResponse<PagingResponse<GetDocumentResponse>>>(`/documents/by-owner/${ownerId}`, { params });
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to fetch documents by owner' };
      }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch documents by owner' };
    }
  },
};
