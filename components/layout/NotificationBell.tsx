"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useUser } from "@/hooks/useUser";
import { Bell, CheckCheck, Trash2, X, BellRing } from "lucide-react";
import type { NotificationResponse } from "@/types/notification";

export const NotificationBell = () => {
  const userState = useUser();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    autoConnect: true,
    showToast: false,
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
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return "1 week ago";
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths === 1) return "1 month ago";
    if (diffMonths < 12) return `${diffMonths} months ago`;

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleNotificationClick = async (
    notification: NotificationResponse
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Parse notification data to determine navigation
    try {
      let parsedData: any = null;
      if (notification.data) {
        try {
          parsedData = JSON.parse(notification.data);
        } catch (e) {
          console.warn("Failed to parse notification data:", e);
        }
      }

      // Handle navigation based on notification type
      const notifType = notification.type?.toLowerCase() || "";
      const notifTitle = notification.title?.toLowerCase() || "";
      const notifMessage = notification.message?.toLowerCase() || "";
      const eventType = parsedData?.eventType?.toLowerCase() || parsedData?.EventType?.toLowerCase() || "";

      // ===== Organization Invitation (Member) =====
      if (
        notifType.includes("invitation") ||
        notifTitle.includes("invitation") ||
        notifMessage.includes("invited")
      ) {
        setShowDropdown(false);

        // If current user is a Member, navigate to Business -> Invitations tab
        const role = (userState?.role || "").toString().toLowerCase();
        if (role === "member") {
          router.push("/business?tab=invitations");
        } else {
          // For other roles, navigate to the business members area (owner/pm)
          router.push("/dashboard/business/members");
        }
        return;
      }

      // Join Request notifications
      if (
        notifType.includes("join") ||
        notifType.includes("request") ||
        notifTitle.includes("join request") ||
        notifMessage.includes("join request") ||
        eventType.includes("join") ||
        eventType.includes("request")
      ) {
        setShowDropdown(false);
        
        // If it's "join request accepted" - Member navigates to business page
        if (
          notifTitle.includes("accepted") ||
          notifMessage.includes("accepted") ||
          notifMessage.includes("welcome")
        ) {
          router.push('/business');
          return;
        }
        
        // Otherwise - Business Owner navigates to members page with Join Requests tab
        router.push('/dashboard/business/members?tab=join-requests');
        return;
      }

      // Meeting-related notifications (check FIRST before project/task)
      if (
        notifType.includes("meeting") ||
        notifTitle.includes("meeting") ||
        eventType.includes("meeting") ||
        parsedData?.meetingId ||
        parsedData?.MeetingId
      ) {
        const meetingId = 
          parsedData?.meetingId || 
          parsedData?.MeetingId || 
          notification.entityId;

        if (meetingId) {
          setShowDropdown(false);
          // Always navigate directly to meeting detail page
          router.push(`/meeting-detail/${meetingId}`);
          return;
        }
      }

      // Task-related notifications (including comments)
      if (
        notifType.includes("task") ||
        notifTitle.includes("task") ||
        notifTitle.includes("comment") ||
        eventType.includes("task") ||
        parsedData?.taskId ||
        parsedData?.TaskId
      ) {
        const projectId = parsedData?.projectId || parsedData?.ProjectId;
        const taskId = parsedData?.taskId || parsedData?.TaskId || notification.entityId;

        // For comment notifications, entityId is the taskId
        if (taskId) {
          setShowDropdown(false);
          
          // If we have both projectId and taskId, navigate with both
          if (projectId) {
            router.push(`/projects/${projectId}?tab=tasks&taskId=${taskId}`);
          } else {
            // If we only have taskId (like comment notifications), 
            // need to fetch task details first to get projectId
            // For now, try to navigate with just taskId - the page will handle fetching
            const fetchTaskAndNavigate = async () => {
              try {
                const { taskService } = await import('@/services/taskService');
                const taskResult = await taskService.getTaskById(taskId);
                if (taskResult.success && taskResult.data) {
                  const task = taskResult.data;
                  router.push(`/projects/${task.projectId}?tab=tasks&taskId=${taskId}`);
                }
              } catch (error) {
                console.error("Error fetching task for navigation:", error);
              }
            };
            fetchTaskAndNavigate();
          }
          return;
        }
        
        // Fallback: if we only have projectId
        if (projectId) {
          setShowDropdown(false);
          router.push(`/projects/${projectId}?tab=tasks`);
          return;
        }
      }

      // Project-related notifications (deadline, completion, status)
      // Check this LAST to avoid catching meeting/task notifications
      if (
        notifType.includes("project") ||
        eventType.includes("project") ||
        parsedData?.projectId ||
        parsedData?.ProjectId
      ) {
        const projectId =
          parsedData?.projectId ||
          parsedData?.ProjectId ||
          notification.entityId;

        if (projectId) {
          setShowDropdown(false);
          router.push(`/projects/${projectId}`);
          return;
        }
      }

      // Fallback: if entityId exists but no specific handler
      if (notification.entityId) {
        console.log("Unhandled notification navigation:", {
          type: notification.type,
          entityId: notification.entityId,
          data: parsedData,
        });
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  if (!userState.userId) {
    return null; // Don't show bell if not logged in
  }

  return (
    <>
      {/* CSS Keyframes - Outside conditional render */}
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes bellRing {
            0%, 100% {
              transform: rotate(0deg);
            }
            10%, 30% {
              transform: rotate(-15deg);
            }
            20%, 40% {
              transform: rotate(15deg);
            }
            50% {
              transform: rotate(0deg);
            }
          }
        `}
      </style>

      <div style={{ position: "relative" }} ref={dropdownRef}>
        {/* Bell Icon */}
        <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: "relative",
          padding: "10px",
          background: showDropdown ? "#fff3ed" : "transparent",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!showDropdown) e.currentTarget.style.background = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          if (!showDropdown) e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          style={{
            animation: unreadCount > 0 ? "bellRing 2s ease-in-out infinite" : "none",
          }}
        >
          <Bell size={22} color={showDropdown ? "#FF5E13" : "#4b5563"} />
        </div>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "linear-gradient(135deg, #FF5E13, #ff8c4a)",
              color: "white",
              fontSize: "10px",
              fontWeight: 700,
              borderRadius: "10px",
              padding: "2px 5px",
              minWidth: "16px",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(255, 94, 19, 0.3)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "420px",
            maxHeight: "500px",
            background: "white",
            borderRadius: "16px",
            boxShadow:
              "0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideDown 0.2s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px 12px",
              background: "linear-gradient(to bottom, #fafafa, #ffffff)",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  Notifications
                </h3>
                {isConnected && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                    title="Connected"
                  />
                )}
              </div>

              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  padding: "6px",
                  background: "#f3f4f6",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
              >
                <X size={16} color="#6b7280" />
              </button>
            </div>

            {/* Filters & Mark all read */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                onClick={() => setFilter("all")}
                style={{
                  padding: "5px 12px",
                  background: filter === "all" ? "#FF5E13" : "transparent",
                  color: filter === "all" ? "white" : "#6b7280",
                  border: filter === "all" ? "none" : "1px solid #e5e7eb",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                style={{
                  padding: "5px 12px",
                  background: filter === "unread" ? "#FF5E13" : "transparent",
                  color: filter === "unread" ? "white" : "#6b7280",
                  border: filter === "unread" ? "none" : "1px solid #e5e7eb",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    marginLeft: "auto",
                    padding: "5px 10px",
                    background: "transparent",
                    color: "#FF5E13",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff3ed";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "400px",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "2px solid #e5e7eb",
                    borderTopColor: "#FF5E13",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 8px",
                  }}
                />
                <p style={{ margin: 0, fontSize: "13px" }}>Loading...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <BellRing size={24} color="#d1d5db" />
                </div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 500 }}>
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f5f5f5",
                    background: notification.isRead
                      ? hoveredId === notification.id
                        ? "#fafafa"
                        : "white"
                      : hoveredId === notification.id
                      ? "#fff8f5"
                      : "#fffbf8",
                    cursor: "pointer",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    transition: "background 0.15s",
                    position: "relative",
                  }}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div
                      style={{
                        position: "absolute",
                        left: "4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "4px",
                        height: "32px",
                        borderRadius: "2px",
                        background: "linear-gradient(180deg, #FF5E13, #ff8c4a)",
                      }}
                    />
                  )}

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      paddingLeft: notification.isRead ? "0" : "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "2px",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: notification.isRead ? 500 : 600,
                          color: "#1f2937",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                        }}
                      >
                        {notification.title}
                      </h4>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          flexShrink: 0,
                        }}
                      >
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "2px",
                      flexShrink: 0,
                      opacity: hoveredId === notification.id ? 1 : 0,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      style={{
                        padding: "6px",
                        background: "#fef2f2",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fee2e2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} color="#dc2626" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};
