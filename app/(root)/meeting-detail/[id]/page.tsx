"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  VoteIcon,
  CheckCircle,
  Clock,
  Users,
  CalendarDays,
  Milestone,
  UserCircle,
  Check,
  Minus,
  AlertTriangleIcon,
  X,
} from "lucide-react";
import "@/app/styles/meeting-detail.scss";
import { useGetCallById } from "@/hooks/useGetCallById";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { mockMilestones, mockParticipants } from "@/constants/mockData";
import { toast } from "react-toastify";
import { meetingService } from "@/services/meetingService";
import { todoService } from "@/services/todoService";
import TranscriptPanel from "@/components/meeting/TranscriptPanel";
import "react-datepicker/dist/react-datepicker.css";
import { Todo } from "@/types/todo";
import { taskService } from "@/services/taskService";
import { PagingRequest } from "@/types/project";
import TodoCard from "@/components/meeting/TodoCard";
import { RelatedTasksSidebar } from "@/components/meeting/RelatedTasksSidebar";
import { useAuth } from "@/hooks/useAuth";
import { formatTime } from "@/lib/formatDate";

// Environment-configurable API bases
const stripSlash = (s: string) => s.replace(/\/$/, "");
const API_BASE = stripSlash(
  process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:7129/api/v1"
);

// Map Stream call state to a simplified status label
const mapCallStatus = (call?: Call) => {
  if (!call) return "Unknown";
  const starts = call.state.startsAt;
  if (starts && new Date(starts) < new Date()) return "Finished";
  if (starts && new Date(starts) > new Date()) return "Scheduled";
  return "Ongoing";
};

