"use client";

import { useState, useEffect, use, useRef } from "react";
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

// Environment-configurable API bases
const stripSlash = (s: string) => s.replace(/\/$/, "");
const API_BASE = stripSlash(process.env.NEXT_PUBLIC_API_URL || "https://localhost:7129/api/v1");

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
  const [transcriptionsError, setTranscriptionsError] = useState<string | null>(null);
  // const [summary, setSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean, taskId: string | null }>({ isOpen: false, taskId: null });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [convertConfirmModal, setConvertConfirmModal] = useState<{ isOpen: boolean, taskCount: number }>({ isOpen: false, taskCount: 0 });

  // State để lưu kết quả
  const [improvedTranscript, setImprovedTranscript] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [todoList, setTodoList] = useState<any[]>([]);
  const [isProcessingMeetingAI, setIsProcessingMeetingAI] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Fetch recordings when switching to recording tab and call is available
  useEffect(() => {
    const loadRecordings = async () => {
      if (!call) return;
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
  }, [activeTab, call]);

  // Fetch transcriptions when switching to recording tab
  useEffect(() => {
    const loadTranscriptions = async () => {
      if (!call?.id) return;
      setIsLoadingTranscriptions(true);
      setTranscriptionsError(null);
      try {
        const response = await fetch(`${API_BASE}/stream/call/default/${call.id}/transcriptions`);
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

  // Generate summary and todo list when transcriptions are loaded
  // const generateSummaryAndTasks = async () => {
  //   if (transcriptions.length === 0) return;

  //   setIsLoadingSummary(true);
  //   setIsGeneratingTasks(true);
  //   setSummaryError(null);
  //   try {
  //     // Format transcriptions into text
  //     const formattedText = transcriptions
  //       .map(item => `${getSpeakerName(item.speakerId)}: ${item.text}`)
  //       .join('\n');

  //     // Generate summary
  //     const summaryResponse = await fetch(`${API_BASE}/Summarize/summary`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         text: formattedText
  //       })
  //     });

  //     if (!summaryResponse.ok) {
  //       throw new Error(`HTTP error! status: ${summaryResponse.status}`);
  //     }

  //     const summaryResult = await summaryResponse.json();
  //     setSummary(summaryResult.data?.summary || "Không thể tạo tóm tắt");

  //     // Generate todo list with participants info for better assignment
  //     const participantsInfo = {
  //       participants: participantEmails.map((email, index) => ({
  //         id: `speaker_${index + 1}`,
  //         name: email.split('@')[0], // Extract name from email
  //         email: email,
  //         displayName: email
  //       })),
  //       speakerMapping: {
  //         "1": participantEmails[0]?.split('@')[0] || "Speaker 1",
  //         "2": participantEmails[1]?.split('@')[0] || "Speaker 2",
  //         "3": participantEmails[2]?.split('@')[0] || "Speaker 3",
  //         "4": participantEmails[3]?.split('@')[0] || "Speaker 4",
  //         "5": participantEmails[4]?.split('@')[0] || "Speaker 5"
  //       }
  //     };

  //     const requestBody = {
  //       text: formattedText,
  //       participants: participantsInfo.participants,
  //       speakerMapping: participantsInfo.speakerMapping,
  //       meetingInfo: {
  //         title: call?.state?.custom?.title || call?.id || "Unknown Meeting",
  //         description: description,
  //         milestone: milestoneName
  //       }
  //     };

  //     console.log("Sending to API:", requestBody);

  //     const tasksResponse = await fetch(`${API_BASE}/Summarize/create-todolist`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(requestBody)
  //     });

  //     if (!tasksResponse.ok) {
  //       throw new Error(`HTTP error! status: ${tasksResponse.status}`);
  //     }

  //     const tasksResult = await tasksResponse.json();
  //     console.log("API Response:", tasksResult);

  //     // Parse the JSON string from result.data.summary
  //     const summaryText = tasksResult.data?.summary || "";
  //     console.log("Summary text:", summaryText);

  //     if (!summaryText) {
  //       throw new Error("Không có dữ liệu summary từ API");
  //     }

  //     // Extract JSON from the response (handle both ```json and `json formats)
  //     let jsonString;

  //     // Try markdown code block format first
  //     let jsonMatch = summaryText.match(/```json\n([\s\S]*?)\n```/);
  //     if (jsonMatch) {
  //       jsonString = jsonMatch[1];
  //     } else {
  //       // Try simple `json format
  //       jsonMatch = summaryText.match(/`json\n([\s\S]*?)\n`/);
  //       if (jsonMatch) {
  //         jsonString = jsonMatch[1];
  //       } else {
  //         // Try without backticks - just look for JSON array
  //         jsonMatch = summaryText.match(/\[[\s\S]*\]/);
  //         if (jsonMatch) {
  //           jsonString = jsonMatch[0];
  //         } else {
  //           console.error("Could not find JSON in summary:", summaryText);
  //           throw new Error("Không thể tìm thấy JSON trong response. Format không đúng.");
  //         }
  //       }
  //     }
  //     console.log("Extracted JSON string:", jsonString);

  //     let tasksArray;
  //     try {
  //       tasksArray = JSON.parse(jsonString);
  //     } catch (parseError) {
  //       console.error("JSON Parse Error:", parseError);
  //       console.error("JSON String:", jsonString);
  //       throw new Error("Không thể parse JSON từ response");
  //     }

  //     if (!Array.isArray(tasksArray)) {
  //       throw new Error("Dữ liệu trả về không phải là array");
  //     }

  //     // Convert to our task format with intelligent assignee matching
  //     const generatedTasks = tasksArray.map((task: any, index: number) => {
  //       // Try to find best matching participant for assignee
  //       const matchedEmail = findBestMatch(task.assignee || "", participantsInfo.participants);

  //       return {
  //         id: `AI-${index + 1}`,
  //         task: task.task || "",
  //         assignee: matchedEmail || task.assignee || "",
  //         startDate: task.startDate || "",
  //         endDate: task.endDate || "",
  //         priority: task.priority || "",
  //         originalAssignee: task.assignee || "", // Keep original name for reference
  //         isAutoMatched: !!matchedEmail, // Flag to show if it was auto-matched
  //       };
  //     });

  //     console.log("Generated tasks:", generatedTasks);
  //     setGeneratedTasks(generatedTasks);

  //   } catch (e: any) {
  //     console.error("Failed to generate summary and tasks", e);
  //     setSummaryError("Không thể tạo tóm tắt và todo list");
  //   } finally {
  //     setIsLoadingSummary(false);
  //     setIsGeneratingTasks(false);
  //   }
  // };

  const hasProcessedRef = useRef(false);
  // Định nghĩa async function xử lý video
  const processVideo = async (recording: any, transcriptions: any) => {
    setIsProcessingMeetingAI(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: recording.url, // Lấy URL từ recording object
          transcriptSegments: transcriptions,
        }),
      });

      const data = await response.json();

      console.log('GEMINI API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      if (data.success) {
        // Cập nhật state với kết quả
        // setImprovedTranscript(data.data.improvedTranscript);
        setImprovedTranscript(data.data.improvedTranscript);
        setSummary(data.data.summary);
        setTodoList(data.data.todoList);

        console.log('Processing complete!', data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Error processing video:', err);
      setError(err.message || 'Không thể xử lý video. Vui lòng thử lại.');
    } finally {
      setIsProcessingMeetingAI(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered:', {
      hasTranscriptions: !!transcriptions?.length,
      hasRecording: !!recordings[0]?.url,
      hasProcessed: hasProcessedRef.current
    });

    if (!transcriptions || transcriptions.length === 0 || !recordings[0]?.url) {
      console.log('⏸️ Missing data');
      return;
    }

    if (hasProcessedRef.current) {
      console.log('⏸️ Already processed');
      return;
    }

    console.log('▶️ Starting processVideo');
    hasProcessedRef.current = true;
    processVideo(recordings[0], transcriptions);
  }, [transcriptions, recordings]);

  useEffect(() => {
    if (improvedTranscript && summary && todoList) {
      console.log("✅ All data ready:", {
        transcriptCount: improvedTranscript.length,
        hasSummary: !!summary,
        hasTodoList: !!todoList
      });
    }
  }, [improvedTranscript, summary, todoList]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "#47D69D";
      case "Finished":
        return "#A41F39";
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
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Get speaker name from speakerId
  const getSpeakerName = (speakerId: string) => {
    // Map speakerId to actual names - you can customize this based on your data
    const speakerMap: { [key: string]: string } = {
      "1": "Nguyễn Văn A",
      "2": "Trần Thị B",
      "3": "Lê Văn C",
      "4": "Phạm Thị D",
      "5": "Hoàng Văn E",
      "male-voice": "Giọng Nam Bên Ngoài",
      "female-voice": "Giọng Nữ Bên Ngoài"
    };
    return speakerMap[speakerId] || `Speaker ${speakerId}`;
  };

  // Format date to dd-mm-yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa rõ";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Chưa rõ";

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
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
    let bestMatch = participants.find(p =>
      p.name.toLowerCase() === normalizedAiName ||
      p.displayName.toLowerCase() === normalizedAiName
    );

    if (bestMatch) return bestMatch.email;

    // Then try partial match (contains)
    bestMatch = participants.find(p =>
      p.name.toLowerCase().includes(normalizedAiName) ||
      normalizedAiName.includes(p.name.toLowerCase()) ||
      p.displayName.toLowerCase().includes(normalizedAiName) ||
      normalizedAiName.includes(p.displayName.toLowerCase())
    );

    if (bestMatch) return bestMatch.email;

    // Try matching first name or last name
    const aiNameParts = normalizedAiName.split(/\s+/);
    bestMatch = participants.find(p => {
      const participantNameParts = p.name.toLowerCase().split(/\s+/);
      return aiNameParts.some(part =>
        participantNameParts.some((pPart: string) =>
          part.length > 2 && pPart.length > 2 &&
          (part.includes(pPart) || pPart.includes(part))
        )
      );
    });

    if (bestMatch) return bestMatch.email;

    // Try matching with email prefix
    bestMatch = participants.find(p => {
      const emailPrefix = p.email.split('@')[0].toLowerCase();
      return emailPrefix.includes(normalizedAiName) ||
        normalizedAiName.includes(emailPrefix);
    });

    if (bestMatch) return bestMatch.email;

    return ""; // No match found
  };

  // Convert date from dd-mm-yyyy to yyyy-mm-dd for input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      // If already in yyyy-mm-dd format, return as is
      if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
        return dateString;
      }

      // If in dd-mm-yyyy format, convert to yyyy-mm-dd
      if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month}-${day}`;
        }
      }

      // Try to parse as regular date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

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

  const handleSaveTask = () => {
    if (!editedTask) return;

    setGeneratedTasks((prev) =>
      prev.map((task) => (task.id === editingTaskId ? editedTask : task))
    );
    setEditingTaskId(null);
    setEditedTask(null);
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
  const handleDeleteTask = () => {
    if (deleteConfirmModal.taskId) {
      setGeneratedTasks(prev => prev.filter(task => task.id !== deleteConfirmModal.taskId));
      setDeleteConfirmModal({ isOpen: false, taskId: null });
    }
  };

  // Xử lý hủy xóa task
  const handleCancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, taskId: null });
  };

  // Xử lý select/deselect task
  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Xử lý select all tasks
  const handleSelectAllTasks = () => {
    if (selectedTasks.length === todoList.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(todoList.map(todo => todo.id));
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
    toast.success(`${selectedTasks.length} công việc đã được tạo và phân công thành công cho các thành viên trong nhóm.`);

    // Close modal and clear selection
    setConvertConfirmModal({ isOpen: false, taskCount: 0 });
    setSelectedTasks([]);
  };

  // Xử lý cancel convert
  const handleCancelConvert = () => {
    setConvertConfirmModal({ isOpen: false, taskCount: 0 });
  };

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

  if (isLoadingCall) {
    return (
      <div className="meeting-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin cuộc họp...</p>
      </div>
    );
  }

  if (!call) {
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
            <h1>{call.state?.custom?.title || call.id}</h1>
            <div className="meeting-meta">
              <span className="project-name">Cuộc họp</span>
            </div>
          </div>
          <span
            className="meeting-status"
            style={{ backgroundColor: getStatusColor(status) }}
          >
            {getStatusLabel(status)}
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
              <h3>Thông tin cuộc họp</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tiêu đề:</label>
                  <p>{call.state?.custom?.title || call.id}</p>
                </div>
                <div className="info-item">
                  <label>Mô tả:</label>
                  <p>{description}</p>
                </div>
                <div className="info-item">
                  <label>Thời gian bắt đầu:</label>
                  <p>{startsAt ? startsAt.toLocaleString("vi-VN") : "-"}</p>
                </div>
                <div className="info-item">
                  <label>Thời gian kết thúc:</label>
                  <p>
                    {endsAt ? new Date(endsAt).toLocaleString("vi-VN") : "-"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(status) }}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>
                {getStatusLabel(status) !== "Hoàn thành" && (
                  <div className="info-item">
                    <label>Tham gia cuộc họp:</label>
                    <button
                      onClick={() =>
                        window.open(`/meeting/${call.id}`, "_blank")
                      }
                      className="room-link"
                    >
                      Nhấn để tham gia
                    </button>
                  </div>
                )}
                <div className="info-item">
                  <label>Người tạo:</label>
                  <p>{createdBy}</p>
                </div>
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <p>{createdAt ? createdAt.toLocaleString("vi-VN") : "-"}</p>
                </div>
              </div>
            </div>

            {/* Thông tin dự án và milestone */}
            <div className="project-info">
              <h3>Thông tin dự án</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Dự án:</label>
                  <p>Hệ thống quản lý dự án MSP</p>
                </div>
                <div className="info-item">
                  <label>Milestone liên quan:</label>
                  <p>{milestoneName}</p>
                </div>
                <div className="info-item">
                  <label>Thành viên tham gia:</label>
                  <div className="participants">
                    {participantEmails.length > 0 ? (
                      <ul>
                        {participantEmails.map((email: string, idx: number) => (
                          <li className="participant" key={idx}>
                            {email}
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

            {/* Thống kê cuộc họp */}
            <div className="meeting-stats">
              <h3>Thống kê cuộc họp</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">
                    <User size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">5</span>
                    <span className="stat-label">Thành viên</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">90</span>
                    <span className="stat-label">Phút</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <CheckSquare size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">3</span>
                    <span className="stat-label">Action Items</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FileText size={20} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">1</span>
                    <span className="stat-label">Tài liệu</span>
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
                    recordings.map((rec, idx) => {
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
                                onClick={() => window.open(rec.url!, "_blank")}
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
                    })}
                </div>
              </div>

              <div className="transcript">
                <h4>Transcript</h4>
                {isLoadingTranscriptions && (
                  <div className="transcript-loading">Đang tải transcript...</div>
                )}
                {transcriptionsError && !isLoadingTranscriptions && (
                  <div className="transcript-error">{transcriptionsError}</div>
                )}
                {!isLoadingTranscriptions && !transcriptionsError && transcriptions.length === 0 && (
                  <div className="transcript-empty">Chưa có transcript cho cuộc họp này</div>
                )}
                {isProcessingMeetingAI && (
                  <div className="transcript-processing"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      padding: '40px 20px',
                      minHeight: '200px'
                    }}>
                    <Loader2 size={50} className="animate-spin" />
                    <span>Đang tạo transcript của cuộc họp...</span>
                  </div>
                )}
                {!isProcessingMeetingAI && improvedTranscript.length > 0 && (
                  <div
                    className={`transcript-content ${isTranscriptExpanded ? "expanded" : ""
                      }`}
                    onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                  >
                    {improvedTranscript.map((item, index) => (
                      <div key={index} className="transcript-item">
                        <span className="timestamp">{formatTimestamp(item.startTs)}</span>
                        <div className="transcript-text">
                          <strong>{getSpeakerName(item.speakerId)}:</strong> {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isProcessingMeetingAI && improvedTranscript.length > 0  && !isTranscriptExpanded && (
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
                  {!isProcessingMeetingAI && summary && (
                    <p>{summary}</p>
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
                          Chọn tất cả ({selectedTasks.length}/{todoList.length})
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

                  <div className="task-list">
                    {todoList.map((todo, index) => {
                      // Auto-assign assignee evenly
                      const currentAssignee = todo.assigneeId;

                      return (
                        <div
                          className={`task-item ai-task ${selectedTasks.includes(todo.id) ? 'selected' : ''} ${editMode[todo.id] ? 'edit-mode' : ''}`}
                          key={todo.id}
                          data-task-id={todo.id}
                          onClick={(e) => {
                            // Don't select if in edit mode
                            if (editMode[todo.id]) return;

                            // Don't select if clicking on action buttons or checkbox
                            const target = e.target as HTMLElement;
                            if (target.closest('.task-actions') || target.closest('.task-checkbox')) return;

                            // Select/deselect the task
                            handleSelectTask(todo.id);
                          }}
                          style={{ cursor: editMode[todo.id] ? 'default' : 'pointer' }}
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
                              <label className="detail-label"
                                style={{ cursor: editMode[todo.id] ? 'default' : 'pointer' }}
                              >Tên công việc</label>
                              {editMode[todo.id] ? (
                                <input
                                  type="text"
                                  value={todo.title || ""}
                                  onChange={(e) => {
                                    const updatedTasks = todoList.map(t =>
                                      t.id === todo.id ? { ...t, title: e.target.value } : t
                                    );
                                    setTodoList(updatedTasks);
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
                              <label className="detail-label"
                                style={{ cursor: editMode[todo.id] ? 'default' : 'pointer' }}
                              >Mô tả công việc</label>
                              {editMode[todo.id] ? (
                                <textarea
                                  value={todo.description || ""}
                                  onChange={(e) => {
                                    const updatedTasks = generatedTasks.map(t =>
                                      t.id === todo.id ? { ...t, description: e.target.value } : t
                                    );
                                    setGeneratedTasks(updatedTasks);
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
                                        const updatedTasks = generatedTasks.map(t =>
                                          t.id === todo.id ? { ...t, startDate: e.target.value } : t
                                        );
                                        setGeneratedTasks(updatedTasks);
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
                                        const updatedTasks = generatedTasks.map(t =>
                                          t.id === todo.id ? { ...t, endDate: e.target.value } : t
                                        );
                                        setGeneratedTasks(updatedTasks);
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
                                        const newAssignee = e.target.value === "" ? null : e.target.value;
                                        const updatedTasks = generatedTasks.map(t =>
                                          t.id === todo.id ? { ...t, assignee: newAssignee } : t
                                        );
                                        setGeneratedTasks(updatedTasks);
                                      }}
                                      className="assignee-select"
                                    >
                                      <option value="">Chưa được giao</option>
                                      {participantEmails.map((email, idx) => (
                                        <option key={idx} value={email}>
                                          {email}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span>{currentAssignee || "Chưa được giao"}</span>
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditMode(prev => ({ ...prev, [todo.id]: false }));
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
                                    setEditMode(prev => ({ ...prev, [todo.id]: false }));
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
                                    setEditMode(prev => ({ ...prev, [todo.id]: true }));
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
                    })}
                  </div>

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


        {/* {activeTab === "comments" && !showJoinFlow && (
          <div className="comments-section">
            <h3>Bình luận & Feedback</h3>
            <div className="comments-content">
              <div className="comment-form">
                <textarea
                  placeholder="Viết bình luận hoặc feedback về cuộc họp..."
                  className="comment-input"
                />
                <Button className="comment-submit">Gửi bình luận</Button>
              </div>

              <div className="comments-list">
                <div className="comment-item">
                  <div className="comment-avatar">A</div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>Nguyễn Văn A</strong>
                      <span className="comment-time">2 giờ trước</span>
                    </div>
                    <p>
                      @Trần Thị B hoàn thành phần báo cáo trước thứ 6 nhé. Cảm
                      ơn!
                    </p>
                  </div>
                </div>

                <div className="comment-item">
                  <div className="comment-avatar">B</div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>Trần Thị B</strong>
                      <span className="comment-time">1 giờ trước</span>
                    </div>
                    <p>
                      Được rồi, tôi sẽ hoàn thành trước thứ 6. Có cần thêm thông
                      tin gì không?
                    </p>
                  </div>
                </div>

                <div className="comment-item">
                  <div className="comment-avatar">C</div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>Lê Văn C</strong>
                      <span className="comment-time">30 phút trước</span>
                    </div>
                    <p>
                      Cuộc họp hôm nay rất hiệu quả. Timeline được thống nhất rõ
                      ràng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {activeTab === "attachments" && (
          <div className="attachments-section">
            <div className="attachments-header">
              <h3>Tài liệu & File đính kèm</h3>
              <Button className="upload-btn">Tải lên file</Button>
            </div>

            <div className="attachments-content">
              <div className="attachment-list">
                <div className="attachment-item">
                  <div className="attachment-icon">
                    <FileText size={24} />
                  </div>
                  <div className="attachment-info">
                    <h5>Sprint Planning Notes.pdf</h5>
                    <p>2.5 MB • Tải lên bởi Nguyễn Văn A</p>
                  </div>
                  <div className="attachment-actions">
                    <Button variant="outline" size="sm">
                      <Download size={16} />
                      Tải xuống
                    </Button>
                  </div>
                </div>

                <div className="attachment-item">
                  <div className="attachment-icon">
                    <FileText size={24} />
                  </div>
                  <div className="attachment-info">
                    <h5>Product Requirements.docx</h5>
                    <p>1.8 MB • Tải lên bởi Trần Thị B</p>
                  </div>
                  <div className="attachment-actions">
                    <Button variant="outline" size="sm">
                      <Download size={16} />
                      Tải xuống
                    </Button>
                  </div>
                </div>

                <div className="attachment-item">
                  <div className="attachment-icon">
                    <FileText size={24} />
                  </div>
                  <div className="attachment-info">
                    <h5>Technical Architecture.pptx</h5>
                    <p>5.2 MB • Tải lên bởi Lê Văn C</p>
                  </div>
                  <div className="attachment-actions">
                    <Button variant="outline" size="sm">
                      <Download size={16} />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
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
              <p className="delete-warning">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="delete-modal-actions">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="cancel-btn"
              >
                Hủy
              </Button>
              <Button
                onClick={handleDeleteTask}
                className="confirm-delete-btn"
              >
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
            <h3 className="text-lg font-semibold mb-2">Chuyển đổi thành Nhiệm vụ Chính thức?</h3>

            {/* Content */}
            <div className="delete-modal-content mb-4">
              <p>
                Bạn sắp chuyển đổi <strong>{convertConfirmModal.taskCount} việc cần làm</strong> do AI tạo thành công việc chính thức.
                Những việc này sẽ được thêm vào trong dự án của bạn và các thành viên liên quan trong nhóm sẽ nhận được thông báo.
              </p>
            </div>

            {/* Actions */}
            <div className="delete-modal-actions flex gap-2">
              <Button variant="outline" onClick={handleCancelConvert} className="cancel-btn">
                Hủy
              </Button>
              <Button onClick={handleConfirmConvert} className="confirm-delete-btn" style={{ background: '#FF5E13' }}>
                Xác nhận chuyển đổi
              </Button>
            </div>
          </div>
        </div>

      )}

      <style jsx>{`
        .mock-recording {
          position: relative;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .mock-recording:hover {
          opacity: 1;
          border-color: #ff8c42;
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 140, 66, 0.2);
        }

        .mock-recording::before {
          content: "Mock Data";
          position: absolute;
          top: -8px;
          right: 12px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
        }

        .mock-recording .recording-info h5 {
          color: #ff8c42;
          font-weight: 600;
        }

        .mock-recording .recording-info p {
          color: #64748b;
        }

        .mock-recording .recording-actions button {
          border-color: #ff8c42;
          color: #ff8c42;
        }

        .mock-recording .recording-actions button:hover {
          background: #ff8c42;
          color: white;
        }

        .transcript-content {
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .transcript-content:not(.expanded) {
          max-height: 200px;
          overflow: hidden;
          mask: linear-gradient(
            to bottom,
            black 0%,
            black 70%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            to bottom,
            black 0%,
            black 70%,
            transparent 100%
          );
        }

        .transcript-content.expanded {
          max-height: 600px;
          overflow-y: auto;
          mask: none;
          -webkit-mask: none;
        }

        .transcript-expand-hint {
          text-align: center;
          padding: 12px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          margin-top: 8px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .transcript-expand-hint:hover {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          border-color: #ff8c42;
          color: #ff8c42;
        }

        .transcript-content.expanded::-webkit-scrollbar {
          width: 6px;
        }

        .transcript-content.expanded::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .transcript-content.expanded::-webkit-scrollbar-thumb {
          background: #ff8c42;
          border-radius: 3px;
        }

        .transcript-content.expanded::-webkit-scrollbar-thumb:hover {
          background: #ff6b1a;
        }

        .summary {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .summary-header {
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .summary-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0;
        }

        .ai-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 8px rgba(255, 140, 66, 0.3);
        }

        .summary-title h4 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ai-badge {
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%) !important;
          color: white !important;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3) !important;
        }

        .summary-main {
          margin-bottom: 24px;
        }

        .summary-main h5 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .summary-main p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
          font-size: 15px;
        }

        .summary-points {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .summary-point:hover {
          border-color: #ff8c42;
          box-shadow: 0 4px 12px rgba(255, 140, 66, 0.15);
          transform: translateY(-2px);
        }

        .point-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .point-content {
          flex: 1;
        }

        .point-content strong {
          color: #1e293b;
          font-weight: 600;
        }

        .point-content {
          color: #64748b;
          line-height: 1.5;
          font-size: 14px;
        }

        .summary-footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }

        .summary-stats {
          display: flex;
          justify-content: space-around;
          gap: 20px;
        }

        .stat-item {
          text-align: center;
          flex: 1;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #ff8c42;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-content p {
          margin: 0 0 20px 0;
          color: #64748b;
          line-height: 1.6;
          font-size: 15px;
        }

        .ai-actions {
          flex-shrink: 0;
        }

        .generate-tasks-btn {
          background: white !important;
          border: 2px solid #ff8c42 !important;
          color: #ff8c42 !important;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.15);
          cursor: pointer;
        }

        .generate-tasks-btn:hover:not(:disabled) {
          background: #ff8c42 !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.3);
        }

        .generate-tasks-btn:hover:not(:disabled) * {
          color: white !important;
        }

        .generate-tasks-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          background: white !important;
          color: #ff8c42 !important;
          border-color: #ff8c42 !important;
        }

        .ai-generated-tasks {
          margin-bottom: 32px;
          padding: 28px;
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #ff8c42 100%);
          border: 2px solid #ff8c42;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(255, 140, 66, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .ai-generated-tasks::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff8c42, #ff6b1a, #ea580c);
        }

        .ai-tasks-header {
          margin-bottom: 20px;
        }

        .ai-title-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
        }

        .ai-title-badge span {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .ai-badge {
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%) !important;
          color: white !important;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3) !important;
        }

        .ai-task {
          background: white;
          border: 2px solid #ff8c42;
          border-radius: 18px;
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .ai-task::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff8c42, #ff6b1a, #ea580c);
        }

        .ai-task:hover {
          /* No hover effect */
        }

        .task-actions {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .task-actions button {
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 8px 12px;
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d1d5db;
          background: white;
          color: #1f2937;
        }

        .task-actions button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* Hover effects for specific buttons */
        .task-actions button:has(svg[data-lucide="plus"]):hover {
          background: linear-gradient(135deg, #22c55e, #16a34a) !important;
          border-color: #16a34a !important;
          color: white !important;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4) !important;
          transform: translateY(-2px) !important;
        }

        .task-actions button:has(svg[data-lucide="trash-2"]):hover {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          border-color: #dc2626 !important;
          color: white !important;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4) !important;
          transform: translateY(-2px) !important;
        }

        .create-task-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a) !important;
          border-color: #16a34a !important;
          color: white !important;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4) !important;
        }

        .create-task-btn:hover {
          background: linear-gradient(135deg, #16a34a, #15803d) !important;
          border-color: #15803d !important;
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.5) !important;
          transform: translateY(-2px);
        }


        .create-task-btn:focus {
          background: linear-gradient(135deg, #16a34a, #15803d) !important;
          border-color: #15803d !important;
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.5) !important;
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          border-color: #dc2626 !important;
          color: white !important;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4) !important;
        }

        .delete-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
          border-color: #b91c1c !important;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5) !important;
          transform: translateY(-2px);
        }

        .delete-btn:focus {
          background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
          border-color: #b91c1c !important;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5) !important;
        }

        /* Icon Colors */
        .create-task-btn svg {
          color: white !important;
          stroke: white !important;
        }

        .delete-btn svg {
          color: white !important;
          stroke: white !important;
        }

        .task-actions button:has(svg[data-lucide="plus"]):hover svg {
          color: white !important;
          stroke: white !important;
        }

        .task-actions button:has(svg[data-lucide="trash-2"]):hover svg {
          color: white !important;
          stroke: white !important;
        }

        .create-task-btn:hover svg {
          color: white !important;
          stroke: white !important;
        }

        .delete-btn:hover svg {
          color: white !important;
          stroke: white !important;
        }

        .task-added-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
          animation: taskAddedPulse 0.6s ease-out;
        }

        @keyframes taskAddedPulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }





        .edit-btn {
          border-color: #ff8c42;
          color: #ff8c42;
        }

        .edit-btn:hover {
          background: #ff8c42;
          color: white;
        }

        .complete-btn {
          border-color: #10b981;
          color: #10b981;
        }

        .complete-btn:hover {
          background: #10b981;
          color: white;
        }

        .complete-btn.completed {
          background: #10b981;
          color: white;
        }

        .copy-btn {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .copy-btn:hover {
          background: #3b82f6;
          color: white;
        }

        .delete-btn {
          border-color: #dc2626 !important;
          color: white !important;
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
        }

        .delete-btn:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
          border-color: #b91c1c !important;
          color: white !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4) !important;
        }

        .task-edit-form {
          width: 100%;
          padding: 16px;
          background: #f8fafc;
          border: 2px solid #ff8c42;
          border-radius: 12px;
        }

        .edit-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .edit-input,
        .edit-textarea,
        .edit-select,
        .edit-date {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .edit-input:focus,
        .edit-textarea:focus,
        .edit-select:focus,
        .edit-date:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .edit-meta {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .date-inputs {
          display: flex;
          gap: 16px;
          flex-wrap: nowrap;
        }

        .date-field {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 150px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .assignee-field {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 170px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .date-field::before, .assignee-field::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05));
          border-radius: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .date-field:hover, .assignee-field:hover {
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          border-color: #f59e0b;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
          transform: translateY(-2px);
        }

        .date-field:hover::before, .assignee-field:hover::before {
          opacity: 1;
        }

        .date-field label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .edit-date {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .edit-date:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .edit-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .save-btn {
          background: #ff8c42;
          border-color: #ff8c42;
          color: white;
        }

        .save-btn:hover {
          background: #ff6b1a;
          border-color: #ff6b1a;
        }


        .task-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }

        .overview-section {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .meeting-info,
        .project-info,
        .meeting-stats {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .meeting-info h3,
        .project-info h3,
        .meeting-stats h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          border-bottom: 2px solid #ff8c42;
          padding-bottom: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .info-item p {
          margin: 0;
          color: #6b7280;
          font-size: 15px;
          line-height: 1.5;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meeting-id {
          font-family: "Courier New", monospace;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 13px;
          color: #374151;
        }

        .participants {
          display: flex;
          flex-wrap: nowrap;
          gap: 8px;
        }

        .participant {
          background: #f0f9ff;
          color: #0369a1;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid #bae6fd;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #ff8c42;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 8px rgba(255, 140, 66, 0.3);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .summary {
            padding: 20px;
            margin-top: 20px;
          }

          .summary-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .summary-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .ai-actions {
            align-self: stretch;
          }

          .generate-tasks-btn {
            width: 100%;
            justify-content: center;
          }

          .summary-stats {
            flex-direction: column;
            gap: 16px;
          }

          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }

          .stat-number {
            margin-bottom: 0;
            font-size: 20px;
          }

          .stat-label {
            font-size: 14px;
            text-transform: none;
            letter-spacing: normal;
          }

          .ai-generated-tasks {
            padding: 16px;
            margin-bottom: 24px;
          }

          .edit-meta {
            flex-direction: column;
            gap: 8px;
          }

          .edit-select,
          .edit-date {
            min-width: auto;
          }

          .edit-actions {
            justify-content: stretch;
          }

          .edit-actions button {
            flex: 1;
          }

          .overview-section {
            gap: 24px;
          }

          .meeting-info,
          .project-info,
          .meeting-stats {
            padding: 20px;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stat-item {
            padding: 16px;
          }

          .participants {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .task-number {
          display: inline-block;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          text-align: center;
          line-height: 24px;
          font-size: 12px;
          font-weight: 700;
          margin-right: 12px;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
        }

        /* Delete Confirmation Modal */
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        .delete-modal {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .delete-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .delete-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }

        .delete-modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .delete-modal-content {
          margin-bottom: 24px;
        }

        .delete-modal-content p {
          margin: 0 0 8px 0;
          color: #64748b;
          line-height: 1.5;
        }

        .delete-warning {
          color: #ef4444 !important;
          font-weight: 600;
          font-size: 14px;
        }

        .delete-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .cancel-btn {
          border-color: #d1d5db;
          color: #6b7280;
        }

        .cancel-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .confirm-delete-btn {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
        }

        .confirm-delete-btn:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        /* Task Status Badge */
        .task-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 12px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .task-status-badge.created {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        /* Create Task Button */
        .create-task-btn {
          border-color: #16a34a !important;
          color: white !important;
          background: linear-gradient(135deg, #22c55e, #16a34a) !important;
        }

        .create-task-btn:hover {
          background: linear-gradient(135deg, #16a34a, #15803d) !important;
          border-color: #15803d !important;
          color: white !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4) !important;
        }

        /* Clickable Task */
        .clickable-task {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clickable-task:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
        }

        .clickable-task:hover .task-header {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
        }

        .task-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        /* Tasks Loading */
        .tasks-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          color: #92400e;
          font-weight: 600;
        }

        .edit-meta {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meta-row {
          display: flex;
          gap: 16px;
          flex-wrap: nowrap;
        }

        .meta-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 150px;
        }

        .meta-field label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .edit-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
          background: white;
        }

        .edit-select:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .task-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .task-meta span {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }

        .task-meta strong {
          color: #374151;
          font-weight: 600;
          min-width: 100px;
        }

        /* Enhanced Task Styles */
        .enhanced-task {
          background: white;
          border: 2px solid #f59e0b;
          border-radius: 20px;
          padding: 0;
          margin-bottom: 20px;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.15), 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          position: relative;
        }

        .enhanced-task::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #f59e0b, #d97706, #b45309);
        }

        .enhanced-task:hover {
          /* No hover effect */
        }

        .task-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: transparent;
          border: 1px solid #e5e7eb;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .task-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 2px 0;
        }

        .task-field {
          width: 100%;
          padding: 2px 0;
        }

        .detail-field {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          width: 100%;
          min-height: 40px;
          box-sizing: border-box;
          cursor: pointer;
        }

        .detail-field:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .assignee-field {
          grid-column: 1;
          min-width: 0;
          width: 100%;
        }

        .date-field {
          min-width: 0;
          width: 100%;
        }

        .date-field:first-of-type {
          grid-column: 2;
        }

        .date-field:last-of-type {
          grid-column: 3;
        }

        .assignee-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
        }

        .assignee-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 4px;
          width: 100%;
          min-width: 0;
        }

        .assignee-label {
          font-size: 12px;
          font-weight: 600;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .assignee-select {
          border: none;
          background: transparent;
          font-size: 15px;
          font-weight: 500;
          color: #1f2937;
          outline: none;
          flex: 1;
          padding: 4px 6px;
          line-height: 1.4;
          cursor: pointer;
          width: 100%;
          z-index: 10;
          position: relative;
        }

        .assignee-select:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 4px;
        }

        .assignee-select option {
          padding: 8px 12px;
          background: white;
          color: #1f2937;
        }

        .assignee-select option:hover {
          background: #f3f4f6;
        }

        .date-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          background: linear-gradient(135deg, #ff8c42, #ff6b1a);
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 2px 6px rgba(255, 140, 66, 0.3);
        }

        .date-picker {
          border: none;
          background: transparent;
          font-size: 15px;
          font-weight: 500;
          color: #1f2937;
          outline: none;
          flex: 1;
          padding: 4px 30px 4px 6px;
          line-height: 1.4;
          position: relative;
          cursor: pointer;
          width: 100%;
        }

        .date-picker::placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        .date-input-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 4px;
          width: 100%;
          min-width: 0;
        }

        .date-label {
          font-size: 12px;
          font-weight: 600;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .date-picker::-webkit-calendar-picker-indicator {
          opacity: 1;
          position: absolute;
          right: 8px;
          width: 24px;
          height: 24px;
          cursor: pointer;
          background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/%3e%3c/svg%3e") no-repeat center;
          background-size: 18px 18px;
          z-index: 2;
        }

        /* New Input Fields */
        .task-title-input {
          width: 100%;
          padding: 12px 30px 12px 20px; /* Increased right padding */
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          background: white;
          color: #1f2937;
          height: 44px;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          line-height: 1.4;
        }

        .task-title-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .task-description-input {
          width: 100%;
          padding: 12px 24px 12px 20px; /* Increased right padding */
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 400;
          background: white;
          color: #1f2937;
          min-height: 60px;
          resize: vertical;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          font-family: inherit;
          line-height: 1.5;
        }

        .task-description-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Responsive Design for New Todo Layout */
        @media (max-width: 768px) {
          .task-header {
            padding: 12px;
            gap: 12px;
            flex-direction: column;
            border-radius: 6px;
          }

          .task-content {
            gap: 8px;
            padding: 2px 0;
          }

          .task-details-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            align-items: stretch;
            padding: 2px 0;
            width: 100%;
          }

          .detail-field {
            min-width: auto;
            width: 100%;
            padding: 6px 10px;
            gap: 8px;
            min-height: 36px;
            box-sizing: border-box;
          }

          .assignee-field, .date-field {
            min-width: auto;
            grid-column: 1;
            width: 100%;
          }

          .date-field:first-of-type,
          .date-field:last-of-type {
            grid-column: 1;
          }

          .assignee-content,
          .date-input-wrapper {
            width: 100%;
            min-width: 0;
          }

          .task-number {
            width: 36px;
            height: 36px;
            font-size: 14px;
            margin-top: 0;
            align-self: flex-start;
          }

          .task-actions {
            margin-top: 0;
            justify-content: center;
            gap: 10px;
          }

          .task-actions button {
            min-width: 32px;
            height: 32px;
            padding: 6px 10px;
          }

          .task-title-input {
            font-size: 14px;
            padding: 10px 20px 10px 18px; /* Increased right padding for mobile */
            height: 40px;
            line-height: 1.4;
          }

          .task-description-input {
            font-size: 13px;
            padding: 10px 20px 10px 18px; /* Increased right padding for mobile */
            min-height: 50px;
            line-height: 1.5;
          }

          .assignee-avatar {
            width: 24px;
            height: 24px;
          }

          .date-icon {
            width: 24px;
            height: 24px;
            padding: 3px;
          }

          .assignee-select, .date-picker {
            font-size: 14px;
            padding: 3px 5px;
            line-height: 1.4;
          }
        }

        .task-status {
          display: flex;
          align-items: center;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .status-in-progress {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .status-completed {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .status-review {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .status-pending {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
        }

        .task-description-field {
          width: 100%;
          margin-top: 4px;
        }

        .task-details-horizontal {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
          margin-top: 8px;
        }

        .assignee-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .assignee-select {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13px;
          color: #374151;
          outline: none;
          cursor: pointer;
        }

        .date-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #ff8c42, #ff6b1a);
          color: white;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(255, 140, 66, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .date-picker {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13px;
          color: #374151;
          outline: none;
          cursor: pointer;
        }

        .task-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #f59e0b, transparent);
        }

        .task-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          flex-shrink: 0;
          border: 2px solid white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          margin-top: 2px;
        }

        .task-number::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(135deg, #ff8c42, #ff6b1a);
          border-radius: 50%;
          z-index: -1;
          opacity: 0.2;
        }

        .task-title-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #92400e;
          line-height: 1.4;
        }

        .task-subtitle {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: nowrap;
        }

        .click-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #64748b;
          font-style: italic;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .enhanced-task:hover .click-hint {
          color: #ff8c42;
          opacity: 1;
        }

        .enhanced-task:hover .click-hint svg {
          color: #ff8c42;
        }

        .task-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: nowrap;
        }

        .task-details {
          padding: 24px;
          background: linear-gradient(135deg, #fefefe 0%, #f8fafc 100%);
          border-radius: 0 0 18px 18px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .detail-item:hover {
          background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          border-color: #ff8c42;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(255, 140, 66, 0.1);
        }

        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          border-radius: 8px;
          color: white;
          flex-shrink: 0;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .detail-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .assignee-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auto-match-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        .priority-high {
          color: #dc2626;
          font-weight: 600;
        }

        .priority-medium {
          color: #d97706;
          font-weight: 600;
        }

        .priority-low {
          color: #059669;
          font-weight: 600;
        }

        .priority-none {
          color: #6b7280;
          font-style: italic;
        }

        .task-edit-inline {
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-top: 1px solid #e2e8f0;
        }

        .task-edit-inline .edit-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 16px;
        }

        .task-title-input, .task-description-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          background: white;
          transition: all 0.3s ease;
          resize: vertical;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
          min-height: 36px;
          line-height: 1.4;
        }

        .task-title-input {
          width: 100%;
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          background: white;
          transition: all 0.3s ease;
          outline: none;
          height: 40px;
          line-height: 1.4;
          font-family: inherit;
        }

        .task-title-input:focus {
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .task-title-input:focus, .task-description-input:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .task-edit-inline .edit-input {
          padding: 12px 16px;
          border: 2px solid #ff8c42;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          background: white;
          transition: all 0.3s ease;
        }

        .task-edit-inline .edit-input:focus {
          outline: none;
          border-color: #ff6b1a;
          box-shadow: 0 0 0 4px rgba(255, 140, 66, 0.1);
        }

        .task-edit-inline .edit-meta {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .task-edit-inline .meta-row {
          display: flex;
          gap: 16px;
          flex-wrap: nowrap;
        }

        .task-edit-inline .meta-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 150px;
        }

        .task-edit-inline .meta-field label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .task-edit-inline .edit-select {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: border-color 0.2s;
        }

        .task-edit-inline .edit-select:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .task-edit-inline .date-inputs {
          display: flex;
          gap: 16px;
          flex-wrap: nowrap;
        }

        .task-edit-inline .date-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 150px;
        }

        .task-edit-inline .edit-date {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: border-color 0.2s;
        }

        .task-edit-inline .edit-date:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .task-edit-inline .edit-date::placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        .task-edit-inline .edit-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        @media (max-width: 768px) {
          .task-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 16px;
          }

          .task-title-section {
            text-align: center;
          }

          .task-actions {
            justify-content: center;
            flex-wrap: nowrap;
          }

          .detail-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .detail-item {
            padding: 10px;
          }

          .task-edit-overlay {
            padding: 16px;
          }

          .task-edit-inline {
            padding: 16px;
          }

          .task-edit-inline .meta-row {
            flex-direction: column;
            gap: 12px;
          }

          .task-edit-inline .date-inputs {
            flex-direction: column;
            gap: 12px;
          }

          .task-edit-inline .edit-actions {
            flex-direction: column;
            gap: 8px;
          }

          .task-edit-inline .edit-actions button {
            width: 100%;
          }
        }

        @media (max-width: 1024px) {
          .task-details-horizontal {
            flex-direction: column;
            gap: 12px;
          }

          .date-field, .assignee-field {
            min-width: 100%;
          }

          .task-controls {
            min-width: 150px;
          }
        }

        @media (max-width: 768px) {
          .task-header {
            padding: 12px 16px;
          }

          .task-main-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .task-title-field {
            order: 1;
          }

          .task-number {
            order: 0;
            align-self: flex-start;
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .task-actions {
            order: 2;
            justify-content: flex-end;
            gap: 6px;
          }

          .task-actions button {
            min-width: 32px;
            height: 32px;
            padding: 6px 8px;
          }

          .task-title-input {
            font-size: 13px;
            padding: 8px 12px;
            height: 36px;
          }

          .task-title-field {
            flex: 1;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}
