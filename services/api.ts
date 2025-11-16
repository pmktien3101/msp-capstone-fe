import axios, { AxiosError } from "axios";
import { getAccessToken, getRefreshToken, clearAllAuthData, setAccessToken, setTokens } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();

    // Check JWT expiration
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeLeft = exp - now;

        if (timeLeft < 0) {
          // Token is expired
        } else if (timeLeft < 60000) {
          // Less than 1 minute
          // Token expires soon
        }
      } catch (error) {
        // Error parsing JWT
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors - try to refresh token first
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refreshToken from localStorage
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {
            refreshToken: refreshToken,
          }
        );

        if (refreshResponse.data.success && refreshResponse.data.data) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          const newRefreshToken = refreshResponse.data.data.refreshToken;

          // Update both tokens in localStorage
          setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          }, false);

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error("Refresh token failed - invalid response");
        }
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError, null);

        // Clear auth data and redirect to login
        clearAllAuthData();
        window.location.href = "/sign-in";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Access forbidden - insufficient permissions
    }

    return Promise.reject(error);
  }
);
