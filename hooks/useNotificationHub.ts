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
      console.error('🚨 [SignalR] Configuration errors:', configValidation.errors);
    }

    const hubUrl = getSignalRHubUrl();

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
      console.warn('🔄 [SignalR] Reconnecting...', error?.message);
    });

    this.connection.onreconnected(async (connectionId) => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log(`✅ [SignalR] Reconnected! ID: ${connectionId}`);
      
      if (this.joinedGroups.size > 0) {
        for (const groupName of Array.from(this.joinedGroups)) {
          try {
            await this.connection.invoke(signalRConfig.events.joinGroup, groupName);
          } catch (err) {
            console.error(`❌ [SignalR] Failed to rejoin group ${groupName}:`, err);
          }
        }
      }
    });

    this.connection.onclose((error) => {
      this.isConnected = false;
      if (error) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.error('🔒 [SignalR] Authorization failed - token expired');
        } else if (error.message?.includes('404')) {
          console.error('🔍 [SignalR] Hub endpoint not found');
        } else {
          console.error('❌ [SignalR] Connection closed:', error.message);
        }
      }
      
      if (globalHub === this) {
        globalHub = null;
      }
    });
  }

  async start() {
    // Check if already connected or connecting
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.isConnected = true;
      return;
    }

    if (this.connection.state === signalR.HubConnectionState.Connecting || 
        this.connection.state === signalR.HubConnectionState.Reconnecting) {
      return;
    }

    try {
      await this.connection.start();
      this.isConnected = true;
      this.retryCount = 0;
      console.log('🚀 [SignalR] Connected:', this.connection.connectionId);
    } catch (err: any) {
      if (err?.message?.includes('404') || err?.statusCode === 404) {
        console.error('🔍 [SignalR] Endpoint not found (404)');
        return;
      }

      if (err?.message?.includes('401') || err?.statusCode === 401) {
        console.error('🔒 [SignalR] Unauthorized (401)');
        return;
      }

      if (err?.message?.includes('403') || err?.statusCode === 403) {
        console.error('🔒 [SignalR] Forbidden (403)');
        return;
      }

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = signalRConfig.retry.delayMs * Math.pow(signalRConfig.retry.backoffMultiplier, this.retryCount - 1);
        console.log(`🔄 [SignalR] Retry ${this.retryCount}/${this.maxRetries} in ${delay}ms...`);
        setTimeout(() => this.start(), delay);
      } else {
        console.error('❌ [SignalR] Max retries reached');
      }
    }
  }

  async stop() {
    try {
      if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
        await this.connection.stop();
      }
    } catch (err) {
      console.error('❌ [SignalR] Stop error:', err);
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
      console.log('📬 [SignalR] New notification:', notification.title);
      callback(notification);
    });
    return () => {
      this.connection.off(signalRConfig.events.receiveNotification, callback);
    };
  }

  onUnreadCountUpdated(callback: (count: number) => void) {
    this.connection.on(signalRConfig.events.updateUnreadCount, (count) => {
      callback(count);
    });
    return () => {
      this.connection.off(signalRConfig.events.updateUnreadCount, callback);
    };
  }

  onNotificationRead(callback: (notificationId: string) => void) {
    this.connection.on(signalRConfig.events.notificationRead, (notificationId) => {
      callback(notificationId);
    });
    return () => {
      this.connection.off(signalRConfig.events.notificationRead, callback);
    };
  }

  async joinGroup(groupName: string) {
    try {
      if (this.connection.state !== signalR.HubConnectionState.Connected) {
        throw new Error(`Cannot join group: not connected`);
      }
      
      await this.connection.invoke(signalRConfig.events.joinGroup, groupName);
      this.joinedGroups.add(groupName);
    } catch (err) {
      console.error(`❌ [SignalR] Join group failed:`, err);
      throw err;
    }
  }

  async leaveGroup(groupName: string) {
    try {
      if (!this.isConnected) {
        this.joinedGroups.delete(groupName);
        return;
      }
      
      await this.connection.invoke(signalRConfig.events.leaveGroup, groupName);
      this.joinedGroups.delete(groupName);
    } catch (err) {
      console.error(`❌ [SignalR] Leave group failed:`, err);
      throw err;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      if (!this.isConnected) {
        throw new Error('Cannot mark notification: not connected');
      }
      
      await this.connection.invoke(signalRConfig.events.markNotificationAsRead, notificationId);
    } catch (err) {
      console.error(`❌ [SignalR] Mark read failed:`, err);
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
    }
  }
}
