"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  MessageSquare,
  History,
  Calendar,
  User,
  Flag,
  Target,
  Trash2,
  Edit2,
  Paperclip,
  Upload,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Loader2,
} from "lucide-react";
import { projectService } from "@/services/projectService";
import { milestoneService } from "@/services/milestoneService";
import { taskService } from "@/services/taskService";
import { taskHistoryService } from "@/services/taskHistoryService";
import { commentService } from "@/services/commentService";
import { attachmentService } from "@/services/attachmentService";
import { uploadFileToCloudinary } from "@/services/uploadFileService";
import { GetTaskResponse } from "@/types/task";
import { MilestoneBackend } from "@/types/milestone";
import { Project } from "@/types/project";
import { TaskHistory } from "@/types/taskHistory";
import { GetCommentResponse } from "@/types/comment";
import { TaskAttachmentResponse } from "@/types/attachment";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  getUserInitials,
  getAvatarColor,
  getHistoryActionText,
  formatHistoryDate,
} from "@/utils/taskHistoryHelpers";
import { getTaskStatusColor, getTaskStatusLabel, ProjectStatus } from "@/constants/status";
import {
  validateTaskDates,
  isValidStatusTransition,
  validateTaskMilestoneDates,
} from "@/utils/taskValidation";
import "@/app/styles/task-detail-modal.scss";
import { formatDate } from "@/lib/formatDate";

interface TaskDetailModalProps {
  task: GetTaskResponse;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  onSave?: () => void;
  projectStatus?: string;
}

