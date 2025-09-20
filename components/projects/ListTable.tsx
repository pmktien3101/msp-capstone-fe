"use client";

import { useState } from "react";
import { Project } from "@/types/project";
import { mockTasks } from "@/constants/mockData";

interface ListTableProps {
  project: Project;
  searchQuery: string;
  statusFilter: string;
  assigneeFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const ListTable = ({
  project,
  searchQuery,
  statusFilter,
  assigneeFilter,
  sortBy,
  sortOrder,
}: ListTableProps) => {
  const [tasks, setTasks] = useState(mockTasks);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#6b7280";
      case "in-progress":
        return "#f59e0b";
      case "review":
        return "#3b82f6";
      case "done":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case "todo":
        return "#f3f4f6";
      case "in-progress":
        return "#fef3c7";
      case "review":
        return "#dbeafe";
      case "done":
        return "#dcfce7";
      default:
        return "#f3f4f6";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return "Cần làm";
      case "in-progress":
        return "Đang làm";
      case "review":
        return "Đang review";
      case "done":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getPriorityBackgroundColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#fee2e2";
      case "medium":
        return "#fef3c7";
      case "low":
        return "#dcfce7";
      default:
        return "#f3f4f6";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.epic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" && !task.assignee) ||
        task.assignee === assigneeFilter;

      return matchesSearch && matchesStatus && matchesAssignee;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === "dueDate" || sortBy === "createdDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  return (
    <div className="list-table">
      <div className="table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input type="checkbox" />
              </th>
              <th className="title-col">Tiêu đề</th>
              <th className="status-col">Trạng thái</th>
              <th className="assignee-col">Người thực hiện</th>
              <th className="priority-col">Độ ưu tiên</th>
              <th className="due-date-col">Ngày hạn</th>
              <th className="created-col">Ngày tạo</th>
              <th className="actions-col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTasks.map((task) => (
              <tr key={task.id} className="task-row">
                <td className="checkbox-col">
                  <input type="checkbox" />
                </td>
                <td className="title-col">
                  <div className="task-title">
                    <div className="task-id">{task.id}</div>
                    <div className="task-name">{task.title}</div>
                    <div className="task-epic">{task.epic}</div>
                  </div>
                </td>
                <td className="status-col">
                  <span
                    className="status-badge"
                    style={{
                      color: getStatusColor(task.status),
                      backgroundColor: getStatusBackgroundColor(task.status),
                      borderColor: getStatusBackgroundColor(task.status),
                    }}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td className="assignee-col">
                  {task.assignee ? (
                    <div className="assignee">
                      <div className="assignee-avatar">{task.assignee}</div>
                      <span>{task.assignee}</span>
                    </div>
                  ) : (
                    <span className="unassigned">Chưa giao</span>
                  )}
                </td>
                <td className="priority-col">
                  <span
                    className="priority-badge"
                    style={{
                      color: getPriorityColor(task.priority),
                      backgroundColor: getPriorityBackgroundColor(
                        task.priority
                      ),
                      borderColor: getPriorityBackgroundColor(task.priority),
                    }}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                </td>
                <td className="due-date-col">
                  <div className="due-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 2V6"
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
                        d="M3 10H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("vi-VN")
                        : "Chưa có hạn"}
                    </span>
                  </div>
                </td>
                <td className="created-col">
                  {new Date(task.createdDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="actions-col">
                  <button className="action-btn" title="Chỉnh sửa">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="action-btn" title="Xóa">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .list-table {
          flex: 1;
          overflow: hidden;
          background: white;
        }

        .table-container {
          height: 100%;
          overflow: auto;
        }

        .tasks-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .tasks-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .tasks-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .task-row:hover {
          background: #f9fafb;
        }

        .checkbox-col {
          width: 40px;
          text-align: center;
        }

        .title-col {
          min-width: 300px;
        }

        .status-col {
          width: 120px;
        }

        .assignee-col {
          width: 140px;
        }

        .priority-col {
          width: 120px;
        }

        .due-date-col {
          width: 140px;
        }

        .created-col {
          width: 120px;
        }

        .actions-col {
          width: 100px;
          text-align: center;
        }

        .task-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .task-id {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .task-name {
          font-weight: 600;
          color: #1f2937;
        }

        .task-epic {
          font-size: 12px;
          color: #8b5cf6;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .status-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          text-align: center;
          min-width: 80px;
          border: 1px solid;
        }

        .assignee {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .assignee-avatar {
          width: 24px;
          height: 24px;
          background: #ff5e13;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .unassigned {
          color: #9ca3af;
          font-style: italic;
        }

        .priority-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          text-align: center;
          min-width: 80px;
          border: 1px solid;
        }

        .due-date {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
          margin: 0 2px;
        }

        .action-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .action-btn:last-child:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        @media (max-width: 768px) {
          .tasks-table {
            font-size: 12px;
          }

          .tasks-table th,
          .tasks-table td {
            padding: 8px 12px;
          }

          .title-col {
            min-width: 200px;
          }

          .task-epic {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};