// Helper to format date for display
const formatDateTime = (
  date: Date | string | undefined,
  includeTime: boolean = false
) => {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  const dateStr = `${day}/${month}/${year}`;

  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${dateStr} - ${hours}:${minutes}`;
  }

  return dateStr;
};

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isProjectManager } = useAuth();
  const { call, isLoadingCall } = useGetCallById(params.id as string);
  const [activeTab, setActiveTab] = useState("overview");
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [recordingsError, setRecordingsError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [originalTodoCache, setOriginalTodoCache] = useState<{
    [id: string]: Todo;
  }>({});
  const [originalTranscriptions, setOriginalTranscriptions] = useState<any[]>(
    []
  );
  const [isLoadingTranscriptions, setIsLoadingTranscriptions] = useState(false);
  const [transcriptionsError, setTranscriptionsError] = useState<string | null>(
    null
  );
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    taskId: string | null;
  }>({ isOpen: false, taskId: null });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [convertConfirmModal, setConvertConfirmModal] = useState<{
    isOpen: boolean;
    taskCount: number;
  }>({ isOpen: false, taskCount: 0 });
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState(true);
  const [todosFromDB, setTodosFromDB] = useState<any[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);

  // State để lưu kết quả
  const [improvedTranscript, setImprovedTranscript] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [todoList, setTodoList] = useState<any[]>([]);
  const [isProcessingMeetingAI, setIsProcessingMeetingAI] =
    useState<boolean>(false);

  const [projectTasks, setProjectTasks] = useState<any[]>([]);

  // Sidebar related state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentReferenceIds, setCurrentReferenceIds] = useState<string[]>([]);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  // Re-generation state
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Summary edit state
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editingSummaryText, setEditingSummaryText] = useState("");
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  // AI Processing Error state
  const [aiProcessingError, setAiProcessingError] = useState<{
    message: string;
    details?: string;
    timestamp: number;
  } | null>(null);

  // Floating Action Bar position state
  const [fabPosition, setFabPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fabInitializedRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const fetchProjectTasks = async (
    projectId: string,
    params: PagingRequest = { pageIndex: 1, pageSize: 100 }
  ) => {
    const tasksResponse = await taskService.getTasksByProjectId(
      projectId,
      params
    );
    if (tasksResponse.success && tasksResponse.data) {
      setProjectTasks(tasksResponse.data.items || []);
    } else {
      setProjectTasks([]);
    }
  };

  // Fetch recordings when switching to recording tab and call is available
  useEffect(() => {
    const loadRecordings = async () => {
      if (!call) return;

      // If we already have recordUrl in DB, no need to load from Stream
      if (meetingInfo?.recordUrl) {
        setRecordings([]);
        setIsLoadingRecordings(false);
        return;
      }

      setIsLoadingRecordings(true);
      setRecordingsError(null);
      try {
        const res = await call.queryRecordings();
        setRecordings(res.recordings || []);
      } catch (e: any) {
        setRecordingsError("Failed to load meeting recordings");
      } finally {
        setIsLoadingRecordings(false);
      }
    };
    if (activeTab === "recording") {
      loadRecordings();
    }
  }, [activeTab, call, meetingInfo?.recordUrl]);

  // Fetch transcriptions when switching to recording tab
  useEffect(() => {
    const loadTranscriptions = async () => {
      if (!call?.id) return;
      setIsLoadingTranscriptions(true);
      setTranscriptionsError(null);
      try {
        const response = await fetch(
          `${API_BASE}/stream/call/default/${call.id}/transcriptions`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOriginalTranscriptions(data || []);
      } catch (e: any) {
        // console.error("Failed to fetch transcriptions", e);
        // setTranscriptionsError("Không tải được transcript");
      } finally {
        setIsLoadingTranscriptions(false);
      }
    };
    if (activeTab === "recording") {
      loadTranscriptions();
      fetchProjectTasks(meetingInfo?.projectId);
    }
  }, [activeTab, call]);

  // Fetch lại active tab từ localStorage khi mount page
  useEffect(() => {
    // Fetch lại active tab từ localStorage khi mount page
    const savedTab = localStorage.getItem("meetingDetailActiveTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
    // Cleanup: when page/component unmounts, remove saved tab
    return () => {
      localStorage.removeItem("meetingDetailActiveTab");
    };
  }, []);

  const handleChangeTab = (tabKey: any) => {
    setActiveTab(tabKey);
    localStorage.setItem("meetingDetailActiveTab", tabKey);
  };

  const hasProcessedRef = useRef(false);

  // Call API to process meeting
  const processVideo = async (
    recording: any,
    transcriptions: any,
    tasks: any[]
  ) => {
    // Clear previous error when starting new process
    setAiProcessingError(null);
    setIsProcessingMeetingAI(true);

    try {
      // 1) Use recording URL from DB (should already be uploaded during end meeting)
      let cloudRecordingUrl = meetingInfo?.recordUrl || null;
      let isUsingStreamUrl = false;
      
      // Fallback: If somehow recordUrl is not in DB, use Stream URL directly
      if (!cloudRecordingUrl && recording?.url) {
        console.warn("⚠️ Recording URL not found in DB, using Stream URL as fallback");
        cloudRecordingUrl = recording.url;
        isUsingStreamUrl = true;
      }

      if (!cloudRecordingUrl) {
        throw new Error("No recording URL available");
      }

      console.log("Cloud recording URL:", cloudRecordingUrl);
      console.log("Is using Stream URL:", isUsingStreamUrl);
      console.log("Transcriptions:", transcriptions);
      console.log("Tasks:", tasks);

      // 2) Call API to process video
      const response = await fetch("/api/gemini/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: cloudRecordingUrl,
          transcriptSegments: transcriptions,
          tasks: tasks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process video");
      }

      if (data.success) {
        // Update state with AI results
        setImprovedTranscript(data.data.improvedTranscript);
        const processedSummary = mapSummaryAssigneeIds(data.data.summary);
        setSummary(processedSummary);
        setTodoList(data.data.todoList);

        // 3) Update meeting on server
        // IMPORTANT: Only save recordUrl if it's NOT a Stream URL (temporary)
        try {
          const updatePayload: any = {
            meetingId: params.id as string,
            summary: data.data.summary,
            transcription: JSON.stringify(data.data.improvedTranscript),
          };

          // Only include recordUrl if it's a permanent Cloudinary URL
          if (!isUsingStreamUrl && cloudRecordingUrl) {
            updatePayload.recordUrl = cloudRecordingUrl;
          }

          const updateResult = await meetingService.updateMeeting(updatePayload);

          if (updateResult.success) {
            setMeetingInfo((prev: any) => ({
              ...prev,
              summary: data.data.summary,
              transcription: JSON.stringify(data.data.improvedTranscript),
              // Only update recordUrl in state if it's permanent
              ...((!isUsingStreamUrl && cloudRecordingUrl) ? { recordUrl: cloudRecordingUrl } : {}),
              todoList: JSON.stringify(data.data.todoList),
            }));
          } else {
            // Don't throw, just log/show light notification if needed
          }
        } catch (updateError) {
          // Don't re-throw to avoid losing AI results, but show local error if desired
        }

        // 4) Create todos from AI if available (keep existing logic, use meetingInfo to map assignee)
        if (data.data.todoList && data.data.todoList.length > 0) {
          try {
            const mappedTodoList = data.data.todoList.map((todo: any) => {
              let validAssigneeId = todo.assigneeId;
              if (todo.assigneeId && meetingInfo?.attendees) {
                const attendee = meetingInfo.attendees.find(
                  (att: any) => att.id === todo.assigneeId
                );
                if (!attendee) {
                  validAssigneeId = meetingInfo?.createdById;
                }
              } else {
                validAssigneeId = meetingInfo?.createdById;
              }

              function normalizeDate(val: any) {
                if (!val) return null;
                if (
                  typeof val === "string" &&
                  /^\d{2}-\d{2}-\d{4}$/.test(val)
                ) {
                  const [dd, mm, yyyy] = val.split("-");
                  return new Date(`${yyyy}-${mm}-${dd}`).toISOString();
                }
                // If YYYY-MM-DD, convert to ISO for safety
                if (
                  typeof val === "string" &&
                  /^\d{4}-\d{2}-\d{2}$/.test(val)
                ) {
                  return new Date(val).toISOString();
                }
                // If already a Date object
                if (val instanceof Date) return val.toISOString();
                return val;
              }

              return {
                ...todo,
                assigneeId: validAssigneeId,
                endDate: normalizeDate(todo.endDate),
                startDate: normalizeDate(todo.startDate),
              };
            });

            const createTodosResult = await todoService.createTodosFromAI(
              params.id as string,
              mappedTodoList
            );

            if (createTodosResult.success) {
              toast.success(
                `${createTodosResult.data?.length || 0} tasks created from AI`
              );
              const refreshResult = await todoService.getTodosByMeetingId(
                params.id as string
              );
              if (refreshResult.success && refreshResult.data) {
                setTodosFromDB(refreshResult.data);
                setTodoList(refreshResult.data);
              }
            } else {
              toast.warning(
                "Failed to create tasks from AI: " + createTodosResult.error
              );
            }
          } catch (todoError) {
            toast.error("Failed to create tasks from AI");
          }
        }
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
      console.error("❌ processVideo error:", err);
      
      // Hiển thị lỗi trực tiếp trên UI thay vì toast
      const errorMessage = err?.message || "Unknown error occurred during video processing";
      
      setAiProcessingError({
        message: "Failed to process meeting video",
        details: errorMessage,
        timestamp: Date.now(),
      });
      
      // Don't continue with partial/invalid data
      throw err;
    } finally {
      // Always reset processing state, whether success or error
      setIsProcessingMeetingAI(false);
    }
  };

  // Call API to regenerate meeting AI content
  const handleRegenerate = async () => {
    if (!call?.id || !meetingInfo) {
      toast.error("Meeting information not available");
      return;
    }

    // Clear previous error khi retry
    setAiProcessingError(null);
    
    setIsRegenerating(true);
    setIsProcessingMeetingAI(true);

    try {
      // 1. Get recording URL from DB (should already be uploaded)
      let cloudRecordingUrl = meetingInfo?.recordUrl || null;

      // Fallback: If no recordUrl in DB, use Stream URL
      if (!cloudRecordingUrl && recordings.length > 0 && recordings[0]?.url) {
        console.warn("⚠️ Recording URL not in DB, using Stream URL as fallback");
        cloudRecordingUrl = recordings[0].url;
      }

      if (!cloudRecordingUrl) {
        toast.warning("No recording URL available for regeneration");
        return;
      }

      // 2. Call Gemini API to re-process video
      const geminiResponse = await fetch("/api/gemini/process-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: cloudRecordingUrl,
          transcriptSegments: originalTranscriptions,
          tasks: projectTasks,
        }),
      });

      const geminiData = await geminiResponse.json();

      if (!geminiResponse.ok || !geminiData.success) {
        throw new Error(geminiData.error || "Failed to regenerate AI content");
      }

      // 3. Update local state immediately for instant feedback
      setImprovedTranscript(geminiData.data.improvedTranscript);
      const processedSummary = mapSummaryAssigneeIds(geminiData.data.summary);
      setSummary(processedSummary);

      // 4. Prepare todos for backend
      const mappedTodos = (geminiData.data.todoList || []).map((todo: any) => {
        // Validate and map assigneeId
        let validAssigneeId = todo.assigneeId;

        if (todo.assigneeId && meetingInfo?.attendees) {
          const attendee = meetingInfo.attendees.find(
            (att: any) => att.id === todo.assigneeId
          );
          if (!attendee) {
            validAssigneeId = meetingInfo?.createdById;
          }
        } else {
          validAssigneeId = meetingInfo?.createdById;
        }

        return {
          meetingId: params.id as string,
          assigneeId: validAssigneeId,
          title: todo.title || "Untitled Task",
          description: todo.description || "",
          startDate: todo.startDate
            ? new Date(todo.startDate).toISOString()
            : null,
          endDate: todo.endDate ? new Date(todo.endDate).toISOString() : null,
          referenceTaskIds: [], // Empty for AI-generated todos
        };
      });

      // 5. Call single backend API to update everything (meeting + todos)
      const regenerateResult = await meetingService.regenerateMeetingAIData({
        meetingId: params.id as string,
        transcription: JSON.stringify(geminiData.data.improvedTranscript),
        summary: geminiData.data.summary,
        recordUrl: cloudRecordingUrl,
        todos: mappedTodos,
      });
      if (regenerateResult.success) {
        // 6. Update local meeting info with backend response
        if (regenerateResult.data) {
          setMeetingInfo((prev: any) => ({
            ...prev,
            summary: regenerateResult?.data?.summary,
            transcription: regenerateResult.data?.transcription,
            recordUrl: regenerateResult.data?.recordUrl,
            updatedAt: regenerateResult.data?.updatedAt,
          }));
        }
        // 7. Refresh todos from database
        const refreshResult = await todoService.getTodosByMeetingId(
          params.id as string
        );
        if (refreshResult.success && refreshResult.data) {
          setTodosFromDB(refreshResult.data);
          setTodoList(refreshResult.data);
        }
        // 8. Show success message
        const todosCreated = mappedTodos.length;
        toast.success(
          `AI content regenerated successfully! Created ${todosCreated} new todos.`
        );
      }
    } catch (err: any) {
      console.error("❌ Regeneration error:", err);
      
      // Hiển thị lỗi trực tiếp trên UI thay vì toast
      const errorMessage = err?.message || "Unknown error occurred during regeneration";
      
      setAiProcessingError({
        message: "Failed to regenerate AI content",
        details: errorMessage,
        timestamp: Date.now(),
      });
    } finally {
      setIsRegenerating(false);
      setIsProcessingMeetingAI(false);
    }
  };

  // Handle edit summary
  const handleStartEditSummary = () => {
    setEditingSummaryText(summary);
    setIsEditingSummary(true);
  };

  const handleCancelEditSummary = () => {
    setIsEditingSummary(false);
    setEditingSummaryText("");
  };

  const handleSaveSummary = async () => {
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
        toast.success("Summary updated successfully");
      } else {
        toast.error(result.error || "Failed to update summary");
      }
    } catch (error) {
      toast.error("Error updating summary");
    } finally {
      setIsSavingSummary(false);
    }
  };

  // useEffect to auto-call processVideo when data is ready and no result yet
  useEffect(() => {
    // Only process when meetingInfo has finished loading
    if (isLoadingMeeting) {
      return;
    }

    // Check if AI data already exists in DB
    if (
      meetingInfo?.summary ||
      meetingInfo?.transcription ||
      todosFromDB.length > 0
    ) {
      // Parse data from DB and display
      if (meetingInfo.transcription) {
        const parsedTranscript = parseTranscription(meetingInfo.transcription);
        setImprovedTranscript(parsedTranscript);
      }
      if (meetingInfo.summary) {
        // Map assigneeId to name in summary from DB
        const processedSummary = mapSummaryAssigneeIds(meetingInfo.summary);
        setSummary(processedSummary);
      }
      // Use todos from DB instead of from meetingInfo
      if (todosFromDB.length > 0) {
        setTodoList(todosFromDB);
        console.log("Todos from DB:", todosFromDB);
      }
      hasProcessedRef.current = true;
      return;
    }
    console.log("processVideo - checking conditions:", {
      originalTranscriptionsLength: originalTranscriptions?.length,
      recordingsLength: recordings?.length,
      recordingUrl: recordings[0]?.url,
      meetingInfoLoaded: !isLoadingMeeting,
      todosFromDBLength: todosFromDB.length,
      meetingInfoRecordUrl: meetingInfo?.recordUrl,
    });
    
    // Only call AI when no existing data and all required info is available
    if (
      !originalTranscriptions ||
      originalTranscriptions.length === 0
    ) {
      console.log("⏸️ Waiting for transcriptions...");
      return;
    }

    // Check if we have recording URL (from DB or Stream)
    const hasRecordingUrl = meetingInfo?.recordUrl || recordings[0]?.url;
    if (!hasRecordingUrl) {
      console.log("⏸️ Waiting for recording URL...");
      return;
    }

    if (hasProcessedRef.current) {
      return;
    }

    hasProcessedRef.current = true;
    
    // Show info if using temporary Stream URL
    if (!meetingInfo?.recordUrl && recordings[0]?.url) {
      console.warn("⚠️ Using temporary Stream URL for AI processing. Recording will be uploaded permanently on next access.");
      toast.info("Processing meeting with temporary recording link. Upload will happen in background.", {
        autoClose: 5000,
      });
    }
    
    // Process video with error handling
    processVideo(recordings[0], originalTranscriptions, projectTasks).catch((error) => {
      console.error("❌ Auto-process video failed:", error);
      // Error already displayed in processVideo's catch block
      // Reset ref to allow manual retry
      hasProcessedRef.current = false;
    });
  }, [
    originalTranscriptions,
    recordings,
    meetingInfo,
    isLoadingMeeting,
    todosFromDB,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "#47D69D";
      case "Finished":
        return "#A41F39";
      case "Ongoing":
        return "#ebca25";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "Scheduled";
      case "Finished":
        return "Finished";
      case "Ongoing":
        return "Ongoing";
      default:
        return status;
    }
  };

  // Format duration from milliseconds -> HH:MM:SS (hide hours if = 0)
  const formatDuration = (ms: number) => {
    if (ms < 0 || !Number.isFinite(ms)) return "-";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  // Format timestamp from milliseconds to MM:SS
  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor(timestamp / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Get speaker name from speakerId using attendees data
  const getSpeakerName = (speakerId: string) => {
    // First try to find in attendees array
    if (meetingInfo?.attendees) {
      const attendee = meetingInfo.attendees.find(
        (att: any) => att.id === speakerId
      );
      if (attendee?.fullName) {
        return attendee.fullName;
      }
    }
  };

  // Helper function to parse transcription from string to array
  const parseTranscription = (transcriptionString?: string): any[] => {
    if (!transcriptionString) return [];
    try {
      return JSON.parse(transcriptionString);
    } catch (error) {
      // console.error("Error parsing transcription:", error);
      return [];
    }
  };

  // Helper function to map assigneeId to name
  const mapAssigneeIdToName = (assigneeId: string): string => {
    if (!assigneeId || !meetingInfo?.attendees) return assigneeId;

    const attendee = meetingInfo.attendees.find(
      (att: any) => att.id === assigneeId
    );
    return attendee?.fullName || attendee?.email || assigneeId;
  };

  // Helper function to get assignee name from todo
  const getTodoAssigneeName = (todo: any): string => {
    if (todo.assignee?.fullName) {
      return todo.assignee.fullName;
    }
    if (todo.assignee?.email) {
      return todo.assignee.email;
    }
    if (todo.assigneeId) {
      return mapAssigneeIdToName(todo.assigneeId);
    }
    return "Unassigned";
  };

  // Helper function to get assigneeId from todo (handles both AI and DB formats)
  const getTodoAssigneeId = (todo: any): string | null => {
    // If todo has assigneeId (from AI or manual assignment)
    if (todo.assigneeId) {
      return todo.assigneeId;
    }

    // If todo has assignee object (from DB)
    if (todo.assignee?.id) {
      return todo.assignee.id;
    }

    return null;
  };

  // Helper function to map assigneeId to name in summary text
  const mapSummaryAssigneeIds = (summaryText: string): string => {
    if (!summaryText || !meetingInfo?.attendees) return summaryText;

    let processedSummary = summaryText;

    meetingInfo.attendees.forEach((attendee: any) => {
      const regex = new RegExp(attendee.id, "g");
      processedSummary = processedSummary.replace(
        regex,
        attendee.fullName || attendee.email
      );
    });

    return processedSummary;
  };

  // Helper to format date to DD/MM/YYYY
  function formatDate(dateString?: string | Date): string {
    if (!dateString) return "--/--/----";
    const dateObj =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(dateObj.getTime())) return "--/--/----";
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // Helper to validate todo has all required fields
  function isValidTodo(todo: any) {
    return (
      todo.status !== 2 && // ConvertedToTask
      todo.status !== 3 // Deleted
    );
  }

  // Xử lý mở modal xác nhận xóa task
  const handleOpenDeleteModal = (taskId: string) => {
    setDeleteConfirmModal({ isOpen: true, taskId });
  };

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!deleteConfirmModal.taskId) return;

    try {
      // Call API to delete todo
      const deleteResult = await todoService.deleteTodo(
        deleteConfirmModal.taskId
      );

      if (deleteResult.success) {
        // Update local state
        setTodoList((prev) =>
          prev.filter((task) => task.id !== deleteConfirmModal.taskId)
        );
        setTodosFromDB((prev) =>
          prev.filter((task) => task.id !== deleteConfirmModal.taskId)
        );

        toast.success("Xóa công việc thành công");
        setDeleteConfirmModal({ isOpen: false, taskId: null });
      } else {
        toast.error("Không thể xóa công việc: " + deleteResult.error);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa công việc");
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, taskId: null });
  };

  // Handle select/deselect task
  const handleSelectTask = (taskId: string) => {
    const todo = todoList.find((t) => t.id === taskId);
    if (!isValidTodo(todo)) {
      toast.warning("To-do has been converted or missing required information");
      return;
    }
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Handle select all tasks
  const handleSelectAllTasks = () => {
    console.log(
      "handleSelectAllTasks - todoList:",
      todoList.filter((t) => isValidTodo(t)).length
    );
    const eligibleIds = todoList
      .filter(
        (t) =>
          isValidTodo(t) &&
          t.status !== 2 && // ConvertedToTask
          t.status !== 3 // Deleted
      )
      .map((t) => t.id);
    if (selectedTasks.length === eligibleIds.length) setSelectedTasks([]);
    else setSelectedTasks(eligibleIds);
  };

  // Handle open convert modal
  const handleOpenConvertModal = () => {
    setConvertConfirmModal({ isOpen: true, taskCount: selectedTasks.length });
  };

  // Handle confirm convert
  const handleConfirmConvert = async () => {
    if (selectedTasks.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một công việc để chuyển đổi!");
      return;
    }

    try {
      const result = await todoService.convertTodosToTasks(selectedTasks);

      if (result.success) {
        toast.success(
          `Chuyển đổi thành công ${result.data?.length} công việc sang dự án!`
        );
        // Clear selection and close modal
        setSelectedTasks([]);
        setConvertConfirmModal({ isOpen: false, taskCount: 0 });

        if (meetingInfo?.projectId) {
          // Navigate to project detail page
          setTimeout(() => {
            router.push(`/projects/${meetingInfo.projectId}?tab=board`);
          }, 600);
        }
      } else {
        toast.error(result.error || "Unable to convert selected to-dos!");
        setConvertConfirmModal({ isOpen: false, taskCount: 0 });
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi chuyển đổi công việc!");
      setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    }

    setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    setSelectedTasks([]);
  };

  // Handle cancel convert
  const handleCancelConvert = () => {
    setConvertConfirmModal({ isOpen: false, taskCount: 0 });
  };

  // Helper function to get status badge style
  const getTodoStatusStyle = (status: number) => {
    switch (status) {
      case 0: // Generated
        return {
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          color: "white",
        };
      case 1: // UnderReview
        return {
          background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
          color: "white",
        };
      case 2: // ConvertedToTask
        return {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        };
      case 3: // Deleted
        return {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        };
      default:
        return {
          background: "#f3f4f6",
          color: "#6b7280",
        };
    }
  };

  // Helper function to get status label
  const getTodoStatusLabel = (statusDisplay: string) => {
    switch (statusDisplay) {
      case "Generated":
        return "New";
      case "UnderReview":
        return "Edited";
      case "ConvertedToTask":
        return "Converted to task";
      case "Deleted":
        return "Deleted";
      default:
        return statusDisplay;
    }
  };

  // Đây là hàm callback truyền cho TodoCard
  const handleShowRelatedTasks = (todo: Todo) => {
    setCurrentReferenceIds(todo.referencedTasks || []);
    setSidebarOpen(true);
    setSelectedTodoId(todo.id);
  };

  // Memoize todo list rendering to prevent unnecessary re-renders
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
          onShowRelatedTasks={(todo: Todo) => handleShowRelatedTasks(todo)}
          onSelectTask={handleSelectTask}
          onEditStart={(todoId, originalTodo) => {
            setEditMode((prev) => ({ ...prev, [todoId]: true }));
            setOriginalTodoCache((prev) => ({
              ...prev,
              [todoId]: originalTodo as Todo,
            }));
          }}
          onEditSave={async (todo) => {
            try {
              const newAssigneeId = todo.assigneeId || todo.assignee?.id;
              const updateResult = await todoService.updateTodo(todo.id, {
                title: todo.title,
                description: todo.description,
                startDate: todo.startDate,
                endDate: todo.endDate,
                assigneeId: newAssigneeId,
              });
              // console.log("Update todo result:", updateResult);

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

                setTodoList((prev) =>
                  prev.map((t) => (t.id === todo.id ? updatedTodo : t))
                );
                setTodosFromDB((prev) =>
                  prev.map((t) => (t.id === todo.id ? updatedTodo : t))
                );

                toast.success("Cập nhật công việc thành công");

                setOriginalTodoCache((prev) => {
                  const copy = { ...prev };
                  delete copy[todo.id];
                  return copy;
                });

                setEditMode((prev) => ({ ...prev, [todo.id]: false }));
              } else {
                toast.error(
                  "Không thể cập nhật công việc: " + updateResult.error
                );
              }
            } catch (error) {
              toast.error("Lỗi khi cập nhật công việc");
            }
          }}
          onEditCancel={(todoId) => {
            if (originalTodoCache[todoId]) {
              setTodoList((prev) =>
                prev.map((t) =>
                  t.id === todoId ? originalTodoCache[todoId] : t
                )
              );
              setTodosFromDB((prev) =>
                prev.map((t) =>
                  t.id === todoId ? originalTodoCache[todoId] : t
                )
              );
              setOriginalTodoCache((prev) => {
                const c = { ...prev };
                delete c[todoId];
                return c;
              });
            }
            setEditMode((prev) => ({ ...prev, [todoId]: false }));
          }}
          onDelete={handleOpenDeleteModal}
          onTodoChange={(todoId, updates) => {
            setTodoList((prev) =>
              prev.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
            );
          }}
          isValidTodo={isValidTodo}
        />
      )),
    [
      todoList,
      selectedTasks,
      editMode,
      meetingInfo?.attendees,
      originalTodoCache,
    ]
  );

  // Handle recording download (download blob to ensure proper filename)
  const handleDownload = async (rec: CallRecording, fallbackIndex: number) => {
    if (!rec.url) return;
    try {
      const uniqueId = rec.url || String(fallbackIndex);
      setDownloadingId(uniqueId);
      const res = await fetch(rec.url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const contentType = blob.type || "video/mp4";
      const extensionFromType = contentType.includes("mp4")
        ? "mp4"
        : contentType.includes("webm")
        ? "webm"
        : "mp4";
      const baseName =
        rec.filename
          ?.replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9-_\.]/g, "")
          .replace(/-{2,}/g, "-") || `recording-${fallbackIndex + 1}`;
      const finalName = baseName.endsWith(extensionFromType)
        ? baseName
        : `${baseName}.${extensionFromType}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Tải xuống thất bại. Vui lòng thử lại.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    async function fetchMeeting() {
      // console.log("🔄 Fetching meeting info for ID:", params.id);
      setIsLoadingMeeting(true);
      try {
        const res = await meetingService.getMeetingById(params.id as string);
        // console.log("📋 Meeting fetch response:", res);

        if (res.success && res.data) {
          setMeetingInfo(res.data);
          // console.log("✅ Meeting info loaded:", res.data);
        } else {
          // console.log("❌ Failed to load meeting info");
          setMeetingInfo(null);
        }
      } catch (err) {
        // console.error("❌ Error loading meeting info:", err);
        setMeetingInfo(null);
      } finally {
        setIsLoadingMeeting(false);
      }
    }
    fetchMeeting();
  }, [params.id]);

  // Load todos from DB
  useEffect(() => {
    async function fetchTodos() {
      if (!params.id) {
        // console.log("❌ No meeting ID, skipping todo fetch");
        return;
      }

      // console.log("🔄 Fetching todos for meeting:", params.id);
      setIsLoadingTodos(true);
      try {
        const res = await todoService.getTodosByMeetingId(params.id as string);
        // console.log("📋 Todo fetch response:", res);

        if (res.success && res.data) {
          setTodosFromDB(res.data);
          // console.log("✅ Loaded todos from DB:", res.data);
        } else {
          // console.log("ℹ️ No todos found in DB or API error");
          setTodosFromDB([]);
        }
      } catch (err) {
        // console.error("❌ Error loading todos:", err);
        setTodosFromDB([]);
      } finally {
        setIsLoadingTodos(false);
      }
    }
    fetchTodos();
  }, [params.id]);

  // Add new handler for deleting multiple tasks
  const handleDeleteMultipleTasks = async () => {
    if (selectedTasks.length === 0) return;

    try {
      // Delete all selected tasks
      const deletePromises = selectedTasks.map((taskId) =>
        todoService.deleteTodo(taskId)
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        setTodoList((prev) =>
          prev.filter((task) => !selectedTasks.includes(task.id))
        );
        setTodosFromDB((prev) =>
          prev.filter((task) => !selectedTasks.includes(task.id))
        );

        toast.success(
          `Successfully deleted ${successCount} task${
            successCount > 1 ? "s" : ""
          }`
        );
      }

      if (successCount < selectedTasks.length) {
        toast.warning(
          `Failed to delete ${selectedTasks.length - successCount} task${
            selectedTasks.length - successCount > 1 ? "s" : ""
          }`
        );
      }

      setSelectedTasks([]);
      setDeleteConfirmModal({ isOpen: false, taskId: null });
    } catch (error) {
      toast.error("Error deleting tasks");
      setDeleteConfirmModal({ isOpen: false, taskId: null });
    }
  };

  // Track mouse position to position FAB near cursor when first appearing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only track before FAB is initialized
      if (
        !fabInitializedRef.current &&
        selectedTasks.length > 0 &&
        !fabPosition
      ) {
        // Position FAB slightly above and to the right of cursor
        const x = Math.min(e.clientX + 20, window.innerWidth - 600); // offset right + check bounds
        const y = Math.max(e.clientY - 100, 20); // offset up + check bounds

        setFabPosition({ x, y });
        fabInitializedRef.current = true;
      }
    };

    if (selectedTasks.length > 0 && !fabPosition) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [selectedTasks.length, fabPosition]);

  // Set FAB position immediately when first task is selected
  useEffect(() => {
    if (
      selectedTasks.length > 0 &&
      !fabInitializedRef.current &&
      !fabPosition
    ) {
      const { x: mouseX, y: mouseY } = lastMousePosRef.current;

      // Position FAB slightly above and to the right of last known cursor position
      const x = Math.min(mouseX + 600, window.innerWidth - 600);
      const y = mouseY + 200;

      setFabPosition({ x, y });
      fabInitializedRef.current = true;
    }
  }, [selectedTasks.length, fabPosition]);

  // Reset FAB position when all tasks are deselected
  useEffect(() => {
    if (selectedTasks.length === 0) {
      fabInitializedRef.current = false;
      setFabPosition(null);
    }
  }, [selectedTasks.length]);

  // Handle FAB drag start
  const handleFabMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".fab-btn")) return; // Don't drag when clicking buttons

    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle FAB drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - 500; // FAB width
      const maxY = window.innerHeight - 100; // FAB height

      setFabPosition({
        x: Math.max(20, Math.min(newX, maxX)),
        y: Math.max(20, Math.min(newY, maxY)),
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

  if (isLoadingCall || isLoadingMeeting) {
    return (
      <div className="meeting-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading meeting information...</p>
      </div>
    );
  }

  if (!call || !meetingInfo) {
    return (
      <div className="meeting-detail-error">
        <h3>Meeting Not Found</h3>
        <p>
          This meeting does not exist or you do not have permission to access
          it.
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  const getMilestoneName = (milestoneId: string) => {
    const milestone = mockMilestones.find((m) => m.id === milestoneId);
    return milestone ? milestone.name : "No milestone assigned";
  };
  const getParticipantEmail = (participantId: string) => {
    const participant = mockParticipants.find((p) => p.id === participantId);
    return participant ? participant.email : "No email assigned";
  };

  // Derived info from call
  const status = mapCallStatus(call);
  const description =
    (call.state.custom as any)?.description || "(No description)";
  const createdBy =
    call.state.createdBy?.name ||
    (call.state.createdBy as any)?.id ||
    "Anonymous";
  const createdAt = call.state.createdAt
    ? new Date(call.state.createdAt)
    : undefined;
  const startsAt = call.state.startsAt
    ? new Date(call.state.startsAt)
    : undefined;
  const endsAt = call.state.endedAt ? new Date(call.state.endedAt) : undefined;
  const milestoneId = (call.state.custom as any)?.milestoneId || null;
  const milestoneName = milestoneId
    ? getMilestoneName(milestoneId)
    : "No milestone assigned";
  const participants: string[] = (call.state.custom as any)?.participants || [];
  const createdById = call.state.createdBy?.id;
  // Filter out creator from participants list
  const displayParticipants = participants.filter((p) => p !== createdById);
  const participantEmails: string[] =
    displayParticipants.map(getParticipantEmail);
  // Handle join meeting button click
  const handleClickJoinMeeting = () => {
    router.push(`${process.env.NEXT_PUBLIC_FE_URL}/meeting/${meetingInfo.id}`);
  };
  return (
    <div className="meeting-detail-page">
      {/* Header */}
      <div className="meeting-header">
        <div className="header-left">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="back-btn"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div className="meeting-title">
            <h1>
              {meetingInfo?.title || call.state?.custom?.title || call.id}
            </h1>
            <div className="meeting-meta">
              <span className="project-name">
                {meetingInfo?.projectName || "Meeting"}
              </span>
            </div>
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
          <FileText size={16} />
          Overview
        </button>
        <button
          className={`tab ${activeTab === "recording" ? "active" : ""}`}
          onClick={() => handleChangeTab("recording")}
        >
          <Video size={16} />
          Recording & Transcript
        </button>
      </div>

      {/* Content */}
      <div className="meeting-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="meeting-info">
              <div className="section-header">
                <h3>
                  <FileText size={18} />
                  Meeting Details
                </h3>
                {(meetingInfo?.endTime
                  ? new Date(meetingInfo.endTime) > new Date()
                  : endsAt
                  ? endsAt > new Date()
                  : false) && (
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
                <div className="info-item full-width">
                  <div className="info-icon">
                    <FileText size={16} />
                  </div>
                  <div className="info-content">
                    <label>Title</label>
                    <p>
                      {meetingInfo?.title ||
                        call.state?.custom?.title ||
                        call.id}
                    </p>
                  </div>
                </div>

                <div className="info-item full-width">
                  <div className="info-icon">
                    <Edit3 size={16} />
                  </div>
                  <div className="info-content">
                    <label>Description</label>
                    <p>{meetingInfo?.description || description}</p>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <div className="info-icon">
                      <Clock size={16} />
                    </div>
                    <div className="info-content">
                      <label>Start Time</label>
                      <p>
                        {formatDateTime(
                          meetingInfo?.startTime || startsAt,
                          true
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Clock size={16} />
                    </div>
                    <div className="info-content">
                      <label>End Time</label>
                      <p>
                        {formatDateTime(meetingInfo?.endTime || endsAt, true)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <div className="info-icon">
                      <UserCircle size={16} />
                    </div>
                    <div className="info-content">
                      <label>Created By</label>
                      <p>{meetingInfo?.createdByEmail || createdBy}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <CalendarDays size={16} />
                    </div>
                    <div className="info-content">
                      <label>Created At</label>
                      <p>
                        {formatDateTime(meetingInfo?.createdAt || createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project and Milestone Info */}
            <div className="project-info">
              <h3>
                <Target size={18} />
                Project Information
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <Target size={16} />
                  </div>
                  <div className="info-content">
                    <label>Project</label>
                    <p>
                      {meetingInfo?.projectName ||
                        "MSP Project Management System"}
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <Milestone size={16} />
                  </div>
                  <div className="info-content">
                    <label>Related Milestone</label>
                    <p>{meetingInfo?.milestoneName || milestoneName}</p>
                  </div>
                </div>

                <div className="info-item full-width">
                  <div className="info-icon">
                    <Users size={16} />
                  </div>
                  <div className="info-content">
                    <label>Attendees</label>
                    <div className="participants-list">
                      {meetingInfo?.attendees?.length > 0 ? (
                        meetingInfo.attendees.map((att: any) => (
                          <span className="participant-badge" key={att.id}>
                            {att.fullName || att.email}
                          </span>
                        ))
                      ) : (
                        <p className="no-participants">No attendees</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "recording" && (
          <div className="recording-section">
            <h3>Recording & Transcript</h3>
            <div className="recording-content">
              <div className="recordings">
                <h4>Meeting Recording</h4>
                <div className="recording-list">
                  {isLoadingRecordings && (
                    <div className="recording-loading">
                      Loading recordings...
                    </div>
                  )}
                  {recordingsError && !isLoadingRecordings && (
                    <div className="recording-error">{recordingsError}</div>
                  )}
                  {!isLoadingRecordings &&
                    !recordingsError &&
                    (() => {
                      // Prioritize showing recordUrl from DB
                      if (meetingInfo?.recordUrl) {
                        return (
                          <div className="recording-item" key="db-recording">
                            <div className="recording-info">
                              <div className="recording-icon">
                                <Video size={20} />
                              </div>
                              <div>
                                <h5>Meeting Recording</h5>
                                <p>
                                  {meetingInfo.updatedAt
                                    ? formatDateTime(meetingInfo.updatedAt)
                                    : "-"}
                                </p>
                              </div>
                            </div>
                            <div className="recording-actions">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(meetingInfo.recordUrl, "_blank")
                                }
                              >
                                <Play size={16} />
                                Watch
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                  downloadingId === meetingInfo.recordUrl
                                }
                                onClick={() => {
                                  const fakeRec = {
                                    url: meetingInfo.recordUrl,
                                    filename: "recording-from-db.mp4",
                                    start_time:
                                      meetingInfo.updatedAt ||
                                      new Date().toISOString(),
                                    end_time:
                                      meetingInfo.updatedAt ||
                                      new Date().toISOString(),
                                    session_id: "db-recording",
                                  } as any;
                                  handleDownload(fakeRec, 0);
                                }}
                              >
                                <Download size={16} />
                                {downloadingId === meetingInfo.recordUrl
                                  ? "Downloading..."
                                  : "Download"}
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      // Fallback to Stream recordings if not in DB
                      if (recordings.length === 0) {
                        return (
                          <div className="recording-empty">
                            <Video size={40} />
                            <p>No recordings available for this meeting</p>
                          </div>
                        );
                      }

                      return recordings.map((rec, idx) => {
                        const displayName =
                          rec.filename?.substring(0, 80) || "Recording";
                        const createdAt = rec.start_time
                          ? formatDateTime(rec.start_time)
                          : "-";
                        const duration =
                          rec.start_time && rec.end_time
                            ? formatDuration(
                                new Date(rec.end_time).getTime() -
                                  new Date(rec.start_time).getTime()
                              )
                            : null;
                        return (
                          <div className="recording-item" key={rec.url || idx}>
                            <div className="recording-info">
                              <div className="recording-icon">
                                <Video size={20} />
                              </div>
                              <div>
                                <h5>{displayName}</h5>
                                <p>
                                  {createdAt}
                                  {duration && (
                                    <span className="recording-duration">
                                      {" "}
                                      · Duration: {duration}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="recording-actions">
                              {rec.url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(rec.url!, "_blank")
                                  }
                                >
                                  <Play size={16} />
                                  Watch
                                </Button>
                              )}
                              {rec.url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    downloadingId === (rec.url || String(idx))
                                  }
                                  onClick={() => handleDownload(rec, idx)}
                                >
                                  <Download size={16} />
                                  {downloadingId === (rec.url || String(idx))
                                    ? "Downloading..."
                                    : "Download"}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                </div>
              </div>

              <div className="transcript">
                {/* Header với nút Re-generate */}
                <div className="transcript-header">
                  <h4>
                    <FileText size={18} />
                    Transcript
                  </h4>

                  {/* Nút Re-generate với CSS Tooltip */}
                  <div className="tooltip-wrapper">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={isRegenerating || isProcessingMeetingAI}
                      className="regenerate-btn"
                    >
                      {isRegenerating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Regenerating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Re-generate</span>
                        </>
                      )}
                    </Button>
                    <span className="tooltip-text">
                      If the transcript and summary are not reasonable, please
                      click here to regenerate
                    </span>
                  </div>
                </div>

                {/* AI Processing Error Banner */}
                {aiProcessingError && (
                  <div className="ai-error-banner">
                    <div className="error-icon">
                      <AlertTriangleIcon size={24} color="#dc2626" />
                    </div>
                    <div className="error-content">
                      <h4 className="error-title">{aiProcessingError.message}</h4>
                      <p className="error-details">{aiProcessingError.details}</p>
                      {aiProcessingError.details?.includes("internet connection") && (
                        <p className="error-hint">
                          💡 Tip: Check your network connection and click "Re-generate" to try again
                        </p>
                      )}
                      {!aiProcessingError.details?.includes("internet connection") && (
                        <p className="error-hint">
                          💡 Tip: Click "Re-generate" to try again
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAiProcessingError(null)}
                      className="error-close-btn"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}

                {isLoadingTranscriptions && (
                  <div className="transcript-loading">
                    <Loader2 size={20} className="animate-spin" />
                    Loading transcript...
                  </div>
                )}

                {!isLoadingTranscriptions &&
                  originalTranscriptions.length === 0 &&
                  improvedTranscript.length === 0 && (
                    <div className="transcript-empty">
                      <FileText size={40} />
                      <p>No transcript available for this meeting</p>
                    </div>
                  )}

                {isProcessingMeetingAI && (
                  <div className="transcript-processing">
                    <Loader2 size={50} className="animate-spin" />
                    <span>Generating meeting transcript...</span>
                  </div>
                )}

                {!isProcessingMeetingAI && improvedTranscript.length > 0 && (
                  <div
                    className={`transcript-content ${
                      isTranscriptExpanded ? "expanded" : ""
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
                      allSpeakers={meetingInfo?.attendees ?? []}
                      getSpeakerName={getSpeakerName}
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

              {(recordings.length !== 0 || summary !== "") && (
                <div className="summary">
                  <div className="summary-header">
                    <div className="summary-title">
                      <div className="ai-icon">
                        <Sparkles size={24} />
                      </div>
                      <div className="summary-title-text">
                        <h4>AI Meeting Summary</h4>
                        <div className="ai-badge">
                          <Sparkles size={10} />
                          <span>Powered by Gemini AI</span>
                        </div>
                      </div>
                    </div>
                    {/* Edit button for summary */}
                    {!isProcessingMeetingAI && summary && !isEditingSummary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEditSummary}
                        className="edit-summary-btn"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </Button>
                    )}
                  </div>

                  <div className="summary-content">
                    {isProcessingMeetingAI && (
                      <div className="summary-loading">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generating summary...</span>
                      </div>
                    )}
                    {!isProcessingMeetingAI && !isEditingSummary && summary && (
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    )}
                    {!isProcessingMeetingAI && isEditingSummary && (
                      <div className="summary-edit-mode">
                        <textarea
                          className="summary-textarea"
                          value={editingSummaryText}
                          onChange={(e) =>
                            setEditingSummaryText(e.target.value)
                          }
                          rows={15}
                          placeholder="Enter meeting summary (supports Markdown)..."
                        />
                        <div className="summary-edit-hint">
                          <span>Supports Markdown formatting</span>
                        </div>
                        <div className="summary-edit-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditSummary}
                            disabled={isSavingSummary}
                          >
                            <X size={14} />
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleSaveSummary}
                            disabled={isSavingSummary}
                            className="save-summary-btn"
                          >
                            {isSavingSummary ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check size={14} />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* AI Generated Tasks */}
              {isProjectManager() &&
                (todoList.length > 0 || isProcessingMeetingAI) && (
                  <div className="ai-generated-tasks">
                    <div className="ai-tasks-header">
                      <div className="ai-tasks-title">
                        <div className="ai-icon">
                          <Sparkles size={18} />
                        </div>
                        <div className="title-content">
                          <h4>AI-Generated To-do List</h4>
                          <p className="draft-notice">
                            <Edit3 size={12} />
                            <span>Draft - Needs review and editing</span>
                          </p>
                        </div>
                      </div>
                      {!isProcessingMeetingAI && (
                        <>
                          {todoList.length > 0 && (
                            <label className="select-all-section">
                              <Checkbox
                                checked={
                                  selectedTasks.length ===
                                    todoList.filter(
                                      (t) =>
                                        isValidTodo(t) &&
                                        t.status !== 2 &&
                                        t.status !== 3
                                    ).length && selectedTasks.length > 0
                                }
                                onCheckedChange={handleSelectAllTasks}
                                className="select-all-checkbox data-[state=checked]:bg-[#ff5e13] data-[state=checked]:border-[#ff5e13]"
                              />
                              <span className="select-all-label">
                                Select All ({selectedTasks.length}/
                                {
                                  todoList.filter(
                                    (t) =>
                                      isValidTodo(t) &&
                                      t.status !== 2 &&
                                      t.status !== 3
                                  ).length
                                }
                                )
                              </span>
                            </label>
                          )}
                        </>
                      )}
                    </div>

                    {isProcessingMeetingAI && (
                      <div className="tasks-loading">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generating to-do list...</span>
                      </div>
                    )}
                    {!isProcessingMeetingAI && (
                      <div className="task-list">{memoizedTodoList}</div>
                    )}
                    {/* Action buttons for the entire AI task list */}
                    {/* <div className="ai-tasks-actions">
                        <Button
                          onClick={handleOpenConvertModal}
                          className="convert-all-btn"
                          variant="default"
                          disabled={selectedTasks.length === 0}
                        >
                          <Target size={16} />
                          Convert to Official Tasks
                        </Button>
                      </div> */}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar - appears near cursor when first shown */}
      {selectedTasks.length > 0 && fabPosition && (
        <div
          className={`floating-action-bar ${isDragging ? "dragging" : ""}`}
          style={{
            left: `${fabPosition.x}px`,
            top: `${fabPosition.y}px`,
            bottom: "auto",
            right: "auto",
          }}
          onMouseDown={handleFabMouseDown}
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
                setFabPosition(null);
                fabInitializedRef.current = false;
              }}
              title="Close and deselect all"
            >
              <X size={40} />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Updated to handle multiple tasks */}
      {deleteConfirmModal.isOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <div className="delete-icon">
                <Trash2 size={24} />
              </div>
              <h3>
                {deleteConfirmModal.taskId === "multiple"
                  ? `Confirm Delete ${selectedTasks.length} Tasks`
                  : "Confirm Delete Task"}
              </h3>
            </div>
            <div className="delete-modal-content">
              <p>
                {deleteConfirmModal.taskId === "multiple"
                  ? `Are you sure you want to delete ${selectedTasks.length} selected to-dos?`
                  : "Are you sure you want to delete this to-do?"}
              </p>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="cancel-btn"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (deleteConfirmModal.taskId === "multiple") {
                    handleDeleteMultipleTasks();
                  } else {
                    handleDeleteTask();
                  }
                }}
                className="confirm-delete-btn"
              >
                <Trash2 size={16} />
                Delete{" "}
                {deleteConfirmModal.taskId === "multiple" ? "Tasks" : "Task"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <RelatedTasksSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        referenceTaskIds={currentReferenceIds}
        todoId={selectedTodoId ?? ""}
      />

      {/* Convert Confirmation Modal */}
      {convertConfirmModal.isOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal flex flex-col items-center text-center">
            <div className="mb-3 flex items-center justify-center">
              <VoteIcon color="#10b981" size={60} />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              Convert to Official Tasks?
            </h3>

            <div className="delete-modal-content mb-4">
              <p>
                You are about to convert{" "}
                <strong>
                  {convertConfirmModal.taskCount} AI-generated to-dos
                </strong>{" "}
                into official tasks. These will be added to your project and
                related team members will be notified.
              </p>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 flex items-start">
                  <AlertTriangleIcon
                    color="#f59e0b"
                    size={20}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <span>
                    <strong>Note:</strong> To-dos without a start date will auto
                    use today's date as the task start date.
                  </span>
                </p>
              </div>
            </div>

            <div className="delete-modal-actions flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelConvert}
                className="cancel-btn"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmConvert}
                className="confirm-convert-btn"
              >
                {/* <Check size={16} /> */}
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add new handler for deleting multiple tasks
// const handleDeleteMultipleTasks = async () => {
//   if (selectedTasks.length === 0) return;

//   try {
//     // Delete all selected tasks
//     const deletePromises = selectedTasks.map(taskId =>
//       todoService.deleteTodo(taskId)
//     );

//     const results = await Promise.all(deletePromises);
//     const successCount = results.filter(r => r.success).length;

//     if (successCount > 0) {
//       setTodoList((prev) =>
//         prev.filter((task) => !selectedTasks.includes(task.id))
//       );
//       setTodosFromDB((prev) =>
//         prev.filter((task) => !selectedTasks.includes(task.id))
//       );

//       toast.success(`Successfully deleted ${successCount} task${successCount > 1 ? 's' : ''}`);
//     }

//     if (successCount < selectedTasks.length) {
//       toast.warning(`Failed to delete ${selectedTasks.length - successCount} task${selectedTasks.length - successCount > 1 ? 's' : ''}`);
//     }

//     setSelectedTasks([]);
//     setDeleteConfirmModal({ isOpen: false, taskId: null });
//   } catch (error) {
//     toast.error("Error deleting tasks");
//     setDeleteConfirmModal({ isOpen: false, taskId: null });
//   }
// };