"use client";

import { Member } from "@/types/member";
import { Task } from "@/types/milestone";
import { Project } from "@/types/project";

interface TeamActivityProps {
  members: Member[];
  tasks: Task[];
  selectedProject: Project | null;
}

interface Activity {
  id: string;
  type:
    | "task_completed"
    | "task_assigned"
    | "comment_added"
    | "meeting_attended";
  member: Member;
  description: string;
  timestamp: Date;
  relatedTask?: Task;
}

export default function TeamActivity({
  members,
  tasks,
  selectedProject,
}: TeamActivityProps) {
  // Mock activity data - trong thực tế sẽ lấy từ API
  const activities: Activity[] = [
    {
      id: "1",
      type: "task_completed",
      member: members[0] || {
        id: "1",
        name: "Nguyễn Văn A",
        role: "Developer",
        avatar: "/avatars/user1.jpg",
        email: "a@example.com",
      },
      description: 'đã hoàn thành task "Thiết kế UI Dashboard"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      relatedTask: tasks.find((t) => t.id === "1"),
    },
    {
      id: "2",
      type: "comment_added",
      member: members[1] || {
        id: "2",
        name: "Trần Thị B",
        role: "Designer",
        avatar: "/avatars/user2.jpg",
        email: "b@example.com",
      },
      description: 'đã thêm comment trong task "Review Design System"',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      relatedTask: tasks.find((t) => t.id === "2"),
    },
    {
      id: "3",
      type: "task_assigned",
      member: members[2] || {
        id: "3",
        name: "Lê Văn C",
        role: "Tester",
        avatar: "/avatars/user3.jpg",
        email: "c@example.com",
      },
      description: 'được assign task "Test API Integration"',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      relatedTask: tasks.find((t) => t.id === "3"),
    },
    {
      id: "4",
      type: "meeting_attended",
      member: members[0] || {
        id: "1",
        name: "Nguyễn Văn A",
        role: "Developer",
        avatar: "/avatars/user1.jpg",
        email: "a@example.com",
      },
      description: 'đã tham gia cuộc họp "Sprint Planning"',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ngày trước`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes} phút trước` : "Vừa xong";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="activity-icon completed"
          >
            <path
              d="M9 12L11 14L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case "task_assigned":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="activity-icon assigned"
          >
            <path
              d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "comment_added":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="activity-icon comment"
          >
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "meeting_attended":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="activity-icon meeting"
          >
            <path
              d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 2V6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 2V6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 10H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="team-activity">
      <div className="section-header">
        <h3>Hoạt động team</h3>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="empty-icon"
            >
              <path
                d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>Chưa có hoạt động nào</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-avatar">
                <img
                  src={activity.member.avatar}
                  alt={activity.member.name}
                  className="member-avatar"
                />
                <div className="activity-icon-wrapper">
                  {getActivityIcon(activity.type)}
                </div>
              </div>

              <div className="activity-content">
                <div className="activity-description">
                  <strong>{activity.member.name}</strong> {activity.description}
                </div>
                <div className="activity-meta">
                  <span className="activity-time">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  {activity.relatedTask && (
                    <span className="activity-task">
                      • {activity.relatedTask.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
