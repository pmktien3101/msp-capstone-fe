'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Meeting } from '@/types/meeting';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Users, Video, FileText, MessageSquare, Paperclip, CheckSquare, Play, Download } from 'lucide-react';
import '@/app/styles/meeting-detail.scss';

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const fetchMeetingDetail = async () => {
      setLoading(true);
      // Mock data
      const mockMeeting: Meeting = {
        id: params.id as string,
        projectId: '1',
        milestoneId: '1',
        title: 'Sprint Planning Meeting',
        description: 'Planning for Sprint 3 features and tasks',
        startTime: '2024-01-15T09:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        status: 'Finished',
        roomUrl: 'https://meet.google.com/abc-def-ghi',
        createdAt: '2024-01-14T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      };

      const mockProject: Project = {
        id: '1',
        name: 'E-commerce Platform',
        description: 'Building a modern e-commerce platform',
        status: 'In Progress',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      };

      setMeeting(mockMeeting);
      setProject(mockProject);
      setLoading(false);
    };

    fetchMeetingDetail();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return '#3b82f6';
      case 'Ongoing': return '#f59e0b';
      case 'Finished': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'Đã lên lịch';
      case 'Ongoing': return 'Đang diễn ra';
      case 'Finished': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="meeting-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin cuộc họp...</p>
      </div>
    );
  }

  if (!meeting || !project) {
    return (
      <div className="meeting-detail-error">
        <h3>Không tìm thấy cuộc họp</h3>
        <p>Cuộc họp này không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

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
            <h1>{meeting.title}</h1>
            <div className="meeting-meta">
              <span className="project-name">{project.name}</span>
              <span className="meeting-status" style={{ backgroundColor: getStatusColor(meeting.status) }}>
                {getStatusLabel(meeting.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <Button className="join-btn">
            <Video size={16} />
            Tham gia cuộc họp
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="meeting-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={16} />
          Tổng quan
        </button>
        <button 
          className={`tab ${activeTab === 'recording' ? 'active' : ''}`}
          onClick={() => setActiveTab('recording')}
        >
          <Video size={16} />
          Recording & Transcript
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={16} />
          To-do & Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={16} />
          Bình luận
        </button>
        <button 
          className={`tab ${activeTab === 'attachments' ? 'active' : ''}`}
          onClick={() => setActiveTab('attachments')}
        >
          <Paperclip size={16} />
          Tài liệu
        </button>
      </div>

      {/* Content */}
      <div className="meeting-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="meeting-info">
              <h3>Thông tin cuộc họp</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Mô tả:</label>
                  <p>{meeting.description}</p>
                </div>
                <div className="info-item">
                  <label>Thời gian bắt đầu:</label>
                  <p>{new Date(meeting.startTime).toLocaleString('vi-VN')}</p>
                </div>
                {meeting.endTime && (
                  <div className="info-item">
                    <label>Thời gian kết thúc:</label>
                    <p>{new Date(meeting.endTime).toLocaleString('vi-VN')}</p>
                  </div>
                )}
                <div className="info-item">
                  <label>URL phòng họp:</label>
                  <a href={meeting.roomUrl} target="_blank" rel="noopener noreferrer" className="room-link">
                    {meeting.roomUrl}
                  </a>
                </div>
                <div className="info-item">
                  <label>Người tạo:</label>
                  <p>Nguyễn Văn A</p>
                </div>
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <p>{new Date(meeting.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>

            <div className="project-info">
              <h3>Dự án liên quan</h3>
              <div className="project-card">
                <h4>{project.name}</h4>
                <p>{project.description}</p>
                <div className="project-meta">
                  <span className="project-status">{project.status}</span>
                  <span className="project-dates">
                    {new Date(project.startDate).toLocaleDateString('vi-VN')} - {new Date(project.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recording' && (
          <div className="recording-section">
            <h3>Recording & Transcript</h3>
            {meeting.status === 'Finished' ? (
              <div className="recording-content">
                <div className="recordings">
                  <h4>Bản ghi cuộc họp</h4>
                  <div className="recording-list">
                    <div className="recording-item">
                      <div className="recording-info">
                        <Video size={20} />
                        <div>
                          <h5>Video Recording - Full Meeting</h5>
                          <p>1h 30m • 1920x1080 • 2.5GB</p>
                        </div>
                      </div>
                      <div className="recording-actions">
                        <Button variant="outline" size="sm">
                          <Play size={16} />
                          Xem
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download size={16} />
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="transcript">
                  <h4>Transcript</h4>
                  <div className="transcript-content">
                    <div className="transcript-item">
                      <span className="timestamp">00:05</span>
                      <div className="transcript-text">
                        <strong>Nguyễn Văn A:</strong> Chào mọi người, chúng ta bắt đầu cuộc họp sprint planning hôm nay.
                      </div>
                    </div>
                    <div className="transcript-item">
                      <span className="timestamp">00:15</span>
                      <div className="transcript-text">
                        <strong>Trần Thị B:</strong> Tôi đã chuẩn bị danh sách các task cho sprint này.
                      </div>
                    </div>
                    <div className="transcript-item">
                      <span className="timestamp">00:30</span>
                      <div className="transcript-text">
                        <strong>Lê Văn C:</strong> Chúng ta cần ưu tiên tính năng thanh toán trước.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="summary">
                  <h4>Tóm tắt AI</h4>
                  <div className="summary-content">
                    <p>Cuộc họp tập trung vào việc lập kế hoạch cho Sprint 3 với các tính năng chính: thanh toán, quản lý sản phẩm, và báo cáo. Team đã thống nhất về timeline và phân công công việc.</p>
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
            ) : (
              <div className="no-recording">
                <Video size={48} />
                <h4>Chưa có bản ghi</h4>
                <p>Bản ghi cuộc họp sẽ có sẵn sau khi cuộc họp kết thúc.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
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
                    <p>Create user interface for product management dashboard</p>
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

        {activeTab === 'comments' && (
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
                    <p>@Trần Thị B hoàn thành phần báo cáo trước thứ 6 nhé. Cảm ơn!</p>
                  </div>
                </div>

                <div className="comment-item">
                  <div className="comment-avatar">B</div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>Trần Thị B</strong>
                      <span className="comment-time">1 giờ trước</span>
                    </div>
                    <p>Được rồi, tôi sẽ hoàn thành trước thứ 6. Có cần thêm thông tin gì không?</p>
                  </div>
                </div>

                <div className="comment-item">
                  <div className="comment-avatar">C</div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>Lê Văn C</strong>
                      <span className="comment-time">30 phút trước</span>
                    </div>
                    <p>Cuộc họp hôm nay rất hiệu quả. Timeline được thống nhất rõ ràng.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
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
