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
import { uploadFileToCloudinary } from "@/services/uploadFileService";
import { taskService } from "@/services/taskService";
import { PagingRequest } from "@/types/project";
import TodoCard from "@/components/meeting/TodoCard";
import { RelatedTasksSidebar } from "@/components/meeting/RelatedTasksSidebar";
import { useAuth } from "@/hooks/useAuth";

// Environment-configurable API bases
const stripSlash = (s: string) => s.replace(/\/$/, "");
const API_BASE = stripSlash(
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:7129/api/v1"
);

// Map Stream call state to a simplified status label
const mapCallStatus = (call?: Call) => {
  if (!call) return "Unknown";
  const starts = call.state.startsAt;
  if (starts && new Date(starts) < new Date()) return "Finished";
  if (starts && new Date(starts) > new Date()) return "Scheduled";
  return "Ongoing";
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

  // Floating Action Bar position state
  const [fabPosition, setFabPosition] = useState<{ x: number; y: number } | null>(null);
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

      // Nếu đã có recordUrl trong DB thì không cần load từ Stream
      if (meetingInfo?.recordUrl) {
        // console.log("Using recordUrl from DB, skipping Stream recordings");
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
        // console.error("Failed to fetch call recordings", e);
        setRecordingsError("Cannot load meeting recordings");
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
    // Cleanup: khi page/component bị unmount thì xóa lưu tab
    return () => {
      localStorage.removeItem("meetingDetailActiveTab");
    };
  }, []);

  const handleChangeTab = (tabKey: any) => {
    setActiveTab(tabKey);
    localStorage.setItem("meetingDetailActiveTab", tabKey);
  };

  const hasProcessedRef = useRef(false);
  // Định nghĩa async function xử lý video
  const uploadRecordingUrlToCloud = async (recordUrl: string) => {
    // Nếu đã có recordUrl trỏ tới Cloudinary (hoặc đã upload trước) thì trả về luôn
    if (!recordUrl) throw new Error("No recording URL to upload");
    try {
      console.debug("uploadRecordingUrlToCloud - recordUrl:", recordUrl);
      const res = await fetch(recordUrl);
      console.debug("uploadRecordingUrlToCloud - fetch response:", {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        contentType: res.headers?.get?.("content-type") ?? "(no header)",
      });
      if (!res.ok) throw new Error("Failed to fetch recording for upload");
      const blob = await res.blob();
      console.debug("uploadRecordingUrlToCloud - blob:", {
        size: blob.size,
        type: blob.type,
      });
      const contentType = blob.type || "video/mp4";
      const ext = contentType.includes("webm") ? "webm" : "mp4";
      // Lấy tên file hợp lý
      const urlParts = (recordUrl || "").split("/");
      let filename = urlParts[urlParts.length - 1] || `recording.${ext}`;
      // sanitize
      filename = filename.split("?")[0].replace(/[^a-zA-Z0-9-_\.]/g, "-");
      const file = new File([blob], filename, { type: contentType });
      console.debug("uploadRecordingUrlToCloud - prepared file:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      // uploadFileToCloudinary đã được import từ services
      try {
        const cloudUrl = await uploadFileToCloudinary(file);
        console.debug("uploadRecordingUrlToCloud - upload success:", cloudUrl);
        return cloudUrl;
      } catch (uploadErr: any) {
        console.error("uploadRecordingUrlToCloud - uploadErr:", uploadErr);
        throw uploadErr;
      }
    } catch (err: any) {
      // propagate meaningful error
      console.error("uploadRecordingUrlToCloud - error:", err);
      throw new Error(
        err?.message || "Unable to upload to cloud. Please try again."
      );
    }
  };

  const processVideo = async (
    recording: any,
    transcriptions: any,
    tasks: any[]
  ) => {
    setIsProcessingMeetingAI(true);

    try {
      // 1) Upload recording từ Stream lên Cloud (nếu chưa có trong DB)
      let cloudRecordingUrl = meetingInfo?.recordUrl || null;
      if (!cloudRecordingUrl) {
        if (!recording?.url)
          throw new Error("Recording URL not found for upload");
        try {
          cloudRecordingUrl = await uploadRecordingUrlToCloud(recording.url);
          // cập nhật local ngay để tránh upload lại
          setMeetingInfo((prev: any) => ({
            ...(prev || {}),
            recordUrl: cloudRecordingUrl,
          }));
        } catch (uploadErr: any) {
          // Nếu upload thất bại thì dừng và báo lỗi
          throw new Error(
            uploadErr?.message || "Failed to upload recording to cloud"
          );
        }
      }

      // 2) Gọi API xử lý video (gửi URL trên cloud thay vì URL từ Stream)
      const response = await fetch("/api/gemini/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: cloudRecordingUrl, // dùng cloud URL
          transcriptSegments: transcriptions,
          tasks: tasks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process video");
      }

      if (data.success) {
        // Cập nhật state với kết quả AI
        setImprovedTranscript(data.data.improvedTranscript);
        const processedSummary = mapSummaryAssigneeIds(data.data.summary);
        setSummary(processedSummary);
        setTodoList(data.data.todoList);

        // 3) Cập nhật meeting trên server với cloudRecordingUrl (không dùng URL Stream)
        try {
          const updateResult = await meetingService.updateMeeting({
            meetingId: params.id as string,
            summary: data.data.summary,
            transcription: JSON.stringify(data.data.improvedTranscript),
            recordUrl: cloudRecordingUrl, // lưu URL trên cloud
          });

          if (updateResult.success) {
            setMeetingInfo((prev: any) => ({
              ...prev,
              summary: data.data.summary,
              transcription: JSON.stringify(data.data.improvedTranscript),
              recordUrl: cloudRecordingUrl,
              todoList: JSON.stringify(data.data.todoList),
            }));
          } else {
            // không throw, chỉ log/hiện thông báo nhẹ nếu cần
          }
        } catch (updateError) {
          // Không throw tiếp để không làm mất kết quả AI, nhưng thông báo lỗi local nếu muốn
        }

        // 4) Tạo todos từ AI nếu có (giữ logic hiện tại, dùng meetingInfo để map assignee)
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
                // Nếu là YYYY-MM-DD, chuyển thành ISO luôn cho chắc
                if (
                  typeof val === "string" &&
                  /^\d{4}-\d{2}-\d{2}$/.test(val)
                ) {
                  return new Date(val).toISOString();
                }
                // Nếu đã là Date object
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
                `${createTodosResult.data?.length || 0
                } tasks created from AI`
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
            toast.error("Error creating tasks from AI");
          }
        }
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
    } finally {
      setIsProcessingMeetingAI(false);
    }
  };

  // useEffect để tự động gọi processVideo khi có đủ dữ liệu và chưa có kết quả
  useEffect(() => {
    // Chỉ xử lý khi đã load xong meetingInfo
    if (isLoadingMeeting) {
      // console.log("⏸️ Still loading meeting info");
      return;
    }

    // Kiểm tra xem đã có dữ liệu AI trong DB chưa
    if (
      meetingInfo?.summary ||
      meetingInfo?.transcription ||
      todosFromDB.length > 0
    ) {
      // Parse dữ liệu từ DB và hiển thị
      if (meetingInfo.transcription) {
        const parsedTranscript = parseTranscription(meetingInfo.transcription);
        setImprovedTranscript(parsedTranscript);
        // console.log("Transcript from DB:", parsedTranscript);
      }
      if (meetingInfo.summary) {
        // Map assigneeId thành tên trong summary từ DB
        const processedSummary = mapSummaryAssigneeIds(meetingInfo.summary);
        setSummary(processedSummary);
      }
      // Sử dụng todos từ DB thay vì từ meetingInfo
      if (todosFromDB.length > 0) {
        setTodoList(todosFromDB);
        console.log("Todos from DB:", todosFromDB);
      }
      hasProcessedRef.current = true;
      return;
    }

    // Chỉ call AI khi chưa có dữ liệu và có đủ thông tin cần thiết
    if (
      !originalTranscriptions ||
      originalTranscriptions.length === 0 ||
      !recordings[0]?.url
    ) {
      // console.log("⏸️ Missing data for AI processing");
      return;
    }

    if (hasProcessedRef.current) {
      // console.log("⏸️ Already processed");
      return;
    }

    // console.log("▶️ Starting AI processing - no existing data found");
    hasProcessedRef.current = true;
    processVideo(recordings[0], originalTranscriptions, projectTasks);
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
        return "Đã lên lịch";
      case "Finished":
        return "Hoàn thành";
      case "Ongoing":
        return "Đang diễn ra";
      default:
        return status;
    }
  };

  // Định dạng thời lượng từ mili-giây -> HH:MM:SS (ẩn giờ nếu = 0)
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
        // console.log(
        //   `✅ Mapped speakerId ${speakerId} to fullName: ${attendee.fullName}`
        // );
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
    return "Not assigned";
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
    // console.log("Mapping summary assigneeIds:", {
    //   originalSummary: summaryText,
    //   attendees: meetingInfo.attendees,
    // });

    meetingInfo.attendees.forEach((attendee: any) => {
      const regex = new RegExp(attendee.id, "g");
      const beforeReplace = processedSummary;
      processedSummary = processedSummary.replace(
        regex,
        attendee.fullName || attendee.email
      );

      if (beforeReplace !== processedSummary) {
        // console.log(
        //   `Replaced ${attendee.id} with ${attendee.fullName || attendee.email}`
        // );
      }
    });

    // console.log("Processed summary:", processedSummary);
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
      !!todo.title &&
      !!todo.description &&
      !!todo.startDate &&
      !!todo.endDate &&
      !!getTodoAssigneeId(todo)
    );
  }

  // Xử lý mở modal xác nhận xóa task
  const handleOpenDeleteModal = (taskId: string) => {
    setDeleteConfirmModal({ isOpen: true, taskId });
  };

  // Xử lý xóa task
  const handleDeleteTask = async () => {
    if (!deleteConfirmModal.taskId) return;

    try {
      const deleteResult = await todoService.deleteTodo(
        deleteConfirmModal.taskId
      );

      if (deleteResult.success) {
        setTodoList((prev) =>
          prev.filter((task) => task.id !== deleteConfirmModal.taskId)
        );
        setTodosFromDB((prev) =>
          prev.filter((task) => task.id !== deleteConfirmModal.taskId)
        );

        toast.success("Task deleted successfully");
        setDeleteConfirmModal({ isOpen: false, taskId: null });
      } else {
        toast.error("Failed to delete task: " + deleteResult.error);
      }
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  // Xử lý hủy xóa task
  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, taskId: null });
  };

  // Xử lý select/deselect task
  const handleSelectTask = (taskId: string) => {
    const todo = todoList.find((t) => t.id === taskId);
    if (
      !isValidTodo(todo) ||
      todo.status === 2 || // ConvertedToTask
      todo.status === 3 // Deleted
    ) {
      toast.warning("To-do has been converted or missing required information");
      return;
    }
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Xử lý select all tasks
  const handleSelectAllTasks = () => {
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

  // Xử lý mở modal confirm convert
  const handleOpenConvertModal = () => {
    setConvertConfirmModal({ isOpen: true, taskCount: selectedTasks.length });
  };

  // Xử lý confirm convert
  const handleConfirmConvert = async () => {
    if (selectedTasks.length === 0) {
      toast.warning("You must select at least one to-do to convert!");
      return;
    }

    try {
      const result = await todoService.convertTodosToTasks(selectedTasks);

      if (result.success) {
        toast.success(
          `Successfully converted ${result.data?.length} tasks to project!`
        );
        setSelectedTasks([]);
        setConvertConfirmModal({ isOpen: false, taskCount: 0 });

        if (meetingInfo?.projectId) {
          setTimeout(() => {
            router.push(`/projects/${meetingInfo.projectId}?tab=board`);
          }, 600);
        }
      } else {
        toast.error(result.error || "Unable to convert selected to-dos!");
        setConvertConfirmModal({ isOpen: false, taskCount: 0 });
      }
    } catch (error) {
      toast.error("Connection error while converting tasks!");
      setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    }

    setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    setSelectedTasks([]);
  };

  // Xử lý cancel convert
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

                toast.success("Task updated successfully");

                setOriginalTodoCache((prev) => {
                  const copy = { ...prev };
                  delete copy[todo.id];
                  return copy;
                });

                setEditMode((prev) => ({ ...prev, [todo.id]: false }));
              } else {
                toast.error(
                  "Failed to update task: " + updateResult.error
                );
              }
            } catch (error) {
              toast.error("Error updating task");
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

  // Xử lý tải xuống recording (tải blob để đảm bảo đặt được tên file)
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
      toast.error("Download failed. Please try again.");
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
      const deletePromises = selectedTasks.map(taskId =>
        todoService.deleteTodo(taskId)
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        setTodoList((prev) =>
          prev.filter((task) => !selectedTasks.includes(task.id))
        );
        setTodosFromDB((prev) =>
          prev.filter((task) => !selectedTasks.includes(task.id))
        );

        toast.success(`Successfully deleted ${successCount} task${successCount > 1 ? 's' : ''}`);
      }

      if (successCount < selectedTasks.length) {
        toast.warning(`Failed to delete ${selectedTasks.length - successCount} task${selectedTasks.length - successCount > 1 ? 's' : ''}`);
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
      if (!fabInitializedRef.current && selectedTasks.length > 0 && !fabPosition) {
        // Position FAB slightly above and to the right of cursor
        const x = Math.min(e.clientX + 20, window.innerWidth - 600); // offset right + check bounds
        const y = Math.max(e.clientY - 100, 20); // offset up + check bounds

        setFabPosition({ x, y });
        fabInitializedRef.current = true;
      }
    };

    if (selectedTasks.length > 0 && !fabPosition) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedTasks.length, fabPosition]);

  // Set FAB position immediately when first task is selected
  useEffect(() => {
    if (selectedTasks.length > 0 && !fabInitializedRef.current && !fabPosition) {
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
    if ((e.target as HTMLElement).closest('.fab-btn')) return; // Don't drag when clicking buttons

    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
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
        y: Math.max(20, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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
        <p>This meeting does not exist or you do not have permission to access it.</p>
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
    return participant ? participant.email : "Chưa gán email";
  };

  // Derived info từ call
  const status = mapCallStatus(call);
  const description =
    (call.state.custom as any)?.description || "(Không có mô tả)";
  const createdBy =
    call.state.createdBy?.name ||
    (call.state.createdBy as any)?.id ||
    "Ẩn danh";
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
    : "Chưa gán milestone";
  const participants: string[] = (call.state.custom as any)?.participants || [];
  const createdById = call.state.createdBy?.id;
  // lọc bỏ creator khỏi danh sách participants
  const displayParticipants = participants.filter((p) => p !== createdById);
  const participantEmails: string[] =
    displayParticipants.map(getParticipantEmail);
  // Xử lý khi nhấn tham gia cuộc họp
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
          Recording
        </button>
      </div>

      {/* Content */}
      <div className="meeting-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="meeting-info">
              <div className="flex justify-between">
                <h3>Meeting Information</h3>
                {(meetingInfo?.endTime
                  ? new Date(meetingInfo.endTime) > new Date()
                  : endsAt
                    ? endsAt > new Date()
                    : false) && (
                    <Button
                      variant="default"
                      className="join-now-btn bg-orange-600 hover:bg-orange-700 cursor-pointer"
                      style={{ marginTop: 12 }}
                      onClick={() => handleClickJoinMeeting()}
                    >
                      <Video size={16} style={{ marginRight: 6 }} />
                      Join Now
                    </Button>
                  )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Title:</label>
                  <p>
                    {meetingInfo?.title || call.state?.custom?.title || call.id}
                  </p>
                </div>
                <div className="info-item">
                  <label>Description:</label>
                  <p>{meetingInfo?.description || description}</p>
                </div>
                <div className="info-item">
                  <label>Start Time:</label>
                  <p>
                    {meetingInfo?.startTime
                      ? new Date(meetingInfo.startTime).toLocaleString("vi-VN")
                      : startsAt?.toLocaleString("vi-VN") || "-"}
                  </p>
                </div>
                <div className="info-item">
                  <label>End Time:</label>
                  <p>
                    {meetingInfo?.endTime
                      ? new Date(meetingInfo.endTime).toLocaleString("vi-VN")
                      : endsAt?.toLocaleString("vi-VN") || "-"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span
                    className="px-8 py-2 rounded-full text-white text-sm font-medium"
                    style={{
                      backgroundColor: getStatusColor(
                        meetingInfo?.status || status
                      ),
                    }}
                  >
                    {getStatusLabel(meetingInfo?.status || status)}
                  </span>
                </div>

                <div className="info-item">
                  <label>Created By:</label>
                  <p>{meetingInfo?.createdByEmail || createdBy}</p>
                </div>
                <div className="info-item">
                  <label>Created At:</label>
                  <p>
                    {meetingInfo?.createdAt
                      ? new Date(meetingInfo.createdAt).toLocaleString("vi-VN")
                      : createdAt?.toLocaleString("vi-VN") || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Project and milestone info */}
            <div className="project-info">
              <h3>Project Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Project:</label>
                  <p>
                    {meetingInfo?.projectName || "MSP Project Management System"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Related Milestone:</label>
                  <p>{meetingInfo?.milestoneName || milestoneName}</p>
                </div>
                <div className="info-item">
                  <label>Participants:</label>
                  <div className="participants">
                    {meetingInfo?.attendees?.length > 0 ? (
                      <ul>
                        {meetingInfo.attendees.map((att: any, idx: number) => (
                          <li className="participant" key={att.id}>
                            {att.email}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No participants yet</p>
                    )}
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
                    <div className="recording-loading">Loading recordings...</div>
                  )}
                  {recordingsError && !isLoadingRecordings && (
                    <div className="recording-error">{recordingsError}</div>
                  )}
                  {!isLoadingRecordings &&
                    !recordingsError &&
                    (() => {
                      if (meetingInfo?.recordUrl) {
                        return (
                          <div className="recording-item" key="db-recording">
                            <div className="recording-info">
                              <Video size={20} />
                              <div>
                                <h5>Meeting Recording</h5>
                                <p>
                                  {meetingInfo.updatedAt
                                    ? new Date(
                                      meetingInfo.updatedAt
                                    ).toLocaleString("vi-VN")
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

                      if (recordings.length === 0) {
                        return (
                          <div className="recording-empty">
                            <p>No recordings available yet</p>
                          </div>
                        );
                      }

                      return recordings.map((rec, idx) => {
                        const displayName =
                          rec.filename?.substring(0, 80) || "Recording";
                        const createdAt = rec.start_time
                          ? new Date(rec.start_time).toLocaleString("vi-VN")
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
                              <Video size={20} />
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
                <h4>Transcript</h4>
                {isLoadingTranscriptions && (
                  <div className="transcript-loading">
                    Loading transcript...
                  </div>
                )}
                {!isLoadingTranscriptions &&
                  originalTranscriptions.length === 0 &&
                  improvedTranscript.length === 0 && (
                    <div className="transcript-empty">
                      No transcript available for this meeting
                    </div>
                  )}
                {isProcessingMeetingAI && (
                  <div
                    className="transcript-processing"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "16px",
                      padding: "40px 20px",
                      minHeight: "200px",
                    }}
                  >
                    <Loader2 size={50} className="animate-spin" />
                    <span>Generating meeting transcript...</span>
                  </div>
                )}
                {!isProcessingMeetingAI && improvedTranscript.length > 0 && (
                  <>
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
                        allSpeakers={meetingInfo?.attendees ?? []}
                        getSpeakerName={getSpeakerName}
                        formatTimestamp={formatTimestamp}
                      />
                    </div>

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
                  </>
                )}
              </div>

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
                </div>
                <div className="summary-content">
                  {isProcessingMeetingAI && (
                    <div className="summary-loading">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating summary...</span>
                    </div>
                  )}
                  {!isProcessingMeetingAI && summary && (
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  )}
                </div>
              </div>

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
                    </div>

                    {isProcessingMeetingAI && (
                      <div className="tasks-loading">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generating to-do list...</span>
                      </div>
                    )}

                    <div className="task-list">{memoizedTodoList}</div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar - appears near cursor when first shown */}
      {selectedTasks.length > 0 && fabPosition && (
        <div
          className={`floating-action-bar ${isDragging ? 'dragging' : ''}`}
          style={{
            left: `${fabPosition.x}px`,
            top: `${fabPosition.y}px`,
            bottom: 'auto',
            right: 'auto'
          }}
          onMouseDown={handleFabMouseDown}
        >
          <div className="fab-content">
            <div className="fab-info">
              <span className="fab-count">
                {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} selected
              </span>
            </div>
            <div className="fab-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllTasks}
                className="fab-btn fab-btn-select"
                title={selectedTasks.length === todoList.filter(t => isValidTodo(t) && t.status !== 2 && t.status !== 3).length ? "Deselect all" : "Select all"}
              >
                <CheckCircle size={16} />
                <span className="fab-btn-text">
                  {selectedTasks.length === todoList.filter(t => isValidTodo(t) && t.status !== 2 && t.status !== 3).length ? "Deselect all" : "Select all"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedTasks.length === 1) {
                    handleOpenDeleteModal(selectedTasks[0]);
                  } else {
                    setDeleteConfirmModal({
                      isOpen: true,
                      taskId: 'multiple'
                    });
                  }
                }}
                className="fab-btn fab-btn-delete"
                title="Delete selected"
              >
                <Trash2 size={16} />
                <span className="fab-btn-text">Delete ({selectedTasks.length})</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenConvertModal}
                className="fab-btn fab-btn-convert"
                title="Convert to official tasks"
              >
                <Target size={16} />
                <span className="fab-btn-text">Convert ({selectedTasks.length})</span>
              </Button>
            </div>
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
                {deleteConfirmModal.taskId === 'multiple'
                  ? `Confirm Delete ${selectedTasks.length} Tasks`
                  : 'Confirm Delete Task'}
              </h3>
            </div>
            <div className="delete-modal-content">
              <p>
                {deleteConfirmModal.taskId === 'multiple'
                  ? `Are you sure you want to delete ${selectedTasks.length} selected to-dos?`
                  : 'Are you sure you want to delete this to-do?'}
              </p>
              <p className="delete-warning">
                This action cannot be undone.
              </p>
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
                  if (deleteConfirmModal.taskId === 'multiple') {
                    handleDeleteMultipleTasks();
                  } else {
                    handleDeleteTask();
                  }
                }}
                className="confirm-delete-btn"
              >
                <Trash2 size={16} />
                Delete {deleteConfirmModal.taskId === 'multiple' ? 'Tasks' : 'Task'}
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
                <strong>{convertConfirmModal.taskCount} AI-generated to-dos</strong> into official tasks. These will be added to your project and related team members will be notified.
              </p>
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
                className="confirm-delete-btn"
                style={{ background: "#FF5E13" }}
              >
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
