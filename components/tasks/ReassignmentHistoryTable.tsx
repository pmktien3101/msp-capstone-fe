"use client";

import React, { useEffect, useState } from "react";
import type { TaskHistory } from "@/types/taskHistory";
import { taskHistoryService } from "@/services/taskHistoryService";

interface Props {
  taskId: string;
}

const ReassignmentHistoryTable: React.FC<Props> = ({ taskId }) => {
  const [items, setItems] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await taskHistoryService.getTaskHistoriesByTaskId(taskId);
        if (mounted && res.success && Array.isArray(res.data)) {
          setItems(res.data);
        } else if (mounted) {
          setItems([]);
        }
      } catch (err) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (taskId) fetch();
    return () => {
      mounted = false;
    };
  }, [taskId]);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit"});
    } catch {
      return iso;
    }
  };

  const getNote = (item: TaskHistory) => {
    if (!item.fromUserId && !item.fromUser) {
      return "Người đầu tiên được giao";
    }
    const fromName = item.fromUser?.fullName || item.fromUser?.email || "Người trước";
    return `Nhận từ ${fromName}`;
  };

  if (loading) {
    return <div style={{ padding: 12, color: "#6b7280" }}>Đang tải lịch sử chuyển giao...</div>;
  }

  if (!items || items.length === 0) {
    return <div style={{ padding: 12, color: "#6b7280" }}>Chưa có lịch sử chuyển giao</div>;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontWeight: 600 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 12h18" stroke="#374151" strokeWidth="2"/></svg>
        <span>Lịch sử chuyển giao</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#374151" }}>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>STT</th>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Người phụ trách</th>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Ngày được giao</th>
              <th style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const toName = it.toUser?.fullName || it.toUser?.email || "Không xác định";
              return (
                <tr key={it.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 12px", color: "#6b7280", width: 60 }}>{idx + 1}</td>
                  <td style={{ padding: "10px 12px", color: "#111827", fontWeight: 600 }}>{toName}</td>
                  <td style={{ padding: "10px 12px", color: "#374151" }}>{formatDateTime(it.assignedAt)}</td>
                  <td style={{ padding: "10px 12px", color: "#374151" }}>{getNote(it)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReassignmentHistoryTable;
