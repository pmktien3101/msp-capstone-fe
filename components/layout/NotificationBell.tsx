"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser } from "@/hooks/useUser";
import { Bell, Check, CheckCheck, Trash2, Clock, Loader2 } from "lucide-react";
import type { NotificationResponse } from "@/types/notification";
import styles from "@/app/styles/notification-bell.module.scss";

export const NotificationBell = () => {
  const userState = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    userId: userState.userId,
    accessToken: undefined,
    autoConnect: true,
    showToast: true,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Filter notifications
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  const handleNotificationClick = async (
    notification: NotificationResponse
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.entityId) {
      console.log("Navigate to:", notification.type, notification.entityId);
    }
  };

  if (!userState.userId) {
    return null;
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`${styles.bellButton} ${showDropdown ? styles.active : ""}`}
        aria-label="Notifications"
      >
        <Bell size={22} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Connection Status */}
        <span
          className={`${styles.connectionDot} ${
            isConnected ? styles.connected : styles.disconnected
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className={styles.dropdown}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.headerTitle}>
                <Bell size={20} />
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount} new</span>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              <button
                onClick={() => setFilter("all")}
                className={`${styles.filterTab} ${
                  filter === "all" ? styles.activeTab : ""
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`${styles.filterTab} ${
                  filter === "unread" ? styles.activeTab : ""
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className={styles.markAllReadBtn}>
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}

          {/* Notifications List */}
          <div className={styles.notificationsList}>
            {isLoading ? (
              <div className={styles.emptyState}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Bell size={40} />
                </div>
                <h4>
                  {filter === "unread" ? "All caught up!" : "No notifications"}
                </h4>
                <p>
                  {filter === "unread"
                    ? "You've read all your notifications"
                    : "When you get notifications, they'll show up here"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`${styles.notificationItem} ${
                    !notification.isRead ? styles.unread : ""
                  }`}
                >
                  {/* Content */}
                  <div className={styles.notificationContent}>
                    <h4 className={styles.notificationTitle}>
                      {notification.title}
                    </h4>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    <div className={styles.notificationMeta}>
                      <Clock size={12} />
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className={`${styles.notificationActions} ${
                      hoveredId === notification.id ? styles.visible : ""
                    }`}
                  >
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className={styles.actionBtn}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className={styles.unreadIndicator} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
