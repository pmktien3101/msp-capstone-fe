"use client";

import { useState, useEffect, useCallback } from "react";
import { X, MessageSquare, History, Calendar, User, Flag, Target, Trash2, Edit2 } from "lucide-react";
import { projectService } from "@/services/projectService";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";
import { taskHistoryService } from "@/services/taskHistoryService";
import { commentService } from "@/services/commentService";
import { GetTaskResponse } from "@/types/task";
import { MilestoneBackend } from "@/types/milestone";
import { TaskHistory } from "@/types/taskHistory";
import { GetCommentResponse } from "@/types/comment";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { 
  getUserInitials, 
  getAvatarColor, 
  getHistoryActionText, 
  formatHistoryDate 
} from "@/utils/taskHistoryHelpers";
import { getTaskStatusColor, getTaskStatusLabel } from "@/constants/status";
import "@/app/styles/task-detail-modal.scss";

interface TaskDetailModalProps {
  task: GetTaskResponse;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  onSave?: () => void;
}

export const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  mode = "view",
  onSave,
}: TaskDetailModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "history">("comments");
  
  // Check if member can edit this task
  const isMember = user?.role === 'Member';
  const isTaskAssignedToUser = task?.userId === user?.userId;
  const isTaskLocked = task?.status === 'ReadyToReview' || task?.status === 'Done' || task?.status === 'Cancelled';
  const canMemberEdit = isMember ? (isTaskAssignedToUser && !isTaskLocked) : true;
  
  const [editedTask, setEditedTask] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "NotStarted",
    userId: task?.userId || "",
    reviewerId: task?.reviewerId || "",
    startDate: task?.startDate || "",
    endDate: task?.endDate || "",
    milestoneIds: task?.milestones?.map(m => m.id) || [],
  });

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isConfirmDeleteCommentOpen, setIsConfirmDeleteCommentOpen] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  
  // API data
  const [members, setMembers] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [taskHistories, setTaskHistories] = useState<TaskHistory[]>([]);
  const [comments, setComments] = useState<GetCommentResponse[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch project data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!task?.projectId || !isOpen) return;

      setIsLoadingData(true);
      try {
        // Fetch members (for assignee)
        const membersResponse = await projectService.getProjectMembersByRole(task.projectId, 'Member');
        if (membersResponse.success && membersResponse.data) {
          const membersList = membersResponse.data
            .filter((pm: any) => pm.member)
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setMembers(membersList);
        }

        // Fetch reviewers (Project Managers)
        const reviewersResponse = await projectService.getProjectManagers(task.projectId);
        if (reviewersResponse.success && reviewersResponse.data) {
          const reviewersList = reviewersResponse.data
            .filter((pm: any) => pm.member)
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setReviewers(reviewersList);
        }

        // Fetch milestones
        const milestonesResponse = await milestoneService.getMilestonesByProjectId(task.projectId);
        if (milestonesResponse.success && milestonesResponse.data) {
          const items = Array.isArray(milestonesResponse.data) 
            ? milestonesResponse.data 
            : (milestonesResponse.data as any).items || [];
          setMilestones(items);
        }
      } catch (error) {
        console.error('Error fetching modal data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [task?.projectId, isOpen]);

  // Function to fetch history (can be called manually)
  const fetchHistory = async () => {
    if (!task?.id) return;

    setIsLoadingHistory(true);
    try {
      const response = await taskHistoryService.getTaskHistoriesByTaskId(task.id);
      if (response.success && response.data) {
        setTaskHistories(response.data);
      } else {
        setTaskHistories([]);
      }
    } catch (error) {
      console.error('Error fetching task history:', error);
      setTaskHistories([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch task history when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [task?.id, isOpen]);

  // Function to fetch comments
  const fetchComments = useCallback(async () => {
    if (!task?.id) {
      return;
    }

    setIsLoadingComments(true);
    try {
      const response = await commentService.getCommentsByTaskId(task.id);
      
      if (response.success && response.data) {
        
        // Handle both array and PagingResponse format
        let commentsList: GetCommentResponse[] = [];
        
        if (Array.isArray(response.data)) {
          commentsList = response.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          commentsList = response.data.items;
        } else {
          console.warn('[Comments] Unexpected data format:', response.data);
        }
        setComments(commentsList);
      } else {
        setComments([]);
      }
    } catch (error) {
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  }, [task?.id]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && task?.id) {
      fetchComments();
    }
  }, [isOpen, task?.id, fetchComments]);

  // Update editedTask when task prop changes
  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "NotStarted",
        userId: task.userId || "",
        reviewerId: task.reviewerId || "",
        startDate: task.startDate || "",
        endDate: task.endDate || "",
        milestoneIds: task.milestones?.map(m => m.id) || [],
      });
    }
  }, [task]);

  // Format comment timestamp
  const formatCommentTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Statuses - filtered based on user role
  const ALL_TASK_STATUS_OPTIONS = [
    { value: "NotStarted", label: "Not Started" },
    { value: "InProgress", label: "In Progress" },
    { value: "ReadyToReview", label: "Ready To Review" },
    { value: "ReOpened", label: "Re-Opened" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Done", label: "Done" },
  ];

  const MEMBER_STATUS_OPTIONS = [
    { value: "NotStarted", label: "Not Started" },
    { value: "InProgress", label: "In Progress" },
    { value: "ReadyToReview", label: "Ready To Review" },
  ];

  // Determine which status options to show based on user role
  // If task status is ReOpened, member can see it but cannot change it
  const TASK_STATUS_OPTIONS = isMember ? MEMBER_STATUS_OPTIONS : ALL_TASK_STATUS_OPTIONS;

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    if (!user?.userId || !task?.id) {
      toast.error("Không thể tạo bình luận");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await commentService.createComment({
        taskId: task.id,
        userId: user.userId,
        content: commentText.trim(),
      });

      if (response.success) {
        toast.success("Comment thành công");
        setCommentText("");
        await fetchComments(); // Refresh comments list
      } else {
        toast.error(response.error || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("An error occurred while posting comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = (comment: GetCommentResponse) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) {
      toast.error("Comment không thể bị trống");
      return;
    }

    try {
      const response = await commentService.updateComment({
        id: commentId,
        content: editingCommentText.trim(),
      });

      if (response.success) {
        toast.success("Cập nhật bình luận thành công");
        setEditingCommentId(null);
        setEditingCommentText("");
        await fetchComments(); // Refresh comments list
      } else {
        toast.error(response.error || "Lỗi khi cập nhật comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("An error occurred while updating comment");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!user?.userId) {
      toast.error("Unable to delete comment");
      return;
    }

    setDeletingCommentId(commentId);
    setIsConfirmDeleteCommentOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!deletingCommentId || !user?.userId) return;

    try {
      const response = await commentService.deleteComment(deletingCommentId, user.userId);

      if (response.success) {
        toast.success("Xóa bình luận thành công");
        await fetchComments(); // Refresh comments list
      } else {
        toast.error(response.error || "Xóa bình luận thất bại");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Đã xảy ra lỗi khi xóa bình luận");
    } finally {
      setIsConfirmDeleteCommentOpen(false);
      setDeletingCommentId(null);
    }
  };

  const handleUpdateField = (field: string, value: any) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  // Format date from ISO to yyyy-mm-dd for input value (date input requires this format)
  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSaveTask = async () => {
    if (!editedTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!user?.userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const updateData = {
        id: task.id,
        projectId: task.projectId,
        actorId: user.userId,
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        userId: editedTask.userId || undefined,
        reviewerId: editedTask.reviewerId || undefined,
        startDate: editedTask.startDate ? new Date(editedTask.startDate).toISOString() : undefined,
        endDate: editedTask.endDate ? new Date(editedTask.endDate).toISOString() : undefined,
        milestoneIds: editedTask.milestoneIds.length > 0 ? editedTask.milestoneIds : undefined,
      };

      const response = await taskService.updateTask(updateData);

      if (response.success) {
        toast.success("Cập nhật công việc thành công");
        
        // Refresh history to show the update action
        await fetchHistory();
        
        if (onSave) {
          onSave();
        }
        onClose();
      } else {
        toast.error(response.error || "Cập nhật công việc thất bại");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred while updating task");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{mode === "view" ? "Task Details" : "Edit Task"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body with 2 columns */}
        <div className="modal-body">
          {/* Left Panel - 60% */}
          <div className="left-panel">
            {/* Title */}
            <div className="field-group">
              <label className="field-label">Title</label>
              {mode === "edit" && canMemberEdit ? (
                <input
                  type="text"
                  className="field-input"
                  value={editedTask.title}
                  onChange={(e) => handleUpdateField("title", e.target.value)}
                  placeholder="Enter task title..."
                />
              ) : (
                <div className="field-value">{editedTask.title}</div>
              )}
            </div>

            {/* Description */}
            <div className="field-group">
              <label className="field-label">Description</label>
              {mode === "edit" && canMemberEdit ? (
                <textarea
                  className="field-textarea"
                  value={editedTask.description}
                  onChange={(e) => handleUpdateField("description", e.target.value)}
                  placeholder="Enter task description..."
                  rows={6}
                />
              ) : (
                <div className="field-value description">
                  {editedTask.description || "No description provided"}
                </div>
              )}
            </div>

            {/* Activity Section */}
            <div className="activity-section">
              <label className="field-label">Activity</label>
              
              {/* Tabs */}
              <div className="activity-tabs">
                <button
                  className={`tab-btn ${activeTab === "comments" ? "active" : ""}`}
                  onClick={() => setActiveTab("comments")}
                >
                  <MessageSquare size={16} />
                  Comments ({comments.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  <History size={16} />
                  History ({taskHistories.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === "comments" ? (
                  <div className="comments-tab">
                    {/* Comment List */}
                    <div className="comments-list">
                      {isLoadingComments ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                          Loading comments...
                        </div>
                      ) : comments.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                          No comments yet. Be the first to comment!
                        </div>
                      ) : (
                        comments.map((comment) => {
                          const author = comment.user?.fullName || comment.user?.email || 'Unknown';
                          const initials = getUserInitials(author);
                          const avatarColor = getAvatarColor(author);
                          const canEdit = user?.userId === comment.userId;
                          const isEditing = editingCommentId === comment.id;

                          return (
                            <div key={comment.id} className="comment-item">
                              <div 
                                className="comment-avatar" 
                                style={{
                                  backgroundColor: avatarColor,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '14px'
                                }}
                              >
                                {initials}
                              </div>
                              <div className="comment-content" style={{ flex: 1 }}>
                                <div className="comment-header">
                                  <span className="comment-author">{author}</span>
                                  <span className="comment-time">{formatCommentTime(comment.createdAt)}</span>
                                  {canEdit && !isEditing && (
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                      <button
                                        className="edit-comment-btn"
                                        onClick={() => handleEditComment(comment)}
                                        title="Edit comment"
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#3b82f6',
                                          cursor: 'pointer',
                                          padding: '4px',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        className="delete-comment-btn"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        title="Delete comment"
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#ef4444',
                                          cursor: 'pointer',
                                          padding: '4px',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div style={{ marginTop: '8px' }}>
                                    <textarea
                                      className="comment-input"
                                      value={editingCommentText}
                                      onChange={(e) => setEditingCommentText(e.target.value)}
                                      rows={3}
                                      style={{ width: '100%', marginBottom: '8px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button
                                        onClick={handleCancelEdit}
                                        style={{
                                          padding: '6px 12px',
                                          background: '#f3f4f6',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          fontSize: '13px'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveEditComment(comment.id)}
                                        disabled={!editingCommentText.trim()}
                                        style={{
                                          padding: '6px 12px',
                                          background: '#ff5e13',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          cursor: editingCommentText.trim() ? 'pointer' : 'not-allowed',
                                          fontSize: '13px',
                                          opacity: editingCommentText.trim() ? 1 : 0.5
                                        }}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="comment-text">{comment.content}</p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="add-comment">
                      <textarea
                        className="comment-input"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                        disabled={isSubmittingComment}
                      />
                      <button
                        className="submit-comment-btn"
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                      >
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="history-tab">
                    {isLoadingHistory ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                        Loading history...
                      </div>
                    ) : taskHistories.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                        No history available
                      </div>
                    ) : (
                      <div className="history-list">
                        {taskHistories.map((item) => {
                          const userName = item.changedBy?.fullName || 'Unknown';
                          const initials = getUserInitials(userName);
                          const avatarColor = getAvatarColor(userName);
                          const actionText = getHistoryActionText(item);
                          
                          // Render different content based on action type
                          let detailContent = null;

                          if (item.action === 'Assigned' || item.action === 'Reassigned') {
                            detailContent = (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span>{item.fromUser?.fullName || 'Unassigned'}</span>
                                <span>→</span>
                                {item.toUser && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: getAvatarColor(item.toUser.fullName),
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '10px',
                                      fontWeight: 'bold'
                                    }}>
                                      {getUserInitials(item.toUser.fullName)}
                                    </div>
                                    <span>{item.toUser.fullName}</span>
                                  </div>
                                )}
                              </div>
                            );
                          } else if (item.action === 'StatusChanged' || item.fieldName === 'Status') {
                            const oldStatusColor = item.oldValue ? getTaskStatusColor(item.oldValue) : '#6b7280';
                            const newStatusColor = item.newValue ? getTaskStatusColor(item.newValue) : '#6b7280';
                            const oldStatusLabel = item.oldValue ? getTaskStatusLabel(item.oldValue) : 'N/A';
                            const newStatusLabel = item.newValue ? getTaskStatusLabel(item.newValue) : 'N/A';
                            
                            detailContent = (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: 'white',
                                  backgroundColor: oldStatusColor,
                                  textTransform: 'capitalize'
                                }}>
                                  {oldStatusLabel}
                                </span>
                                <span style={{ color: '#9ca3af', fontWeight: '500' }}>→</span>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: 'white',
                                  backgroundColor: newStatusColor,
                                  textTransform: 'capitalize'
                                }}>
                                  {newStatusLabel}
                                </span>
                              </div>
                            );
                          } else if (item.fieldName && item.oldValue && item.newValue) {
                            detailContent = (
                              <div style={{ marginTop: '4px' }}>
                                <span>{item.oldValue}</span>
                                <span style={{ margin: '0 8px' }}>→</span>
                                <span>{item.newValue}</span>
                              </div>
                            );
                          }

                          return (
                            <div key={item.id} className="history-item">
                              <div className="history-avatar" style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: avatarColor,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {initials}
                              </div>
                              <div className="history-content">
                                <div style={{ marginBottom: '4px' }}>
                                  <strong>{userName}</strong> {actionText}
                                </div>
                                {detailContent}
                                <div style={{ marginTop: '4px', color: '#6b7280', fontSize: '13px' }}>
                                  {formatHistoryDate(item.createdAt)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - 40% */}
          <div className="right-panel">
            {/* Status */}
            <div className="info-field">
              <label className="info-label">
                <Flag size={16} />
                Status
              </label>
              <select
                className="info-select"
                value={editedTask.status}
                onChange={(e) => handleUpdateField("status", e.target.value)}
                disabled={mode === "view" || !canMemberEdit}
              >
                {/* If current status is ReOpened and user is member, show it as disabled option */}
                {isMember && editedTask.status === "ReOpened" && (
                  <option value="ReOpened">Re-Opened</option>
                )}
                {TASK_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="info-field">
              <label className="info-label">
                <User size={16} />
                Assignee
              </label>
              <select
                className="info-select"
                value={editedTask.userId}
                onChange={(e) => handleUpdateField("userId", e.target.value)}
                disabled={isLoadingData || mode === "view" || !canMemberEdit}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reviewer */}
            <div className="info-field">
              <label className="info-label">
                <User size={16} />
                Reviewer
              </label>
              <select
                className="info-select"
                value={editedTask.reviewerId}
                onChange={(e) => handleUpdateField("reviewerId", e.target.value)}
                disabled={isLoadingData || mode === "view" || !canMemberEdit}
              >
                <option value="">No reviewer</option>
                {reviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="info-field">
              <label className="info-label">
                <Calendar size={16} />
                Start Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  className="info-input"
                  value={formatDateForInput(editedTask.startDate)}
                  onChange={(e) => {
                    const dateValue = e.target.value; // yyyy-mm-dd format from date input
                    if (dateValue) {
                      handleUpdateField("startDate", new Date(dateValue).toISOString());
                    } else {
                      handleUpdateField("startDate", "");
                    }
                  }}
                  disabled={mode === "view" || !canMemberEdit}
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="info-field">
              <label className="info-label">
                <Calendar size={16} />
                End Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  className="info-input"
                  value={formatDateForInput(editedTask.endDate)}
                  onChange={(e) => {
                    const dateValue = e.target.value; // yyyy-mm-dd format from date input
                    if (dateValue) {
                      handleUpdateField("endDate", new Date(dateValue).toISOString());
                    } else {
                      handleUpdateField("endDate", "");
                    }
                  }}
                  disabled={mode === "view" || !canMemberEdit}
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            {/* Milestones */}
            <div className="info-field">
              <label className="info-label">
                <Target size={16} />
                Milestones
              </label>
              <div className="milestones-list">
                {isLoadingData ? (
                  <div style={{ padding: '8px', color: '#6b7280', fontSize: '13px' }}>
                    Loading milestones...
                  </div>
                ) : milestones.length === 0 ? (
                  <div style={{ padding: '8px', color: '#6b7280', fontSize: '13px' }}>
                    No milestones available
                  </div>
                ) : (
                  milestones.map((milestone) => (
                    <label key={milestone.id} className="milestone-checkbox">
                      <input
                        type="checkbox"
                        checked={editedTask.milestoneIds.includes(milestone.id)}
                        onChange={(e) => {
                          const newMilestoneIds = e.target.checked
                            ? [...editedTask.milestoneIds, milestone.id]
                            : editedTask.milestoneIds.filter((id: string) => id !== milestone.id);
                          handleUpdateField("milestoneIds", newMilestoneIds);
                        }}
                        disabled={mode === "view" || !canMemberEdit}
                      />
                      <span>{milestone.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          {mode === "edit" && canMemberEdit && (
            <button className="save-btn" onClick={handleSaveTask}>
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Confirm Delete Comment Dialog */}
      {isConfirmDeleteCommentOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <ConfirmDialog
            isOpen={isConfirmDeleteCommentOpen}
            onClose={() => {
              setIsConfirmDeleteCommentOpen(false);
              setDeletingCommentId(null);
            }}
            onConfirm={confirmDeleteComment}
            title="Xóa Bình Luận"
            description="Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác."
            confirmText="Xóa"
            cancelText="Hủy"
          />
        </div>
      )}
    </div>
  );
};
