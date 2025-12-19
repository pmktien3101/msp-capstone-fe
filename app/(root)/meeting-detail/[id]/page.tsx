"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Video,
  FileText,
  Play,
  Download,
  Sparkles,
  Loader2,
  Trash2,
  Edit3,
  Target,
  CheckCircle,
  Clock,
  Users,
  CalendarDays,
  Milestone,
  UserCircle,
  Check,
  X,
  AlertTriangleIcon,
} from "lucide-react";
import "@/app/styles/meeting-detail.scss";
import { useGetCallById } from "@/hooks/useGetCallById";
import { CallRecording } from "@stream-io/video-react-sdk";
import { toast } from "react-toastify";
import { todoService } from "@/services/todoService";
import { meetingService } from "@/services/meetingService";
import TranscriptPanel from "@/components/meeting/TranscriptPanel";
import TodoCard from "@/components/meeting/TodoCard";
import { RelatedTasksSidebar } from "@/components/meeting/RelatedTasksSidebar";
import { useAuth } from "@/hooks/useAuth";
import { taskService } from "@/services/taskService";
import { PagingRequest } from "@/types/project";
import { Todo } from "@/types/todo";

// Custom hooks
import { useMeetingData } from "@/hooks/useMeetingData";
import { useMeetingTodos } from "@/hooks/useMeetingTodos";
import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { useMeetingTranscriptions } from "@/hooks/useMeetingTranscriptions";
import { useMeetingAI } from "@/hooks/useMeetingAI";

