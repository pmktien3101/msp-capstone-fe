import * as signalR from '@microsoft/signalr';
import type { NotificationResponse } from '@/types/notification';
import { signalRConfig, getSignalRHubUrl, validateSignalRConfig } from '@/config/signalr.config';

type AccessTokenFactory = (() => string | Promise<string>) | undefined;

let globalHub: NotificationHub | null = null;

export class NotificationHub {
  private connection: signalR.HubConnection;
  private userId: string | null = null;
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = signalRConfig.retry.maxAttempts;
  private joinedGroups: Set<string> = new Set();
  private reconnectAttempts: number = 0;

  static getInstance(userId?: string, accessTokenFactory?: AccessTokenFactory) {
    if (!globalHub) {
      globalHub = new NotificationHub(userId, accessTokenFactory);
    } else if (userId && globalHub.userId !== userId) {
      console.log(' [SignalR] Switching user, recreating hub');
      globalHub.stop().catch(() => {});
      globalHub = new NotificationHub(userId, accessTokenFactory);
    }
    return globalHub;
  }

  constructor(userId?: string, accessTokenFactory?: AccessTokenFactory) {
    this.userId = userId ?? null;

    const configValidation = validateSignalRConfig();
    if (!configValidation.valid) {
      console.error(' [SignalR] Configuration errors:', configValidation.errors);
    }

    const hubUrl = getSignalRHubUrl();
    console.log(' [SignalR] Initializing Hub URL:', hubUrl);
    console.log(' [SignalR] User ID:', this.userId);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: accessTokenFactory,
        withCredentials: signalRConfig.auth.withCredentials,
        skipNegotiation: signalRConfig.connection.skipNegotiation,
        transport: signalRConfig.connection.transport,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delays = signalRConfig.connection.automaticReconnectDelays;
          if (retryContext.previousRetryCount >= delays.length) {
            console.error(' [SignalR] Max reconnection attempts reached');
            return null;
          }
          this.reconnectAttempts = retryContext.previousRetryCount;
          const delay = delays[retryContext.previousRetryCount];
          console.log(` [SignalR] Reconnect attempt ${retryContext.previousRetryCount + 1}, waiting ${delay}ms`);
          return delay;
        }
      })
      .configureLogging(signalRConfig.logging.level)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.connection.onreconnecting((error) => {
      this.isConnected = false;
      console.warn(' [SignalR] Reconnecting...', error?.message || 'Connection lost');
    });

    this.connection.onreconnected(async (connectionId) => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log(` [SignalR] Reconnected successfully! ConnectionId: ${connectionId}`);
      
      if (this.joinedGroups.size > 0) {
        console.log(' [SignalR] Rejoining groups:', Array.from(this.joinedGroups));
        for (const groupName of Array.from(this.joinedGroups)) {
          try {
            await this.connection.invoke(signalRConfig.events.joinGroup, groupName);
            console.log(` [SignalR] Rejoined group: ${groupName}`);
          } catch (err) {
            console.error(` [SignalR] Failed to rejoin group ${groupName}:`, err);
          }
        }
      }
    });

    this.connection.onclose((error) => {
      this.isConnected = false;
      if (error) {
        console.error(' [SignalR] Connection closed with error:', error.message);
        
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.error(' [SignalR] Authorization failed - token may be invalid or expired');
        } else if (error.message?.includes('404')) {
          console.error(' [SignalR] Hub endpoint not found - check backend configuration');
        }
      } else {
        console.log(' [SignalR] Connection closed gracefully');
      }
      
      if (globalHub === this) {
        globalHub = null;
      }
    });
  }

  async start() {
    // Check if already connected or connecting
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      console.log('ℹ [SignalR] Already connected');
      this.isConnected = true;
      return;
    }

    if (this.connection.state === signalR.HubConnectionState.Connecting || 
        this.connection.state === signalR.HubConnectionState.Reconnecting) {
      console.log('ℹ [SignalR] Connection already in progress');
      return;
    }

    try {
      console.log(' [SignalR] Starting connection...');
      await this.connection.start();
      this.isConnected = true;
      this.retryCount = 0;
      console.log(' [SignalR] Connected successfully! ConnectionId:', this.connection.connectionId);
    } catch (err: any) {
      console.error(' [SignalR] Connection failed:', err);

      if (err?.message?.includes('404') || err?.statusCode === 404) {
        console.error(' [SignalR] Endpoint not found (404).');
        return;
      }

      if (err?.message?.includes('401') || err?.statusCode === 401) {
        console.error(' [SignalR] Unauthorized (401).');
        return;
      }

      if (err?.message?.includes('403') || err?.statusCode === 403) {
        console.error(' [SignalR] Forbidden (403).');
        return;
      }

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = signalRConfig.retry.delayMs * Math.pow(signalRConfig.retry.backoffMultiplier, this.retryCount - 1);
        console.log(` [SignalR] Retry ${this.retryCount}/${this.maxRetries} in ${delay}ms...`);
        setTimeout(() => this.start(), delay);
      } else {
        console.error(' [SignalR] Max retry attempts reached.');
      }
    }
  }

  async stop() {
    try {
      // Only stop if not already disconnected
      if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
        console.log(` [SignalR] Stopping connection (current state: ${this.connection.state})...`);
        await this.connection.stop();
        console.log(' [SignalR] Connection stopped');
      } else {
        console.log(' [SignalR] Connection already disconnected');
      }
    } catch (err) {
      console.error(' [SignalR] Error stopping connection:', err);
    } finally {
      this.isConnected = false;
      this.joinedGroups.clear();
      if (globalHub === this) {
        globalHub = null;
      }
    }
  }

  getState() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connection.state,
      connectionId: this.connection.connectionId,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      joinedGroups: Array.from(this.joinedGroups),
    };
  }

  onNotificationReceived(callback: (notification: NotificationResponse) => void) {
    this.connection.on(signalRConfig.events.receiveNotification, (notification) => {
      console.log(' [SignalR] Received notification:', notification);
      callback(notification);
    });
    return () => {
      this.connection.off(signalRConfig.events.receiveNotification, callback);
    };
  }

  onUnreadCountUpdated(callback: (count: number) => void) {
    this.connection.on(signalRConfig.events.updateUnreadCount, (count) => {
      console.log(' [SignalR] Unread count updated:', count);
      callback(count);
    });
    return () => {
      this.connection.off(signalRConfig.events.updateUnreadCount, callback);
    };
  }

  onNotificationRead(callback: (notificationId: string) => void) {
    this.connection.on(signalRConfig.events.notificationRead, (notificationId) => {
      console.log(' [SignalR] Notification marked as read:', notificationId);
      callback(notificationId);
    });
    return () => {
      this.connection.off(signalRConfig.events.notificationRead, callback);
    };
  }

  async joinGroup(groupName: string) {
    try {
      if (this.connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error(`Cannot join group: SignalR is not connected (state: ${this.connection.state})`);
      }
      
      await this.connection.invoke(signalRConfig.events.joinGroup, groupName);
      this.joinedGroups.add(groupName);
      console.log(` [SignalR] Joined group: ${groupName}`);
    } catch (err) {
      console.error(` [SignalR] Failed to join group ${groupName}:`, err);
      throw err;
    }
  }

  async leaveGroup(groupName: string) {
    try {
      if (!this.isConnected) {
        console.warn(' [SignalR] Not connected, cannot leave group');
        this.joinedGroups.delete(groupName);
        return;
      }
      
      await this.connection.invoke(signalRConfig.events.leaveGroup, groupName);
      this.joinedGroups.delete(groupName);
      console.log(` [SignalR] Left group: ${groupName}`);
    } catch (err) {
      console.error(` [SignalR] Failed to leave group ${groupName}:`, err);
      throw err;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      if (!this.isConnected) {
        throw new Error('Cannot mark notification: SignalR is not connected');
      }
      
      await this.connection.invoke(signalRConfig.events.markNotificationAsRead, notificationId);
      console.log(` [SignalR] Marked notification as read: ${notificationId}`);
    } catch (err) {
      console.error(` [SignalR] Failed to mark notification ${notificationId} as read:`, err);
      throw err;
    }
  }

  getConnectionId(): string | null {
    return this.connection.connectionId ?? null;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.connection.state === signalR.HubConnectionState.Connected;
  }

  static destroyInstance() {
    if (globalHub) {
      globalHub.stop().catch(() => {});
      globalHub = null;
      console.log(' [SignalR] Global instance destroyed');
    }
  }
}
