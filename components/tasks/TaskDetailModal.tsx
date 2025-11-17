"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare, History, Calendar, User, Flag, Target } from "lucide-react";
import { projectService } from "@/services/projectService";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";
import { taskHistoryService } from "@/services/taskHistoryService";
import { GetTaskResponse } from "@/types/task";
import { MilestoneBackend } from "@/types/milestone";
import { TaskHistory } from "@/types/taskHistory";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { 
  getUserInitials, 
  getAvatarColor, 
  getHistoryActionText, 
  formatHistoryDate 
} from "@/utils/taskHistoryHelpers";
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
  
  // API data
  const [members, setMembers] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [taskHistories, setTaskHistories] = useState<TaskHistory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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

  // Mock data for comments
  const mockComments = [
    {
      id: 1,
      author: "Nguyễn Văn A",
      avatar: "NA",
      content: "Task này cần hoàn thành trước deadline nhé team!",
      timestamp: "2 giờ trước",
    },
    {
      id: 2,
      author: "Trần Thị B",
      avatar: "TB",
      content: "Đã xem và đang làm, dự kiến hoàn thành trong hôm nay.",
      timestamp: "1 giờ trước",
    },
  ];

  // Mock data for history
  const mockHistory = [
    {
      id: 1,
      action: "Cập nhật trạng thái",
      detail: "Từ 'Not Started' → 'In Progress'",
      user: "Nguyễn Văn A",
      timestamp: "3 giờ trước",
    },
    {
      id: 2,
      action: "Giao cho",
      detail: "Trần Thị B",
      user: "Nguyễn Văn A",
      timestamp: "5 giờ trước",
    },
    {
      id: 3,
      action: "Tạo task",
      detail: "Task được tạo bởi PM",
      user: "Nguyễn Văn A",
      timestamp: "1 ngày trước",
    },
  ];

  // Statuses
  const statuses = [
    { value: "NotStarted", label: "Not Started" },
    { value: "InProgress", label: "In Progress" },
    { value: "ReadyToReview", label: "Ready To Review" },
    { value: "ReOpened", label: "Re-Opened" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Done", label: "Done" },
  ];

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      console.log("New comment:", commentText);
      setCommentText("");
    }
  };

  const handleUpdateField = (field: string, value: any) => {
    setEditedTask({ ...editedTask, [field]: value });
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
              {mode === "edit" ? (
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
              {mode === "edit" ? (
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
                  Comments ({mockComments.length})
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
                      {mockComments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">{comment.avatar}</div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="comment-author">{comment.author}</span>
                              <span className="comment-time">{comment.timestamp}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="add-comment">
                      <textarea
                        className="comment-input"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                      />
                      <button
                        className="submit-comment-btn"
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim()}
                      >
                        Post Comment
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
                            detailContent = (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '3px',
                                  fontSize: '12px',
                                  textTransform: 'uppercase',
                                  fontWeight: '500'
                                }}>
                                  {item.oldValue || 'N/A'}
                                </span>
                                <span>→</span>
                                <span style={{
                                  padding: '2px 8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '3px',
                                  fontSize: '12px',
                                  textTransform: 'uppercase',
                                  fontWeight: '500',
                                  backgroundColor: '#fef3c7'
                                }}>
                                  {item.newValue || 'N/A'}
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
              >
                {statuses.map((status) => (
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
                disabled={isLoadingData}
              >
                <option value="">Not assigned</option>
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
                disabled={isLoadingData}
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
              <input
                type="date"
                className="info-input"
                value={editedTask.startDate?.split('T')[0] || ""}
                onChange={(e) => handleUpdateField("startDate", e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="info-field">
              <label className="info-label">
                <Calendar size={16} />
                End Date
              </label>
              <input
                type="date"
                className="info-input"
                value={editedTask.endDate?.split('T')[0] || ""}
                onChange={(e) => handleUpdateField("endDate", e.target.value)}
              />
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
          {mode === "edit" && (
            <button className="save-btn" onClick={handleSaveTask}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
