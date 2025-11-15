'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@/hooks/useUser';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import type { NotificationResponse } from '@/types/notification';

export const NotificationBell = () => {
  const userState = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    fetchUnreadNotifications,
  } = useNotifications({
    userId: userState.userId,
    accessToken: undefined, // Token được handle bởi axios interceptor
    autoConnect: true,
    showToast: true,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Filter notifications
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type/entityId if needed
    if (notification.entityId) {
      // Example: Navigate to related entity
      console.log('Navigate to:', notification.type, notification.entityId);
    }
  };

  if (!userState.userId) {
    return null; // Don't show bell if not logged in
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          padding: '8px',
          background: 'transparent',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Bell size={20} color="#374151" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 600,
              borderRadius: '10px',
              padding: '2px 6px',
              minWidth: '18px',
              textAlign: 'center',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <span
          style={{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#9ca3af',
            border: '2px solid white',
          }}
          title={isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
        />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '400px',
            maxHeight: '600px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0,
                }}
              >
                Thông báo
              </h3>
              
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} color="#6b7280" />
              </button>
            </div>

            {/* Filters */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                onClick={() => setFilter('all')}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: filter === 'all' ? '#FF5E13' : '#f3f4f6',
                  color: filter === 'all' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('unread')}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: filter === 'unread' ? '#FF5E13' : '#f3f4f6',
                  color: filter === 'unread' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '6px 12px',
                  background: 'transparent',
                  color: '#FF5E13',
                  border: '1px solid #FF5E13',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCheck size={16} />
                Đánh dấu tất cả là đã đọc
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '500px',
            }}
          >
            {isLoading ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                <p>Đang tải...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#6b7280',
                }}
              >
                <Bell size={48} className="mx-auto mb-4" style={{ color: '#d1d5db' }} />
                <p style={{ margin: 0, fontSize: '16px' }}>
                  {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    background: notification.isRead ? 'white' : '#fef3f2',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notification.isRead ? '#f9fafb' : '#fee2e2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.isRead ? 'white' : '#fef3f2';
                  }}
                >
                  {/* Unread Indicator */}
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: notification.isRead ? 'transparent' : '#FF5E13',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1f2937',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {notification.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: '0 0 4px 0',
                        lineHeight: '1.4',
                      }}
                    >
                      {notification.message}
                    </p>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                      }}
                    >
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Đánh dấu đã đọc"
                      >
                        <Check size={16} color="#10b981" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      style={{
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Xóa"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
