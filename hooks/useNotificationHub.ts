import * as signalR from '@microsoft/signalr';
import type { NotificationResponse } from '@/types/notification';

export class useNotificationHub {
  private connection: signalR.HubConnection;
  private userId: string;
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(baseUrl: string, userId: string, accessToken?: string) {
    this.userId = userId;

    // Remove /api/v1 from baseUrl if present, SignalR hub is at root level
    const cleanBaseUrl = baseUrl.replace('/api/v1', '');
    
    console.log('🔧 SignalR Hub URL:', `${cleanBaseUrl}/notificationHub`);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${cleanBaseUrl}/notificationHub`, {
        accessTokenFactory: accessToken ? () => accessToken : undefined,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  // Start connection
  async start() {
    if (this.isConnected) return;

    try {
      await this.connection.start();
      console.log('✅ SignalR connected');
      this.isConnected = true;
      this.retryCount = 0; // Reset retry count on success
    } catch (err: any) {
      console.error('❌ SignalR connection failed:', err);
      
      // Check if it's a 404 error (endpoint not found)
      if (err?.message?.includes('404') || err?.statusCode === 404) {
        console.error('🚫 SignalR endpoint not found. Please check:');
        console.error('   1. Backend is running');
        console.error('   2. SignalR hub is at /notificationHub');
        console.error('   3. CORS is configured');
        return; // Don't retry on 404
      }

      // Retry with exponential backoff (max 3 times)
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(5000 * this.retryCount, 15000);
        console.log(`🔄 Retrying in ${delay/1000}s... (${this.retryCount}/${this.maxRetries})`);
        setTimeout(() => this.start(), delay);
      } else {
        console.error('❌ Max retry attempts reached. SignalR connection failed permanently.');
      }
    }
  }

  // Stop connection
  async stop() {
    if (!this.isConnected) return;
    await this.connection.stop();
    console.log('🔌 SignalR disconnected');
    this.isConnected = false;
  }

  // Handlers
  onNotificationReceived(callback: (notification: NotificationResponse) => void) {
    this.connection.on('ReceiveNotification', callback);
  }

  onUnreadCountUpdated(callback: (count: number) => void) {
    this.connection.on('UpdateUnreadCount', callback);
  }

  onNotificationRead(callback: (notificationId: string) => void) {
    this.connection.on('NotificationRead', callback);
  }

  // Optionally trigger join group manually
  async joinGroup(groupName: string) {
    await this.connection.invoke('JoinGroup', groupName);
  }

  async leaveGroup(groupName: string) {
    await this.connection.invoke('LeaveGroup', groupName);
  }
}
