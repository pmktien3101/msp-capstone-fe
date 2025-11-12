import { api } from "./api";
import type {
  Limitation,
  CreateLimitationRequest,
  UpdateLimitationRequest,
  PagingRequest,
  PagingResponse,
} from "@/types/limitation";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const limitationService = {
  async createLimitation(
    data: CreateLimitationRequest
  ): Promise<{ success: boolean; data?: Limitation; error?: string }> {
    try {
      const response = await api.post<ApiResponse<Limitation>>(
        "/limitations",
        data
      );
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Create limitation error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create limitation",
      };
    }
  },

  async updateLimitation(
    data: UpdateLimitationRequest
  ): Promise<{ success: boolean; data?: Limitation; error?: string }> {
    try {
      const response = await api.put<ApiResponse<Limitation>>(
        "/limitations",
        data
      );
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Update limitation error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update limitation",
      };
    }
  },

  async getLimitationById(
    limitationId: string
  ): Promise<{ success: boolean; data?: Limitation; error?: string }> {
    try {
      const response = await api.get<ApiResponse<Limitation>>(
        `/limitations/${limitationId}`
      );
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Get limitation by id error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch limitation",
      };
    }
  },

  async getLimitations(
    params?: PagingRequest
  ): Promise<{
    success: boolean;
    data?: PagingResponse<Limitation> | Limitation[];
    error?: string;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>("/limitations", {
        params,
      });

      // Handle both paged and non-paged responses
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }

      if (response.data && response.data.success) {
        if (response.data.data) {
          return {
            success: true,
            data: response.data.data,
          };
        }
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: false,
        error: response.data?.message || "Failed to fetch limitations",
      };
    } catch (error: any) {
      console.error("Get limitations error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch limitations",
      };
    }
  },

  async deleteLimitation(
    limitationId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse>(
        `/limitations/${limitationId}`
      );
      return {
        success: response.data.success,
        message: response.data.message,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Delete limitation error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete limitation",
      };
    }
  },
};

export default limitationService;
