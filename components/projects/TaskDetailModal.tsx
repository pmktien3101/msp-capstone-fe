'use client';

import { useState, useEffect } from 'react';
import { Task, Comment } from '@/types/milestone';
import { Member } from '@/types/member';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Avatar from '@/components/ui/Avatar';
import { TaskComment } from './TaskComment';

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
  projectMembers,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment
}: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(task.comments || []);

  useEffect(() => {
    setComments(task.comments || []);
  }, [task.comments]);

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(task.id.toString(), newComment.trim());
      setNewComment('');
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    if (onEditComment) {
      onEditComment(commentId, content);
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content, isEdited: true, updatedAt: new Date().toISOString() }
          : comment
      ));
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(commentId);
      // Update local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    }
  };

  const handleReply = (parentId: string, content: string) => {
    if (onAddComment) {
      onAddComment(task.id.toString(), content);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
      case 'pending':
        return '#6b7280';
      case 'in-progress':
        return '#f59e0b';
      case 'done':
      case 'completed':
        return '#10b981';
      case 'review':
        return '#3b82f6';
      case 'blocked':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Chờ xử lý';
      case 'pending':
        return 'Đang chờ';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'done':
        return 'Hoàn thành';
      case 'completed':
        return 'Hoàn thành';
      case 'review':
        return 'Đang review';
      case 'blocked':
        return 'Bị chặn';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      case 'urgent':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Thấp';
      case 'medium':
        return 'Trung bình';
      case 'high':
        return 'Cao';
      case 'urgent':
        return 'Khẩn cấp';
      default:
        return priority;
    }
  };

  if (!isOpen) return null;

  // Add keyframes to document head
  useEffect(() => {
    const style = document.createElement('style');
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
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          width: '25%',
          minWidth: '300px',
          height: '100vh',
          background: 'white',
          borderRadius: '8px 0 0 8px',
          boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 24px 16px 24px',
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0
          }}
        >
          <h2 
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1f2937',
              margin: 0,
              flex: 1
            }}
          >
            {task.title || task.name}
          </h2>
          <button 
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '24px',
            flex: 1,
            overflowY: 'auto'
          }}
        >
          {/* Task Info */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <span 
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Trạng thái
                </span>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'white',
                    textAlign: 'center',
                    width: 'fit-content',
                    backgroundColor: getStatusColor(task.status)
                  }}
                >
                  {getStatusText(task.status)}
                </span>
              </div>
              
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <span 
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Ưu tiên
                </span>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'white',
                    textAlign: 'center',
                    width: 'fit-content',
                    backgroundColor: getPriorityColor(task.priority)
                  }}
                >
                  {getPriorityText(task.priority)}
                </span>
              </div>

              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <span 
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Hạn chót
                </span>
                <span 
                  style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontWeight: 500
                  }}
                >
                  {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {task.assignedTo && (
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Người thực hiện
                  </span>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Avatar 
                      src={task.assignedTo.avatar} 
                      alt={task.assignedTo.name}
                      size="sm"
                    />
                    <span 
                      style={{
                        fontSize: '14px',
                        color: '#374151',
                        fontWeight: 500
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
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Epic
                  </span>
                  <span 
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      width: 'fit-content'
                    }}
                  >
                    {task.epic}
                  </span>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    gridColumn: '1 / -1'
                  }}
                >
                  <span 
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Tags
                  </span>
                  <div 
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}
                  >
                    {task.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          background: '#e0e7ff',
                          color: '#3730a3',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 500
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
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h4 
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1f2937'
                }}
              >
                Mô tả
              </h4>
              <p 
                style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#374151',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {task.description}
              </p>
            </div>

          </div>

          {/* Comments Section */}
          <div 
            style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <h4 
              style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1f2937'
              }}
            >
              Bình luận ({comments.length})
            </h4>
            
            {/* Add Comment Form */}
            <div 
              style={{
                marginBottom: '24px',
                padding: '16px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '12px'
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
                    minHeight: '80px',
                    resize: 'vertical',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div 
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}
              >
                <Button 
                  variant="outline" 
                  onClick={() => setNewComment('')}
                  disabled={!newComment.trim()}
                  style={{
                    fontSize: '14px',
                    padding: '8px 16px'
                  }}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  style={{
                    fontSize: '14px',
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Bình luận
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {comments.length === 0 ? (
                <div 
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <p style={{ margin: 0 }}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
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
