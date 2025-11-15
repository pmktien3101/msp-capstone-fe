import * as signalR from '@microsoft/signalr';
import type { NotificationResponse } from '@/types/notification';

type AccessTokenFactory = (() => string | Promise<string>) | undefined;

let globalHub: NotificationHub | null = null;

export class NotificationHub {
  private connection: signalR.HubConnection;
  private userId: string | null = null;
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private joinedGroups: Set<string> = new Set();

  static getInstance(baseUrl: string, userId?: string, accessTokenFactory?: AccessTokenFactory) {
    if (!globalHub) {
      globalHub = new NotificationHub(baseUrl, userId, accessTokenFactory);
    } else if (userId && globalHub.userId !== userId) {
      // If different user, stop old connection and recreate
      globalHub.stop().catch(() => {});
      globalHub = new NotificationHub(baseUrl, userId, accessTokenFactory);
    }
    return globalHub;
  }

  constructor(baseUrl: string, userId?: string, accessTokenFactory?: AccessTokenFactory) {
    this.userId = userId ?? null;

    const cleanBaseUrl = baseUrl.replace('/api/v1', '');
    const hubUrl = `${cleanBaseUrl}/notificationHub`;
    console.debug('SignalR Hub URL:', hubUrl);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: accessTokenFactory,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // track reconnect lifecycle and rejoin groups on successful reconnect
    this.connection.onreconnecting((error) => {
      this.isConnected = false;
      console.warn('SignalR reconnecting...', error);
    });

    this.connection.onreconnected(async (connectionId) => {
      this.isConnected = true;
      console.debug('SignalR reconnected, connectionId=', connectionId);
      // rejoin previously joined groups
      if (this.joinedGroups.size > 0) {
        for (const g of Array.from(this.joinedGroups)) {
          try {
            await this.connection.invoke('JoinGroup', g);
          } catch (err) {
            console.error('Failed to rejoin group', g, err);
          }
        }
      }
    });

    // reset global on close so it can be recreated later
    this.connection.onclose(() => {
      this.isConnected = false;
      if (globalHub === this) globalHub = null;
    });
  }

  async start() {
    if (this.isConnected) return;
    try {
      await this.connection.start();
      this.isConnected = true;
      this.retryCount = 0;
      console.debug('SignalR connected');
    } catch (err: any) {
      console.error('SignalR start failed', err);
      if (err?.message?.includes('404') || err?.statusCode === 404) {
        console.error('SignalR endpoint not found (404)');
        return;
      }
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.start(), 5000 * this.retryCount);
      }
    }
  }

  async stop() {
    try {
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.stop();
      }
    } finally {
      this.isConnected = false;
      if (globalHub === this) globalHub = null;
    }
  }

  getState() {
    return {
      isConnected: this.isConnected,
      connectionState: this.connection.state,
      connectionId: this.connection.connectionId,
      userId: this.userId,
    };
  }

  // register handler and return unsubscribe function
  onNotificationReceived(callback: (notification: NotificationResponse) => void) {
    this.connection.on('ReceiveNotification', callback);
    return () => this.connection.off('ReceiveNotification', callback);
  }

  onUnreadCountUpdated(callback: (count: number) => void) {
    this.connection.on('UpdateUnreadCount', callback);
    return () => this.connection.off('UpdateUnreadCount', callback);
  }

  onNotificationRead(callback: (notificationId: string) => void) {
    this.connection.on('NotificationRead', callback);
    return () => this.connection.off('NotificationRead', callback);
  }

  async joinGroup(groupName: string) {
    await this.connection.invoke('JoinGroup', groupName);
    // track so we can rejoin after reconnect
    this.joinedGroups.add(groupName);
  }

  async leaveGroup(groupName: string) {
    await this.connection.invoke('LeaveGroup', groupName);
    this.joinedGroups.delete(groupName);
  }
}
