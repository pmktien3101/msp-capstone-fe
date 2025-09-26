"use client";

import React, { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BusinessDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const meetingChartRef = useRef<HTMLCanvasElement>(null);
  const meetingChartInstance = useRef<Chart | null>(null);

  // Project data for Recharts
  const projectData = [
    { month: "T1", projects: 8 },
    { month: "T2", projects: 12 },
    { month: "T3", projects: 10 },
    { month: "T4", projects: 15 },
    { month: "T5", projects: 13 },
    { month: "T6", projects: 18 },
    { month: "T7", projects: 20 },
    { month: "T8", projects: 17 },
    { month: "T9", projects: 22 },
  ];

  useEffect(() => {
    if (chartRef.current) {
      // Register Chart.js components
      Chart.register(...registerables);

      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Hoàn thành", "Đang thực hiện", "Chờ xử lý"],
            datasets: [
              {
                data: [18, 6, 3],
                backgroundColor: [
                  "#10b981", // Green for completed
                  "#f59e0b", // Orange for in-progress
                  "#6b7280", // Gray for pending
                ],
                borderColor: ["#059669", "#d97706", "#4b5563"],
                borderWidth: 2,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              },
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 15,
                  usePointStyle: true,
                  font: {
                    size: 11,
                    family: "Inter, sans-serif",
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "white",
                bodyColor: "white",
                borderColor: "#FF5E13",
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.parsed;
                    const total = context.dataset.data.reduce(
                      (a: number, b: number) => a + b,
                      0
                    );
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} dự án (${percentage}%)`;
                  },
                },
              },
            },
            cutout: "60%",
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (meetingChartRef.current) {
      // Register Chart.js components
      Chart.register(...registerables);

      // Destroy existing chart if it exists
      if (meetingChartInstance.current) {
        meetingChartInstance.current.destroy();
      }

      const ctx = meetingChartRef.current.getContext("2d");
      if (ctx) {
        meetingChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["9:00-12:00", "13:00-17:00", "18:00-20:00", "Khác"],
            datasets: [
              {
                label: "Số cuộc họp",
                data: [55, 44, 34, 23],
                backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
                borderColor: ["#FF5252", "#26A69A", "#2196F3", "#66BB6A"],
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "white",
                bodyColor: "white",
                borderColor: "#FF5E13",
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: function (context) {
                    return `${context.label}: ${context.parsed.y} cuộc họp`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "#F3F4F6",
                },
                ticks: {
                  color: "#6b7280",
                  font: {
                    size: 10,
                  },
                },
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: "#6b7280",
                  font: {
                    size: 10,
                  },
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (meetingChartInstance.current) {
        meetingChartInstance.current.destroy();
      }
    };
  }, []);

  const stats = [
    {
      id: "revenue",
      title: "Tổng Số Dự Án",
      value: "27",
      change: "+3",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      id: "projects",
      title: "Dự Án Hoạt Động",
      value: "8",
      change: "+2",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "purple",
    },
    {
      id: "members",
      title: "Nhân Viên",
      value: "45",
      change: "+5",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      id: "meetings",
      title: "Cuộc Họp Tháng",
      value: "156",
      change: "+23",
      changeType: "positive",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 7V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 7V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 9H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "purple",
    },
  ];

  const upcomingMeetings = [
    {
      id: 1,
      title: "Họp Đánh Giá Tháng",
      time: "14:00 - 15:30",
      date: "Hôm nay",
      participants: 8,
    },
    {
      id: 2,
      title: "Review Dự Án Website",
      time: "10:00 - 11:00",
      date: "Ngày mai",
      participants: 5,
    },
    {
      id: 3,
      title: "Họp Kế Hoạch Q3",
      time: "09:00 - 10:30",
      date: "Thứ 6",
      participants: 12,
    },
    {
      id: 4,
      title: "Họp Báo Cáo Tài Chính",
      time: "15:00 - 16:00",
      date: "Thứ 2",
      participants: 6,
    },
    {
      id: 5,
      title: "Họp Đánh Giá Nhân Viên",
      time: "11:00 - 12:00",
      date: "Thứ 3",
      participants: 4,
    },
    {
      id: 6,
      title: "Họp Chiến Lược Marketing",
      time: "13:30 - 14:30",
      date: "Thứ 4",
      participants: 7,
    },
    {
      id: 7,
      title: "Họp Đánh Giá Dự Án",
      time: "16:00 - 17:00",
      date: "Thứ 5",
      participants: 9,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "#D1FAE5", textColor: "#065F46", text: "Hoạt động" },
      completed: { color: "#DBEAFE", textColor: "#1E40AF", text: "Hoàn thành" },
      pending: { color: "#FEF3C7", textColor: "#92400E", text: "Chờ xử lý" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: config.color,
          color: config.textColor,
        }}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="business-dashboard">
      {/* Time Filter */}
      <div className="time-filter-container">
        <div className="time-filter-header">
          <h3>Bộ lọc thời gian</h3>
        </div>
        <div className="time-filter-select">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="time-filter-dropdown"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
            <option value="last-week">Tuần trước</option>
            <option value="last-month">Tháng trước</option>
            <option value="last-quarter">Quý trước</option>
            <option value="last-year">Năm trước</option>
            <option value="custom">Tùy chỉnh</option>
          </select>

          {selectedPeriod === "custom" && (
            <div className="custom-date-range">
              <div className="date-input-group">
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label>Đến ngày:</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="date-input"
                  min={customDateRange.startDate}
                />
              </div>
              <button
                className="apply-date-btn"
                onClick={() => {
                  if (customDateRange.startDate && customDateRange.endDate) {
                    console.log("Áp dụng khoảng thời gian:", customDateRange);
                    // Ở đây bạn có thể thêm logic để filter dữ liệu theo khoảng thời gian
                  }
                }}
                disabled={
                  !customDateRange.startDate || !customDateRange.endDate
                }
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`stat-card ${stat.color} interactive`}
            onMouseEnter={() => setHoveredStat(stat.id)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="stat-header">
              <div className="stat-label">{stat.title}</div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change">
                <span className="change-text positive">{stat.change}</span>
                <div className="change-icon up">↗</div>
              </div>
            </div>
            {hoveredStat === stat.id && (
              <div className="tooltip">
                <div className="tooltip-content">
                  <strong>{stat.title}</strong>
                  <br />
                  {stat.id === "revenue" 
                    ? `Tăng ${stat.change} dự án so với ${selectedPeriod === "week" ? "tuần trước" : selectedPeriod === "month" ? "tháng trước" : "quý trước"}`
                    : `Tăng ${stat.change} so với ${selectedPeriod === "week" ? "tuần trước" : selectedPeriod === "month" ? "tháng trước" : "quý trước"}`
                  }
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Project Overview Chart */}
        <div className="main-chart-container">
          <div className="chart-header">
            <h3>Thống Kê Dự Án</h3>
          </div>
          <div className="chart-content">
            <div className="project-stats">
              <div className="status-item completed">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="status-info">
                  <span className="status-count">18</span>
                  <span className="status-label">Hoàn thành</span>
                </div>
              </div>
              <div className="status-item in-progress">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 8V12L15 15"
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
                <div className="status-info">
                  <span className="status-count">6</span>
                  <span className="status-label">Đang thực hiện</span>
                </div>
              </div>
              <div className="status-item pending">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2V6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 18V22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.93 4.93L7.76 7.76"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.24 16.24L19.07 19.07"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12H6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 12H22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.93 19.07L7.76 16.24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.24 7.76L19.07 4.93"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="status-info">
                  <span className="status-count">3</span>
                  <span className="status-label">Chờ xử lý</span>
                </div>
              </div>
            </div>
            <div className="chart-wrapper">
              <canvas ref={chartRef} width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        {/* Project Trend Chart */}
        <div className="revenue-trend-section">
          <div className="section-header">
            <h3>Xu hướng dự án năm 2025</h3>
            <div className="revenue-stats">
              <div className="revenue-stat">
                <span className="stat-label">Tháng này</span>
                <span className="stat-value">27</span>
              </div>
              <div className="revenue-stat">
                <span className="stat-label">Tăng trưởng</span>
                <span className="stat-value positive">+17.4%</span>
              </div>
            </div>
          </div>

          <div className="revenue-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  domain={[0, 30]}
                  tickCount={6}
                  tickFormatter={(value) => `${value}`}
                  interval={0}
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    border: "1px solid #FF5E13",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [`${value} dự án`, "Số dự án"]}
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#FF5E13"
                  strokeWidth={3}
                  dot={{
                    fill: "#FF5E13",
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                    r: 6,
                  }}
                  activeDot={{ r: 8 }}
                  fill="rgba(255, 94, 19, 0.1)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Upcoming Meetings */}
        <div className="upcoming-meetings">
          <div className="section-header">
            <h3>Cuộc Họp Sắp Tới</h3>
            <button
              className="create-btn"
              onClick={() => setShowAllMeetings(!showAllMeetings)}
            >
              {showAllMeetings ? "Thu gọn" : "Xem tất cả"}
            </button>
          </div>

          <div className="meetings-list">
            {(showAllMeetings
              ? upcomingMeetings
              : upcomingMeetings.slice(0, 4)
            ).map((meeting) => (
              <div key={meeting.id} className="meeting-item">
                <div className="meeting-time">
                  <span className="time">{meeting.time}</span>
                  <span className="date">{meeting.date}</span>
                </div>

                <div className="meeting-info">
                  <h4>{meeting.title}</h4>
                  <span className="participants">
                    {meeting.participants} người tham gia
                  </span>
                </div>

                <button className="join-btn">Tham gia</button>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Statistics Chart */}
        <div className="meeting-stats-section">
          <div className="section-header">
            <h3>Thống Kê Cuộc Họp</h3>
          </div>

          <div className="meeting-stats-content">
            <div className="meeting-stats-overview">
              <div className="meeting-stat-item">
                <div className="stat-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 7V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 7V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 9H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Tổng cuộc họp</span>
                  <span className="stat-value">156</span>
                </div>
              </div>
              <div className="meeting-stat-item">
                <div className="stat-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Đã hoàn thành</span>
                  <span className="stat-value">142</span>
                </div>
              </div>
              <div className="meeting-stat-item">
                <div className="stat-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 8V12L15 15"
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
                <div className="stat-info">
                  <span className="stat-label">Sắp diễn ra</span>
                  <span className="stat-value">14</span>
                </div>
              </div>
            </div>

            <div className="meeting-chart-wrapper">
              <canvas ref={meetingChartRef} width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .business-dashboard {
          width: 100%;
          min-height: calc(100vh - 90px - 48px);
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 24px;
          background: #f7f9fb;
          box-sizing: border-box;
          margin-y: -24px;
        }

        /* Time Filter */
        .time-filter-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .time-filter-header {
          margin-bottom: 16px;
        }

        .time-filter-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1c1c1c;
        }

        .time-filter-select {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .time-filter-dropdown {
          width: 200px;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #1c1c1c;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px;
        }

        .time-filter-dropdown:hover {
          border-color: #ff8c42;
        }

        .time-filter-dropdown:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .custom-date-range {
          display: flex;
          align-items: end;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .date-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .date-input-group label {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #1c1c1c;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .date-input:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 2px rgba(255, 140, 66, 0.1);
        }

        .apply-date-btn {
          padding: 8px 16px;
          background: #ff8c42;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          height: fit-content;
        }

        .apply-date-btn:hover:not(:disabled) {
          background: #ff7a2e;
          transform: translateY(-1px);
        }

        .apply-date-btn:disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        /* Stats Container */
        .stats-container {
          display: flex;
          flex-wrap: wrap;
          gap: 28px;
          align-content: flex-start;
        }

        .stat-card {
          flex: 1 1 0;
          min-width: 200px;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-card.blue {
          background: #e3f5ff;
        }

        .stat-card.purple {
          background: #e5ecf6;
        }

        .stat-card.interactive {
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .stat-card.interactive:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-header {
          align-self: stretch;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-label {
          color: #1c1c1c;
          font-size: 14px;
          font-family: "Inter", sans-serif;
          font-weight: 600;
          line-height: 20px;
        }

        .stat-content {
          align-self: stretch;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-value {
          color: #1c1c1c;
          font-size: 24px;
          font-family: "Inter", sans-serif;
          font-weight: 600;
          line-height: 36px;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .change-text {
          font-size: 12px;
          font-family: "Inter", sans-serif;
          font-weight: 400;
          line-height: 18px;
        }

        .change-text.positive {
          color: #1c1c1c;
        }

        .change-icon {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        /* Charts Rows */
        .charts-row {
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }

        /* Main Chart */
        .main-chart-container {
          flex: 1 1 0;
          height: 450px;
          min-width: 500px;
          padding: 24px;
          background: linear-gradient(135deg, #f7f9fb 0%, #e8f2ff 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .chart-header h3 {
          color: #1c1c1c;
          font-size: 14px;
          font-family: "Inter", sans-serif;
          font-weight: 600;
          line-height: 20px;
          margin: 0;
        }

        .chart-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .project-stats {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .project-stats .status-item {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #f3f4f6;
        }

        .status-item.completed .status-icon {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-item.in-progress .status-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .status-item.pending .status-icon {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-count {
          font-size: 18px;
          font-weight: 700;
          color: #1c1c1c;
        }

        .status-label {
          font-size: 10px;
          color: #787486;
          font-weight: 500;
        }

        .project-stat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .project-stat-item .stat-icon {
          width: 40px;
          height: 40px;
          background: #f9f4ee;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff5e13;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-info .stat-label {
          font-size: 12px;
          color: #787486;
          font-weight: 500;
        }

        .stat-info .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1c1c1c;
        }

        .chart-wrapper {
          flex: 1;
          background: white;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #f3f4f6;
          position: relative;
          height: 280px;
          overflow: hidden;
        }

        .chart-wrapper canvas {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h3 {
          color: #1c1c1c;
          font-size: 14px;
          font-family: "Inter", sans-serif;
          font-weight: 600;
          line-height: 20px;
          margin: 0;
        }

        .create-btn {
          background: none;
          border: none;
          color: #ff5e13;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .create-btn:hover {
          color: #ffa463;
        }

        /* Upcoming Meetings */
        .upcoming-meetings {
          flex: 1 1 0;
          height: 450px;
          min-width: 500px;
          padding: 24px;
          background: linear-gradient(135deg, #f7f9fb 0%, #f0f8ff 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .meetings-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }

        .meeting-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          transition: all 0.3s ease;
          background: white;
        }

        .meeting-item:hover {
          border-color: #ffdbbd;
          background: #f9f4ee;
        }

        .meeting-time {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
        }

        .meeting-time .time {
          font-size: 12px;
          font-weight: 600;
          color: #1c1c1c;
        }

        .meeting-time .date {
          font-size: 10px;
          color: #787486;
        }

        .meeting-info {
          flex: 1;
        }

        .meeting-info h4 {
          font-size: 12px;
          font-weight: 600;
          color: #1c1c1c;
          margin: 0 0 2px 0;
        }

        .participants {
          font-size: 10px;
          color: #787486;
        }

        .join-btn {
          background: #ff5e13;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .join-btn:hover {
          background: #ffa463;
          transform: translateY(-1px);
        }

        /* Meeting Statistics */
        .meeting-stats-section {
          flex: 1 1 0;
          height: 450px;
          min-width: 400px;
          padding: 24px;
          background: linear-gradient(135deg, #f7f9fb 0%, #f5f0ff 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .meeting-stats-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
        }

        .meeting-stats-overview {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .meeting-stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          padding: 6px;
          background: white;
          border-radius: 6px;
          border: 1px solid #f3f4f6;
          min-width: 0;
        }

        .meeting-stat-item .stat-icon {
          width: 24px;
          height: 24px;
          background: #f9f4ee;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff5e13;
          flex-shrink: 0;
        }

        .meeting-stat-item .stat-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
          flex: 1;
        }

        .meeting-stat-item .stat-label {
          font-size: 9px;
          color: #787486;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .meeting-stat-item .stat-value {
          font-size: 14px;
          font-weight: 700;
          color: #1c1c1c;
        }

        .meeting-chart {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .meeting-chart .chart-bars {
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 16px;
          height: 40px;
        }

        .meeting-chart .bar {
          width: 24px;
          border-radius: 3px 3px 0 0;
          transition: all 0.3s ease;
        }

        .meeting-chart .bar.completed {
          background: #10b981;
        }

        .meeting-chart .bar.upcoming {
          background: #f59e0b;
        }

        .meeting-chart .chart-labels {
          display: flex;
          justify-content: center;
          gap: 16px;
          font-size: 9px;
          color: #6b7280;
        }

        .meeting-chart-wrapper {
          flex: 1;
          background: white;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #f3f4f6;
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .meeting-chart-wrapper canvas {
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
        }

        .revenue-stats {
          display: flex;
          gap: 20px;
        }

        .revenue-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .revenue-stat .stat-label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 500;
        }

        .revenue-stat .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #1c1c1c;
        }

        .revenue-stat .stat-value.positive {
          color: #10b981;
        }

        .revenue-chart-wrapper {
          flex: 1;
          background: white;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #f3f4f6;
          position: relative;
          height: 450px;
          overflow: hidden;
        }

        /* Revenue Trend Chart */
        .revenue-trend-section {
          flex: 1 1 0;
          height: 450px;
          min-width: 500px;
          padding: 24px;
          background: linear-gradient(135deg, #f7f9fb 0%, #e8f2ff 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        /* Tooltips */
        .tooltip {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .tooltip-content {
          background: rgba(28, 28, 28, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.4;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-container {
            flex-direction: column;
          }

          .charts-row {
            flex-direction: column;
          }

          .main-chart-container,
          .upcoming-meetings,
          .meeting-stats-section,
          .revenue-trend-section {
            min-width: auto;
            width: 100%;
            height: auto;
          }
        }

        @media (max-width: 768px) {
          .business-dashboard {
            padding: 16px;
            gap: 16px;
            margin: -16px;
          }

          .time-filter-container {
            padding: 16px;
          }

          .time-filter-select {
            width: 100%;
          }

          .time-filter-dropdown {
            width: 100%;
          }

          .custom-date-range {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .date-input-group {
            width: 100%;
          }

          .project-stats {
            flex-direction: column;
            gap: 12px;
          }

          .chart-bars {
            gap: 8px;
          }

          .bar {
            width: 30px;
          }

          .chart-labels {
            gap: 8px;
          }

          .chart-wrapper {
            height: 220px;
            padding: 16px;
            overflow: hidden;
          }

          .chart-wrapper canvas {
            max-width: 100% !important;
            max-height: 100% !important;
          }

          .meeting-chart-wrapper {
            height: 220px;
            padding: 16px;
            overflow: hidden;
          }

          .meeting-chart-wrapper canvas {
            max-width: 100% !important;
            max-height: 100% !important;
          }

          .revenue-chart-wrapper {
            height: 500px;
            padding: 16px;
            overflow: hidden;
          }

          .meeting-stats-overview {
            flex-direction: column;
            gap: 6px;
          }

          .meeting-stat-item {
            padding: 4px;
            gap: 4px;
          }

          .meeting-stat-item .stat-icon {
            width: 20px;
            height: 20px;
          }

          .meeting-stat-item .stat-label {
            font-size: 8px;
          }

          .meeting-stat-item .stat-value {
            font-size: 12px;
          }

          .meeting-chart .chart-bars {
            gap: 10px;
            height: 30px;
          }

          .meeting-chart .bar {
            width: 20px;
          }

          .meeting-chart .chart-labels {
            gap: 10px;
            font-size: 8px;
          }

          .meeting-time-distribution h4 {
            font-size: 10px;
            margin-bottom: 4px;
          }

          .time-slots {
            gap: 3px;
          }

          .slot-label {
            font-size: 8px;
            min-width: 40px;
          }

          .slot-count {
            font-size: 8px;
            min-width: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default BusinessDashboard;
