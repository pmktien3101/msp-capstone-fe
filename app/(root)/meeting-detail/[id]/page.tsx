"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Video,
  FileText,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Play,
  Download,
  Sparkles,
  Plus,
  Loader2,
  Edit,
  Save,
  X,
  Calendar,
  User,
  Flag,
} from "lucide-react";
import "@/app/styles/meeting-detail.scss";
import { useGetCallById } from "@/hooks/useGetCallById";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import MeetingSetup from "@/components/meeting/MeetingSetup";
import MeetingRoom from "@/components/meeting/MeetingRoom";

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
  const [showJoinFlow, setShowJoinFlow] = useState(false); // hiển thị phần join meeting
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [recordingsError, setRecordingsError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [isAddingToProject, setIsAddingToProject] = useState(false);

  // Khi đã join thì chuyển sang hiển thị MeetingRoom
  useEffect(() => {
    if (isSetupComplete) {
      // nothing else for now
    }
  }, [isSetupComplete]);
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

  // Xử lý tạo task từ AI dựa trên transcript
  const handleGenerateTasks = async () => {
    setIsGeneratingTasks(true);
    try {
      // Simulate AI processing - trong thực tế sẽ gọi API AI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data dựa trên transcript với cấu trúc đúng theo mockData
      const mockTasks = [
        {
          id: "AI-1",
          title: "Implement Stripe payment gateway integration",
          description: "Integrate Stripe API for checkout process as discussed in meeting",
          milestoneIds: [],
          status: "todo",
          priority: "high",
          assignee: "member-4", // Lê Văn C
          startDate: "2024-02-10",
          endDate: "2024-02-15"
        },
        {
          id: "AI-2",
          title: "Design mobile-first dashboard UI",
          description: "Create wireframe and implement dashboard redesign focusing on mobile experience",
          milestoneIds: [],
          status: "todo",
          priority: "medium",
          assignee: "member-3", // Trần Thị B
          startDate: "2024-02-15",
          endDate: "2024-02-20"
        },
        {
          id: "AI-3",
          title: "Setup automated testing for payment module",
          description: "Implement automated testing with 80% coverage for critical payment paths",
          milestoneIds: [],
          status: "todo",
          priority: "high",
          assignee: "member-4", // Lê Văn C
          startDate: "2024-02-12",
          endDate: "2024-02-18"
        },
        {
          id: "AI-4",
          title: "Implement user profile management",
          description: "Develop user profile management features that can run parallel with payment development",
          milestoneIds: [],
          status: "todo",
          priority: "medium",
          assignee: "member-3", // Trần Thị B
          startDate: "2024-02-20",
          endDate: "2024-02-25"
        },
        {
          id: "AI-5",
          title: "Setup CI/CD pipeline and staging environment",
          description: "Prepare staging environment and database migration scripts for testing",
          milestoneIds: [],
          status: "todo",
          priority: "medium",
          assignee: "member-4", // Lê Văn C
          startDate: "2024-02-18",
          endDate: "2024-02-22"
        }
      ];
      
      setGeneratedTasks(mockTasks);
      
      // Tự động chuyển sang tab Tasks sau khi tạo xong
      setTimeout(() => {
        setActiveTab("tasks");
      }, 500); // Delay 500ms để user thấy kết quả
      
    } catch (error) {
      console.error("Error generating tasks:", error);
      alert("Có lỗi xảy ra khi tạo task. Vui lòng thử lại.");
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Xử lý chỉnh sửa task
  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id);
    setEditedTask({ ...task });
  };

  const handleSaveTask = () => {
    if (!editedTask) return;
    
    setGeneratedTasks(prev => 
      prev.map(task => 
        task.id === editingTaskId ? editedTask : task
      )
    );
    setEditingTaskId(null);
    setEditedTask(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTask(null);
  };

  // Xử lý thêm task vào project
  const handleAddTasksToProject = async () => {
    setIsAddingToProject(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Trong thực tế sẽ gọi API để thêm task vào project/milestone
      console.log("Adding tasks to project:", generatedTasks);
      
      // Clear generated tasks sau khi thêm thành công
      setGeneratedTasks([]);
      alert("Đã thêm thành công các task vào project!");
      
    } catch (error) {
      console.error("Error adding tasks to project:", error);
      alert("Có lỗi xảy ra khi thêm task vào project. Vui lòng thử lại.");
    } finally {
      setIsAddingToProject(false);
    }
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
          Recording & Transcript
        </button>
        <button
          className={`tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          <CheckSquare size={16} />
          To-do & Tasks
        </button>
        <button
          className={`tab ${activeTab === "comments" ? "active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          <MessageSquare size={16} />
          Bình luận
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
        {activeTab === "overview" && !showJoinFlow && (
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
                  <p>{call.state.endsAt ? new Date(call.state.endsAt).toLocaleString("vi-VN") : "-"}</p>
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
                <div className="info-item">
                  <label>ID cuộc họp:</label>
                  <p className="meeting-id">{call.id}</p>
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
                  <p>Sprint 1 - Authentication & UI</p>
                </div>
                <div className="info-item">
                  <label>Thành viên tham gia:</label>
                  <div className="participants">
                    <span className="participant">Quang Long (PM)</span>
                    <span className="participant">Nguyễn Văn A (Dev)</span>
                    <span className="participant">Trần Thị B (Designer)</span>
                    <span className="participant">Lê Văn C (Backend)</span>
                    <span className="participant">Phạm Thị D (Frontend)</span>
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
            <h3>Recording & Transcript</h3>
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
                            onClick={() => alert("Đây là mock data - không có bản ghi thực tế")}
                          >
                            <Play size={16} />
                            Xem
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert("Đây là mock data - không có bản ghi thực tế")}
                          >
                            <Download size={16} />
                            Tải xuống
                          </Button>
                        </div>
                      </div>
                    )}
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
                <div 
                  className={`transcript-content ${isTranscriptExpanded ? 'expanded' : ''}`}
                  onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                >
                  <div className="transcript-item">
                    <span className="timestamp">00:05</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Chào mọi người, chúng ta bắt đầu cuộc họp sprint planning hôm nay. Tôi hy vọng mọi người đã chuẩn bị sẵn sàng cho việc lập kế hoạch sprint mới.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">00:15</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Tôi đã chuẩn bị danh sách các task cho sprint này. Có tổng cộng 15 user stories cần được implement, bao gồm cả tính năng authentication và dashboard mới.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">00:30</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Chúng ta cần ưu tiên tính năng thanh toán trước. Đây là tính năng core của ứng dụng và khách hàng đang chờ đợi rất nhiều.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">00:45</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Đồng ý với Lê Văn C. Tôi nghĩ chúng ta nên dành 60% effort cho payment module trong sprint này. Còn lại 40% cho các tính năng phụ trợ.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">01:00</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Về mặt technical, tôi đã research và thấy chúng ta có thể integrate với Stripe API. Nó sẽ giúp giảm thiểu rủi ro và tăng tốc độ development.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">01:15</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Tuyệt vời! Tôi sẽ bắt đầu implement payment flow từ ngày mai. Ước tính sẽ mất khoảng 3-4 ngày để hoàn thành basic flow.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">01:30</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Còn về phần UI/UX, chúng ta cần thiết kế lại dashboard để user experience tốt hơn. Trần Thị B, bạn có thể handle phần này không?
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">01:45</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Được rồi, tôi sẽ làm wireframe cho dashboard mới. Tôi nghĩ chúng ta nên focus vào mobile-first design vì 70% user sử dụng mobile.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">02:00</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Về phần testing, chúng ta cần đảm bảo coverage ít nhất 80% cho payment module. Tôi sẽ setup automated testing cho critical paths.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">02:15</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Tốt! Bây giờ chúng ta cần thảo luận về timeline. Sprint này sẽ kéo dài 2 tuần, deadline là ngày 15/02. Mọi người có thấy timeline này realistic không?
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">02:30</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Tôi nghĩ timeline này hơi tight, đặc biệt là với payment integration. Có thể chúng ta cần thêm 1 tuần buffer để đảm bảo quality.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">02:45</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Tôi đồng ý với Trần Thị B. Payment là tính năng nhạy cảm, chúng ta không thể rush. Tôi suggest extend deadline đến 22/02.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">03:00</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Được rồi, tôi sẽ discuss với management về việc extend deadline. Trong khi đó, chúng ta bắt đầu implement những phần không phụ thuộc vào payment.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">03:15</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Tôi sẽ bắt đầu với user profile management và notification system. Những tính năng này có thể develop parallel với payment.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">03:30</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Tôi sẽ setup CI/CD pipeline và database migration scripts. Cũng cần prepare staging environment cho testing.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">03:45</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Perfect! Chúng ta cũng cần schedule daily standup meetings để track progress. Tôi suggest 9:00 AM mỗi ngày.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">04:00</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Đồng ý! Tôi cũng suggest chúng ta nên có weekly demo để stakeholders có thể review progress và provide feedback.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">04:15</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Tuyệt vời! Tôi sẽ prepare demo environment và schedule weekly demo vào thứ 6 hàng tuần. Có gì khác cần thảo luận không?
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">04:30</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Tôi nghĩ chúng ta đã cover hết các điểm chính. Cảm ơn mọi người đã tham gia cuộc họp. Chúng ta sẽ bắt đầu implement từ ngày mai. Good luck!
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">04:35</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Cảm ơn! Tôi sẽ gửi meeting notes và action items cho mọi người trong vòng 1 giờ.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">04:40</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Perfect! Tôi sẽ update project timeline và tạo tasks trong Jira. Hẹn gặp lại mọi người vào standup ngày mai.
                    </div>
                  </div>
                </div>
                {!isTranscriptExpanded && (
                  <div className="transcript-expand-hint">
                    <span>Click để xem toàn bộ transcript</span>
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
                  <div className="ai-actions">
                    <Button 
                      onClick={handleGenerateTasks}
                      disabled={isGeneratingTasks}
                      className="generate-tasks-btn"
                      style={{
                        backgroundColor: 'white',
                        border: '2px solid #ff8c42',
                        color: '#ff8c42'
                      }}
                    >
                      {isGeneratingTasks ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Đang phân tích...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Tạo task từ cuộc họp
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="summary-content">
                  <p>
                    Cuộc họp tập trung vào việc lập kế hoạch cho Sprint 3 với
                    các tính năng chính: thanh toán, quản lý sản phẩm, và báo
                    cáo. Team đã thống nhất về timeline và phân công công việc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && !showJoinFlow && (
          <div className="tasks-section">
            <div className="tasks-header">
              <h3>To-do & Tasks</h3>
            </div>

            <div className="tasks-content">
              {/* AI Generated Tasks */}
              {generatedTasks.length > 0 && (
                <div className="ai-generated-tasks">
                  <div className="ai-tasks-header">
                    <div className="ai-tasks-title">
                      <Sparkles size={16} />
                      <h4>Task được tạo từ AI</h4>
                      <span className="ai-badge">AI Generated</span>
                    </div>
                  </div>
                  <div className="task-list">
                    {generatedTasks.map((task) => (
                      <div className="task-item ai-task" key={task.id}>
                        {editingTaskId === task.id ? (
                          <div className="task-edit-form">
                            <div className="edit-fields">
                              <input
                                type="text"
                                value={editedTask?.title || ''}
                                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                                className="edit-input"
                                placeholder="Task title"
                              />
                              <textarea
                                value={editedTask?.description || ''}
                                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                                className="edit-textarea"
                                placeholder="Task description"
                                rows={3}
                              />
                              <div className="edit-meta">
                                <select
                                  value={editedTask?.assignee || ''}
                                  onChange={(e) => setEditedTask({...editedTask, assignee: e.target.value})}
                                  className="edit-select"
                                >
                                  <option value="member-2">Nguyễn Văn A</option>
                                  <option value="member-3">Trần Thị B</option>
                                  <option value="member-4">Lê Văn C</option>
                                  <option value="member-5">Phạm Thị D</option>
                                </select>
                                <select
                                  value={editedTask?.priority || ''}
                                  onChange={(e) => setEditedTask({...editedTask, priority: e.target.value})}
                                  className="edit-select"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                                <input
                                  type="date"
                                  value={editedTask?.endDate || ''}
                                  onChange={(e) => setEditedTask({...editedTask, endDate: e.target.value})}
                                  className="edit-date"
                                />
                              </div>
                            </div>
                            <div className="edit-actions">
                              <Button size="sm" onClick={handleSaveTask} className="save-btn">
                                <Save size={14} />
                                Lưu
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X size={14} />
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="task-info">
                              <h5>{task.title}</h5>
                              <p>{task.description}</p>
                              <div className="task-meta">
                                <span className="assignee">
                                  <User size={12} />
                                  {task.assignee === 'member-2' ? 'Nguyễn Văn A' :
                                   task.assignee === 'member-3' ? 'Trần Thị B' :
                                   task.assignee === 'member-4' ? 'Lê Văn C' :
                                   task.assignee === 'member-5' ? 'Phạm Thị D' : 'Chưa giao'}
                                </span>
                                <span className="deadline">
                                  <Calendar size={12} />
                                  Hạn: {new Date(task.endDate).toLocaleDateString('vi-VN')}
                                </span>
                                <span className={`priority ${task.priority}`}>
                                  <Flag size={12} />
                                  {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                                </span>
                              </div>
                            </div>
                            <div className="task-actions">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEditTask(task)}
                                className="edit-btn"
                              >
                                <Edit size={14} />
                                Chỉnh sửa
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {generatedTasks.length > 0 && (
                    <div className="ai-tasks-footer">
                      <Button 
                        onClick={handleAddTasksToProject}
                        disabled={isAddingToProject}
                        className="add-to-project-btn"
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid #ff8c42',
                          color: '#ff8c42'
                        }}
                      >
                        {isAddingToProject ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Đang thêm vào project...
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Thêm các task vào project
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {activeTab === "comments" && !showJoinFlow && (
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
        )}

        {activeTab === "attachments" && !showJoinFlow && (
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
          mask: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);
          -webkit-mask: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);
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
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
          background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(255, 140, 66, 0.3);
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
          padding: 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }

        .ai-tasks-header {
          margin-bottom: 20px;
        }

        .ai-tasks-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-tasks-title h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #92400e;
        }

        .ai-task {
          background: white;
          border: 2px solid #f59e0b;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
        }

        .ai-task:hover {
          border-color: #d97706;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
        }


        .task-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .edit-btn {
          border-color: #ff8c42;
          color: #ff8c42;
        }

        .edit-btn:hover {
          background: #ff8c42;
          color: white;
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

        .edit-input, .edit-textarea, .edit-select, .edit-date {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .edit-input:focus, .edit-textarea:focus, .edit-select:focus, .edit-date:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .edit-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .edit-select, .edit-date {
          flex: 1;
          min-width: 120px;
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

        .ai-tasks-footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f59e0b;
          text-align: center;
        }

        .add-to-project-btn {
          background: white;
          border: 2px solid #ff8c42;
          color: #ff8c42;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(255, 140, 66, 0.15);
        }

        .add-to-project-btn:hover:not(:disabled) {
          background: #ff8c42 !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 140, 66, 0.3);
        }

        .add-to-project-btn:hover:not(:disabled) * {
          color: white !important;
        }

        .add-to-project-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          background: white;
          color: #ff8c42;
          border-color: #ff8c42;
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

        .meeting-info, .project-info, .meeting-stats {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .meeting-info h3, .project-info h3, .meeting-stats h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          border-bottom: 2px solid #ff8c42;
          padding-bottom: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
          font-family: 'Courier New', monospace;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 13px;
          color: #374151;
        }

        .participants {
          display: flex;
          flex-wrap: wrap;
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

          .edit-select, .edit-date {
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

          .meeting-info, .project-info, .meeting-stats {
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
      `}</style>
    </div>
  );
}
