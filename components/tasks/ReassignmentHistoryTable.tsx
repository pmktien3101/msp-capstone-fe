"use client";

import { TaskReassignRequest } from "@/types/taskReassignRequest";

interface ReassignmentHistoryTableProps {
  history: TaskReassignRequest[];
  isLoading?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const ReassignmentHistoryTable = ({
  history,
  isLoading = false,
}: ReassignmentHistoryTableProps) => {
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải lịch sử...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="empty-state">
        <p>Không có lịch sử chuyển giao nào cho công việc này</p>
      </div>
    );
  }

  return (
    <div className="history-table-container">
      <table className="history-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Từ</th>
            <th>Đến</th>
            <th>Lý do</th>
            <th>Phản hồi</th>
            <th>Ngày tạo</th>
            <th>Ngày xử lý</th>
          </tr>
        </thead>
        <tbody>
          {history.map((record, index) => (
            <tr key={record.id}>
              <td className="stt-cell">{index + 1}</td>
              <td className="user-cell">
                {record.fromUser?.fullName || record.fromUserId}
              </td>
              <td className="user-cell">
                {record.toUser?.fullName || record.toUserId}
              </td>
              <td className="reason-cell" title={record.description || undefined}>
                <span className="reason-text">{record.description || "-"}</span>
              </td>
              <td className="response-cell" title={record.responseMessage || undefined}>
                <span className="response-text">{record.responseMessage || "-"}</span>
              </td>
              <td className="date-cell">
                {formatDate(record.createdAt)}
              </td>
              <td className="date-cell">
                {formatDate(record.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          text-align: center;
          color: #64748b;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0369a1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-state p {
          margin: 0;
          font-size: 14px;
        }

        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
          min-height: 150px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px dashed #d1d5db;
        }

        .history-table-container {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .history-table thead {
          background: #fdf0d2;
          border-bottom: 2px solid #fbbf24;
        }

        .history-table th {
          padding: 14px 12px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #92400e;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-right: 1px solid #fde68a;
        }

        .history-table th:last-child {
          border-right: none;
        }

        .history-table td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
        }

        .history-table tbody tr:hover {
          background: #f9fafb;
        }

        .history-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .stt-cell {
          width: 50px;
          text-align: center;
          font-weight: 600;
          color: #0369a1;
        }

        .user-cell {
          width: 120px;
          font-weight: 500;
          color: #1e40af;
        }

        .reason-cell,
        .response-cell {
          max-width: 150px;
        }

        .reason-text,
        .response-text {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .date-cell {
          width: 130px;
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
        }

        @media (max-width: 1024px) {
          .history-table-container {
            overflow-x: scroll;
          }

          .history-table {
            min-width: 800px;
          }
        }

        @media (max-width: 768px) {
          .history-table-container {
            overflow-x: scroll;
          }

          .history-table {
            min-width: 700px;
            font-size: 12px;
          }

          .history-table th,
          .history-table td {
            padding: 10px 8px;
          }

          .reason-cell,
          .response-cell {
            max-width: 120px;
          }

          .date-cell {
            width: 110px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};
