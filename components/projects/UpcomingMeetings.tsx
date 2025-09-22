"use client";

import { mockMeetings, mockMembers } from "@/constants/mockData";

export const UpcomingMeetings = () => {
  // Lấy thông tin member
  const getMemberInfo = (memberId: string) => {
    return mockMembers.find((member) => member.id === memberId);
  };

  // Lọc các cuộc họp sắp tới (Scheduled)
  const upcomingMeetings = mockMeetings.filter(
    (meeting) => meeting.status === "Scheduled"
  );

  // Sắp xếp theo thời gian bắt đầu
  const sortedMeetings = upcomingMeetings.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const getParticipantNames = (participantIds: string[] | undefined) => {
    if (!participantIds) return [];
    return participantIds.map((id) => {
      const member = getMemberInfo(id);
      return member ? member.name : "Unknown";
    });
  };

  return (
    <div className="upcoming-meetings">
      <div className="section-header">
        <div className="section-title">
          <h3>Các cuộc họp sắp tới</h3>
          <p>Danh sách cuộc họp được lên lịch.</p>
        </div>
      </div>

      <div className="meetings-content">
        {sortedMeetings.length > 0 ? (
          <div className="meetings-list">
            {sortedMeetings.map((meeting) => {
              const { date, time } = formatDateTime(meeting.startTime);
              const participants = getParticipantNames(meeting.participants);

              return (
                <div key={meeting.id} className="meeting-item">
                  <div className="meeting-time-section">
                    <div className="meeting-time-badge">
                      <div className="time-icon">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 7V12L16 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="time-content">
                        <div className="meeting-date">{date}</div>
                        <div className="meeting-time-text">{time}</div>
                      </div>
                    </div>
                  </div>

                  <div className="meeting-content">
                    <div className="meeting-header">
                      <h4 className="meeting-title">{meeting.title}</h4>
                      <div className="meeting-status">
                        <div className="status-dot"></div>
                        <span>Sắp tới</span>
                      </div>
                    </div>

                    <p className="meeting-description">{meeting.description}</p>

                    <div className="meeting-participants">
                      <div className="participants-avatars">
                        {participants.slice(0, 4).map((name, index) => {
                          const member = mockMembers.find(
                            (m) => m.name === name
                          );
                          return (
                            <div
                              key={index}
                              className="participant-avatar"
                              title={name}
                            >
                              {member ? member.avatar : name.charAt(0)}
                            </div>
                          );
                        })}
                        {participants.length > 4 && (
                          <div
                            className="participant-more"
                            title={`+${participants.length - 4} người khác`}
                          >
                            +{participants.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="participants-count">
                        {participants.length} người tham gia
                      </div>
                    </div>
                  </div>

                  <div className="meeting-actions">
                    <button className="join-button">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 11L12 15L16 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Tham gia
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-meetings">
            <div className="no-meetings-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 2V5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 2V5"
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
                <path
                  d="M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>Không có cuộc họp sắp tới</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .upcoming-meetings {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .section-title h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .section-title p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .view-all-link {
          font-size: 14px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #2563eb;
        }

        .meetings-content {
          max-height: 400px;
          overflow-y: auto;
        }

        .meetings-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meeting-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .meeting-item::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #fb923c, #fbbf24);
        }

        .meeting-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        .meeting-time-section {
          flex-shrink: 0;
        }

        .meeting-time-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          padding: 6px 8px;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(251, 146, 60, 0.3);
        }

        .time-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .time-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .meeting-date {
          font-size: 9px;
          opacity: 0.9;
          font-weight: 500;
          line-height: 1.2;
        }

        .meeting-time-text {
          font-size: 11px;
          font-weight: 600;
          line-height: 1.2;
        }

        .meeting-content {
          flex: 1;
          min-width: 0;
        }

        .meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .meeting-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .meeting-status {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(251, 146, 60, 0.1);
          color: #fb923c;
          padding: 1px 6px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }

        .status-dot {
          width: 3px;
          height: 3px;
          background: #fb923c;
          border-radius: 50%;
        }

        .meeting-description {
          font-size: 11px;
          color: #64748b;
          margin: 0 0 6px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meeting-participants {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .participants-avatars {
          display: flex;
          align-items: center;
          gap: -4px;
        }

        .participant-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 600;
          border: 1px solid white;
          margin-left: -3px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .participant-avatar:first-child {
          margin-left: 0;
        }

        .participant-more {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 600;
          border: 1px solid white;
          margin-left: -3px;
        }

        .participants-count {
          font-size: 9px;
          color: #64748b;
          font-weight: 500;
        }

        .meeting-actions {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .join-button {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #fb923c, #fbbf24);
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 4px rgba(251, 146, 60, 0.3);
        }

        .join-button:hover {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 2px 8px rgba(251, 146, 60, 0.4);
          transform: translateY(-1px);
        }

        .no-meetings {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .no-meetings-icon {
          color: #9ca3af;
          margin-bottom: 16px;
        }

        .no-meetings p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        /* Scrollbar styling */
        .meetings-content::-webkit-scrollbar {
          width: 6px;
        }

        .meetings-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .meetings-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .meetings-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 768px) {
          .meeting-item {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }

          .meeting-time-section {
            width: 100%;
          }

          .meeting-time-badge {
            justify-content: center;
            width: fit-content;
            margin: 0 auto;
          }

          .meeting-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .meeting-status {
            align-self: flex-start;
          }

          .meeting-participants {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .meeting-actions {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
