"use client";

import React, { useEffect, useState } from "react";
import type { TaskHistory } from "@/types/taskHistory";
import { taskHistoryService } from "@/services/taskHistoryService";
import { 
  formatTaskHistory, 
  formatHistoryDate, 
  getHistoryIcon, 
  getHistoryColor 
} from "@/utils/taskHistoryHelpers";

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
          // Sort by date descending (newest first)
          const sortedData = [...res.data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setItems(sortedData);
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

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ padding: 16, color: "#6b7280", textAlign: "center" }}>
          <div style={{ display: "inline-block", width: 20, height: 20, border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <span style={{ marginLeft: 8 }}>Đang tải lịch sử thay đổi...</span>
        </div>
      </>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div style={{ padding: 16, color: "#6b7280", textAlign: "center", fontSize: 14 }}>
        Chưa có lịch sử thay đổi
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 8, 
        marginBottom: 16, 
        paddingBottom: 12,
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 600,
        fontSize: 16,
        color: "#111827"
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Lịch sử thay đổi</span>
        <span style={{ 
          marginLeft: "auto", 
          fontSize: 12, 
          fontWeight: 400, 
          color: "#6b7280",
          backgroundColor: "#f3f4f6",
          padding: "2px 8px",
          borderRadius: 12
        }}>
          {items.length} thay đổi
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, idx) => {
          const colorClass = getHistoryColor(item.action);
          const description = formatTaskHistory(item);
          const timeAgo = formatHistoryDate(item.createdAt);
          
          return (
            <div 
              key={item.id} 
              style={{ 
                display: "flex", 
                gap: 12,
                padding: 12,
                backgroundColor: "#f9fafb",
                borderRadius: 8,
                borderLeft: `3px solid ${
                  item.action === "Created" ? "#10b981" :
                  item.action === "Assigned" ? "#3b82f6" :
                  item.action === "Reassigned" ? "#8b5cf6" :
                  item.action === "StatusChanged" ? "#f59e0b" :
                  "#6b7280"
                }`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              {/* Icon */}
              <div style={{ 
                flexShrink: 0,
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: 
                  item.action === "Created" ? "#d1fae5" :
                  item.action === "Assigned" ? "#dbeafe" :
                  item.action === "Reassigned" ? "#e9d5ff" :
                  item.action === "StatusChanged" ? "#fed7aa" :
                  "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${
                  item.action === "Created" ? "#10b981" :
                  item.action === "Assigned" ? "#3b82f6" :
                  item.action === "Reassigned" ? "#8b5cf6" :
                  item.action === "StatusChanged" ? "#f59e0b" :
                  "#6b7280"
                }`
              }}>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={
                    item.action === "Created" ? "#10b981" :
                    item.action === "Assigned" ? "#3b82f6" :
                    item.action === "Reassigned" ? "#8b5cf6" :
                    item.action === "StatusChanged" ? "#f59e0b" :
                    "#6b7280"
                  }
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.action === "Created" && <path d="M12 5v14m-7-7h14" />}
                  {item.action === "Assigned" && (
                    <>
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <path d="M20 8v6M23 11h-6" />
                    </>
                  )}
                  {item.action === "Reassigned" && (
                    <>
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <polyline points="17 11 21 7 17 3" />
                      <line x1="21" y1="7" x2="13" y2="7" />
                    </>
                  )}
                  {item.action === "StatusChanged" && (
                    <>
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                    </>
                  )}
                  {item.action === "Updated" && (
                    <>
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </>
                  )}
                </svg>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: 14, 
                  color: "#111827", 
                  marginBottom: 4,
                  lineHeight: 1.5
                }}>
                  {description}
                </div>
                
                <div style={{ 
                  fontSize: 12, 
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>{timeAgo}</span>
                </div>
              </div>

              {/* Badge */}
              <div style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 600,
                color: 
                  item.action === "Created" ? "#10b981" :
                  item.action === "Assigned" ? "#3b82f6" :
                  item.action === "Reassigned" ? "#8b5cf6" :
                  item.action === "StatusChanged" ? "#f59e0b" :
                  "#6b7280",
                backgroundColor: 
                  item.action === "Created" ? "#d1fae5" :
                  item.action === "Assigned" ? "#dbeafe" :
                  item.action === "Reassigned" ? "#e9d5ff" :
                  item.action === "StatusChanged" ? "#fed7aa" :
                  "#f3f4f6",
                padding: "4px 10px",
                borderRadius: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                alignSelf: "flex-start"
              }}>
                {item.action === "Created" && "Tạo"}
                {item.action === "Assigned" && "Giao việc"}
                {item.action === "Reassigned" && "Chuyển giao"}
                {item.action === "StatusChanged" && "Trạng thái"}
                {item.action === "Updated" && "Cập nhật"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReassignmentHistoryTable;
