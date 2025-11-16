import { get } from "http";
import { api } from "./api";
import { CreateSubscriptionPayload } from "@/types/subscription";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
export const subscriptionService = {
  async createSubscription(
    data: CreateSubscriptionPayload
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.debug("Creating package payload:", data);
      const response = await api.post<ApiResponse<any>>("/subscriptions", data);
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

  async getSubscriptionByUserId(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const response = await api.get<ApiResponse<any>>(`/subscriptions/${id}`);
        return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Get subscription error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to get subscription",
      };
    }
    },
    async getActiveSubscriptionByUserId(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
      try {
        const response = await api.get<ApiResponse<any>>(`/subscriptions/active/${userId}`);
        return {
          success: response.data.success,
          data: response.data.data,
          error: response.data.success ? undefined : response.data.message,
        };
      } catch (error: any) {
        console.error("Get active subscriptions error:", error);
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "Failed to get active subscriptions",
        };
      }
    },
}