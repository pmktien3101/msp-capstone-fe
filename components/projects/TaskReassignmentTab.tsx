"use client";

import { useState, useEffect, useCallback } from "react";
import { Project } from "@/types/project";
import { taskService } from "@/services/taskService";
import { taskReassignRequestService } from "@/services/taskReassignRequestService";
import { useAuth } from "@/hooks/useAuth";
import { AcceptRejectReassignModal } from "@/components/tasks/AcceptRejectReassignModal";
import { TaskReassignRequest } from "@/types/taskReassignRequest";

interface TaskReassignmentTabProps {
  project: Project;
  refreshKey?: number;
}



const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const TaskReassignmentTab = ({
  project,
  refreshKey = 0,
}: TaskReassignmentTabProps) => {
  const { user } = useAuth();
  const userId = user?.userId;
  const userRole = user?.role;
  const projectId = project?.id?.toString();

  const [activeSubTab, setActiveSubTab] = useState<"sent" | "received">("sent");
  
  // History tab state
  const [requests, setRequests] = useState<TaskReassignRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<TaskReassignRequest | null>(null);
  const [isAcceptRejectModalOpen, setIsAcceptRejectModalOpen] = useState(false);

  // Fetch reassignment requests
  const fetchRequests = useCallback(async () => {
    if (!projectId || !userId) {
      setIsLoadingRequests(false);
      return;
    }

    setIsLoadingRequests(true);
    try {
      // Fetch requests for current user
      const response = await taskReassignRequestService.getTaskReassignRequestsForUser(userId);
      
      if (response.success && response.data) {
        // Handle both array and PagingResponse format
        let allRequests: TaskReassignRequest[] = [];
        if (Array.isArray(response.data)) {
          allRequests = response.data;
        } else if (response.data.items) {
          allRequests = response.data.items;
        } else {
          allRequests = [];
        }
        
        // Fetch task details for requests that don't have task info, then filter by project
        const requestsWithTasks = await Promise.all(
          allRequests.map(async (req) => {
            let task = req.task;
            if (!task && req.taskId) {
              try {
                const taskResponse = await taskService.getTaskById(req.taskId);
                if (taskResponse.success && taskResponse.data) {
                  task = taskResponse.data;
                }
              } catch (error) {
                console.error("Error fetching task:", error);
              }
            }
            return { ...req, task };
          })
        );
        
        // Filter requests for this project
        const finalRequests = requestsWithTasks.filter(
          (req) => req.task?.projectId === projectId
        );
        
        setRequests(finalRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [projectId, userId, refreshKey]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshKey]);

  const handleAcceptRejectClick = (request: TaskReassignRequest) => {
    setSelectedRequest(request);
    setIsAcceptRejectModalOpen(true);
  };

  const handleAcceptRejectSuccess = () => {
    setIsAcceptRejectModalOpen(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý";
      case "Accepted":
        return "Đã chấp nhận";
      case "Rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Accepted":
        return "#10b981";
      case "Rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Check if request is received (current user is the recipient)
  const isReceivedRequest = (request: TaskReassignRequest) => {
    return request.toUserId === userId;
  };

  // Check if request is sent (current user is the sender)
  const isSentRequest = (request: TaskReassignRequest) => {
    return request.fromUserId === userId;
  };

  // Check if request can be acted upon (pending and received)
  const canActOnRequest = (request: TaskReassignRequest) => {
    return request.status === "Pending" && isReceivedRequest(request);
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter((request) => {
    if (activeSubTab === "sent") {
      return isSentRequest(request);
    } else {
      return isReceivedRequest(request);
    }
  });

  return (
    <div className="task-reassignment-tab">
      {/* Sub-tabs */}
      <div className="sub-tabs-header">
        <button
          className={`sub-tab-button ${activeSubTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveSubTab("sent")}
        >
          Đã gửi
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === "received" ? "active" : ""}`}
          onClick={() => setActiveSubTab("received")}
        >
          Đã nhận
        </button>
      </div>

      {/* Requests Tab Content */}
      <div className="history-tab-content">
        {isLoadingRequests ? (
          <div className="loading-state">Đang tải...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            {activeSubTab === "sent" 
              ? "Không có yêu cầu chuyển giao nào đã gửi" 
              : "Không có yêu cầu chuyển giao nào đã nhận"}
          </div>
        ) : (
          <div className="requests-table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Công việc</th>
                  <th>Người gửi</th>
                  <th>Người nhận</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Ngày xử lý</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <tr key={request.id}>
                    <td className="stt-cell">{index + 1}</td>
                    <td className="task-cell">
                      {request.task?.title || "N/A"}
                    </td>
                    <td className="user-cell">
                      {request.fromUser?.fullName || request.fromUserId}
                    </td>
                    <td className="user-cell">
                      {request.toUser?.fullName || request.toUserId}
                    </td>
                    <td className="description-cell" title={request.description}>
                      <span className="description-text">
                        {request.description || "-"}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="date-cell">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="date-cell">
                      {formatDate(request.respondedAt || request.updatedAt)}
                    </td>
                    <td className="actions-cell">
                      {canActOnRequest(request) ? (
                        <button
                          className="action-button accept-reject-button"
                          onClick={() => handleAcceptRejectClick(request)}
                          title="Chấp nhận/Từ chối"
                        >
                          Xử lý
                        </button>
                      ) : (
                        <span className="read-only">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAcceptRejectModalOpen && selectedRequest && (
        <AcceptRejectReassignModal
          isOpen={isAcceptRejectModalOpen}
          onClose={() => {
            setIsAcceptRejectModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onSuccess={handleAcceptRejectSuccess}
        />
      )}

      <style jsx>{`
        .task-reassignment-tab {
          width: 100%;
        }

        .sub-tabs-header {
          display: flex;
          gap: 8px;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .sub-tab-button {
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: -2px;
        }

        .sub-tab-button:hover {
          color: #374151;
        }

        .sub-tab-button.active {
          color: #ff5e13;
          border-bottom-color: #ff5e13;
        }

        .tasks-tab-content,
        .history-tab-content {
          width: 100%;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 48px;
          color: #6b7280;
          font-size: 14px;
        }

        .tasks-table-container,
        .requests-table-container {
          width: 100%;
          overflow-x: auto;
        }

        .tasks-table,
        .requests-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .tasks-table thead,
        .requests-table thead {
          background: #f9fafb;
        }

        .tasks-table th,
        .requests-table th {
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        .tasks-table td,
        .requests-table td {
          padding: 12px;
          font-size: 13px;
          color: #1f2937;
          border-bottom: 1px solid #f3f4f6;
        }

        .tasks-table tr:hover,
        .requests-table tr:hover {
          background: #f9fafb;
        }

        .stt-cell {
          width: 60px;
          text-align: center;
        }

        .title-cell,
        .task-cell {
          max-width: 200px;
        }

        .title-text,
        .task-cell {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }

        .description-cell {
          max-width: 250px;
        }

        .description-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }

        .status-cell {
          white-space: nowrap;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          font-weight: 600;
        }

        .assignee-cell,
        .user-cell {
          white-space: nowrap;
        }

        .date-cell {
          white-space: nowrap;
          font-size: 12px;
          color: #6b7280;
        }

        .actions-cell {
          white-space: nowrap;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .reassign-button {
          background: #ff5e13;
          color: white;
        }

        .reassign-button:hover {
          background: #e54d00;
        }

        .accept-reject-button {
          background: #3b82f6;
          color: white;
        }

        .accept-reject-button:hover {
          background: #2563eb;
        }

        .read-only {
          color: #9ca3af;
          font-size: 12px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .tasks-table-container,
          .requests-table-container {
            overflow-x: scroll;
          }

          .tasks-table,
          .requests-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

