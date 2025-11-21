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
      console.debug("Creating subscription payload:", data);
      const response = await api.post<ApiResponse<any>>("/subscriptions", data);
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error(
        "Create subscription error:",
        error?.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create subscription",
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

  // Fetch all subscriptions and map to a simplified display model
  async getAllSubscriptions(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/subscriptions`);
      const raw = response.data.data;

      const mapped = Array.isArray(raw)
        ? raw.map((s: any) => ({
            id: s.id,
            paymentMethod: s.paymentMethod,
            transactionID: s.transactionID,
            totalPrice: s.totalPrice,
            status: s.status,
            paidAt: s.paidAt,
            startDate: s.startDate,
            endDate: s.endDate,
            isActive: s.isActive,
            packageId: s.packageId,
            package: s.package
              ? {
                  id: s.package.id,
                  name: s.package.name,
                  price: s.package.price,
                  currency: s.package.currency,
                  billingCycle: s.package.billingCycle,
                  limitations: Array.isArray(s.package.limitations)
                    ? s.package.limitations.map((l: any) => ({
                        id: l.id,
                        name: l.name,
                        description: l.description,
                        isUnlimited: l.isUnlimited,
                        limitValue: l.limitValue,
                        limitUnit: l.limitUnit,
                      }))
                    : [],
                }
              : undefined,
            userId: s.userId,
            user: s.user
              ? {
                  id: s.user.id,
                  fullName: s.user.fullName,
                  email: s.user.email,
                }
              : undefined,
          }))
        : [];

      return {
        success: response.data.success,
        data: mapped,
        error: response.data.success ? undefined : response.data.message,
      };
    } catch (error: any) {
      console.error("Get subscriptions error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to get subscriptions",
      };
    }
  },

  async getActiveSubscriptionByUserId(
    userId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/subscriptions/active/${userId}`
      );
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
};
