"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AvatarImage } from "@radix-ui/react-avatar";

interface TaskCommentProps {
  comment: Comment;
  onReply?: (parentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
  showReplies?: boolean;
}

export function TaskComment({
  comment,
  onReply,
  onEdit,
  onDelete,
  currentUserId,
  showReplies = true,
}: TaskCommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [showRepliesState, setShowRepliesState] = useState(showReplies);

  const isOwner = currentUserId === comment.author.id.toString();
  const canEdit = isOwner;
  const canDelete = isOwner;

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm("Bạn có chắc muốn xóa bình luận này?")) {
      onDelete(comment.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Vừa xong";
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  return (
    <div className="task-comment">
      <div className="comment-header">
        <div className="comment-author">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <div className="author-info">
            <span className="author-name">{comment.author.name}</span>
            <span className="comment-time">
              {formatDate(comment.createdAt)}
              {comment.isEdited && " (đã chỉnh sửa)"}
            </span>
          </div>
        </div>

        {canEdit && (
          <div className="comment-actions">
            <button
              className="action-btn"
              onClick={() => setIsEditing(!isEditing)}
              title="Chỉnh sửa"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {canDelete && (
              <button
                className="action-btn delete"
                onClick={handleDelete}
                title="Xóa"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="comment-content">
        {isEditing ? (
          <div className="edit-form">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Chỉnh sửa bình luận..."
              className="edit-textarea"
            />
            <div className="edit-actions">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={!editContent.trim()}
              >
                Lưu
              </Button>
            </div>
          </div>
        ) : (
          <div className="comment-text">{comment.content}</div>
        )}
      </div>

      <div className="comment-footer">
        <button
          className="reply-btn"
          onClick={() => setIsReplying(!isReplying)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Trả lời
        </button>
      </div>

      {isReplying && (
        <div className="reply-form">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Viết trả lời..."
            className="reply-textarea"
          />
          <div className="reply-actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsReplying(false);
                setReplyContent("");
              }}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyContent.trim()}
            >
              Trả lời
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        .task-comment {
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .comment-author {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .author-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .comment-time {
          font-size: 12px;
          color: #6b7280;
        }

        .comment-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .action-btn.delete:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .comment-content {
          margin-bottom: 8px;
        }

        .comment-text {
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          white-space: pre-wrap;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edit-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .edit-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .comment-footer {
          margin-top: 8px;
        }

        .reply-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .reply-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .reply-form {
          margin-top: 12px;
          padding-left: 20px;
          border-left: 2px solid #e5e7eb;
        }

        .reply-textarea {
          min-height: 60px;
          resize: vertical;
        }

        .reply-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
