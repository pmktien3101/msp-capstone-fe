"use client";

import { useState, useEffect, use, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Video,
  FileText,
  Paperclip,
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
import { meetingService } from "@/services/meetingService";
import { todoService } from "@/services/todoService";
import TranscriptPanel from "@/components/meeting/TranscriptPanel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Todo } from "@/types/todo";
import { uploadFileToCloudinary } from "@/services/uploadFileService";

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
  const [error, setError] = useState<string | null>(null);

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
        err?.message || "Không thể tải lên cloud. Vui lòng thử lại."
      );
    }
  };

  const processVideo = async (recording: any, transcriptions: any) => {
    setIsProcessingMeetingAI(true);
    setError(null);

    try {
      // 1) Upload recording từ Stream lên Cloud (nếu chưa có trong DB)
      let cloudRecordingUrl = meetingInfo?.recordUrl || null;
      if (!cloudRecordingUrl) {
        if (!recording?.url)
          throw new Error("Không tìm thấy URL bản ghi để upload");
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
            uploadErr?.message || "Tải lên bản ghi lên cloud thất bại"
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
              return { ...todo, assigneeId: validAssigneeId };
            });

            const createTodosResult = await todoService.createTodosFromAI(
              params.id as string,
              mappedTodoList
            );

            if (createTodosResult.success) {
              toast.success(
                `${createTodosResult.data?.length || 0
                } công việc đã được tạo từ AI`
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
                "Tạo công việc từ AI thất bại: " + createTodosResult.error
              );
            }
          } catch (todoError) {
            toast.error("Lỗi khi tạo công việc từ AI");
          }
        }
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message || "Không thể xử lý video. Vui lòng thử lại.");
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
    processVideo(recordings[0], originalTranscriptions);
  }, [
    originalTranscriptions,
    recordings,
    meetingInfo,
    isLoadingMeeting,
    todosFromDB,
  ]);

  useEffect(() => {
    if (improvedTranscript && summary && todoList) {
      // console.log("✅ All data ready:", {
      //   transcriptCount: improvedTranscript.length,
      //   hasSummary: !!summary,
      //   hasTodoList: !!todoList,
      // });
    }
  }, [improvedTranscript, summary, todoList]);

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
      // console.error("Error deleting todo:", error);
      toast.error("Lỗi khi xóa công việc");
    }
  };

  // Xử lý hủy xóa task
  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, taskId: null });
  };

  // Xử lý select/deselect task
  const handleSelectTask = (taskId: string) => {
    const todo = todoList.find((t) => t.id === taskId);
    if (!isValidTodo(todo) ||
      todo.status === 2 || // ConvertedToTask
      todo.status === 3   // Deleted
    ) {
      toast.warning(
        "To-do đã được chuyển đổi hoặc thiếu thông tin cần thiết"
      );
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
    const eligibleIds = todoList.filter(t => isValidTodo(t)
      && t.status !== 2 // ConvertedToTask
      && t.status !== 3 // Deleted
    ).map((t) => t.id);
    if (selectedTasks.length === eligibleIds.length)
      setSelectedTasks([]);
    else setSelectedTasks(eligibleIds);
  };

  // Xử lý mở modal confirm convert
  const handleOpenConvertModal = () => {
    setConvertConfirmModal({ isOpen: true, taskCount: selectedTasks.length });
  };

  // Xử lý confirm convert
  const handleConfirmConvert = async () => {
    if (selectedTasks.length === 0) {
      toast.warning("Bạn phải chọn ít nhất một To-do để chuyển!");
      return;
    }

    // Có thể hiển thị loading ở đây nếu muốn
    try {
      const result = await todoService.convertTodosToTasks(selectedTasks);

      if (result.success) {
        toast.success(
          `Chuyển thành công ${result.data?.length} công việc cho dự án!`
        );
        // Xoá selection và đóng modal
        setSelectedTasks([]);
        setConvertConfirmModal({ isOpen: false, taskCount: 0 });

        // Refresh lại danh sách todo (nếu còn trong DB thì lọc IsDeleted)
        // const refreshedTodos = await todoService.getTodosByMeetingId(meetingInfo.id);
        // if (refreshedTodos.success) {
        //   setTodosFromDB(refreshedTodos.data ?? []);
        //   setTodoList(refreshedTodos.data ?? []);
        // }

        if (meetingInfo?.projectId) {
          // Chuyển về trang chi tiết project
          setTimeout(() => {
            router.push(`/projects/${meetingInfo.projectId}?tab=board`);
          }, 600);
        }

        // Nếu có list task trả về, có thể push vào ProjectTask trong frontend/project context nếu cần
      } else {
        toast.error(result.error || "Không thể chuyển đổi các To-do đã chọn!");
        setConvertConfirmModal({ isOpen: false, taskCount: 0 });
      }
    } catch (error) {
      toast.error("Có lỗi kết nối khi chuyển đổi công việc!");
      setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    }

    // Close modal and clear selection
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
        return "Mới tạo";
      case "UnderReview":
        return "Đã chỉnh sửa";
      case "ConvertedToTask":
        return "Đã chuyển đổi thành công việc";
      case "Deleted":
        return "Đã xóa";
      default:
        return statusDisplay;
    }
  };

  // Memoize todo list rendering to prevent unnecessary re-renders
  const memoizedTodoList = useMemo(() => {
    return todoList.map((todo, index) => {
      // Auto-assign assignee evenly
      const currentAssignee = getTodoAssigneeId(todo);

      return (
        <div
          className={`task-item ai-task ${selectedTasks.includes(todo.id) ? "selected" : ""
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
              disabled={!isValidTodo(todo)}
              onCheckedChange={() => handleSelectTask(todo.id)}
              className="task-select-checkbox data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
          </div>
          <div className="task-number">{index + 1}</div>

          <div className="task-content">
            {/* Status Badge */}
            <div className="task-status-badge">
              <span
                className="status-badge"
                style={getTodoStatusStyle(todo.status)}
              >
                {getTodoStatusLabel(todo.statusDisplay)}
              </span>
            </div>

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
                    <DatePicker
                      selected={
                        todo.startDate ? new Date(todo.startDate) : null
                      }
                      onChange={(date) => {
                        setTodoList((prev) =>
                          prev.map((t) =>
                            t.id === todo.id
                              ? { ...t, startDate: date?.toISOString() || null }
                              : t
                          )
                        );
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-input"
                    />
                  ) : (
                    <span>{formatDate(todo.startDate) || "--/--/----"}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <label className="detail-label">Ngày kết thúc</label>
                <div className="detail-value">
                  <Calendar size={14} />
                  {editMode[todo.id] ? (
                    <DatePicker
                      selected={todo.endDate ? new Date(todo.endDate) : null}
                      onChange={(date) => {
                        setTodoList((prev) =>
                          prev.map((t) =>
                            t.id === todo.id
                              ? { ...t, endDate: date?.toISOString() || null }
                              : t
                          )
                        );
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="date-input"
                    />
                  ) : (
                    <span>{formatDate(todo.endDate) || "--/--/----"}</span>
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
                        const newAssigneeId =
                          e.target.value === "" ? null : e.target.value;

                        // Tìm thông tin đầy đủ của assignee mới
                        const newAssigneeInfo = newAssigneeId
                          ? meetingInfo?.attendees?.find(
                            (att: any) => att.id === newAssigneeId
                          )
                          : null;

                        setTodoList((prev) =>
                          prev.map((t) => {
                            if (t.id === todo.id) {
                              // Đồng bộ cả assigneeId và assignee object
                              return {
                                ...t,
                                assigneeId: newAssigneeId,
                                assignee: newAssigneeInfo
                                  ? {
                                    id: newAssigneeInfo.id,
                                    fullName: newAssigneeInfo.fullName,
                                    email: newAssigneeInfo.email,
                                  }
                                  : null,
                              };
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
                      // Lấy assigneeId mới
                      const newAssigneeId =
                        todo.assigneeId || todo.assignee?.id;

                      // Gọi API update todo
                      const updateResult = await todoService.updateTodo(
                        todo.id,
                        {
                          title: todo.title,
                          description: todo.description,
                          startDate: todo.startDate,
                          endDate: todo.endDate,
                          assigneeId: newAssigneeId,
                        }
                      );

                      if (updateResult.success) {
                        // Tìm thông tin assignee mới từ meetingInfo.attendees
                        const newAssignee = meetingInfo?.attendees?.find(
                          (att: any) => att.id === newAssigneeId
                        );

                        // Tạo updated todo với cả assignee object và assigneeId được đồng bộ
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

                        // Cập nhật local state
                        setTodoList((prev) =>
                          prev.map((t) => (t.id === todo.id ? updatedTodo : t))
                        );
                        setTodosFromDB((prev) =>
                          prev.map((t) => (t.id === todo.id ? updatedTodo : t))
                        );

                        toast.success("Cập nhật công việc thành công");

                        // Xóa cache
                        setOriginalTodoCache((prev) => {
                          const copy = { ...prev };
                          delete copy[todo.id];
                          return copy;
                        });

                        setEditMode((prev) => ({ ...prev, [todo.id]: false }));
                      } else {
                        toast.error(
                          "Cập nhật công việc thất bại: " + updateResult.error
                        );
                      }
                    } catch (error) {
                      // console.error("Error updating todo:", error);
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

                    if (originalTodoCache[todo.id]) {
                      // Trả lại giá trị ban đầu từ cache
                      setTodoList((prev) =>
                        prev.map((t) =>
                          t.id === todo.id ? originalTodoCache[todo.id] : t
                        )
                      );
                      setTodosFromDB((prev) =>
                        prev.map((t) =>
                          t.id === todo.id ? originalTodoCache[todo.id] : t
                        )
                      );
                      setOriginalTodoCache((prev) => {
                        const c = { ...prev };
                        delete c[todo.id];
                        return c;
                      });
                    }

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
                    setOriginalTodoCache((prev) => ({
                      ...prev,
                      [todo.id]: { ...todo }, // Lưu bản gốc trước khi user sửa
                    }));
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
      // console.error("Download recording error", err);
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
          onClick={() => handleChangeTab("overview")}
        >
          <FileText size={16} />
          Tổng quan
        </button>
        <button
          className={`tab ${activeTab === "recording" ? "active" : ""}`}
          onClick={() => handleChangeTab("recording")}
        >
          <Video size={16} />
          Bản ghi cuộc họp
        </button>
        <button
          className={`tab ${activeTab === "attachments" ? "active" : ""}`}
          onClick={() => handleChangeTab("attachments")}
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
                {!isLoadingTranscriptions &&
                  (originalTranscriptions.length === 0 && improvedTranscript.length === 0) && (
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
                            <span>Thu gọn lời thoại</span>
                            <ArrowLeft
                              size={16}
                              style={{ transform: "rotate(90deg)" }}
                            />
                          </>
                        ) : (
                          <>
                            <span>
                              Xem toàn bộ lời thoại ({improvedTranscript.length}{" "}
                              đoạn)
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
                      <h4>Tóm tắt cuộc họp bằng AI</h4>
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
                      <span>Đang tạo tóm tắt...</span>
                    </div>
                  )}
                  {!isProcessingMeetingAI && summary && (
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  )}
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

                    {/* <Button
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
                    </Button> */}
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
              Chuyển đổi thành Công việc Chính thức?
            </h3>

            {/* Content */}
            <div className="delete-modal-content mb-4">
              <p>
                Bạn sắp chuyển đổi{" "}
                <strong>{convertConfirmModal.taskCount} to-do</strong> do AI tạo
                thành "công việc chính thức". Những việc này sẽ được thêm vào
                trong dự án của bạn và các thành viên liên quan trong nhóm sẽ
                nhận được thông báo.
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
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
