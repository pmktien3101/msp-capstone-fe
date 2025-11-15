import { api } from "./api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const packageService = {
  async createPackage(
    data: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.debug("Creating package payload:", data);
      const response = await api.post<ApiResponse<any>>("/packages", data);
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Create package error:", error?.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create package",
      };
    }
  },

  async updatePackage(
    id: string,
    data: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Controller expects id as query param (PUT without route param), so pass id as param
      const response = await api.put<ApiResponse<any>>("/packages", data, {
        params: { id },
      });
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Update package error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update package",
      };
    }
  },

  async getPackageById(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/packages/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Get package by id error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch package",
      };
    }
  },

  async getPackages(
    params?: any
  ): Promise<{ success: boolean; data?: any[] | any; error?: string }> {
    try {
      const response = await api.get<ApiResponse<any>>("/packages", {
        params,
      });
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      }
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data ?? [] };
      }
      return {
        success: false,
        error: response.data?.message || "Failed to fetch packages",
      };
    } catch (error: any) {
      console.error("Get packages error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch packages",
      };
    }
  },

  async deletePackage(
    id: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete<ApiResponse<any>>(`/packages/${id}`);
      return {
        success: response.data.success,
        message: response.data.message,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Delete package error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete package",
      };
    }
  },
};

export default packageService;