export const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  mode = "view",
  onSave,
  projectStatus,
}: TaskDetailModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "history">(
    "comments"
  );

  // Check if project is completed
  const isProjectDisabled =
    projectStatus === ProjectStatus.Completed ||
    projectStatus === ProjectStatus.OnHold ||
    projectStatus === ProjectStatus.Cancelled;

  // Check if member can edit this task
  const isMember = user?.role === "Member";
  const isBusiness =
    user?.role?.toLowerCase() === "business" ||
    user?.role?.toLowerCase() === "businessowner";
  const isTaskAssignedToUser = task?.userId === user?.userId;
  const isTaskLocked =
    task?.status === "ReadyToReview" ||
    task?.status === "Done" ||
    task?.status === "Cancelled";
  const canMemberEdit = isMember ? isTaskAssignedToUser && !isTaskLocked : true;
  const canEdit = !isBusiness && canMemberEdit && !isProjectDisabled;

  const [editedTask, setEditedTask] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "Todo",
    userId: task?.userId || "",
    reviewerId: task?.reviewerId || "",
    startDate: task?.startDate || "",
    endDate: task?.endDate || "",
    milestoneIds: task?.milestones?.map((m) => m.id) || [],
  });

  // Track original milestones to detect changes
  const [originalMilestoneIds] = useState<string[]>(
    task?.milestones?.map((m) => m.id) || []
  );

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    startDate: "",
    endDate: "",
    milestone: "",
    status: "",
    reviewer: "",
  });

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isConfirmDeleteCommentOpen, setIsConfirmDeleteCommentOpen] =
    useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  // Attachments state
  const [attachments, setAttachments] = useState<TaskAttachmentResponse[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [isConfirmDeleteAttachmentOpen, setIsConfirmDeleteAttachmentOpen] = useState(false);

  // API data
  const [members, setMembers] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<MilestoneBackend[]>([]);
  const [project, setProject] = useState<Project | null>(null);
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
        // Fetch project details for date validation
        const projectResponse = await projectService.getProjectById(
          task.projectId
        );
        if (projectResponse.success && projectResponse.data) {
          setProject(projectResponse.data);
        }

        // Fetch members (for assignee)
        const membersResponse = await projectService.getProjectMembersByRole(
          task.projectId,
          "Member"
        );
        if (membersResponse.success && membersResponse.data) {
          const membersList = membersResponse.data
            .filter((pm: any) => pm.member && !pm.leftAt) // Only active members
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setMembers(membersList);
        }

        // Fetch reviewers (Project Managers)
        const reviewersResponse = await projectService.getProjectManagers(
          task.projectId
        );
        if (reviewersResponse.success && reviewersResponse.data) {
          const reviewersList = reviewersResponse.data
            .filter((pm: any) => pm.member && !pm.leftAt) // Only active PMs
            .map((pm: any) => ({
              id: pm.member.id,
              name: pm.member.fullName || pm.member.email,
              email: pm.member.email,
            }));
          setReviewers(reviewersList);
        }

        // Fetch milestones
        const milestonesResponse =
          await milestoneService.getMilestonesByProjectId(task.projectId);
        if (milestonesResponse.success && milestonesResponse.data) {
          const items = Array.isArray(milestonesResponse.data)
            ? milestonesResponse.data
            : (milestonesResponse.data as any).items || [];
          setMilestones(items);
        }
      } catch (error) {
        console.error("Error fetching modal data:", error);
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
      const response = await taskHistoryService.getTaskHistoriesByTaskId(
        task.id
      );
      if (response.success && response.data) {
        setTaskHistories(response.data);
      } else {
        setTaskHistories([]);
      }
    } catch (error) {
      console.error("Error fetching task history:", error);
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
          console.warn("[Comments] Unexpected data format:", response.data);
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

  // Function to fetch attachments
  const fetchAttachments = useCallback(async () => {
    if (!task?.id) {
      return;
    }

    setIsLoadingAttachments(true);
    try {
      const response = await attachmentService.getAttachmentsByTaskId(task.id);

      if (response.success && response.data) {
        setAttachments(response.data);
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachments([]);
    } finally {
      setIsLoadingAttachments(false);
    }
  }, [task?.id]);

  // Fetch attachments when modal opens
  useEffect(() => {
    if (isOpen && task?.id) {
      fetchAttachments();
    }
  }, [isOpen, task?.id, fetchAttachments]);

  // Update editedTask when task prop changes
  useEffect(() => {
    if (task) {
      const taskMilestoneIds = task.milestones?.map((m) => m.id) || [];
      setEditedTask({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "Todo",
        userId: task.userId || "",
        reviewerId: task.reviewerId || "",
        startDate: task.startDate || "",
        endDate: task.endDate || "",
        milestoneIds: taskMilestoneIds,
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Statuses - filtered based on user role
  const ALL_TASK_STATUS_OPTIONS = [
    { value: "Todo", label: "Todo" },
    { value: "InProgress", label: "In Progress" },
    { value: "ReadyToReview", label: "Ready To Review" },
    { value: "ReOpened", label: "Re-Opened" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Done", label: "Done" },
  ];

  const MEMBER_STATUS_OPTIONS = [
    { value: "Todo", label: "Todo" },
    { value: "InProgress", label: "In Progress" },
    { value: "ReadyToReview", label: "Ready To Review" },
    { value: "ReOpened", label: "Re-Opened" },
  ];

  // Determine which status options to show based on user role
  // For members: if current task status is not in MEMBER_STATUS_OPTIONS, add it as read-only
  const TASK_STATUS_OPTIONS = isMember
    ? (() => {
        const memberStatusValues = MEMBER_STATUS_OPTIONS.map(s => s.value);
        const currentStatus = editedTask.status;
        
        // If current status is not in member's allowed list, prepend it
        if (currentStatus && !memberStatusValues.includes(currentStatus)) {
          const fullStatus = ALL_TASK_STATUS_OPTIONS.find(s => s.value === currentStatus);
          if (fullStatus) {
            return [fullStatus, ...MEMBER_STATUS_OPTIONS];
          }
        }
        return MEMBER_STATUS_OPTIONS;
      })()
    : ALL_TASK_STATUS_OPTIONS;

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    if (!user?.userId || !task?.id) {
      toast.error("Unable to create comment");
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
        toast.success("Comment posted successfully");
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
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await commentService.updateComment({
        id: commentId,
        content: editingCommentText.trim(),
      });

      if (response.success) {
        toast.success("Comment updated successfully");
        setEditingCommentId(null);
        setEditingCommentText("");
        await fetchComments(); // Refresh comments list
      } else {
        toast.error(response.error || "Failed to update comment");
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
      const response = await commentService.deleteComment(
        deletingCommentId,
        user.userId
      );

      if (response.success) {
        toast.success("Comment deleted successfully");
        await fetchComments(); // Refresh comments list
      } else {
        toast.error(response.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("An error occurred while deleting comment");
    } finally {
      setIsConfirmDeleteCommentOpen(false);
      setDeletingCommentId(null);
    }
  };

  // Attachment handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !task?.id) return;

    setIsUploadingFile(true);

    try {
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${file.name}-${Date.now()}`;

        try {
          // Upload to Cloudinary
          setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));
          
          const cloudinaryUrl = await uploadFileToCloudinary(file);
          
          if (!cloudinaryUrl) {
            toast.error(`Failed to upload ${file.name}`);
            continue;
          }

          setUploadProgress((prev) => ({ ...prev, [fileKey]: 50 }));

          // Extract filename from Cloudinary URL
          // URL format: https://res.cloudinary.com/dgzn2ix8w/image/upload/v1234567890/filename.jpg
          const urlParts = cloudinaryUrl.split('/');
          const fileNameWithExt = urlParts[urlParts.length - 1];

          // Create attachment metadata in backend
          const attachmentData = {
            fileName: fileNameWithExt,
            originalFileName: file.name,
            fileSize: file.size,
            contentType: file.type,
            fileUrl: cloudinaryUrl,
          };

          const response = await attachmentService.createAttachment(
            task.id,
            attachmentData
          );

          if (response.success) {
            setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));
            toast.success(`${file.name} uploaded successfully`);
          } else {
            toast.error(`Failed to save ${file.name}: ${response.error}`);
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Error uploading ${file.name}`);
        } finally {
          // Remove progress after a delay
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileKey];
              return newProgress;
            });
          }, 1000);
        }
      }

      // Refresh attachments list
      await fetchAttachments();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("An error occurred while uploading files");
    } finally {
      setIsUploadingFile(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    setDeletingAttachmentId(attachmentId);
    setIsConfirmDeleteAttachmentOpen(true);
  };

  const confirmDeleteAttachment = async () => {
    if (!deletingAttachmentId) return;

    try {
      const response = await attachmentService.deleteAttachment(
        deletingAttachmentId
      );

      if (response.success) {
        toast.success("Attachment deleted successfully");
        await fetchAttachments();
      } else {
        toast.error(response.error || "Failed to delete attachment");
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("An error occurred while deleting attachment");
    } finally {
      setIsConfirmDeleteAttachmentOpen(false);
      setDeletingAttachmentId(null);
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <ImageIcon size={20} />;
    } else if (contentType.startsWith("video/")) {
      return <Video size={20} />;
    } else if (contentType === "application/pdf") {
      return <FileText size={20} />;
    } else {
      return <File size={20} />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleUpdateField = (field: string, value: any) => {
    // Validate status change when field is status
    if (field === "status" && value !== editedTask.status) {
      const statusValidation = isValidStatusTransition(task.status, value);
      if (!statusValidation.valid) {
        setValidationErrors(prev => ({ 
          ...prev, 
          status: statusValidation.message || "This status change is not allowed" 
        }));
        return; // Don't update if invalid
      }
      // Clear status error if valid
      setValidationErrors(prev => ({ ...prev, status: "" }));
    }

    setEditedTask({ ...editedTask, [field]: value });
  };

  // Validate dates when they change
  const handleStartDateChange = (newStartDate: string) => {
    // Always allow clearing the date
    if (!newStartDate) {
      setValidationErrors(prev => ({ ...prev, startDate: "" }));
      handleUpdateField("startDate", newStartDate);
      return;
    }

    // Validate against project dates (always check)
    if (project?.startDate) {
      const projectStart = new Date(project.startDate);
      const selectedStart = new Date(newStartDate);
      
      if (selectedStart < projectStart) {
        setValidationErrors(prev => ({ ...prev, startDate: "Task start date cannot be before project start date" }));
        return;
      }
    }

    if (project?.endDate) {
      const projectEnd = new Date(project.endDate);
      const selectedStart = new Date(newStartDate);
      
      if (selectedStart > projectEnd) {
        setValidationErrors(prev => ({ ...prev, startDate: "Task start date cannot be after project end date" }));
        return;
      }
    }

    // Validate with end date if present
    if (editedTask.endDate) {
      const dateValidation = validateTaskDates(
        newStartDate,
        editedTask.endDate,
        project?.startDate,
        project?.endDate
      );

      if (!dateValidation.valid) {
        setValidationErrors(prev => ({ ...prev, startDate: dateValidation.message || "Invalid dates" }));
        return;
      }

      // Validate against milestones if any selected
      if (editedTask.milestoneIds.length > 0) {
        const selectedMilestones = milestones.filter(m => 
          editedTask.milestoneIds.includes(m.id)
        );
        
        const milestoneValidation = validateTaskMilestoneDates(
          newStartDate,
          editedTask.endDate,
          selectedMilestones
        );

        if (!milestoneValidation.valid) {
          setValidationErrors(prev => ({ ...prev, startDate: milestoneValidation.message || "Task dates conflict with milestone dates" }));
          return;
        }
      }
    } else if (editedTask.milestoneIds.length > 0) {
      // If only start date and milestones are selected, check if start is valid with milestone due dates
      const selectedMilestones = milestones.filter(m => 
        editedTask.milestoneIds.includes(m.id)
      );
      
      // Find the milestone with the latest due date
      const milestonesWithDates = selectedMilestones.filter(m => m.dueDate);
      if (milestonesWithDates.length > 0) {
        const latestMilestoneDue = new Date(
          Math.max(...milestonesWithDates.map(m => new Date(m.dueDate).getTime()))
        );
        const latestMilestone = milestonesWithDates.find(
          m => new Date(m.dueDate).getTime() === latestMilestoneDue.getTime()
        );
        const selectedStart = new Date(newStartDate);
        
        if (selectedStart > latestMilestoneDue) {
          setValidationErrors(prev => ({ ...prev, startDate: `Task start date cannot be after the latest milestone "${latestMilestone?.name}" due date` }));
          return;
        }
      }
    }

    // Clear error if all validations passed
    setValidationErrors(prev => ({ ...prev, startDate: "" }));
    handleUpdateField("startDate", newStartDate);
  };

  const handleEndDateChange = (newEndDate: string) => {
    // Always allow clearing the date
    if (!newEndDate) {
      setValidationErrors(prev => ({ ...prev, endDate: "" }));
      handleUpdateField("endDate", newEndDate);
      return;
    }

    // Validate against project dates (always check)
    if (project?.startDate) {
      const projectStart = new Date(project.startDate);
      const selectedEnd = new Date(newEndDate);
      
      if (selectedEnd < projectStart) {
        setValidationErrors(prev => ({ ...prev, endDate: "Task end date cannot be before project start date" }));
        return;
      }
    }

    if (project?.endDate) {
      const projectEnd = new Date(project.endDate);
      const selectedEnd = new Date(newEndDate);
      
      if (selectedEnd > projectEnd) {
        setValidationErrors(prev => ({ ...prev, endDate: "Task end date cannot be after project end date" }));
        return;
      }
    }

    // Validate with start date if present
    if (editedTask.startDate) {
      const dateValidation = validateTaskDates(
        editedTask.startDate,
        newEndDate,
        project?.startDate,
        project?.endDate
      );

      if (!dateValidation.valid) {
        setValidationErrors(prev => ({ ...prev, endDate: dateValidation.message || "Invalid dates" }));
        return;
      }

      // Validate against milestones if any selected
      if (editedTask.milestoneIds.length > 0) {
        const selectedMilestones = milestones.filter(m => 
          editedTask.milestoneIds.includes(m.id)
        );
        
        const milestoneValidation = validateTaskMilestoneDates(
          editedTask.startDate,
          newEndDate,
          selectedMilestones
        );

        if (!milestoneValidation.valid) {
          setValidationErrors(prev => ({ ...prev, endDate: milestoneValidation.message || "Task dates conflict with milestone dates" }));
          return;
        }
      }
    } else if (editedTask.milestoneIds.length > 0) {
      // If only end date and milestones are selected, check if end is valid with milestone due dates
      const selectedMilestones = milestones.filter(m => 
        editedTask.milestoneIds.includes(m.id)
      );
      
      // Find the milestone with the latest due date
      const milestonesWithDates = selectedMilestones.filter(m => m.dueDate);
      if (milestonesWithDates.length > 0) {
        const latestMilestoneDue = new Date(
          Math.max(...milestonesWithDates.map(m => new Date(m.dueDate).getTime()))
        );
        const latestMilestone = milestonesWithDates.find(
          m => new Date(m.dueDate).getTime() === latestMilestoneDue.getTime()
        );
        const selectedEnd = new Date(newEndDate);
        
        if (selectedEnd > latestMilestoneDue) {
          setValidationErrors(prev => ({ ...prev, endDate: `Task end date cannot be after the latest milestone "${latestMilestone?.name}" due date` }));
          return;
        }
      }
    }

    // Clear error if all validations passed
    setValidationErrors(prev => ({ ...prev, endDate: "" }));
    handleUpdateField("endDate", newEndDate);
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    const isAdding = !editedTask.milestoneIds.includes(milestoneId);
    const newMilestoneIds = isAdding
      ? [...editedTask.milestoneIds, milestoneId]
      : editedTask.milestoneIds.filter((id) => id !== milestoneId);

    // If adding a milestone, validate ONLY the new milestone being added
    if (isAdding) {
      const milestoneToAdd = milestones.find(m => m.id === milestoneId);
      
      if (milestoneToAdd && milestoneToAdd.dueDate) {
        const milestoneDue = new Date(milestoneToAdd.dueDate);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to compare dates only
        
        // Check if milestone due date is in the past
        if (milestoneDue < currentDate) {
          setValidationErrors(prev => ({ 
            ...prev, 
            milestone: `Cannot select milestone "${milestoneToAdd.name}" - due date has passed` 
          }));
          return;
        }
        
        // Check if start date is after THIS milestone's due date
        if (editedTask.startDate) {
          const taskStart = new Date(editedTask.startDate);
          if (taskStart > milestoneDue) {
            setValidationErrors(prev => ({ 
              ...prev, 
              milestone: `Cannot select milestone "${milestoneToAdd.name}" - task start date is after milestone due date` 
            }));
            return;
          }
        }
        
        // Check if end date is after THIS milestone's due date
        if (editedTask.endDate) {
          const taskEnd = new Date(editedTask.endDate);
          if (taskEnd > milestoneDue) {
            setValidationErrors(prev => ({ 
              ...prev, 
              milestone: `Cannot select milestone "${milestoneToAdd.name}" - task end date is after milestone due date` 
            }));
            return;
          }
        }
      }
    }

    // Clear milestone error when successfully toggling
    setValidationErrors(prev => ({ ...prev, milestone: "" }));
    handleUpdateField("milestoneIds", newMilestoneIds);
  };

  // Format date from ISO to yyyy-mm-dd for input value (date input requires this format)
  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSaveTask = async () => {
    if (!user?.userId) {
      toast.error("User is not logged in");
      return;
    }

    // Validation: Member cannot change assignee
    if (isMember && editedTask.userId !== task.userId) {
      toast.warning("Members are not allowed to change the assignee");
      return;
    }

    // Validate all fields at once
    const errors = {
      title: "",
      startDate: "",
      endDate: "",
      milestone: "",
      status: "",
      reviewer: "",
    };

    let hasError = false;

    // Validate title
    if (!editedTask.title.trim()) {
      errors.title = "Task title is required";
      hasError = true;
    } else if (editedTask.title.trim().length < 3) {
      errors.title = "Task title must be at least 3 characters";
      hasError = true;
    } else if (editedTask.title.trim().length > 50) {
      errors.title = "Task title must not exceed 50 characters";
      hasError = true;
    }

    // Validate reviewer if moving to ReadyToReview
    if (editedTask.status === 'ReadyToReview' && !editedTask.reviewerId) {
      errors.reviewer = "Please select a reviewer when moving to Ready To Review";
      hasError = true;
    }

    // Validate dates if they exist
    if (editedTask.startDate && editedTask.endDate) {
      const dateValidation = validateTaskDates(
        editedTask.startDate,
        editedTask.endDate,
        project?.startDate,
        project?.endDate
      );

      if (!dateValidation.valid) {
        errors.endDate = dateValidation.message || "Invalid dates";
        hasError = true;
      }

      // Validate dates against selected milestones
      if (!errors.endDate && editedTask.milestoneIds.length > 0) {
        const selectedMilestones = milestones.filter(m => 
          editedTask.milestoneIds.includes(m.id)
        );
        const milestoneValidation = validateTaskMilestoneDates(
          editedTask.startDate,
          editedTask.endDate,
          selectedMilestones
        );

        if (!milestoneValidation.valid) {
          errors.milestone = milestoneValidation.message || "Task dates conflict with milestone dates";
          hasError = true;
        }
      }
    }

    // Set all errors at once
    setValidationErrors(errors);

    // If there are any errors, stop here
    if (hasError) {
      return;
    }

    try {
      // Check if milestones were actually changed
      const milestonesChanged = 
        JSON.stringify([...editedTask.milestoneIds].sort()) !== 
        JSON.stringify([...originalMilestoneIds].sort());

      const updateData = {
        id: task.id,
        projectId: task.projectId,
        actorId: user.userId,
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        userId: editedTask.userId || undefined,
        reviewerId: editedTask.reviewerId || undefined,
        startDate: editedTask.startDate
          ? new Date(editedTask.startDate).toISOString()
          : undefined,
        endDate: editedTask.endDate
          ? new Date(editedTask.endDate).toISOString()
          : undefined,
        // Only include milestoneIds if they were actually changed
        milestoneIds: milestonesChanged ? editedTask.milestoneIds : undefined,
      };

      const response = await taskService.updateTask(updateData);

      if (response.success) {
        toast.success("Task updated successfully");

        // Refresh history to show the update action
        await fetchHistory();

        if (onSave) {
          onSave();
        }
        onClose();
      } else {
        toast.warning(response.error || "Failed to update task");
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
        <div className="task-detail-modal-header">
          <h2>{mode === "view" ? "Task Details" : "Edit Task"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Completed Project Warning */}
        {isProjectDisabled && (
          <div
            style={{
              padding: "12px 16px",
              margin: "16px 24px 0 24px",
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              color: "#92400E",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>
              This project is not active. Editing tasks is disabled.
            </span>
          </div>
        )}

        {/* Body with 2 columns */}
        <div className="task-detail-modal-body">
          {/* Left Panel - 60% */}
          <div className="left-panel">
            {/* Title */}
            <div className="field-group">
              <label className="field-label">Title</label>
              {mode === "edit" && canEdit ? (
                <>
                  <input
                    type="text"
                    className={`field-input ${validationErrors.title ? "error" : ""}`}
                    value={editedTask.title}
                    onChange={(e) => {
                      handleUpdateField("title", e.target.value);
                      setValidationErrors(prev => ({ ...prev, title: "" }));
                    }}
                    placeholder="Enter task title..."
                  />
                  {validationErrors.title && (
                    <p className="error-text">{validationErrors.title}</p>
                  )}
                </>
              ) : (
                <div className="field-value">{editedTask.title}</div>
              )}
            </div>

            {/* Description */}
            <div className="field-group">
              <label className="field-label">Description</label>
              {mode === "edit" && canEdit ? (
                <textarea
                  className="field-textarea"
                  value={editedTask.description}
                  onChange={(e) =>
                    handleUpdateField("description", e.target.value)
                  }
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
                  className={`tab-btn ${
                    activeTab === "comments" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("comments")}
                >
                  <MessageSquare size={16} />
                  Comments ({comments.length})
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === "history" ? "active" : ""
                  }`}
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
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#6b7280",
                          }}
                        >
                          Loading comments...
                        </div>
                      ) : comments.length === 0 ? (
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            color: "#6b7280",
                          }}
                        >
                          No comments yet. Be the first to comment!
                        </div>
                      ) : (
                        comments.map((comment) => {
                          const author =
                            comment.user?.fullName ||
                            comment.user?.email ||
                            "Unknown";
                          const initials = getUserInitials(author);
                          const avatarColor = getAvatarColor(author);
                          const avatarUrl = comment.user?.avatarUrl;
                          const canEdit = user?.userId === comment.userId && !isProjectDisabled;
                          const isEditing = editingCommentId === comment.id;

                          return (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-avatar">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={author}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div
                                className="comment-content"
                                style={{ flex: 1 }}
                              >
                                <div className="comment-header">
                                  <span className="comment-author">
                                    {author}
                                  </span>
                                  <span className="comment-time">
                                    {formatCommentTime(comment.createdAt)}
                                  </span>
                                  {canEdit && !isEditing && (
                                    <div
                                      style={{
                                        marginLeft: "auto",
                                        display: "flex",
                                        gap: "8px",
                                      }}
                                    >
                                      <button
                                        className="edit-comment-btn"
                                        onClick={() =>
                                          handleEditComment(comment)
                                        }
                                        title="Edit comment"
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#3b82f6",
                                          cursor: "pointer",
                                          padding: "4px",
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        className="delete-comment-btn"
                                        onClick={() =>
                                          handleDeleteComment(comment.id)
                                        }
                                        title="Delete comment"
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#ef4444",
                                          cursor: "pointer",
                                          padding: "4px",
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div style={{ marginTop: "8px" }}>
                                    <textarea
                                      className="comment-input"
                                      value={editingCommentText}
                                      onChange={(e) =>
                                        setEditingCommentText(e.target.value)
                                      }
                                      rows={3}
                                      style={{
                                        width: "100%",
                                        marginBottom: "8px",
                                      }}
                                    />
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "8px",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <button
                                        onClick={handleCancelEdit}
                                        style={{
                                          padding: "6px 12px",
                                          background: "#f3f4f6",
                                          border: "1px solid #d1d5db",
                                          borderRadius: "6px",
                                          cursor: "pointer",
                                          fontSize: "13px",
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleSaveEditComment(comment.id)
                                        }
                                        disabled={!editingCommentText.trim()}
                                        style={{
                                          padding: "6px 12px",
                                          background: "#ff5e13",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "6px",
                                          cursor: editingCommentText.trim()
                                            ? "pointer"
                                            : "not-allowed",
                                          fontSize: "13px",
                                          opacity: editingCommentText.trim()
                                            ? 1
                                            : 0.5,
                                        }}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="comment-text">
                                    {comment.content}
                                  </p>
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
                        placeholder={isProjectDisabled ? "Comments are disabled for inactive projects" : "Write a comment..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                        disabled={isSubmittingComment || isProjectDisabled}
                      />
                      <button
                        className="submit-comment-btn"
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmittingComment || isProjectDisabled}
                      >
                        {isSubmittingComment ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="history-tab">
                    {isLoadingHistory ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        Loading history...
                      </div>
                    ) : taskHistories.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        No history available
                      </div>
                    ) : (
                      <div className="history-list">
                        {taskHistories.map((item) => {
                          const userName =
                            item.changedBy?.fullName || "Unknown";
                          const initials = getUserInitials(userName);
                          const avatarColor = getAvatarColor(userName);
                          const avatarUrl = item.changedBy?.avatarUrl;
                          const actionText = getHistoryActionText(item);

                          // Render different content based on action type
                          let detailContent = null;

                          if (
                            item.action === "Assigned" ||
                            item.action === "Reassigned"
                          ) {
                            const toUserAvatarUrl = item.toUser?.avatarUrl;
                            detailContent = (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginTop: "4px",
                                }}
                              >
                                <span>
                                  {item.fromUser?.fullName || "Unassigned"}
                                </span>
                                <span>→</span>
                                {item.toUser && (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        background:
                                          "linear-gradient(135deg, #ff5e13, #ff8c42)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "10px",
                                        fontWeight: "600",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {toUserAvatarUrl ? (
                                        <img
                                          src={toUserAvatarUrl}
                                          alt={item.toUser.fullName}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                        />
                                      ) : (
                                        getUserInitials(item.toUser.fullName)
                                      )}
                                    </div>
                                    <span>{item.toUser.fullName}</span>
                                  </div>
                                )}
                              </div>
                            );
                          } else if (
                            item.action === "StatusChanged" ||
                            item.fieldName === "Status"
                          ) {
                            const oldStatusColor = item.oldValue
                              ? getTaskStatusColor(item.oldValue)
                              : "#6b7280";
                            const newStatusColor = item.newValue
                              ? getTaskStatusColor(item.newValue)
                              : "#6b7280";
                            const oldStatusLabel = item.oldValue
                              ? getTaskStatusLabel(item.oldValue)
                              : "N/A";
                            const newStatusLabel = item.newValue
                              ? getTaskStatusLabel(item.newValue)
                              : "N/A";

                            detailContent = (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginTop: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    color: "white",
                                    backgroundColor: oldStatusColor,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {oldStatusLabel}
                                </span>
                                <span
                                  style={{
                                    color: "#9ca3af",
                                    fontWeight: "500",
                                  }}
                                >
                                  →
                                </span>
                                <span
                                  style={{
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    color: "white",
                                    backgroundColor: newStatusColor,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {newStatusLabel}
                                </span>
                              </div>
                            );
                          } else if (
                            item.fieldName &&
                            item.oldValue &&
                            item.newValue
                          ) {
                            detailContent = (
                              <div style={{ marginTop: "4px" }}>
                                <span>{item.oldValue}</span>
                                <span style={{ margin: "0 8px" }}>→</span>
                                <span>{item.newValue}</span>
                              </div>
                            );
                          }

                          return (
                            <div key={item.id} className="history-item">
                              <div className="history-avatar">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={userName}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div className="history-content">
                                <div style={{ marginBottom: "4px" }}>
                                  <strong>{userName}</strong> {actionText}
                                </div>
                                {detailContent}
                                <div
                                  style={{
                                    marginTop: "4px",
                                    color: "#6b7280",
                                    fontSize: "13px",
                                  }}
                                >
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
                className={`info-select ${validationErrors.status ? "error" : ""}`}
                value={editedTask.status}
                onChange={(e) => handleUpdateField("status", e.target.value)}
                disabled={
                  mode === "view" || 
                  !canEdit || 
                  (isMember && !["Todo", "InProgress", "ReadyToReview", "ReOpened"].includes(editedTask.status))
                }
              >
                {TASK_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {validationErrors.status && (
                <p className="error-text">{validationErrors.status}</p>
              )}
              {isMember && !["Todo", "InProgress", "ReadyToReview", "ReOpened"].includes(editedTask.status) && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  Status locked - only PM can modify
                </span>
              )}
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
                disabled={
                  isLoadingData || mode === "view" || !canEdit || isMember
                }
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {isMember && mode === "edit" && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  Members cannot change assignee
                </span>
              )}
            </div>

            {/* Reviewer */}
            <div className="info-field">
              <label className="info-label">
                <User size={16} />
                Reviewer
              </label>
              <select
                className={`info-select ${validationErrors.reviewer ? "error" : ""}`}
                value={editedTask.reviewerId}
                onChange={(e) => {
                  handleUpdateField("reviewerId", e.target.value);
                  setValidationErrors(prev => ({ ...prev, reviewer: "" }));
                }}
                disabled={isLoadingData || mode === "view" || !canEdit}
              >
                <option value="">No reviewer</option>
                {reviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.name}
                  </option>
                ))}
              </select>
              {validationErrors.reviewer && (
                <p className="error-text">{validationErrors.reviewer}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="info-field">
              <label className="info-label">
                <Calendar size={16} />
                Start Date
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  className={`info-input ${validationErrors.startDate ? "error" : ""}`}
                  value={formatDateForInput(editedTask.startDate)}
                  onChange={(e) => {
                    const dateValue = e.target.value; // yyyy-mm-dd format from date input
                    if (dateValue) {
                      handleStartDateChange(new Date(dateValue).toISOString());
                    } else {
                      handleStartDateChange("");
                    }
                  }}
                  min={
                    project?.startDate
                      ? formatDate(project.startDate)
                      : undefined
                  }
                  max={formatDate(new Date().toISOString())}
                  disabled={mode === "view" || !canEdit}
                  style={{ colorScheme: "light" }}
                />
              </div>
              {validationErrors.startDate && (
                <p className="error-text">{validationErrors.startDate}</p>
              )}
              {project?.startDate && mode === "edit" && (
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  Project: {formatDate(project.startDate)} -{" "}
                  {project.endDate ? formatDate(project.endDate) : "No end"}
                </span>
              )}
            </div>

            {/* End Date */}
            <div className="info-field">
              <label className="info-label">
                <Calendar size={16} />
                End Date
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  className={`info-input ${validationErrors.endDate ? "error" : ""}`}
                  value={formatDateForInput(editedTask.endDate)}
                  onChange={(e) => {
                    const dateValue = e.target.value; // yyyy-mm-dd format from date input
                    if (dateValue) {
                      handleEndDateChange(new Date(dateValue).toISOString());
                    } else {
                      handleEndDateChange("");
                    }
                  }}
                  min={
                    editedTask.startDate
                      ? formatDateForInput(editedTask.startDate)
                      : undefined
                  }
                  max={
                    project?.endDate
                      ? formatDateForInput(project.endDate)
                      : undefined
                  }
                  disabled={mode === "view" || !canEdit}
                  style={{ colorScheme: "light" }}
                />
              </div>
              {validationErrors.endDate && (
                <p className="error-text">{validationErrors.endDate}</p>
              )}
            </div>

            {/* Milestones */}
            <div className="info-field">
              <label className="info-label">
                <Target size={16} />
                Milestones
              </label>
              <div className="milestones-list">
                {isLoadingData ? (
                  <div
                    style={{
                      padding: "8px",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    Loading milestones...
                  </div>
                ) : milestones.length === 0 ? (
                  <div
                    style={{
                      padding: "8px",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    No milestones available
                  </div>
                ) : (
                  milestones.map((milestone) => {
                    const milestoneDue = new Date(milestone.dueDate);
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);
                    const isPastDue = milestoneDue < currentDate;
                    
                    return (
                      <label 
                        key={milestone.id} 
                        className="milestone-checkbox"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          opacity: isPastDue ? 0.5 : 1,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={editedTask.milestoneIds.includes(milestone.id)}
                            onChange={() => handleMilestoneToggle(milestone.id)}
                            disabled={mode === "view" || !canEdit || isPastDue}
                          />
                          <span>{milestone.name}</span>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: isPastDue ? "#ef4444" : "#6b7280",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          {formatDate(milestone.dueDate)}
                          {isPastDue && " (Past due)"}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {validationErrors.milestone && (
                <p className="error-text">{validationErrors.milestone}</p>
              )}
            </div>

            {/* Attachments */}
            <div className="info-field">
              <label className="info-label">
                <Paperclip size={16} />
                Attachments
              </label>
              
              {/* Upload Button */}
              {mode === "edit" && canEdit && (
                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="file-upload"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, #ff5e13 0%, #e54e0a 100%)",
                      color: "white",
                      borderRadius: "8px",
                      cursor: isUploadingFile ? "not-allowed" : "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      opacity: isUploadingFile ? 0.6 : 1,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isUploadingFile) {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 94, 19, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {isUploadingFile ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Files
                      </>
                    )}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploadingFile}
                    style={{ display: "none" }}
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  <p style={{ 
                    fontSize: "11px", 
                    color: "#6b7280", 
                    marginTop: "6px",
                    marginBottom: "0"
                  }}>
                    Max 10MB per file. Supports images, videos, PDFs, and documents.
                  </p>
                </div>
              )}

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  {Object.entries(uploadProgress).map(([key, progress]) => (
                    <div key={key} style={{ 
                      marginBottom: "8px",
                      padding: "8px",
                      background: "#f3f4f6",
                      borderRadius: "6px"
                    }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginBottom: "4px",
                        fontSize: "12px",
                        color: "#6b7280"
                      }}>
                        <span>{key.split('-')[0]}</span>
                        <span>{progress}%</span>
                      </div>
                      <div style={{
                        width: "100%",
                        height: "4px",
                        background: "#e5e7eb",
                        borderRadius: "2px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #ff5e13 0%, #e54e0a 100%)",
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments List */}
              <div className="attachments-list">
                {isLoadingAttachments ? (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto" }} />
                    <p style={{ marginTop: "8px" }}>Loading attachments...</p>
                  </div>
                ) : attachments.length === 0 ? (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: "13px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px dashed #d1d5db"
                    }}
                  >
                    <Paperclip size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                    <p>No attachments yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f9fafb";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "12px",
                          flex: 1,
                          minWidth: 0
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            background: "white",
                            borderRadius: "6px",
                            color: "#ff5e13",
                            flexShrink: 0
                          }}>
                            {getFileIcon(attachment.contentType)}
                          </div>
                          <div style={{ 
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden"
                          }}>
                            <p style={{
                              margin: 0,
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#111827",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>
                              {attachment.originalFileName}
                            </p>
                            <p style={{
                              margin: "2px 0 0 0",
                              fontSize: "11px",
                              color: "#6b7280"
                            }}>
                              {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div style={{ 
                          display: "flex", 
                          gap: "4px",
                          flexShrink: 0
                        }}>
                          <button
                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              background: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              cursor: "pointer",
                              color: "#6b7280",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#ff5e13";
                              e.currentTarget.style.borderColor = "#ff5e13";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "white";
                              e.currentTarget.style.borderColor = "#e5e7eb";
                              e.currentTarget.style.color = "#6b7280";
                            }}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          {mode === "edit" && canEdit && (
                            <button
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                cursor: "pointer",
                                color: "#6b7280",
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ef4444";
                                e.currentTarget.style.borderColor = "#ef4444";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "white";
                                e.currentTarget.style.borderColor = "#e5e7eb";
                                e.currentTarget.style.color = "#6b7280";
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="task-detail-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          {mode === "edit" && canEdit && (
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
            title="Delete Comment"
            description="Are you sure you want to delete this comment? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
          />
        </div>
      )}

      {/* Confirm Delete Attachment Dialog */}
      {isConfirmDeleteAttachmentOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <ConfirmDialog
            isOpen={isConfirmDeleteAttachmentOpen}
            onClose={() => {
              setIsConfirmDeleteAttachmentOpen(false);
              setDeletingAttachmentId(null);
            }}
            onConfirm={confirmDeleteAttachment}
            title="Delete Attachment"
            description="Are you sure you want to delete this attachment? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
          />
        </div>
      )}
    </div>
  );
};
