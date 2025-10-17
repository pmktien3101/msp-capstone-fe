"use client";

import { useState, useEffect, use, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Video,
  FileText,
  Paperclip,
  CheckSquare,
  Play,
  Download,
  Sparkles,
  Loader2,
  Edit,
  X,
  Calendar,
  User,
  Trash2,
  Check,
  Edit3,
  Target,
  VoteIcon,
} from "lucide-react";
import "@/app/styles/meeting-detail.scss";
import { useGetCallById } from "@/hooks/useGetCallById";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { mockMilestones, mockParticipants } from "@/constants/mockData";
import { toast } from "react-toastify";
import { is } from "zod/v4/locales";
import { meetingService } from "@/services/meetingService";
import { todoService } from "@/services/todoService";

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
  const { call, isLoadingCall } = useGetCallById(params.id as string);
  const [activeTab, setActiveTab] = useState("overview");
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [recordingsError, setRecordingsError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [isLoadingTranscriptions, setIsLoadingTranscriptions] = useState(false);
  const [transcriptionsError, setTranscriptionsError] = useState<string | null>(
    null
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [showJoinFlow, setShowJoinFlow] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    taskId: string | null;
  }>({ isOpen: false, taskId: null });
  const [isTaskCreated, setIsTaskCreated] = useState<{
    [key: string]: boolean;
  }>({});
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
  const [error, setError] = useState<string | null>(null);

  // Fetch recordings when switching to recording tab and call is available
  useEffect(() => {
    const loadRecordings = async () => {
      if (!call) return;

      // Nếu đã có recordUrl trong DB thì không cần load từ Stream
      if (meetingInfo?.recordUrl) {
        console.log("Using recordUrl from DB, skipping Stream recordings");
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
        console.error("Failed to fetch call recordings", e);
        setRecordingsError("Không tải được bản ghi cuộc họp");
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
        console.log("Transcriptions data:", data);
        setTranscriptions(data || []);
      } catch (e: any) {
        console.error("Failed to fetch transcriptions", e);
        setTranscriptionsError("Không tải được transcript");
      } finally {
        setIsLoadingTranscriptions(false);
      }
    };
    if (activeTab === "recording") {
      loadTranscriptions();
    }
  }, [activeTab, call]);

  const hasProcessedRef = useRef(false);
  // Định nghĩa async function xử lý video
  const processVideo = async (recording: any, transcriptions: any) => {
    setIsProcessingMeetingAI(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: recording.url, // Lấy URL từ recording object
          transcriptSegments: transcriptions,
        }),
      });

      const data = await response.json();

      console.log("GEMINI API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to process video");
      }

      if (data.success) {
        // Cập nhật state với kết quả
        setImprovedTranscript(data.data.improvedTranscript);

        // Map assigneeId thành tên trong summary
        const processedSummary = mapSummaryAssigneeIds(data.data.summary);
        setSummary(processedSummary);

        setTodoList(data.data.todoList);

        // Cập nhật meeting khi call AI thành công
        try {
          const updateResult = await meetingService.updateMeeting({
            meetingId: params.id as string,
            summary: data.data.summary,
            transcription: JSON.stringify(data.data.improvedTranscript),
            recordUrl: recording.url,
          });

          if (updateResult.success) {
            console.log("Meeting updated successfully with AI data");
            // Cập nhật meetingInfo với data mới
            setMeetingInfo((prev: any) => ({
              ...prev,
              summary: data.data.summary,
              transcription: JSON.stringify(data.data.improvedTranscript),
              recordUrl: recording.url,
              todoList: JSON.stringify(data.data.todoList),
            }));
          } else {
            console.error("Failed to update meeting:", updateResult.error);
            // Không throw error vì AI processing đã thành công
            // Chỉ log warning
          }
        } catch (updateError) {
          console.error("Error updating meeting with AI data:", updateError);
          // Không throw error vì AI processing đã thành công
        }

        // Tạo todos từ AI response nếu có
        if (data.data.todoList && data.data.todoList.length > 0) {
          try {
            console.log("Creating todos from AI response:", data.data.todoList);

            // Map assigneeId từ AI với attendees trong meeting
            const mappedTodoList = data.data.todoList.map((todo: any) => {
              // Tìm assigneeId hợp lệ trong attendees
              let validAssigneeId = todo.assigneeId;

              if (todo.assigneeId && meetingInfo?.attendees) {
                const attendee = meetingInfo.attendees.find(
                  (att: any) => att.id === todo.assigneeId
                );
                if (!attendee) {
                  console.warn(
                    `AssigneeId ${todo.assigneeId} not found in attendees, using fallback`
                  );
                  validAssigneeId = meetingInfo?.createdById;
                }
              } else {
                validAssigneeId = meetingInfo?.createdById;
              }

              return {
                ...todo,
                assigneeId: validAssigneeId,
              };
            });

            console.log(
              "Mapped todoList with valid assigneeIds:",
              mappedTodoList
            );

            const createTodosResult = await todoService.createTodosFromAI(
              params.id as string,
              mappedTodoList
            );

            if (createTodosResult.success) {
              console.log(
                "Todos created successfully:",
                createTodosResult.data
              );
              toast.success(
                `${
                  createTodosResult.data?.length || 0
                } công việc đã được tạo từ AI`
              );
              // Refresh todos from DB
              const refreshResult = await todoService.getTodosByMeetingId(
                params.id as string
              );
              if (refreshResult.success && refreshResult.data) {
                setTodosFromDB(refreshResult.data);
                setTodoList(refreshResult.data);
              }
            } else {
              console.error("Failed to create todos:", createTodosResult.error);
              toast.warning(
                "Tạo công việc từ AI thất bại: " + createTodosResult.error
              );
            }
          } catch (todoError) {
            console.error("Error creating todos from AI:", todoError);
            toast.error("Lỗi khi tạo công việc từ AI");
          }
        } else {
          console.log("No todoList in AI response or empty list");
        }

        console.log("Processing complete!", data.data);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
      console.error("Error processing video:", err);
      setError(err.message || "Không thể xử lý video. Vui lòng thử lại.");
    } finally {
      setIsProcessingMeetingAI(false);
    }
  };
  useEffect(() => {
    console.log("🔄 useEffect triggered:", {
      hasTranscriptions: !!transcriptions?.length,
      hasRecording: !!recordings[0]?.url,
      hasProcessed: hasProcessedRef.current,
      hasExistingData: !!(
        meetingInfo?.summary ||
        meetingInfo?.transcription ||
        todosFromDB.length > 0
      ),
      isLoadingMeeting,
      meetingInfo: meetingInfo ? "loaded" : "not loaded",
      todosFromDB: todosFromDB.length,
    });

    // Chỉ xử lý khi đã load xong meetingInfo
    if (isLoadingMeeting) {
      console.log("⏸️ Still loading meeting info");
      return;
    }

    // Kiểm tra xem đã có dữ liệu AI trong DB chưa
    if (
      meetingInfo?.summary ||
      meetingInfo?.transcription ||
      todosFromDB.length > 0
    ) {
      console.log("📋 Using existing AI data from DB");
      // Parse dữ liệu từ DB và hiển thị
      if (meetingInfo.transcription) {
        const parsedTranscript = parseTranscription(meetingInfo.transcription);
        setImprovedTranscript(parsedTranscript);
      }
      if (meetingInfo.summary) {
        // Map assigneeId thành tên trong summary từ DB
        const processedSummary = mapSummaryAssigneeIds(meetingInfo.summary);
        setSummary(processedSummary);
      }
      // Sử dụng todos từ DB thay vì từ meetingInfo
      if (todosFromDB.length > 0) {
        setTodoList(todosFromDB);
      }
      hasProcessedRef.current = true;
      return;
    }

    // Chỉ call AI khi chưa có dữ liệu và có đủ thông tin cần thiết
    if (!transcriptions || transcriptions.length === 0 || !recordings[0]?.url) {
      console.log("⏸️ Missing data for AI processing");
      return;
    }

    if (hasProcessedRef.current) {
      console.log("⏸️ Already processed");
      return;
    }

    console.log("▶️ Starting AI processing - no existing data found");
    hasProcessedRef.current = true;
    processVideo(recordings[0], transcriptions);
  }, [transcriptions, recordings, meetingInfo, isLoadingMeeting, todosFromDB]);

  useEffect(() => {
    if (improvedTranscript && summary && todoList) {
      console.log("✅ All data ready:", {
        transcriptCount: improvedTranscript.length,
        hasSummary: !!summary,
        hasTodoList: !!todoList,
      });
    }
  }, [improvedTranscript, summary, todoList]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "#47D69D";
      case "Finished":
        return "#A41F39";
      case "Ongoing":
        return "#F59E0B";
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
        console.log(
          `✅ Mapped speakerId ${speakerId} to fullName: ${attendee.fullName}`
        );
        return attendee.fullName;
      }
    }

    // Fallback to old mapping for external speakers or unknown IDs
    const speakerMap: { [key: string]: string } = {
      "male-voice": "Giọng Nam Bên Ngoài",
      "female-voice": "Giọng Nữ Bên Ngoài",
    };

    const fallbackName = speakerMap[speakerId] || `Speaker ${speakerId}`;
    console.log(
      `⚠️ Using fallback for speakerId ${speakerId}: ${fallbackName}`
    );
    return fallbackName;
  };

  // Helper function to parse transcription from string to array
  const parseTranscription = (transcriptionString?: string): any[] => {
    if (!transcriptionString) return [];
    try {
      return JSON.parse(transcriptionString);
    } catch (error) {
      console.error("Error parsing transcription:", error);
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

  // Helper function to get assignee name from todo (handles both AI and DB formats)
  const getTodoAssigneeName = (todo: any): string => {
    // If todo has assignee object (from DB)
    if (todo.assignee?.fullName) {
      return todo.assignee.fullName;
    }
    if (todo.assignee?.email) {
      return todo.assignee.email;
    }

    // If todo has assigneeId (from AI or manual assignment)
    if (todo.assigneeId) {
      return mapAssigneeIdToName(todo.assigneeId);
    }

    return "Chưa được giao";
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
    console.log("Mapping summary assigneeIds:", {
      originalSummary: summaryText,
      attendees: meetingInfo.attendees,
    });

    meetingInfo.attendees.forEach((attendee: any) => {
      const regex = new RegExp(attendee.id, "g");
      const beforeReplace = processedSummary;
      processedSummary = processedSummary.replace(
        regex,
        attendee.fullName || attendee.email
      );

      if (beforeReplace !== processedSummary) {
        console.log(
          `Replaced ${attendee.id} with ${attendee.fullName || attendee.email}`
        );
      }
    });

    console.log("Processed summary:", processedSummary);
    return processedSummary;
  };

  // Format date to dd-mm-yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa rõ";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Chưa rõ";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      return "Chưa rõ";
    }
  };

  // Function to find best matching participant by name similarity
  const findBestMatch = (aiAssigneeName: string, participants: any[]) => {
    if (!aiAssigneeName || !participants.length) return "";

    const normalizedAiName = aiAssigneeName.toLowerCase().trim();

    // First try exact match
    let bestMatch = participants.find(
      (p) =>
        p.name.toLowerCase() === normalizedAiName ||
        p.displayName.toLowerCase() === normalizedAiName
    );

    if (bestMatch) return bestMatch.email;

    // Then try partial match (contains)
    bestMatch = participants.find(
      (p) =>
        p.name.toLowerCase().includes(normalizedAiName) ||
        normalizedAiName.includes(p.name.toLowerCase()) ||
        p.displayName.toLowerCase().includes(normalizedAiName) ||
        normalizedAiName.includes(p.displayName.toLowerCase())
    );

    if (bestMatch) return bestMatch.email;

    // Try matching first name or last name
    const aiNameParts = normalizedAiName.split(/\s+/);
    bestMatch = participants.find((p) => {
      const participantNameParts = p.name.toLowerCase().split(/\s+/);
      return aiNameParts.some((part) =>
        participantNameParts.some(
          (pPart: string) =>
            part.length > 2 &&
            pPart.length > 2 &&
            (part.includes(pPart) || pPart.includes(part))
        )
      );
    });

    if (bestMatch) return bestMatch.email;

    // Try matching with email prefix
    bestMatch = participants.find((p) => {
      const emailPrefix = p.email.split("@")[0].toLowerCase();
      return (
        emailPrefix.includes(normalizedAiName) ||
        normalizedAiName.includes(emailPrefix)
      );
    });

    if (bestMatch) return bestMatch.email;

    return ""; // No match found
  };

  // Convert date from dd-mm-yyyy to yyyy-mm-dd for input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      // If already in yyyy-mm-dd format, return as is
      if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
        return dateString;
      }

      // If in dd-mm-yyyy format, convert to yyyy-mm-dd
      if (dateString.includes("-") && dateString.split("-")[0].length === 2) {
        const parts = dateString.split("-");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month}-${day}`;
        }
      }

      // Try to parse as regular date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      return "";
    }
  };

  // Xử lý chỉnh sửa task
  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditedTask({ ...task });
  };

  const handleSaveTask = async () => {
    if (!editedTask) return;

    try {
      // Gọi API update todo
      const updateResult = await todoService.updateTodo(editedTask.id, {
        title: editedTask.title,
        description: editedTask.description,
        startDate: editedTask.startDate,
        endDate: editedTask.endDate,
        assigneeId: editedTask.assigneeId || editedTask.assignee?.id,
      });

      if (updateResult.success) {
        // Cập nhật local state
        setTodoList((prev) =>
          prev.map((task) => (task.id === editedTask.id ? editedTask : task))
        );
        setTodosFromDB((prev) =>
          prev.map((task) => (task.id === editedTask.id ? editedTask : task))
        );

        toast.success("Cập nhật công việc thành công");
        setEditingTaskId(null);
        setEditedTask(null);
      } else {
        toast.error("Cập nhật công việc thất bại: " + updateResult.error);
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Lỗi khi cập nhật công việc");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTask(null);
  };

  // Xử lý mở modal xác nhận xóa task
  const handleOpenDeleteModal = (taskId: string) => {
    setDeleteConfirmModal({ isOpen: true, taskId });
  };

  // Xử lý xóa task
  const handleDeleteTask = async () => {
    if (!deleteConfirmModal.taskId) return;

    try {
      // Gọi API delete todo
      const deleteResult = await todoService.deleteTodo(
        deleteConfirmModal.taskId
      );

      if (deleteResult.success) {
        // Cập nhật local state
        setTodoList((prev) =>
          prev.filter((task) => task.id !== deleteConfirmModal.taskId)
        );
        setTodosFromDB((prev) =>
          prev.filter((task) => task.id !== deleteConfirmModal.taskId)
        );

        toast.success("Xóa công việc thành công");
        setDeleteConfirmModal({ isOpen: false, taskId: null });
      } else {
        toast.error("Xóa công việc thất bại: " + deleteResult.error);
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Lỗi khi xóa công việc");
    }
  };

  // Xử lý hủy xóa task
  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, taskId: null });
  };
  // Xử lý tạo task từ todo
  const handleCreateTask = (taskId: string) => {
    setIsTaskCreated((prev) => ({ ...prev, [taskId]: true }));
  };

  // Xử lý select/deselect task
  const handleSelectTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Xử lý select all tasks
  const handleSelectAllTasks = () => {
    if (selectedTasks.length === todoList.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(todoList.map((todo) => todo.id));
    }
  };

  // Xử lý mở modal confirm convert
  const handleOpenConvertModal = () => {
    setConvertConfirmModal({ isOpen: true, taskCount: selectedTasks.length });
  };

  // Xử lý confirm convert
  const handleConfirmConvert = () => {
    // TODO: Implement convert logic
    console.log("Converting tasks:", selectedTasks);

    // Show success toast
    toast.success(
      `${selectedTasks.length} công việc đã được tạo và phân công thành công cho các thành viên trong nhóm.`
    );

    // Close modal and clear selection
    setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    setSelectedTasks([]);
  };

  // Xử lý cancel convert
  const handleCancelConvert = () => {
    setConvertConfirmModal({ isOpen: false, taskCount: 0 });
  };

  // Memoize todo list rendering to prevent unnecessary re-renders
  const memoizedTodoList = useMemo(() => {
    return todoList.map((todo, index) => {
      // Auto-assign assignee evenly
      const currentAssignee = getTodoAssigneeId(todo);

      return (
        <div
          className={`task-item ai-task ${
            selectedTasks.includes(todo.id) ? "selected" : ""
          } ${editMode[todo.id] ? "edit-mode" : ""}`}
          key={`todo-${todo.id}-${index}`}
          data-task-id={todo.id}
          onClick={(e) => {
            // Don't select if in edit mode
            if (editMode[todo.id]) return;

            // Don't select if clicking on action buttons or checkbox
            const target = e.target as HTMLElement;
            if (
              target.closest(".task-actions") ||
              target.closest(".task-checkbox")
            )
              return;

            // Select/deselect the task
            handleSelectTask(todo.id);
          }}
          style={{ cursor: editMode[todo.id] ? "default" : "pointer" }}
        >
          <div className="task-checkbox">
            <Checkbox
              checked={selectedTasks.includes(todo.id)}
              onCheckedChange={() => handleSelectTask(todo.id)}
              className="task-select-checkbox data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
          </div>
          <div className="task-number">{index + 1}</div>

          <div className="task-content">
            <div className="task-title">
              <label
                className="detail-label"
                style={{ cursor: editMode[todo.id] ? "default" : "pointer" }}
              >
                Tên công việc
              </label>
              {editMode[todo.id] ? (
                <input
                  type="text"
                  value={todo.title || ""}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTodoList((prev) =>
                      prev.map((t) =>
                        t.id === todo.id ? { ...t, title: newTitle } : t
                      )
                    );
                  }}
                  className="task-title-input"
                  placeholder="Nhập tên công việc..."
                  autoFocus
                />
              ) : (
                <div className="task-title-display">
                  {todo.title || "Nhập tên công việc..."}
                </div>
              )}
            </div>

            <div className="task-description">
              <label
                className="detail-label"
                style={{ cursor: editMode[todo.id] ? "default" : "pointer" }}
              >
                Mô tả công việc
              </label>
              {editMode[todo.id] ? (
                <textarea
                  value={todo.description || ""}
                  onChange={(e) => {
                    const newDescription = e.target.value;
                    setTodoList((prev) =>
                      prev.map((t) =>
                        t.id === todo.id
                          ? { ...t, description: newDescription }
                          : t
                      )
                    );
                  }}
                  className="task-description-input"
                  placeholder="Mô tả chi tiết công việc..."
                  rows={2}
                />
              ) : (
                <div className="task-description-display">
                  {todo.description || "Mô tả chi tiết công việc..."}
                </div>
              )}
            </div>

            <div className="task-details">
              <div className="detail-item">
                <label className="detail-label">Ngày bắt đầu</label>
                <div className="detail-value">
                  <Calendar size={14} />
                  {editMode[todo.id] ? (
                    <input
                      type="date"
                      value={todo.startDate || ""}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setTodoList((prev) =>
                          prev.map((t) =>
                            t.id === todo.id
                              ? { ...t, startDate: newStartDate }
                              : t
                          )
                        );
                      }}
                      className="date-input"
                    />
                  ) : (
                    <span>{todo.startDate || "--/--/----"}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">Ngày kết thúc</label>
                <div className="detail-value">
                  <Calendar size={14} />
                  {editMode[todo.id] ? (
                    <input
                      type="date"
                      value={todo.endDate || ""}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        setTodoList((prev) =>
                          prev.map((t) =>
                            t.id === todo.id ? { ...t, endDate: newEndDate } : t
                          )
                        );
                      }}
                      className="date-input"
                    />
                  ) : (
                    <span>{todo.endDate || "--/--/----"}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">Người phụ trách</label>
                <div className="detail-value">
                  <User size={14} />
                  {editMode[todo.id] ? (
                    <select
                      value={currentAssignee || ""}
                      onChange={(e) => {
                        const newAssignee =
                          e.target.value === "" ? null : e.target.value;
                        setTodoList((prev) =>
                          prev.map((t) => {
                            if (t.id === todo.id) {
                              // Handle both AI format (assigneeId) and DB format (assignee object)
                              if (t.assignee) {
                                // DB format: update assignee object
                                return {
                                  ...t,
                                  assignee: newAssignee
                                    ? { ...t.assignee, id: newAssignee }
                                    : null,
                                };
                              } else {
                                // AI format: update assigneeId
                                return { ...t, assigneeId: newAssignee };
                              }
                            }
                            return t;
                          })
                        );
                      }}
                      className="assignee-select"
                    >
                      <option value="">Chưa được giao</option>
                      {meetingInfo?.attendees?.map(
                        (attendee: any, idx: number) => (
                          <option key={idx} value={attendee.id}>
                            {attendee.fullName || attendee.email}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <span>{getTodoAssigneeName(todo)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="task-actions">
            {editMode[todo.id] ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async (e) => {
                    e.stopPropagation();

                    try {
                      // Gọi API update todo
                      const updateResult = await todoService.updateTodo(
                        todo.id,
                        {
                          title: todo.title,
                          description: todo.description,
                          startDate: todo.startDate,
                          endDate: todo.endDate,
                          assigneeId: todo.assigneeId || todo.assignee?.id,
                        }
                      );

                      if (updateResult.success) {
                        // Chỉ cập nhật local state một lần
                        const updatedTodo = { ...todo };
                        setTodoList((prev) =>
                          prev.map((t) => (t.id === todo.id ? updatedTodo : t))
                        );
                        setTodosFromDB((prev) =>
                          prev.map((t) => (t.id === todo.id ? updatedTodo : t))
                        );

                        toast.success("Cập nhật công việc thành công");
                        setEditMode((prev) => ({ ...prev, [todo.id]: false }));
                      } else {
                        toast.error(
                          "Cập nhật công việc thất bại: " + updateResult.error
                        );
                      }
                    } catch (error) {
                      console.error("Error updating todo:", error);
                      toast.error("Lỗi khi cập nhật công việc");
                    }
                  }}
                  className="save-btn"
                  title="Lưu"
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode((prev) => ({ ...prev, [todo.id]: false }));
                  }}
                  className="cancel-btn"
                  title="Hủy"
                >
                  <X size={16} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode((prev) => ({ ...prev, [todo.id]: true }));
                  }}
                  className="edit-btn"
                  title="Chỉnh sửa"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteModal(todo.id);
                  }}
                  className="delete-btn"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </Button>
              </>
            )}
          </div>
        </div>
      );
    });
  }, [todoList, selectedTasks, editMode, meetingInfo?.attendees]);

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
      console.error("Download recording error", err);
      alert("Tải xuống thất bại. Vui lòng thử lại.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    async function fetchMeeting() {
      console.log("🔄 Fetching meeting info for ID:", params.id);
      setIsLoadingMeeting(true);
      try {
        const res = await meetingService.getMeetingById(params.id as string);
        console.log("📋 Meeting fetch response:", res);

        if (res.success && res.data) {
          setMeetingInfo(res.data);
          console.log("✅ Meeting info loaded:", res.data);
        } else {
          console.log("❌ Failed to load meeting info");
          setMeetingInfo(null);
        }
      } catch (err) {
        console.error("❌ Error loading meeting info:", err);
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
        console.log("❌ No meeting ID, skipping todo fetch");
        return;
      }

      console.log("🔄 Fetching todos for meeting:", params.id);
      setIsLoadingTodos(true);
      try {
        const res = await todoService.getTodosByMeetingId(params.id as string);
        console.log("📋 Todo fetch response:", res);

        if (res.success && res.data) {
          setTodosFromDB(res.data);
          console.log("✅ Loaded todos from DB:", res.data);
        } else {
          console.log("ℹ️ No todos found in DB or API error");
          setTodosFromDB([]);
        }
      } catch (err) {
        console.error("❌ Error loading todos:", err);
        setTodosFromDB([]);
      } finally {
        setIsLoadingTodos(false);
      }
    }
    fetchTodos();
  }, [params.id]);

  if (isLoadingCall || isLoadingMeeting) {
    return (
      <div className="meeting-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin cuộc họp...</p>
      </div>
    );
  }

  if (!call || !meetingInfo) {
    return (
      <div className="meeting-detail-error">
        <h3>Không tìm thấy cuộc họp</h3>
        <p>Cuộc họp này không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }
  const getMilestoneName = (milestoneId: string) => {
    const milestone = mockMilestones.find((m) => m.id === milestoneId);
    return milestone ? milestone.name : "Chưa gán milestone";
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
    setShowJoinFlow(true);
    router.push(
      `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingInfo.id}`
    );
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
            Quay lại
          </Button>
          <div className="meeting-title">
            <h1>
              {meetingInfo?.title || call.state?.custom?.title || call.id}
            </h1>
            <div className="meeting-meta">
              <span className="project-name">
                {meetingInfo?.projectName || "Cuộc họp"}
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
          onClick={() => setActiveTab("overview")}
        >
          <FileText size={16} />
          Tổng quan
        </button>
        <button
          className={`tab ${activeTab === "recording" ? "active" : ""}`}
          onClick={() => setActiveTab("recording")}
        >
          <Video size={16} />
          Bản ghi cuộc họp
        </button>
        <button
          className={`tab ${activeTab === "attachments" ? "active" : ""}`}
          onClick={() => setActiveTab("attachments")}
        >
          <Paperclip size={16} />
          Tài liệu
        </button>
      </div>

      {/* Content */}
      <div className="meeting-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="meeting-info">
              <div className="flex justify-between">
                <h3>Thông tin cuộc họp</h3>
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
                    Tham gia ngay
                  </Button>
                )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Tiêu đề:</label>
                  <p>
                    {meetingInfo?.title || call.state?.custom?.title || call.id}
                  </p>
                </div>
                <div className="info-item">
                  <label>Mô tả:</label>
                  <p>{meetingInfo?.description || description}</p>
                </div>
                <div className="info-item">
                  <label>Thời gian bắt đầu:</label>
                  <p>
                    {meetingInfo?.startTime
                      ? new Date(meetingInfo.startTime).toLocaleString("vi-VN")
                      : startsAt?.toLocaleString("vi-VN") || "-"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Thời gian kết thúc:</label>
                  <p>
                    {meetingInfo?.endTime
                      ? new Date(meetingInfo.endTime).toLocaleString("vi-VN")
                      : endsAt?.toLocaleString("vi-VN") || "-"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
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
                  <label>Người tạo:</label>
                  <p>{meetingInfo?.createdByEmail || createdBy}</p>
                </div>
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <p>
                    {meetingInfo?.createdAt
                      ? new Date(meetingInfo.createdAt).toLocaleString("vi-VN")
                      : createdAt?.toLocaleString("vi-VN") || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin dự án và milestone */}
            <div className="project-info">
              <h3>Thông tin dự án</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Dự án:</label>
                  <p>
                    {meetingInfo?.projectName || "Hệ thống quản lý dự án MSP"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Milestone liên quan:</label>
                  <p>{meetingInfo?.milestoneName || milestoneName}</p>
                </div>
                <div className="info-item">
                  <label>Thành viên tham gia:</label>
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
                      <p>Chưa có người tham gia</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Đã bỏ flow MeetingSetup/MeetingRoom khi join trực tiếp */}

        {activeTab === "recording" && (
          <div className="recording-section">
            <h3>Bản ghi cuộc họp & Lời thoại</h3>
            <div className="recording-content">
              <div className="recordings">
                <h4>Bản ghi cuộc họp</h4>
                <div className="recording-list">
                  {isLoadingRecordings && (
                    <div className="recording-loading">Đang tải bản ghi...</div>
                  )}
                  {recordingsError && !isLoadingRecordings && (
                    <div className="recording-error">{recordingsError}</div>
                  )}
                  {/* {!isLoadingRecordings &&
                    !recordingsError &&
                    recordings.length === 0 && (
                      <div className="recording-item mock-recording">
                        <div className="recording-info">
                          <Video size={20} />
                          <div>
                            <h5>Mock Data Bản Ghi Cuộc Họp</h5>
                            <p>
                              {new Date().toLocaleString("vi-VN")}
                              <span className="recording-duration">
                                {" "}
                                · Thời lượng: 45:30
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="recording-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              alert(
                                "Đây là mock data - không có bản ghi thực tế"
                              )
                            }
                          >
                            <Play size={16} />
                            Xem
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              alert(
                                "Đây là mock data - không có bản ghi thực tế"
                              )
                            }
                          >
                            <Download size={16} />
                            Tải xuống
                          </Button>
                        </div>
                      </div>
                    )} */}
                  {!isLoadingRecordings &&
                    !recordingsError &&
                    (() => {
                      // Ưu tiên hiển thị recordUrl từ DB trước
                      if (meetingInfo?.recordUrl) {
                        return (
                          <div className="recording-item" key="db-recording">
                            <div className="recording-info">
                              <Video size={20} />
                              <div>
                                <h5>Bản ghi cuộc họp</h5>
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
                                Xem
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                  downloadingId === meetingInfo.recordUrl
                                }
                                onClick={() => {
                                  // Tạo fake recording object để sử dụng handleDownload
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
                                  ? "Đang tải..."
                                  : "Tải xuống"}
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      // Fallback sang Stream recordings nếu không có trong DB
                      if (recordings.length === 0) {
                        return (
                          <div className="recording-empty">
                            <p>Chưa có bản ghi cuộc họp</p>
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
                                      · Thời lượng: {duration}
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
                                  Xem
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
                                    ? "Đang tải..."
                                    : "Tải xuống"}
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
                <h4>Lời thoại</h4>
                {isLoadingTranscriptions && (
                  <div className="transcript-loading">
                    Đang tải lời thoại...
                  </div>
                )}
                {transcriptionsError && !isLoadingTranscriptions && (
                  <div className="transcript-error">{transcriptionsError}</div>
                )}
                {!isLoadingTranscriptions &&
                  !transcriptionsError &&
                  transcriptions.length === 0 && (
                    <div className="transcript-empty">
                      Chưa có transcript cho cuộc họp này
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
                    <span>Đang tạo transcript của cuộc họp...</span>
                  </div>
                )}
                {!isProcessingMeetingAI && improvedTranscript.length > 0 && (
                  <div
                    className={`transcript-content ${
                      isTranscriptExpanded ? "expanded" : ""
                    }`}
                    onClick={() =>
                      setIsTranscriptExpanded(!isTranscriptExpanded)
                    }
                  >
                    {improvedTranscript.map((item, index) => (
                      <div key={index} className="transcript-item">
                        <span className="timestamp">
                          {formatTimestamp(item.startTs)}
                        </span>
                        <div className="transcript-text">
                          <strong>{getSpeakerName(item.speakerId)}:</strong>{" "}
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isProcessingMeetingAI &&
                  improvedTranscript.length > 0 &&
                  !isTranscriptExpanded && (
                    <div className="transcript-expand-hint">
                      <span>Click để xem toàn bộ lời thoại</span>
                    </div>
                  )}
              </div>

              <div className="summary">
                <div className="summary-header">
                  <div className="summary-title">
                    <div className="ai-icon">
                      <Sparkles size={20} />
                    </div>
                    <h4>Tóm tắt AI</h4>
                    <div className="ai-badge">Powered by AI</div>
                  </div>
                </div>
                <div className="summary-content">
                  {isProcessingMeetingAI && (
                    <div className="summary-loading">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang tạo tóm tắt...</span>
                    </div>
                  )}
                  {/* {summaryError && !isLoadingSummary && (
                    <div className="summary-error">
                      <p>{summaryError}</p>
                    </div>
                  )} */}
                  {!isProcessingMeetingAI && summary && <p>{summary}</p>}
                </div>
              </div>

              {/* AI Generated Tasks */}
              {(todoList.length > 0 || isProcessingMeetingAI) && (
                <div className="ai-generated-tasks">
                  <div className="ai-tasks-header">
                    <div className="ai-tasks-title">
                      <div className="ai-icon">
                        <Sparkles size={18} />
                      </div>
                      <div className="title-content">
                        <h4>Danh sách To-do từ AI</h4>
                        <p className="draft-notice">
                          <Edit3 size={12} />
                          <span>Bản nháp - Cần xem xét và chỉnh sửa</span>
                        </p>
                      </div>
                    </div>
                    {todoList.length > 0 && (
                      <label className="select-all-section">
                        <Checkbox
                          checked={selectedTasks.length === todoList.length}
                          onCheckedChange={handleSelectAllTasks}
                          className="select-all-checkbox data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <span className="select-all-label">
                          Chọn tất cả({selectedTasks.length} / {todoList.length}
                          )
                        </span>
                      </label>
                    )}
                  </div>

                  {isProcessingMeetingAI && (
                    <div className="tasks-loading">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang tạo danh sách To-do...</span>
                    </div>
                  )}

                  <div className="task-list">{memoizedTodoList}</div>

                  {/* Action buttons for the entire AI task list */}
                  <div className="ai-tasks-actions">
                    <Button
                      onClick={handleOpenConvertModal}
                      className="convert-all-btn"
                      variant="default"
                      disabled={selectedTasks.length === 0}
                    >
                      <Target size={16} />
                      Chuyển đổi thành công việc chính thức
                    </Button>

                    <Button
                      disabled={isGeneratingTasks}
                      onClick={() => {
                        // Handle regenerate AI tasks
                        setGeneratedTasks([]);
                        // generateSummaryAndTasks();
                      }}
                      className="regenerate-btn"
                      variant="outline"
                    >
                      <Sparkles size={16} />
                      Tạo lại danh sách bằng AI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <div className="delete-icon">
                <Trash2 size={24} />
              </div>
              <h3>Xác nhận xóa task</h3>
            </div>
            <div className="delete-modal-content">
              <p>Bạn có chắc chắn muốn xóa To-do này không?</p>
              <p className="delete-warning">
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="delete-modal-actions">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="cancel-btn"
              >
                Hủy
              </Button>
              <Button onClick={handleDeleteTask} className="confirm-delete-btn">
                <Trash2 size={16} />
                Xóa task
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Confirmation Modal */}
      {convertConfirmModal.isOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-3 flex items-center justify-center">
              <VoteIcon color="#10b981" size={60} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2">
              Chuyển đổi thành Nhiệm vụ Chính thức?
            </h3>

            {/* Content */}
            <div className="delete-modal-content mb-4">
              <p>
                Bạn sắp chuyển đổi{" "}
                <strong>{convertConfirmModal.taskCount} việc cần làm</strong> do
                AI tạo thành công việc chính thức. Những việc này sẽ được thêm
                vào trong dự án của bạn và các thành viên liên quan trong nhóm
                sẽ nhận được thông báo.
              </p>
            </div>

            {/* Actions */}
            <div className="delete-modal-actions flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelConvert}
                className="cancel-btn"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmConvert}
                className="confirm-delete-btn"
                style={{ background: "#FF5E13" }}
              >
                Xác nhận chuyển đổi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
