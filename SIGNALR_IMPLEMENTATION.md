# SignalR Real-time Notification System

## 📁 Files Created/Modified

### ✅ New Files
1. **`config/signalr.config.ts`** - Centralized SignalR configuration
2. **`hooks/useNotificationHub.ts`** - SignalR connection management class
3. **`hooks/useNotifications.ts`** - React hook for notification management

### ✅ Modified Files  
1. **`components/layout/NotificationBell.tsx`** - Updated to use new API

---

## 🔧 Configuration

### Environment Variables
Make sure you have `NEXT_PUBLIC_BASE_URL` set in your `.env` file:

```env
NEXT_PUBLIC_BASE_URL=https://localhost:7129/api/v1
```

### SignalR Config (`config/signalr.config.ts`)
Centralized configuration for:
- Base URL (from environment variable)
- Hub endpoint path
- Connection settings (keep-alive, timeout, reconnect delays)
- Retry configuration
- Logging level
- Event names
- Group naming conventions

---

## 🚀 Usage

### Basic Usage in Component

```typescript
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@/hooks/useUser';

export const MyComponent = () => {
  const { userId } = useUser();
  
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    userId,
    autoConnect: true,  // Automatically connect on mount
    showToast: true,    // Show toast notifications
  });

  return (
    <div>
      <h2>Notifications ({unreadCount})</h2>
      <div>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      
      {notifications.map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};
```

### Advanced Usage - Manual Connection Control

```typescript
const {
  notifications,
  connect,
  disconnect,
  joinGroup,
  leaveGroup,
  hub,
} = useNotifications({
  userId,
  autoConnect: false, // Don't auto-connect
});

// Manually connect
await connect();

// Join a project group
await joinGroup(signalRConfig.groups.projectGroup('project-123'));

// Leave a group
await leaveGroup(signalRConfig.groups.projectGroup('project-123'));

// Disconnect
await disconnect();

// Access hub state
const state = hub?.getState();
console.log('Connection ID:', state?.connectionId);
console.log('Joined groups:', state?.joinedGroups);
```

---

## 📡 Backend Integration

### Hub Endpoint
- **Path**: `/notificationHub`
- **Auth**: Requires `Authorization` header with JWT Bearer token
- **Base URL**: Configured via `NEXT_PUBLIC_BASE_URL` env variable

### Server Events (Backend → Frontend)

| Event Name | Description | Payload |
|------------|-------------|---------|
| `ReceiveNotification` | New notification received | `NotificationResponse` |
| `UpdateUnreadCount` | Unread count updated | `number` |
| `NotificationRead` | Notification marked as read | `string` (notificationId) |

### Client Methods (Frontend → Backend)

| Method | Description | Parameters |
|--------|-------------|------------|
| `JoinGroup` | Join a SignalR group | `groupName: string` |
| `LeaveGroup` | Leave a SignalR group | `groupName: string` |
| `MarkNotificationAsRead` | Mark notification as read | `notificationId: Guid` |

---

## 🔐 Authentication

The hook automatically handles JWT token management:
- Uses `getAccessToken()` from `@/lib/auth`
- Token is provided via `accessTokenFactory` function
- Token expiry is monitored and logged
- Automatic reconnection on token refresh

---

## 🔄 Reconnection Strategy

### Automatic Reconnection
The system uses exponential backoff for reconnection:
- **Delays**: [0ms, 2s, 5s, 10s, 30s]
- **Max Attempts**: 5
- **Behavior**: Automatically rejoins previously joined groups

### Manual Retry
For initial connection failures:
- **Max Attempts**: 5
- **Base Delay**: 3s
- **Backoff Multiplier**: 1.5x

### Error Handling
- **404**: Endpoint not found - stops retrying
- **401/403**: Auth failures - stops retrying (requires token refresh)
- **Other errors**: Retries with exponential backoff

---

## 📊 State Management

### Returned State
```typescript
{
  notifications: NotificationResponse[],     // List of notifications
  unreadCount: number,                       // Unread notification count
  isLoading: boolean,                        // Loading state for API calls
  isConnected: boolean,                      // SignalR connection status
  connectionError: string | null,            // Connection error message
}
```

### Returned Actions
```typescript
{
  fetchNotifications: () => Promise<void>,           // Fetch all notifications
  fetchUnreadNotifications: () => Promise<void>,     // Fetch unread only
  fetchUnreadCount: () => Promise<void>,             // Fetch unread count
  markAsRead: (id: string) => Promise<void>,         // Mark one as read
  markAllAsRead: () => Promise<void>,                // Mark all as read
  deleteNotification: (id: string) => Promise<void>, // Delete notification
  connect: () => Promise<void>,                      // Manual connect
  disconnect: () => Promise<void>,                   // Manual disconnect
  joinGroup: (name: string) => Promise<void>,        // Join custom group
  leaveGroup: (name: string) => Promise<void>,       // Leave custom group
}
```

---

## 🐛 Debugging

### Console Logging
The system provides detailed console logging with emojis:
- 🚀 Starting connection
- ✅ Successful operations
- ❌ Errors
- 🔄 Reconnecting
- 📬 Notification received
- 🔢 Unread count updated
- 🔑 Token expiry info

### Check Connection State
```typescript
const { hub } = useNotifications({ userId });

// Get detailed state
const state = hub?.getState();
console.log({
  isConnected: state.isConnected,
  connectionId: state.connectionId,
  userId: state.userId,
  reconnectAttempts: state.reconnectAttempts,
  joinedGroups: state.joinedGroups,
});
```

### Monitor Connection
The hook automatically monitors connection status every 5 seconds and updates `isConnected` state.

---

## 🎯 Group Naming Conventions

Groups are defined in `signalRConfig.groups`:

```typescript
// User personal group (auto-joined)
const userGroup = signalRConfig.groups.userGroup(userId);
// Result: "user_<userId>"

// Project group
const projectGroup = signalRConfig.groups.projectGroup(projectId);
// Result: "project_<projectId>"

// Organization group
const orgGroup = signalRConfig.groups.organizationGroup(orgId);
// Result: "organization_<orgId>"
```

---

## ⚡ Performance Considerations

1. **Singleton Pattern**: Only one hub instance per user
2. **Automatic Cleanup**: Connections are properly closed on component unmount
3. **Efficient Re-renders**: Uses React hooks properly with dependencies
4. **Toast Debouncing**: Toast notifications have 5-second auto-close

---

## ✅ Testing Checklist

- [ ] Connection establishes successfully
- [ ] Notifications are received in real-time
- [ ] Unread count updates correctly
- [ ] Mark as read works (local + SignalR)
- [ ] Reconnection works after network loss
- [ ] Groups can be joined/left successfully
- [ ] Token expiry is handled gracefully
- [ ] Multiple tabs/devices sync properly
- [ ] Error states are handled correctly
- [ ] Cleanup on unmount works

---

## 🔗 Related Files

- Backend Hub: `MSP.WebAPI/Hubs/NotificationHub.cs`
- Backend Service: `MSP.Infrastructure/Services/SignalRNotificationService.cs`
- Backend Config: `MSP.WebAPI/Program.cs` (line 73-80, 131)

---

## 📝 Notes

- The backend requires authentication, so ensure user is logged in before connecting
- Backend automatically adds users to their personal group (`user_{userId}`) on connection
- Frontend also joins the group explicitly to handle edge cases
- SignalR uses WebSockets when available, falls back to other transports automatically
