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
                  <label>Mô tả:</label>
                  <p>{description}</p>
                </div>
                <div className="info-item">
                  <label>Thời gian bắt đầu:</label>
                  <p>{startsAt ? startsAt.toLocaleString("vi-VN") : "-"}</p>
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
            {/* Có thể bổ sung thông tin dự án nếu backend trả về sau */}
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
                      <div className="recording-empty">
                        Chưa có bản ghi cho cuộc họp này.
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
                <div className="transcript-content">
                  <div className="transcript-item">
                    <span className="timestamp">00:05</span>
                    <div className="transcript-text">
                      <strong>Nguyễn Văn A:</strong> Chào mọi người, chúng ta
                      bắt đầu cuộc họp sprint planning hôm nay.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">00:15</span>
                    <div className="transcript-text">
                      <strong>Trần Thị B:</strong> Tôi đã chuẩn bị danh sách các
                      task cho sprint này.
                    </div>
                  </div>
                  <div className="transcript-item">
                    <span className="timestamp">00:30</span>
                    <div className="transcript-text">
                      <strong>Lê Văn C:</strong> Chúng ta cần ưu tiên tính năng
                      thanh toán trước.
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary">
                <h4>Tóm tắt AI</h4>
                <div className="summary-content">
                  <p>
                    Cuộc họp tập trung vào việc lập kế hoạch cho Sprint 3 với
                    các tính năng chính: thanh toán, quản lý sản phẩm, và báo
                    cáo. Team đã thống nhất về timeline và phân công công việc.
                  </p>
                </div>
              </div>

              <div className="keywords">
                <h4>Từ khóa</h4>
                <div className="keyword-tags">
                  <span className="keyword-tag">sprint planning</span>
                  <span className="keyword-tag">payment</span>
                  <span className="keyword-tag">product management</span>
                  <span className="keyword-tag">timeline</span>
                  <span className="keyword-tag">tasks</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && !showJoinFlow && (
          <div className="tasks-section">
            <div className="tasks-header">
              <h3>To-do & Tasks</h3>
              <Button className="add-task-btn">Thêm task</Button>
            </div>

            <div className="tasks-content">
              <div className="task-list">
                <div className="task-item">
                  <div className="task-info">
                    <h5>Implement payment gateway integration</h5>
                    <p>Integrate Stripe payment gateway for checkout process</p>
                    <div className="task-meta">
                      <span className="assignee">@Nguyễn Văn A</span>
                      <span className="deadline">Hạn: 20/01/2024</span>
                      <span className="priority high">High</span>
                    </div>
                  </div>
                  <div className="task-status">
                    <span className="status in-progress">In Progress</span>
                  </div>
                </div>

                <div className="task-item">
                  <div className="task-info">
                    <h5>Design product management UI</h5>
                    <p>
                      Create user interface for product management dashboard
                    </p>
                    <div className="task-meta">
                      <span className="assignee">@Trần Thị B</span>
                      <span className="deadline">Hạn: 25/01/2024</span>
                      <span className="priority medium">Medium</span>
                    </div>
                  </div>
                  <div className="task-status">
                    <span className="status pending">Pending</span>
                  </div>
                </div>

                <div className="task-item">
                  <div className="task-info">
                    <h5>Setup reporting system</h5>
                    <p>Implement analytics and reporting features</p>
                    <div className="task-meta">
                      <span className="assignee">@Lê Văn C</span>
                      <span className="deadline">Hạn: 30/01/2024</span>
                      <span className="priority low">Low</span>
                    </div>
                  </div>
                  <div className="task-status">
                    <span className="status completed">Completed</span>
                  </div>
                </div>
              </div>
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
    </div>
  );
}