// Helpers
import {
  mapCallStatus,
  formatDateTime,
  formatDuration,
  formatTimestamp,
  getStatusColor,
  getStatusLabel,
  parseTranscription,
  getSpeakerName,
  mapSummaryAssigneeIds,
  isValidTodo,
  formatDate,
  getTodoStatusStyle,
  getTodoStatusLabel,
} from "@/lib/meetingHelpers";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isProjectManager } = useAuth();

  // Stream call
  const { call, isLoadingCall } = useGetCallById(params.id as string);

  // UI State
  const [activeTab, setActiveTab] = useState("overview");

  // ==================== Custom Hooks ====================
  const { meetingInfo, setMeetingInfo, isLoading: isLoadingMeeting } =
    useMeetingData(params.id as string);

  const { todos: todosFromDB, setTodos: setTodosFromDB } =
    useMeetingTodos(params.id as string);

  const { recordings, isLoading: isLoadingRecordings, error: recordingsError } =
    useMeetingRecordings(call, meetingInfo, activeTab);

  const { transcriptions: originalTranscriptions } =
    useMeetingTranscriptions(call?.id, activeTab);

  const {
    improvedTranscript,
    summary,
    todoList,
    isProcessing: isProcessingMeetingAI,
    error: aiProcessingError,
    processVideo,
    regenerate,
    hasProcessedRef,
    setImprovedTranscript,
    setSummary,
    setTodoList,
    setError: setAiProcessingError,
  } = useMeetingAI();

  // ==================== Local UI State ====================
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [originalTodoCache, setOriginalTodoCache] = useState<{
    [id: string]: Todo;
  }>({});
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    taskId: string | null;
  }>({ isOpen: false, taskId: null });

  const [convertConfirmModal, setConvertConfirmModal] = useState<{
    isOpen: boolean;
    taskCount: number;
  }>({ isOpen: false, taskCount: 0 });

  // Sidebar & summary state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentReferenceIds, setCurrentReferenceIds] = useState<string[]>([]);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editingSummaryText, setEditingSummaryText] = useState("");
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);

  // FAB (Floating Action Bar) state
  const [fabPosition, setFabPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fabInitializedRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // ==================== Effects ====================

  // Tab persistence
  useEffect(() => {
    const savedTab = localStorage.getItem("meetingDetailActiveTab");
    if (savedTab) setActiveTab(savedTab);

    return () => {
      localStorage.removeItem("meetingDetailActiveTab");
    };
  }, []);

  // Fetch project tasks when switching to recording tab
  useEffect(() => {
    async function fetchProjectTasks() {
      if (!meetingInfo?.projectId || activeTab !== "recording") return;

      const params: PagingRequest = { pageIndex: 1, pageSize: 100 };
      const response = await taskService.getTasksByProjectId(
        meetingInfo.projectId,
        params
      );

      if (response.success && response.data) {
        setProjectTasks(response.data.items || []);
      }
    }

    fetchProjectTasks();
  }, [activeTab, meetingInfo?.projectId]);

  // Auto-process video or load existing AI data
  useEffect(() => {
    if (isLoadingMeeting) return;

    // Load existing AI data from DB
    if (
      meetingInfo?.summary ||
      meetingInfo?.transcription ||
      todosFromDB.length > 0
    ) {
      if (meetingInfo.transcription) {
        const parsedTranscript = parseTranscription(meetingInfo.transcription);
        setImprovedTranscript(parsedTranscript);
      }

      if (meetingInfo.summary) {
        const processedSummary = mapSummaryAssigneeIds(
          meetingInfo.summary,
          meetingInfo?.attendees || []
        );
        setSummary(processedSummary);
      }

      if (todosFromDB.length > 0) {
        setTodoList(todosFromDB);
      }

      hasProcessedRef.current = true;
      return;
    }

    // Auto-process video with AI if conditions are met
    if (!originalTranscriptions?.length) return;

    const hasRecordingUrl = meetingInfo?.recordUrl || recordings[0]?.url;
    if (!hasRecordingUrl || hasProcessedRef.current) return;

    hasProcessedRef.current = true;

    if (!meetingInfo?.recordUrl && recordings[0]?.url) {
      toast.info("Đang xử lý video với AI...", { autoClose: 5000 });
    }

    processVideo(
      params.id as string,
      recordings[0],
      originalTranscriptions,
      projectTasks,
      meetingInfo,
      call
    ).catch(() => {
      hasProcessedRef.current = false;
    });
  }, [
    originalTranscriptions,
    recordings,
    meetingInfo,
    isLoadingMeeting,
    todosFromDB,
    projectTasks,
    params.id,
  ]);

  // FAB initialization
  useEffect(() => {
    if (activeTab === "recording" && !fabInitializedRef.current) {
      const initialX = window.innerWidth - 180;
      const initialY = window.innerHeight - 200;
      setFabPosition({ x: initialX, y: initialY });
      fabInitializedRef.current = true;
    }
  }, [activeTab]);

  // ==================== FAB Handlers ====================
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!fabPosition) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - fabPosition.x,
      y: e.clientY - fabPosition.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      setFabPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // ==================== Handlers ====================

  const handleChangeTab = useCallback((tabKey: string) => {
    setActiveTab(tabKey);
    localStorage.setItem("meetingDetailActiveTab", tabKey);
  }, []);

  // Summary editing
  const handleStartEditSummary = useCallback(() => {
    setEditingSummaryText(summary);
    setIsEditingSummary(true);
  }, [summary]);

  const handleCancelEditSummary = useCallback(() => {
    setIsEditingSummary(false);
    setEditingSummaryText("");
  }, []);

  const handleSaveSummary = useCallback(async () => {
    if (!params.id) return;

    setIsSavingSummary(true);
    try {
      const result = await meetingService.updateSummary(
        params.id as string,
        editingSummaryText
      );

      if (result.success) {
        setSummary(editingSummaryText);
        setMeetingInfo((prev: any) => ({
          ...prev,
          summary: editingSummaryText,
        }));
        setIsEditingSummary(false);
        setEditingSummaryText("");
        toast.success("Cập nhật tóm tắt thành công");
      } else {
        toast.error(result.error || "Không thể cập nhật tóm tắt");
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật tóm tắt");
    } finally {
      setIsSavingSummary(false);
    }
  }, [params.id, editingSummaryText, setSummary, setMeetingInfo]);

  // Regenerate AI content
  const handleRegenerate = useCallback(async () => {
    if (!call?.id || !meetingInfo) {
      toast.error("Thông tin cuộc họp không khả dụng");
      return;
    }

    setAiProcessingError(null);
    setIsRegenerating(true);

    try {
      let cloudRecordingUrl = meetingInfo?.recordUrl || null;

      if (!cloudRecordingUrl && recordings.length > 0 && recordings[0]?.url) {
        console.warn("⚠️ Using Stream URL as fallback");
        cloudRecordingUrl = recordings[0].url;
      }

      if (!cloudRecordingUrl) {
        toast.warning("Không có URL recording");
        return;
      }

      await regenerate(
        params.id as string,
        cloudRecordingUrl,
        originalTranscriptions,
        projectTasks,
        meetingInfo,
        call
      );
    } finally {
      setIsRegenerating(false);
    }
  }, [
    call,
    meetingInfo,
    recordings,
    originalTranscriptions,
    projectTasks,
    params.id,
    regenerate,
    setAiProcessingError,
  ]);

  // Task selection
  const handleSelectTask = useCallback(
    (taskId: string) => {
      const todo = todoList.find((t) => t.id === taskId);

      if (!isValidTodo(todo)) {
        toast.warning("Công việc đã được chuyển đổi hoặc xóa");
        return;
      }

      setSelectedTasks((prev) =>
        prev.includes(taskId)
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId]
      );
    },
    [todoList]
  );

  const handleSelectAllTasks = useCallback(() => {
    const eligibleIds = todoList.filter((t) => isValidTodo(t)).map((t) => t.id);
    setSelectedTasks(
      selectedTasks.length === eligibleIds.length ? [] : eligibleIds
    );
  }, [todoList, selectedTasks.length]);

  // Delete & Convert
  const handleOpenDeleteModal = useCallback((taskId: string) => {
    setDeleteConfirmModal({ isOpen: true, taskId });
  }, []);

  const handleDeleteTask = useCallback(async () => {
    if (!deleteConfirmModal.taskId) return;

    try {
      const result = await todoService.deleteTodo(deleteConfirmModal.taskId);

      if (result.success) {
        const filterDeleted = (tasks: any[]) =>
          tasks.filter((task) => task.id !== deleteConfirmModal.taskId);

        setTodoList(filterDeleted);
        setTodosFromDB(filterDeleted);
        toast.success("Xóa công việc thành công");
        setDeleteConfirmModal({ isOpen: false, taskId: null });
      } else {
        toast.error("Không thể xóa: " + result.error);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa công việc");
    }
  }, [deleteConfirmModal.taskId, setTodoList, setTodosFromDB]);

  const handleOpenConvertModal = useCallback(() => {
    setConvertConfirmModal({ isOpen: true, taskCount: selectedTasks.length });
  }, [selectedTasks.length]);

  const handleConfirmConvert = useCallback(async () => {
    if (selectedTasks.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một công việc!");
      return;
    }

    try {
      const result = await todoService.convertTodosToTasks(selectedTasks);

      if (result.success) {
        toast.success(
          `Chuyển đổi thành công ${result.data?.length} công việc!`
        );
        setSelectedTasks([]);
        setConvertConfirmModal({ isOpen: false, taskCount: 0 });

        if (meetingInfo?.projectId) {
          setTimeout(() => {
            router.push(`/projects/${meetingInfo.projectId}?tab=board`);
          }, 600);
        }
      } else {
        toast.error(result.error || "Không thể chuyển đổi!");
      }
    } catch (error) {
      toast.error("Lỗi khi chuyển đổi!");
    } finally {
      setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    }
  }, [selectedTasks, meetingInfo?.projectId, router]);

  // Related tasks & downloads
  const handleShowRelatedTasks = useCallback((todo: Todo) => {
    setCurrentReferenceIds(todo.referencedTasks || []);
    setSidebarOpen(true);
    setSelectedTodoId(todo.id);
  }, []);

  const handleDownload = useCallback(
    async (rec: CallRecording, fallbackIndex: number) => {
      if (!rec.url) return;

      try {
        const uniqueId = rec.url || String(fallbackIndex);
        setDownloadingId(uniqueId);

        const res = await fetch(rec.url);
        if (!res.ok) throw new Error("Download failed");

        const blob = await res.blob();
        const contentType = blob.type || "video/mp4";
        const extension = contentType.includes("mp4")
          ? "mp4"
          : contentType.includes("webm")
            ? "webm"
            : "mp4";

        const baseName =
          rec.filename
            ?.replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9-_\.]/g, "")
            .replace(/-{2,}/g, "-") || `recording-${fallbackIndex + 1}`;

        const finalName = baseName.endsWith(extension)
          ? baseName
          : `${baseName}.${extension}`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        toast.error("Tải xuống thất bại!");
      } finally {
        setDownloadingId(null);
      }
    },
    []
  );

  // Todo edit handlers
  const handleTodoEditStart = useCallback(
    (todoId: string, originalTodo: Todo) => {
      setEditMode((prev) => ({ ...prev, [todoId]: true }));
      setOriginalTodoCache((prev) => ({ ...prev, [todoId]: originalTodo }));
    },
    []
  );

  const handleTodoEditSave = useCallback(
    async (todo: any) => {
      try {
        const newAssigneeId = todo.assigneeId || todo.assignee?.id;

        const updateResult = await todoService.updateTodo(todo.id, {
          title: todo.title,
          description: todo.description,
          startDate: todo.startDate,
          endDate: todo.endDate,
          assigneeId: newAssigneeId,
        });

        if (updateResult.success) {
          const newAssignee = meetingInfo?.attendees?.find(
            (att: any) => att.id === newAssigneeId
          );

          const updatedTodo = {
            ...todo,
            assigneeId: newAssigneeId,
            assignee: newAssignee
              ? {
                id: newAssignee.id,
                fullName: newAssignee.fullName,
                email: newAssignee.email,
              }
              : null,
            status: updateResult?.data?.status,
            statusDisplay: updateResult?.data?.statusDisplay,
          };

          const updateTodoInList = (prev: any[]) =>
            prev.map((t) => (t.id === todo.id ? updatedTodo : t));

          setTodoList(updateTodoInList);
          setTodosFromDB(updateTodoInList);
          toast.success("Cập nhật công việc thành công");

          setOriginalTodoCache((prev) => {
            const copy = { ...prev };
            delete copy[todo.id];
            return copy;
          });
          setEditMode((prev) => ({ ...prev, [todo.id]: false }));
        } else {
          toast.error("Không thể cập nhật: " + updateResult.error);
        }
      } catch (error) {
        toast.error("Lỗi khi cập nhật công việc");
      }
    },
    [meetingInfo?.attendees, setTodoList, setTodosFromDB]
  );

  const handleTodoEditCancel = useCallback(
    (todoId: string) => {
      if (originalTodoCache[todoId]) {
        const restoreOriginal = (prev: any[]) =>
          prev.map((t) => (t.id === todoId ? originalTodoCache[todoId] : t));

        setTodoList(restoreOriginal);
        setTodosFromDB(restoreOriginal);

        setOriginalTodoCache((prev) => {
          const copy = { ...prev };
          delete copy[todoId];
          return copy;
        });
      }
      setEditMode((prev) => ({ ...prev, [todoId]: false }));
    },
    [originalTodoCache, setTodoList, setTodosFromDB]
  );

  const handleTodoChange = useCallback(
    (todoId: string, updates: any) => {
      setTodoList((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
      );
    },
    [setTodoList]
  );

  const handleClickJoinMeeting = () => {
    router.push(`${process.env.NEXT_PUBLIC_FE_URL}/meeting/${meetingInfo.id}`);
  };

  // ==================== Memoized Values ====================

  const memoizedTodoList = useMemo(
    () =>
      todoList.map((todo, index) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          index={index}
          selectedTasks={selectedTasks}
          editMode={editMode[todo.id] || false}
          attendees={meetingInfo?.attendees || []}
          onShowRelatedTasks={handleShowRelatedTasks}
          onSelectTask={handleSelectTask}
          onEditStart={handleTodoEditStart}
          onEditSave={handleTodoEditSave}
          onEditCancel={handleTodoEditCancel}
          onDelete={handleOpenDeleteModal}
          onTodoChange={handleTodoChange}
          isValidTodo={isValidTodo}
        />
      )),
    [
      todoList,
      selectedTasks,
      editMode,
      meetingInfo?.attendees,
      handleShowRelatedTasks,
      handleSelectTask,
      handleTodoEditStart,
      handleTodoEditSave,
      handleTodoEditCancel,
      handleOpenDeleteModal,
      handleTodoChange,
    ]
  );

  const validTodoCount = useMemo(
    () => todoList.filter(isValidTodo).length,
    [todoList]
  );

  const allValidTasksSelected = useMemo(
    () => selectedTasks.length === validTodoCount && validTodoCount > 0,
    [selectedTasks.length, validTodoCount]
  );

  const allSpeakers = useMemo(
    () =>
      meetingInfo?.attendees?.map((att: any) => ({
        id: att.id,
        name: att.fullName || att.email,
      })) || [],
    [meetingInfo?.attendees]
  );

  // ==================== Render ====================

  if (isLoadingCall || isLoadingMeeting) {
    return (
      <div className="meeting-detail-page">
        <div className="meeting-detail-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin cuộc họp...</p>
        </div>
      </div>
    );
  }

  if (!call || !meetingInfo) {
    return (
      <div className="meeting-detail-page">
        <div className="meeting-detail-error">
          <h3>Không tìm thấy cuộc họp</h3>
          <p>Cuộc họp không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const status = mapCallStatus(call);

  return (
    <div className="meeting-detail-page">
      {/* Header */}
      <div className="meeting-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => router.back()}>
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="meeting-title">
            <h1>{meetingInfo.title || "Meeting Details"}</h1>
          </div>
          <span
            className="meeting-status"
            style={{
              backgroundColor: getStatusColor(meetingInfo?.status || status),
            }}
          >
            {getStatusLabel(meetingInfo?.status || status)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="meeting-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => handleChangeTab("overview")}
        >
          <FileText size={18} />
          Overview
        </button>

        <button
          className={`tab ${activeTab === "recording" ? "active" : ""}`}
          onClick={() => handleChangeTab("recording")}
        >
          <Video size={18} />
          Recording & Transcript
        </button>
      </div>

      {/* Content */}
      <div className="meeting-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            {/* Meeting Info */}
            <div className="meeting-info">
              <div className="section-header">
                <h3>
                  <FileText size={18} />
                  Meeting Details
                </h3>
                {(meetingInfo?.status === 'Scheduled' ||
                  (meetingInfo?.endTime
                    ? new Date(meetingInfo.endTime) > new Date()
                    : call.state.endedAt ? new Date(call.state.endedAt) > new Date()
                      : false)) && (
                    <Button
                      variant="default"
                      className="join-now-btn"
                      onClick={() => handleClickJoinMeeting()}
                    >
                      <Video size={16} />
                      Join Meeting
                    </Button>
                  )}
              </div>

              <div className="info-grid">
                {meetingInfo.description && (
                  <div className="info-row">
                    <div className="info-item full-width">
                      <div className="info-icon">
                        <FileText />
                      </div>
                      <div className="info-content">
                        <label>Description</label>
                        <p>{meetingInfo.description}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="info-row">
                  <div className="info-item">
                    <div className="info-icon">
                      <Clock />
                    </div>
                    <div className="info-content">
                      <label>Start Time</label>
                      <p>{formatDateTime(call.state.startsAt, true)}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <CalendarDays />
                    </div>
                    <div className="info-content">
                      <label>End Time</label>
                      <p>
                        {call.state.startsAt && meetingInfo?.duration
                          ? formatDateTime(
                            new Date(
                              new Date(call.state.startsAt).getTime() +
                              meetingInfo.duration
                            ),
                            true
                          )
                          : "--/--/---- --:--"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <div className="info-icon">
                      <UserCircle />
                    </div>
                    <div className="info-content">
                      <label>Created By</label>
                      <p>{meetingInfo.createdByEmail || "-"}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <CalendarDays />
                    </div>
                    <div className="info-content">
                      <label>Created At</label>
                      <p>{formatDateTime(meetingInfo.createdAt, false)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info */}
            {meetingInfo.projectName && (
              <div className="project-info">
                <h3>
                  <Target size={20} />
                  Related Information
                </h3>
                <div className="info-grid">
                  <div className="info-row">
                    <div className="info-item full-width">
                      <div className="info-icon">
                        <Target />
                      </div>
                      <div className="info-content">
                        <label>Related Project</label>
                        <p>{meetingInfo.projectName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-item full-width">
                      <div className="info-icon">
                        <Milestone />
                      </div>
                      <div className="info-content">
                        <label>Related Milestones</label>
                        <p>{meetingInfo?.milestoneName ?? "No milestone assigned"}</p>
                      </div>
                    </div>
                  </div>
                  {meetingInfo.attendees && meetingInfo.attendees.length > 0 && (
                    <div className="info-row">
                      <div className="info-item full-width">
                        <div className="info-icon">
                          <Users />
                        </div>
                        <div className="info-content">
                          <label>Participants</label>
                          <div className="participants-list">
                            {meetingInfo.attendees.map((attendee: any) => (
                              <span key={attendee.id} className="participant-badge">
                                {attendee.fullName || attendee.email}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "recording" && (
          <div className="recording-section">
            {/* AI Error Banner */}
            {aiProcessingError && (
              <div className="ai-error-banner">
                <div className="error-icon">
                  <AlertTriangleIcon size={20} />
                </div>
                <div className="error-content">
                  <p className="error-title">{aiProcessingError.message}</p>
                  {aiProcessingError.details && (
                    <p className="error-details">{aiProcessingError.details}</p>
                  )}
                </div>
                <button
                  className="error-close-btn"
                  onClick={() => setAiProcessingError(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <h3>
              <Video size={20} />
              Recording & Transcript
            </h3>

            {/* Recordings */}
            <div className="recordings">
              <h4>
                <Video size={18} />
                Meeting Recording
              </h4>

              <div className="recording-list">
                {isLoadingRecordings ? (
                  <div className="recording-loading">
                    <Loader2 className="animate-spin" size={32} />
                    <span>Loading recordings...</span>
                  </div>
                ) : recordingsError ? (
                  <div className="recording-error">
                    <span>{recordingsError}</span>
                  </div>
                ) : meetingInfo.recordUrl ? (
                  <div className="recording-item">
                    <div className="recording-info">
                      <div className="recording-icon">
                        <Play size={20} />
                      </div>
                      <div>
                        <h5>Meeting Recording</h5>
                        <p>Main recording</p>
                      </div>
                    </div>
                    <div className="recording-actions">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(meetingInfo.recordUrl, "_blank")}
                      >
                        <Play size={16} />
                        Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = meetingInfo.recordUrl;
                          a.download = `${meetingInfo.title || "meeting"}.mp4`;
                          a.click();
                        }}
                      >
                        <Download size={16} />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : recordings.length > 0 ? (
                  recordings.map((rec, idx) => (
                    <div key={idx} className="recording-item">
                      <div className="recording-info">
                        <div className="recording-icon">
                          <Play size={20} />
                        </div>
                        <div>
                          <h5>{rec.filename || `Recording ${idx + 1}`}</h5>
                          <p>
                            {rec.start_time
                              ? formatDateTime(rec.start_time, true)
                              : "Stream recording"}{" "}
                            {rec.end_time && (
                              <span className="recording-duration">
                                ({formatDuration(
                                  new Date(rec.end_time).getTime() -
                                  new Date(rec.start_time).getTime()
                                )}
                                )
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="recording-actions">
                        <Button
                          size="sm"
                          onClick={() => window.open(rec.url, "_blank")}
                        >
                          <Play size={16} />
                          Watch
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(rec, idx)}
                          disabled={downloadingId === (rec.url || String(idx))}
                        >
                          {downloadingId === (rec.url || String(idx)) ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Download size={16} />
                          )}
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="recording-empty">
                    <Video size={48} />
                    <p>No recordings available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript */}
            {improvedTranscript.length > 0 && (
              <div className="transcript">
                <div className="transcript-header">
                  <h4>
                    <FileText size={18} />
                    Transcript
                  </h4>

                  <div className="tooltip-wrapper">
                    <Button
                      className="regenerate-btn"
                      variant="outline"
                      onClick={handleRegenerate}
                      disabled={isRegenerating || isProcessingMeetingAI}
                    >
                      {isRegenerating ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      <span>
                        {isRegenerating ? "Regenerating..." : "Re-generate"}
                      </span>
                    </Button>
                    {isRegenerating && (
                      <span className="tooltip-text">
                        AI is regenerating transcript, summary, and to-do list.
                        This may take a few minutes...
                      </span>
                    )}
                  </div>
                </div>

                {isProcessingMeetingAI ? (
                  <div className="transcript-processing">
                    <Loader2 className="animate-spin" size={32} />
                    <span>Processing transcript with AI...</span>
                  </div>
                ) : (
                  <div
                    className={`transcript-content ${isTranscriptExpanded ? "expanded" : ""
                      } ${improvedTranscript.length <= 4 ? "no-expand" : ""}`}
                    style={{
                      maxHeight:
                        improvedTranscript.length <= 4
                          ? "none"
                          : isTranscriptExpanded
                            ? "none"
                            : "200px",
                    }}
                  >
                    <TranscriptPanel
                      meetingId={params.id as string}
                      transcriptItems={improvedTranscript}
                      setTranscriptItems={setImprovedTranscript}
                      allSpeakers={allSpeakers}
                      getSpeakerName={(id) =>
                        getSpeakerName(id, meetingInfo?.attendees || [])
                      }
                      formatTimestamp={formatTimestamp}
                    />
                  </div>
                )}

                {improvedTranscript.length > 4 && (
                  <div
                    className="transcript-expand-hint"
                    onClick={() =>
                      setIsTranscriptExpanded(!isTranscriptExpanded)
                    }
                  >
                    {isTranscriptExpanded ? (
                      <>
                        <span>Collapse transcript</span>
                        <ArrowLeft
                          size={16}
                          style={{ transform: "rotate(90deg)" }}
                        />
                      </>
                    ) : (
                      <>
                        <span>
                          View full transcript ({improvedTranscript.length}{" "}
                          segments)
                        </span>
                        <ArrowLeft
                          size={16}
                          style={{ transform: "rotate(-90deg)" }}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {summary && (
              <div className="summary">
                <div className="summary-header">
                  <div className="summary-title">
                    <div className="ai-icon">
                      <Sparkles size={24} />
                    </div>
                    <div className="summary-title-text">
                      <h4>AI Meeting Summary</h4>
                      <span className="ai-badge">
                        <Sparkles size={12} />
                        POWERED BY GEMINI AI
                      </span>
                    </div>
                  </div>

                  {isProjectManager() && !isEditingSummary && (
                    <button
                      className="edit-summary-btn"
                      onClick={handleStartEditSummary}
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  )}
                </div>

                <div className="summary-content">
                  {isEditingSummary ? (
                    <div className="summary-edit-mode">
                      <textarea
                        className="summary-textarea"
                        value={editingSummaryText}
                        onChange={(e) => setEditingSummaryText(e.target.value)}
                        rows={10}
                        placeholder="Enter meeting summary..."
                      />
                      <div className="summary-edit-actions">
                        <button
                          className="save-summary-btn"
                          onClick={handleSaveSummary}
                          disabled={isSavingSummary}
                        >
                          {isSavingSummary ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                          Save
                        </button>
                        <button onClick={handleCancelEditSummary}>
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  )}
                </div>
              </div>
            )}

            {/* Todos */}
            {todoList.length > 0 && (
              <div className="ai-generated-tasks">
                <div className="ai-tasks-header">
                  <div className="ai-tasks-title">
                    <div className="ai-icon">
                      <Sparkles size={18} />
                    </div>
                    <div className="title-content">
                      <h4>AI-Generated To-do List</h4>
                      <span className="draft-notice">
                        <Edit3 size={12} />
                        Draft - Needs review and editing
                      </span>
                    </div>
                  </div>

                  {isProjectManager() && validTodoCount > 0 && (
                    <div
                      className="select-all-section"
                      onClick={handleSelectAllTasks}
                    >
                      <Checkbox
                        className="select-all-checkbox data-[state=checked]:bg-[#ff5e13] data-[state=checked]:border-[#ff5e13]"
                        checked={allValidTasksSelected}
                      />
                      <span className="select-all-label">
                        Select All ({selectedTasks.length}/{validTodoCount})
                      </span>
                    </div>
                  )}
                </div>

                <div className="task-list">{memoizedTodoList}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB (Floating Action Bar) - Only show on recording tab with selected tasks */}
      {activeTab === "recording" &&
        selectedTasks.length > 0 && fabPosition && (
          <div
            className={`floating-action-bar ${isDragging ? "dragging" : ""}`}
            style={{
              left: `${fabPosition.x}px`,
              top: `${fabPosition.y}px`,
              bottom: "auto",
              right: "auto",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="fab-content">
              <div className="fab-info">
                <span className="fab-count">
                  {selectedTasks.length}{" "}
                  {selectedTasks.length === 1 ? "task" : "tasks"} selected
                </span>
              </div>
              <div className="fab-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedTasks.length === 1) {
                      handleOpenDeleteModal(selectedTasks[0]);
                    } else {
                      setDeleteConfirmModal({
                        isOpen: true,
                        taskId: "multiple",
                      });
                    }
                  }}
                  className="fab-btn fab-btn-delete"
                  title="Delete selected"
                >
                  <Trash2 size={16} />
                  <span className="fab-btn-text">
                    Delete ({selectedTasks.length})
                  </span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenConvertModal}
                  className="fab-btn fab-btn-convert"
                  title="Convert to official tasks"
                >
                  <Target size={16} />
                  <span className="fab-btn-text">
                    Convert ({selectedTasks.length})
                  </span>
                </Button>
              </div>
              <Button
                className="fab-close-btn"
                onClick={() => {
                  setSelectedTasks([]);
                  fabInitializedRef.current = false;
                }}
                title="Close and deselect all"
              >
                <X size={40} />
              </Button>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div
          className="delete-modal-overlay"
          onClick={() => setDeleteConfirmModal({ isOpen: false, taskId: null })}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-icon">
                <Trash2 size={28} />
              </div>
              <h3>Confirm Deletion</h3>
            </div>
            <div className="delete-modal-content">
              <p>Are you sure you want to delete this task?</p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={() =>
                  setDeleteConfirmModal({ isOpen: false, taskId: null })
                }
              >
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDeleteTask}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Confirmation Modal */}
      {convertConfirmModal.isOpen && (
        <div
          className="delete-modal-overlay"
          onClick={() => setConvertConfirmModal({ isOpen: false, taskCount: 0 })}
        >
          <div
            className="delete-modal convert-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="convert-icon">
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h3>Confirm Conversion</h3>
            <div className="delete-modal-content">
              <p>
                Are you sure you want to convert{" "}
                <strong>{convertConfirmModal.taskCount}</strong> to-do
                {convertConfirmModal.taskCount > 1 ? "s" : ""} to task
                {convertConfirmModal.taskCount > 1 ? "s" : ""}?
              </p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={() =>
                  setConvertConfirmModal({ isOpen: false, taskCount: 0 })
                }
              >
                Cancel
              </button>
              <button
                className="confirm-convert-btn"
                onClick={handleConfirmConvert}
              >
                <CheckCircle size={16} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Tasks Sidebar */}
      <RelatedTasksSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        referenceTaskIds={currentReferenceIds}
        todoId={selectedTodoId || undefined}
      />
    </div>
  );
}
