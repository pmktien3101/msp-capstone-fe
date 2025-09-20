"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types/milestone";
import { Comment } from "@/types/comment";
import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Avatar from "@/components/ui/Avatar";
import { TaskComment } from "./TaskComment";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectMembers: Member[];
  currentUser: Member;
  onAddComment?: (taskId: string, content: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(task.comments || []);

  useEffect(() => {
    setComments(task.comments || []);
  }, [task.comments]);

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(task.id.toString(), newComment.trim());
      setNewComment("");
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    if (onEditComment) {
      onEditComment(commentId, content);
      // Update local state
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content,
                isEdited: true,
                updatedAt: new Date().toISOString(),
              }
            : comment
        )
      );
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
      // Update local state
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    }
  };

  const handleReply = (parentId: string, content: string) => {
    if (onAddComment) {
      onAddComment(task.id.toString(), content);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
      case "pending":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "done":
      case "completed":
        return "#10b981";
      case "review":
        return "#3b82f6";
      case "blocked":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "Chờ xử lý";
      case "pending":
        return "Đang chờ";
      case "in-progress":
        return "Đang thực hiện";
      case "done":
        return "Hoàn thành";
      case "completed":
        return "Hoàn thành";
      case "review":
        return "Đang review";
      case "blocked":
        return "Bị chặn";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "high":
        return "#ef4444";
      case "urgent":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "Thấp";
      case "medium":
        return "Trung bình";
      case "high":
        return "Cao";
      case "urgent":
        return "Khẩn cấp";
      default:
        return priority;
    }
  };

  // Hook luôn được gọi
  useEffect(() => {
    if (!isOpen) return; // chỉ chạy khi mở modal

    const style = document.createElement("style");
    style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.3)",
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "stretch",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "40%",
          minWidth: "450px",
          maxWidth: "600px",
          height: "100vh",
          background: "white",
          borderRadius: "8px 0 0 8px",
          boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.15)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 24px 16px 24px",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
              margin: 0,
              flex: 1,
            }}
          >
            {task.title || task.name}
          </h2>
          <button
            style={{
              width: "32px",
              height: "32px",
              border: "none",
              background: "none",
              color: "#6b7280",
              cursor: "pointer",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            padding: "24px",
            flex: 1,
            overflowY: "auto",
          }}
        >
          {/* Task Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Trạng thái
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: getStatusColor(task.status),
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {getStatusText(task.status)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Ưu tiên
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: getPriorityColor(
                        task.priority || "medium"
                      ),
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {getPriorityText(task.priority || "medium")}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Hạn chót
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: "#6b7280" }}
                  >
                    <path
                      d="M8 2V6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 2V6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 10H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    {task.dueDate &&
                      new Date(task.dueDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {task.assignedTo && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Người thực hiện
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Avatar
                      src={task.assignedTo.avatar}
                      alt={task.assignedTo.name}
                      size="sm"
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {task.assignedTo.name}
                    </span>
                  </div>
                </div>
              )}

              {task.epic && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Epic
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#8b5cf6",
                      }}
                    ></div>
                    <span
                      style={{
                        background: "#e0e7ff",
                        color: "#3730a3",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 500,
                        width: "fit-content",
                      }}
                    >
                      {task.epic}
                    </span>
                  </div>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    gridColumn: "1 / -1",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Tags
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          background: "#e0e7ff",
                          color: "#3730a3",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h4
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1f2937",
                }}
              >
                Mô tả
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#374151",
                  whiteSpace: "pre-wrap",
                }}
              >
                {task.description}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div
            style={{
              background: "#f8fafc",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4
              style={{
                margin: "0 0 24px 0",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              Bình luận ({comments.length})
            </h4>

            {/* Add Comment Form */}
            <div
              style={{
                marginBottom: "24px",
                padding: "20px",
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <Avatar
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  size="sm"
                />
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  style={{
                    flex: 1,
                    minHeight: "80px",
                    resize: "vertical",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="outline"
                  onClick={() => setNewComment("")}
                  disabled={!newComment.trim()}
                  style={{
                    fontSize: "14px",
                    padding: "8px 16px",
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  style={{
                    fontSize: "14px",
                    padding: "8px 16px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Bình luận
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {comments.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                    fontStyle: "italic",
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <TaskComment
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    currentUserId={currentUser.id.toString()}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
