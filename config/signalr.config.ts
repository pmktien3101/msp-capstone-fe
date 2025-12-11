/**
 * SignalR Configuration
 * Centralized configuration for SignalR connection settings
 */

export const signalRConfig = {
  // Get base URL from environment variable
  getBaseUrl: () => {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!apiUrl) {
      console.error('❌ NEXT_PUBLIC_BASE_URL is not defined in environment variables');
      return 'https://localhost:7129';
    }
    
    // For production (api.msp.audivia.vn), keep /api/v1
    // For localhost, remove /api/v1 because SignalR hub is at root
    if (apiUrl.includes('localhost')) {
      // Localhost: SignalR at https://localhost:7129/notificationHub
      return apiUrl.replace('/api/v1', '');
    } else {
      // Production: SignalR at https://api.msp.audivia.vn/api/v1/notificationHub
      return apiUrl;
    }
  },

  // Hub endpoint path (must match backend MapHub configuration)
  // Localhost: /notificationHub
  // Production: /notificationHub (but base URL includes /api/v1)
  hubPath: process.env.NODE_ENV === 'production'
  ? '/api/v1/notificationHub'
  : '/notificationHub',

  // Connection settings
  connection: {
    // Automatic reconnect delays (in milliseconds)
    // Default: [0, 2000, 10000, 30000] then stops trying
    automaticReconnectDelays: [0, 2000, 5000, 10000, 30000],
    
    // Keep-alive interval (should match backend KeepAliveInterval)
    keepAliveInterval: 15000, // 15 seconds
    
    // Server timeout (should match backend ClientTimeoutInterval)
    serverTimeout: 30000, // 30 seconds
    
    // Enable detailed errors (useful for debugging)
    skipNegotiation: false,
    
    // Transport type (WebSockets, ServerSentEvents, LongPolling)
    // Leave undefined to let SignalR choose the best transport
    transport: undefined,
  },

  // Retry configuration for initial connection
  retry: {
    maxAttempts: 5,
    delayMs: 3000,
    backoffMultiplier: 1.5, // Exponential backoff
  },

  // Logging
  logging: {
    // Log level: Trace = 0, Debug = 1, Information = 2, Warning = 3, Error = 4, Critical = 5, None = 6
    // Use Warning (3) for production, Debug (1) or Trace (0) for development
    level: process.env.NODE_ENV === 'production' ? 3 : 1,
  },

  // Authentication
  auth: {
    withCredentials: true, // Include credentials (cookies) with requests
    // Access token will be provided by accessTokenFactory function
  },

  // Group naming conventions (must match backend)
  groups: {
    userGroup: (userId: string) => `user_${userId}`,
    projectGroup: (projectId: string) => `project_${projectId}`,
    organizationGroup: (orgId: string) => `organization_${orgId}`,
  },

  // Event names (must match backend SendAsync calls)
  events: {
    // Server -> Client events
    receiveNotification: 'ReceiveNotification',
    updateUnreadCount: 'UpdateUnreadCount',
    notificationRead: 'NotificationRead',
    
    // Client -> Server methods (must match backend Hub methods)
    joinGroup: 'JoinGroup',
    leaveGroup: 'LeaveGroup',
    markNotificationAsRead: 'MarkNotificationAsRead',
  },
};

/**
 * Get full SignalR Hub URL
 */
export const getSignalRHubUrl = (): string => {
  return `${signalRConfig.getBaseUrl()}${signalRConfig.hubPath}`;
};

/**
 * Check if SignalR is properly configured
 */
export const validateSignalRConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    errors.push('NEXT_PUBLIC_BASE_URL is not defined');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
