"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MeetingDetailModal } from "@/components/modals/MeetingDetailModal";
import { CreateMeetingModal } from "@/components/modals/CreateMeetingModal";
import { format } from "date-fns";
import { Member } from "@/types";
import { Milestone } from "@/types/milestone";
import "@/app/styles/milestone.scss";
import { useUser } from "@/hooks/useUser";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { describe } from "node:test";
import { link } from "fs";

export default function MilestoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isMeetingDetailOpen, setIsMeetingDetailOpen] = useState(false);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);

  const { userId, email } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dataTime: new Date(),
    description: "",
    link: "",
  });
  const [callDetails, setCallDetails] = useState<Call | null>(null);

  const handleCreateMeeting = async () => {
    if (!client || !userId) {
      return;
    }

    try {
      const callId = crypto.randomUUID();
      const call = client.call("default", callId);
      if (!call) throw new Error("Failed to create call");

      const startsAt =
        values.dataTime.toISOString() || new Date().toISOString();
      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetails(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // TODO: Replace with actual API call
    // This is mock data for now
    const mockMilestone = {
      id: params.milestoneId as string,
      name: "Thiết Kế UI/UX",
      description: "Thiết kế giao diện người dùng và trải nghiệm người dùng",
      startDate: "2024-01-01",
      endDate: "2024-02-15",
      status: "completed" as const,
      priority: "high" as const,
      projectId: params.projectId as string,
      createdAt: "2024-01-01",
      updatedAt: "2024-02-15",
      progress: 100,
      projectName: "Website E-commerce",
      members: [],
    };

    const mockMembers = [
      {
        id: "1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@company.com",
        role: "Frontend Developer",
        avatar: "NA",
      },
      {
        id: "2",
        name: "Trần Thị B",
        email: "tranthib@company.com",
        role: "Backend Developer",
        avatar: "TB",
      },
    ];

    setMilestone(mockMilestone);
    setMembers(mockMembers);
  }, [params]);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Chờ thực hiện",
      "in-progress": "Đang thực hiện",
      completed: "Hoàn thành",
      delayed: "Bị trễ",
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
      urgent: "Khẩn cấp",
    };
    return priorityMap[priority] || priority;
  };

  if (!milestone) {
    return <div>Loading...</div>;
  }

  return (
    <div className="milestone-detail-page">
      <div className="page-header">
        <div className="header-content">
          <Button
            variant="outline"
            className="back-button"
            onClick={() => router.back()}
          >
            ← Quay lại
          </Button>
          <h1>{milestone.name}</h1>
          <div className="status-badges">
            <span className={`status-badge ${milestone.status}`}>
              {getStatusText(milestone.status)}
            </span>
            <span className={`priority-badge ${milestone.priority}`}>
              {getPriorityText(milestone.priority)}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Button variant="outline">Chỉnh sửa</Button>
          <Button variant="default">Quản lý công việc</Button>
        </div>
      </div>

      <div className="milestone-content">
        <div className="info-section">
          <div className="info-card">
            <h3>Thông tin chung</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Dự án:</span>
                <span className="value">{milestone.projectName}</span>
              </div>
              <div className="info-item">
                <span className="label">Thời gian:</span>
                <span className="value">
                  {formatDate(milestone.startDate)} -{" "}
                  {formatDate(milestone.endDate)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Tiến độ:</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${milestone.progress}%` }}
                  />
                  <span className="progress-text">{milestone.progress}%</span>
                </div>
              </div>
              <div className="info-item">
                <span className="label">Mô tả:</span>
                <p className="description">{milestone.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="members-section">
          <div className="section-card">
            <h3>Thành viên ({members.length})</h3>
            <div className="members-grid">
              {members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="add-member-button">
                + Thêm thành viên
              </Button>
            </div>
          </div>
        </div>

        <div className="meetings-section">
          <div className="section-card">
            <div className="section-header">
              <h3>Cuộc họp</h3>
              <Button
                variant="default"
                onClick={() => setIsCreateMeetingOpen(true)}
              >
                + Tạo cuộc họp
              </Button>
            </div>
            <div className="meetings-list">
              <div className="meeting-tabs">
                <button className="tab-button active">Sắp tới</button>
                <button className="tab-button">Đã qua</button>
              </div>
              {/* Mock data for upcoming meetings */}
              <div className="meeting-items">
                <div className="meeting-item upcoming">
                  <div className="meeting-time">
                    <div className="date">15</div>
                    <div className="month">Tháng 9</div>
                    <div className="time">14:00</div>
                  </div>
                  <div className="meeting-info">
                    <h4>Review tiến độ UI/UX</h4>
                    <p className="description">
                      Họp review các màn hình đã thiết kế và thảo luận các thay
                      đổi cần thiết
                    </p>
                    <div className="meeting-meta">
                      <span className="duration">60 phút</span>
                      <span className="attendees">8 thành viên</span>
                    </div>
                  </div>
                  <Button variant="outline" className="join-button">
                    Tham gia
                  </Button>
                </div>

                <div className="meeting-item past">
                  <div className="meeting-time">
                    <div className="date">10</div>
                    <div className="month">Tháng 9</div>
                    <div className="time">10:00</div>
                  </div>
                  <div className="meeting-info">
                    <h4>Kick-off Milestone UI/UX</h4>
                    <p className="description">
                      Phân công công việc và thống nhất timeline thực hiện
                    </p>
                    <div className="meeting-meta">
                      <span className="duration">45 phút</span>
                      <span className="attendees">6 thành viên</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="view-button"
                    onClick={() => {
                      setSelectedMeeting({
                        title: "Kick-off Milestone UI/UX",
                        date: "10/09/2023",
                        time: "10:00 - 11:00",
                        attendees: 6,
                      });
                      setIsMeetingDetailOpen(true);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Detail Modal */}
        <MeetingDetailModal
          isOpen={isMeetingDetailOpen}
          onClose={() => setIsMeetingDetailOpen(false)}
          meeting={selectedMeeting}
        />

        <CreateMeetingModal
          open={isCreateMeetingOpen}
          onClose={() => setIsCreateMeetingOpen(false)}
          onSave={async (meetingData) => {
            setValues({
              dataTime: new Date(meetingData.startTime),
              description: meetingData.description,
              link: "",
            });
            await handleCreateMeeting();
          }}
          availableMembers={members}
          milestoneId={parseInt(params.milestoneId as string)}
        />

        <div className="tasks-section">
          <div className="section-card">
            <div className="section-header">
              <h3>Công việc</h3>
              <Button variant="default">+ Thêm công việc</Button>
            </div>
            <div className="tasks-list">
              {/* Task list will be implemented later */}
              <p>Danh sách công việc sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
