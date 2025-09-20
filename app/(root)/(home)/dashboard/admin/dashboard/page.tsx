"use client";

import React, { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Doanh Thu");
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredProgress, setHoveredProgress] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedYears, setSelectedYears] = useState<string[]>([
    "2024",
    "2023",
  ]); // Mặc định chọn 2024 và 2023
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("30"); // Mặc định 30 ngày
  // Get first day of current month and today
  const getDefaultDateRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      startDate: firstDayOfMonth.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>(getDefaultDateRange());
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);

  // Time filter options
  const timeFilterOptions = [
    { value: "7", label: "7 ngày qua" },
    { value: "30", label: "30 ngày qua" },
    { value: "90", label: "90 ngày qua" },
    { value: "365", label: "1 năm qua" },
    { value: "custom", label: "Tùy chỉnh" },
  ];

  // Mock data for different time periods
  const statsData = {
    "7": {
      revenue: { current: 125430, previous: 118200, change: 6.1 },
      subscriptions: { current: 3456, previous: 3200, change: 8.0 },
      companies: { current: 1247, previous: 1150, change: 8.4 },
      meetings: { current: 8932, previous: 8200, change: 8.9 },
    },
    "30": {
      revenue: { current: 125430, previous: 112500, change: 11.5 },
      subscriptions: { current: 3456, previous: 3100, change: 11.5 },
      companies: { current: 1247, previous: 1080, change: 15.5 },
      meetings: { current: 8932, previous: 7800, change: 14.5 },
    },
    "90": {
      revenue: { current: 125430, previous: 98000, change: 28.0 },
      subscriptions: { current: 3456, previous: 2800, change: 23.4 },
      companies: { current: 1247, previous: 950, change: 31.3 },
      meetings: { current: 8932, previous: 6500, change: 37.4 },
    },
    "365": {
      revenue: { current: 125430, previous: 85000, change: 47.6 },
      subscriptions: { current: 3456, previous: 2400, change: 44.0 },
      companies: { current: 1247, previous: 800, change: 55.9 },
      meetings: { current: 8932, previous: 5200, change: 71.8 },
    },
  };

  // Helper function to format numbers
  const formatNumber = (num: number, isCurrency: boolean = false) => {
    if (isCurrency) {
      return `$${num.toLocaleString()}`;
    }
    return num.toLocaleString();
  };

  // Function to calculate days between dates
  const calculateDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to generate custom stats data based on date range
  const generateCustomStatsData = (startDate: string, endDate: string) => {
    const days = calculateDaysBetween(startDate, endDate);

    // Base values (simulate data based on number of days)
    const baseRevenue = 125430;
    const baseSubscriptions = 3456;
    const baseCompanies = 1247;
    const baseMeetings = 8932;

    // Calculate previous period data (same duration before start date)
    const start = new Date(startDate);
    const previousStart = new Date(start);
    previousStart.setDate(start.getDate() - days);
    const previousEnd = new Date(start);
    previousEnd.setDate(start.getDate() - 1);

    // Simulate growth based on duration
    const growthFactor = Math.min(days / 30, 2); // Cap at 2x for very long periods

    return {
      revenue: {
        current: Math.round(baseRevenue * growthFactor),
        previous: Math.round(baseRevenue * growthFactor * 0.8), // 20% lower in previous period
        change:
          Math.round(
            ((baseRevenue * growthFactor - baseRevenue * growthFactor * 0.8) /
              (baseRevenue * growthFactor * 0.8)) *
              100 *
              10
          ) / 10,
      },
      subscriptions: {
        current: Math.round(baseSubscriptions * growthFactor),
        previous: Math.round(baseSubscriptions * growthFactor * 0.85),
        change:
          Math.round(
            ((baseSubscriptions * growthFactor -
              baseSubscriptions * growthFactor * 0.85) /
              (baseSubscriptions * growthFactor * 0.85)) *
              100 *
              10
          ) / 10,
      },
      companies: {
        current: Math.round(baseCompanies * growthFactor),
        previous: Math.round(baseCompanies * growthFactor * 0.75),
        change:
          Math.round(
            ((baseCompanies * growthFactor -
              baseCompanies * growthFactor * 0.75) /
              (baseCompanies * growthFactor * 0.75)) *
              100 *
              10
          ) / 10,
      },
      meetings: {
        current: Math.round(baseMeetings * growthFactor),
        previous: Math.round(baseMeetings * growthFactor * 0.7),
        change:
          Math.round(
            ((baseMeetings * growthFactor - baseMeetings * growthFactor * 0.7) /
              (baseMeetings * growthFactor * 0.7)) *
              100 *
              10
          ) / 10,
      },
    };
  };

  // Get current stats data based on selected filter
  const currentStats = isCustomRange
    ? generateCustomStatsData(
        customDateRange.startDate,
        customDateRange.endDate
      )
    : statsData[selectedTimeFilter as keyof typeof statsData] ||
      statsData["30"]; // Fallback to 30 days

  // Handle time filter change
  const handleTimeFilterChange = (value: string) => {
    setSelectedTimeFilter(value);
    setIsCustomRange(value === "custom");

    // If switching to custom, ensure we have default date range
    if (
      value === "custom" &&
      (!customDateRange.startDate || !customDateRange.endDate)
    ) {
      setCustomDateRange(getDefaultDateRange());
    }
  };

  // Handle custom date range change
  const handleCustomDateChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setCustomDateRange((prev) => {
      const newRange = {
        ...prev,
        [field]: value,
      };

      // Validate date range
      if (newRange.startDate && newRange.endDate) {
        const startDate = new Date(newRange.startDate);
        const endDate = new Date(newRange.endDate);

        // If start date is after end date, swap them
        if (startDate > endDate) {
          return {
            startDate: newRange.endDate,
            endDate: newRange.startDate,
          };
        }
      }

      return newRange;
    });
  };

  // Data for industry bar chart
  const industryData = {
    labels: ["IT", "Finance", "Healthcare", "Education", "Retail", "Other"],
    datasets: [
      {
        label: "Số công ty",
        data: [400, 300, 350, 200, 450, 250],
        backgroundColor: [
          "#95A4FC", // indigo
          "#BAEDBD", // mint
          "#1C1C1C", // black
          "#B1E3FF", // blue
          "#A8C5DA", // cyan
          "#A1E3CB", // green
        ],
        borderColor: [
          "#95A4FC",
          "#BAEDBD",
          "#1C1C1C",
          "#B1E3FF",
          "#A8C5DA",
          "#A1E3CB",
        ],
        borderWidth: 1,
      },
    ],
  };

  const industryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed.y} công ty`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 500,
        ticks: {
          stepSize: 100,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      bar: {
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
      },
    },
  };

  // Data for meeting time doughnut chart
  const meetingTimeData = {
    labels: ["9:00-12:00", "13:00-17:00", "18:00-20:00", "Khác"],
    datasets: [
      {
        data: [35.2, 28.8, 22.4, 13.6],
        backgroundColor: [
          "#FF6B6B", // red (thay thế màu đen)
          "#BAEDBD", // mint
          "#95A4FC", // indigo
          "#B1E3FF", // blue
        ],
        borderColor: ["#FF6B6B", "#BAEDBD", "#95A4FC", "#B1E3FF"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const meetingTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        display: false, // Sử dụng custom legend
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  // Data for different tabs - Flexible years structure
  const chartData = {
    "Doanh Thu": {
      years: {
        "2024": {
          values: [130, 90, 170, 150, 110, 190, 160, 0, 0, 0, 0, 0],
          displayValues: [
            "$130K",
            "$90K",
            "$170K",
            "$150K",
            "$110K",
            "$190K",
            "$160K",
            "$0",
            "$0",
            "$0",
            "$0",
            "$0",
          ],
          color: "#BAEDBD",
          label: "Năm 2024",
        },
        "2023": {
          values: [110, 70, 140, 120, 90, 160, 130, 145, 95, 175, 155, 125],
          displayValues: [
            "$110K",
            "$70K",
            "$140K",
            "$120K",
            "$90K",
            "$160K",
            "$130K",
            "$145K",
            "$95K",
            "$175K",
            "$155K",
            "$125K",
          ],
          color: "#B1E3FF",
          label: "Năm 2023",
        },
        "2022": {
          values: [100, 80, 120, 110, 85, 140, 120, 130, 90, 160, 140, 110],
          displayValues: [
            "$100K",
            "$80K",
            "$120K",
            "$110K",
            "$85K",
            "$140K",
            "$120K",
            "$130K",
            "$90K",
            "$160K",
            "$140K",
            "$110K",
          ],
          color: "#FFE4B5",
          label: "Năm 2022",
        },
      },
      yLabels: ["$200K", "$150K", "$100K", "$50K", "$0"],
      maxValue: 200,
    },
    "Gói Đăng Ký": {
      years: {
        "2024": {
          values: [1400, 1200, 1600, 1300, 1500, 1700, 1800, 0, 0, 0, 0, 0],
          displayValues: [
            "1,400",
            "1,200",
            "1,600",
            "1,300",
            "1,500",
            "1,700",
            "1,800",
            "0",
            "0",
            "0",
            "0",
            "0",
          ],
          color: "#BAEDBD",
          label: "Năm 2024",
        },
        "2023": {
          values: [
            1200, 1000, 1400, 1100, 1300, 1500, 1600, 1350, 1150, 1550, 1450,
            1250,
          ],
          displayValues: [
            "1,200",
            "1,000",
            "1,400",
            "1,100",
            "1,300",
            "1,500",
            "1,600",
            "1,350",
            "1,150",
            "1,550",
            "1,450",
            "1,250",
          ],
          color: "#B1E3FF",
          label: "Năm 2023",
        },
        "2022": {
          values: [
            1000, 800, 1200, 1100, 900, 1300, 1200, 1150, 950, 1400, 1300, 1100,
          ],
          displayValues: [
            "1,000",
            "800",
            "1,200",
            "1,100",
            "900",
            "1,300",
            "1,200",
            "1,150",
            "950",
            "1,400",
            "1,300",
            "1,100",
          ],
          color: "#FFE4B5",
          label: "Năm 2022",
        },
      },
      yLabels: ["2,000", "1,500", "1,000", "500", "0"],
      maxValue: 2000,
    },
    "Công Ty Mới": {
      years: {
        "2024": {
          values: [125, 87, 150, 112, 100, 175, 137, 0, 0, 0, 0, 0],
          displayValues: [
            "125",
            "87",
            "150",
            "112",
            "100",
            "175",
            "137",
            "0",
            "0",
            "0",
            "0",
            "0",
          ],
          color: "#BAEDBD",
          label: "Năm 2024",
        },
        "2023": {
          values: [100, 62, 125, 87, 75, 150, 112, 95, 67, 135, 97, 85],
          displayValues: [
            "100",
            "62",
            "125",
            "87",
            "75",
            "150",
            "112",
            "95",
            "67",
            "135",
            "97",
            "85",
          ],
          color: "#B1E3FF",
          label: "Năm 2023",
        },
        "2022": {
          values: [80, 50, 100, 70, 60, 120, 90, 75, 55, 110, 80, 70],
          displayValues: [
            "80",
            "50",
            "100",
            "70",
            "60",
            "120",
            "90",
            "75",
            "55",
            "110",
            "80",
            "70",
          ],
          color: "#FFE4B5",
          label: "Năm 2022",
        },
      },
      yLabels: ["200", "150", "100", "50", "0"],
      maxValue: 200,
    },
  };

  const currentData = chartData[activeTab as keyof typeof chartData];

  // Function to toggle year selection
  const toggleYear = (year: string) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        // Nếu đã chọn thì bỏ chọn, nhưng phải giữ ít nhất 1 năm
        if (prev.length > 1) {
          return prev.filter((y) => y !== year);
        }
        return prev;
      } else {
        // Nếu chưa chọn thì thêm vào
        return [...prev, year];
      }
    });
  };

  // Filter years data based on selection
  const filteredYears = Object.fromEntries(
    Object.entries(currentData.years).filter(([year]) =>
      selectedYears.includes(year)
    )
  );
  return (
    <div className="admin-dashboard">
      {/* Time Filter */}
      <div className="time-filter-container">
        <div className="time-filter-header">
          <h3>Bộ lọc thời gian</h3>
        </div>
        <div className="time-filter-buttons">
          {timeFilterOptions.map((option) => (
            <button
              key={option.value}
              className={`time-filter-btn ${
                selectedTimeFilter === option.value ? "active" : ""
              }`}
              onClick={() => handleTimeFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker */}
        {isCustomRange && (
          <div className="custom-date-range">
            <div className="date-inputs">
              <div className="date-input-group">
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) =>
                    handleCustomDateChange("startDate", e.target.value)
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
                    handleCustomDateChange("endDate", e.target.value)
                  }
                  className="date-input"
                />
              </div>
            </div>
            <div className="date-range-info">
              <span>
                Khoảng thời gian:{" "}
                {calculateDaysBetween(
                  customDateRange.startDate,
                  customDateRange.endDate
                )}{" "}
                ngày
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div
          className="stat-card blue interactive"
          onMouseEnter={() => setHoveredBar("revenue")}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div className="stat-header">
            <div className="stat-label">Tổng doanh thu</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {formatNumber(currentStats.revenue.current, true)}
            </div>
            <div className="stat-change">
              <span className="change-text positive">
                +{currentStats.revenue.change}%
              </span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === "revenue" && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>
                  Doanh thu{" "}
                  {isCustomRange
                    ? "khoảng thời gian tùy chỉnh"
                    : timeFilterOptions.find(
                        (opt) => opt.value === selectedTimeFilter
                      )?.label}
                </strong>
                <br />
                Tăng {currentStats.revenue.change}% so với{" "}
                {isCustomRange
                  ? "khoảng thời gian trước đó"
                  : timeFilterOptions
                      .find((opt) => opt.value === selectedTimeFilter)
                      ?.label.replace("qua", "trước đó")}
                <br />
                Từ {formatNumber(currentStats.revenue.previous, true)} lên{" "}
                {formatNumber(currentStats.revenue.current, true)}
              </div>
            </div>
          )}
        </div>

        <div
          className="stat-card purple interactive"
          onMouseEnter={() => setHoveredBar("subscriptions")}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div className="stat-header">
            <div className="stat-label">Gói đăng ký</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {formatNumber(currentStats.subscriptions.current)}
            </div>
            <div className="stat-change">
              <span className="change-text positive">
                +{currentStats.subscriptions.change}%
              </span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === "subscriptions" && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>
                  Gói đăng ký{" "}
                  {isCustomRange
                    ? "khoảng thời gian tùy chỉnh"
                    : timeFilterOptions.find(
                        (opt) => opt.value === selectedTimeFilter
                      )?.label}
                </strong>
                <br />
                Tăng {currentStats.subscriptions.change}% so với{" "}
                {isCustomRange
                  ? "khoảng thời gian trước đó"
                  : timeFilterOptions
                      .find((opt) => opt.value === selectedTimeFilter)
                      ?.label.replace("qua", "trước đó")}
                <br />
                Từ {formatNumber(currentStats.subscriptions.previous)} lên{" "}
                {formatNumber(currentStats.subscriptions.current)}
              </div>
            </div>
          )}
        </div>

        <div
          className="stat-card blue interactive"
          onMouseEnter={() => setHoveredBar("companies")}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div className="stat-header">
            <div className="stat-label">Tổng công ty</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {formatNumber(currentStats.companies.current)}
            </div>
            <div className="stat-change">
              <span className="change-text positive">
                +{currentStats.companies.change}%
              </span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === "companies" && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>
                  Công ty{" "}
                  {isCustomRange
                    ? "khoảng thời gian tùy chỉnh"
                    : timeFilterOptions.find(
                        (opt) => opt.value === selectedTimeFilter
                      )?.label}
                </strong>
                <br />
                Tăng {currentStats.companies.change}% so với{" "}
                {isCustomRange
                  ? "khoảng thời gian trước đó"
                  : timeFilterOptions
                      .find((opt) => opt.value === selectedTimeFilter)
                      ?.label.replace("qua", "trước đó")}
                <br />
                Từ {formatNumber(currentStats.companies.previous)} lên{" "}
                {formatNumber(currentStats.companies.current)}
              </div>
            </div>
          )}
        </div>

        <div
          className="stat-card purple interactive"
          onMouseEnter={() => setHoveredBar("meetings")}
          onMouseLeave={() => setHoveredBar(null)}
        >
          <div className="stat-header">
            <div className="stat-label">Tổng số cuộc họp</div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {formatNumber(currentStats.meetings.current)}
            </div>
            <div className="stat-change">
              <span className="change-text positive">
                +{currentStats.meetings.change}%
              </span>
              <div className="change-icon up">↗</div>
            </div>
          </div>
          {hoveredBar === "meetings" && (
            <div className="tooltip">
              <div className="tooltip-content">
                <strong>
                  Cuộc họp{" "}
                  {isCustomRange
                    ? "khoảng thời gian tùy chỉnh"
                    : timeFilterOptions.find(
                        (opt) => opt.value === selectedTimeFilter
                      )?.label}
                </strong>
                <br />
                Tăng {currentStats.meetings.change}% so với{" "}
                {isCustomRange
                  ? "khoảng thời gian trước đó"
                  : timeFilterOptions
                      .find((opt) => opt.value === selectedTimeFilter)
                      ?.label.replace("qua", "trước đó")}
                <br />
                Từ {formatNumber(currentStats.meetings.previous)} lên{" "}
                {formatNumber(currentStats.meetings.current)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Main Chart Section */}
        <div className="main-chart-container">
          <div className="chart-header">
            <div className="chart-tabs">
              <div
                className={`tab ${activeTab === "Doanh Thu" ? "active" : ""}`}
                onClick={() => setActiveTab("Doanh Thu")}
              >
                Doanh Thu
              </div>
              <div
                className={`tab ${activeTab === "Gói Đăng Ký" ? "active" : ""}`}
                onClick={() => setActiveTab("Gói Đăng Ký")}
              >
                Gói Đăng Ký
              </div>
              <div
                className={`tab ${activeTab === "Công Ty Mới" ? "active" : ""}`}
                onClick={() => setActiveTab("Công Ty Mới")}
              >
                Công Ty Mới
              </div>
            </div>
            <div className="chart-legend">
              {Object.entries(currentData.years).map(([year, data]) => (
                <div key={year} className="legend-item">
                  <input
                    type="checkbox"
                    checked={selectedYears.includes(year)}
                    onChange={() => toggleYear(year)}
                    className="year-checkbox"
                  />
                  <div
                    className="legend-dot"
                    style={{ backgroundColor: data.color }}
                  ></div>
                  <span>{data.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-content">
            <div className="chart-y-axis">
              {currentData.yLabels.map((label, index) => (
                <div key={index} className="y-label">
                  {label}
                </div>
              ))}
            </div>
            <div className="chart-area">
              <div className="chart-grid">
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line bold"></div>
              </div>
              <div className="chart-bars">
                {[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ].map((month, index) => {
                  return (
                    <div key={month} className="bar-group">
                      {Object.entries(filteredYears).map(([year, data]) => {
                        const value = data.values[index];
                        const height = (value / currentData.maxValue) * 100;

                        return (
                          <div
                            key={year}
                            className={`bar ${
                              hoveredBar === `${month}-${year}` ? "hovered" : ""
                            }`}
                            style={{
                              height: `${height}%`,
                              backgroundColor: data.color,
                            }}
                            onMouseEnter={() =>
                              setHoveredBar(`${month}-${year}`)
                            }
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {hoveredBar === `${month}-${year}` && (
                              <div className="bar-tooltip">
                                <div className="tooltip-content">
                                  <strong>
                                    {month} {year}
                                  </strong>
                                  <br />
                                  {activeTab}: {data.displayValues[index]}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="chart-x-axis">
                <div className="x-label">Jan</div>
                <div className="x-label">Feb</div>
                <div className="x-label">Mar</div>
                <div className="x-label">Apr</div>
                <div className="x-label">May</div>
                <div className="x-label">Jun</div>
                <div className="x-label">Jul</div>
                <div className="x-label">Aug</div>
                <div className="x-label">Sep</div>
                <div className="x-label">Oct</div>
                <div className="x-label">Nov</div>
                <div className="x-label">Dec</div>
              </div>
            </div>
          </div>
        </div>

        {/* Phân Bố Gói Đăng Ký */}
        <div className="traffic-website">
          <div className="section-header">
            <h3>Phân Bố Gói Đăng Ký</h3>
          </div>
          <div className="traffic-list">
            {[
              {
                name: "Premium",
                width: "100%",
                count: "1,200",
                revenue: "$48,000",
                color: "premium",
              },
              {
                name: "Professional",
                width: "75%",
                count: "900",
                revenue: "$27,000",
                color: "professional",
              },
              {
                name: "Business",
                width: "85%",
                count: "1,020",
                revenue: "$30,600",
                color: "business",
              },
              {
                name: "Enterprise",
                width: "45%",
                count: "540",
                revenue: "$21,600",
                color: "enterprise",
              },
              {
                name: "Basic",
                width: "60%",
                count: "720",
                revenue: "$14,400",
                color: "basic",
              },
              {
                name: "Starter",
                width: "30%",
                count: "360",
                revenue: "$7,200",
                color: "starter",
              },
              {
                name: "Free",
                width: "20%",
                count: "240",
                revenue: "$0",
                color: "free",
              },
            ].map((plan) => (
              <div key={plan.name} className="traffic-item">
                <span className="website-name">{plan.name}</span>
                <div
                  className="progress-bar"
                  onMouseEnter={(e) => {
                    setHoveredProgress(plan.name);
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredProgress(null)}
                >
                  <div
                    className={`progress-fill ${plan.color} ${
                      hoveredProgress === plan.name ? "hovered" : ""
                    }`}
                    style={{ width: plan.width }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Tooltip for Progress Bars */}
      {hoveredProgress && (
        <div
          className="floating-tooltip"
          style={{
            position: "fixed",
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div className="tooltip-content">
            {(() => {
              const plan = [
                { name: "Premium", count: "1,200", revenue: "$48,000" },
                { name: "Professional", count: "900", revenue: "$27,000" },
                { name: "Business", count: "1,020", revenue: "$30,600" },
                { name: "Enterprise", count: "540", revenue: "$21,600" },
                { name: "Basic", count: "720", revenue: "$14,400" },
                { name: "Starter", count: "360", revenue: "$7,200" },
                { name: "Free", count: "240", revenue: "$0" },
              ].find((p) => p.name === hoveredProgress);
              return (
                <>
                  <strong>{plan?.name}</strong>
                  <br />
                  Số lượng: {plan?.count}
                  <br />
                  Doanh thu: {plan?.revenue}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Thống Kê Công Ty Theo Ngành */}
        <div className="traffic-device">
          <div className="section-header">
            <h3>Thống Kê Công Ty Theo Ngành</h3>
          </div>
          <div className="device-chart">
            <Bar data={industryData} options={industryOptions} />
          </div>
        </div>

        {/* Thống Kê Cuộc Họp Theo Thời Gian */}
        <div className="traffic-location">
          <div className="section-header">
            <h3>Cuộc Họp Theo Thời Gian</h3>
          </div>
          <div className="location-content">
            <div className="pie-chart-container">
              <Doughnut data={meetingTimeData} options={meetingTimeOptions} />
            </div>
            <div className="location-legend">
              <div className="legend-item">
                <div className="legend-dot red"></div>
                <span>9:00-12:00</span>
                <span className="percentage">3,152</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot mint"></div>
                <span>13:00-17:00</span>
                <span className="percentage">2,584</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot indigo"></div>
                <span>18:00-20:00</span>
                <span className="percentage">2,011</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot blue"></div>
                <span>Khác</span>
                <span className="percentage">1,220</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          width: 100%;
          min-height: calc(100vh - 90px - 48px);
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 24px;
          background: #f7f9fb;
          min-height: 100vh;
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

        .change-text.negative {
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
          height: 330px;
          min-width: 662px;
          padding: 24px;
          background: linear-gradient(135deg, #f7f9fb 0%, #e8f2ff 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .chart-tabs {
          display: flex;
          gap: 16px;
        }

        .tab {
          padding: 4px 0;
          color: rgba(28, 28, 28, 0.4);
          font-size: 14px;
          font-family: "Inter", sans-serif;
          font-weight: 400;
          line-height: 20px;
          cursor: pointer;
        }

        .tab.active {
          color: #1c1c1c;
          font-weight: 600;
        }

        .tab {
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: #1c1c1c;
          background: rgba(28, 28, 28, 0.05);
          border-radius: 4px;
          padding: 4px 8px;
        }

        .chart-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 4px 2px 4px;
        }

        .legend-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .legend-dot.current {
          background: #baedbd;
        }

        .legend-dot.previous {
          background: #b1e3ff;
        }

        .legend-item span {
          color: #1c1c1c;
          font-size: 12px;
          font-family: "Inter", sans-serif;
          font-weight: 400;
          line-height: 18px;
        }

        .chart-content {
          flex: 1;
          display: flex;
          gap: 16px;
        }

        .chart-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
        }

        .y-label {
          color: rgba(28, 28, 28, 0.4);
          font-size: 12px;
          font-family: "Inter", sans-serif;
          font-weight: 400;
          line-height: 18px;
          text-align: right;
        }

        .chart-area {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .chart-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px 0 28px 0;
        }

        .grid-line {
          height: 1px;
          background: rgba(28, 28, 28, 0.05);
        }

        .grid-line.bold {
          background: rgba(28, 28, 28, 0.2);
        }

        .chart-bars {
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          bottom: 28px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          padding: 0 16px;
        }

        .bar-group {
          flex: 1;
          height: 100%;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 2px;
        }

        .bar {
          width: 20px;
          background: #1c1c1c;
          border-radius: 4px 4px 0 0;
          min-height: 0;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .year-checkbox {
          margin-right: 8px;
          cursor: pointer;
        }

        .legend-item {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .bar.hovered {
          transform: scaleY(1.05);
        }

        .bar.current.hovered {
          background: #a8e5ab;
        }

        .bar.previous.hovered {
          background: #9dd9ff;
        }

        .chart-x-axis {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 16px;
        }

        .chart-x-axis .x-label {
          flex: 1;
          text-align: center;
          margin: 0 2px;
        }

        .x-label {
          color: rgba(28, 28, 28, 0.4);
          font-size: 12px;
          font-family: "Inter", sans-serif;
          font-weight: 400;
          line-height: 18px;
          text-align: center;
        }

        /* Traffic by Website */
        .traffic-website {
          flex: 1 1 0;
          height: 330px;
          max-width: 272px;
          min-width: 200px;
          padding: 24px;
          background: linear-gradient(135deg, #f7f9fb 0%, #e8f4f8 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .section-header h3 {
          color: #1c1c1c;
          font-size: 14px;
          font-family: "Inter", sans-serif;
          font-weight: 600;
          line-height: 20px;
          margin: 0;
        }

        .traffic-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .traffic-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .website-name {
          color: #1c1c1c;
          font-size: 12px;
          font-family: "Inter", sans-serif;
          font-weight: 400;
          line-height: 18px;
          min-width: 60px;
        }

        .progress-bar {
          flex: 1;
          height: 18px;
          background: rgba(28, 28, 28, 0.1);
          border-radius: 80px;
          overflow: hidden;
          padding: 6px;
        }

        .progress-fill {
          height: 100%;
          background: #1c1c1c;
          border-radius: 80px;
          transition: all 0.3s ease;
          position: relative;
        }

        .progress-fill.hovered {
          transform: scaleY(1.1);
        }

        /* Progress bar colors */
        .progress-fill.premium {
          background: #ff6b6b;
        }
        .progress-fill.professional {
          background: #4ecdc4;
        }
        .progress-fill.business {
          background: #45b7d1;
        }
        .progress-fill.enterprise {
          background: #96ceb4;
        }
        .progress-fill.basic {
          background: #ffeaa7;
        }
        .progress-fill.starter {
          background: #dda0dd;
        }
        .progress-fill.free {
          background: #98d8c8;
        }

        .progress-fill.premium.hovered {
          background: #ff5252;
        }
        .progress-fill.professional.hovered {
          background: #26a69a;
        }
        .progress-fill.business.hovered {
          background: #2196f3;
        }
        .progress-fill.enterprise.hovered {
          background: #66bb6a;
        }
        .progress-fill.basic.hovered {
          background: #ffc107;
        }
        .progress-fill.starter.hovered {
          background: #ba68c8;
        }
        .progress-fill.free.hovered {
          background: #4db6ac;
        }

        /* Floating Tooltip */
        .floating-tooltip {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
        }

        .floating-tooltip .tooltip-content {
          background: rgba(28, 28, 28, 0.95);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Traffic by Device */
        .traffic-device {
          flex: 1 1 0;
          height: 280px;
          min-width: 400px;
          padding: 24px;
          background: linear-gradient(135deg, #f7f9fb 0%, #f0f8ff 100%);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .device-chart {
          flex: 1;
          height: 200px;
          position: relative;
        }

        /* Traffic by Location */
        .traffic-location {
          flex: 1 1 0;
          height: 280px;
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

        .location-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 40px;
          padding: 0 20px;
        }

        .pie-chart-container {
          width: 120px;
          height: 120px;
          position: relative;
        }

        .location-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .location-legend .legend-item {
          display: flex;
          align-items: center;
          gap: 48px;
          padding: 2px 4px;
        }

        .location-legend .legend-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .location-legend .legend-dot.red {
          background: #ff6b6b;
        }
        .location-legend .legend-dot.mint {
          background: #baedbd;
        }
        .location-legend .legend-dot.indigo {
          background: #95a4fc;
        }
        .location-legend .legend-dot.blue {
          background: #b1e3ff;
        }

        .location-legend span {
          color: #1c1c1c;
          font-size: 12px;
          font-family: "Inter", sans-serif;
          font-weight: 400;
          line-height: 18px;
        }

        .percentage {
          margin-left: auto;
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

        .bar-tooltip {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .progress-tooltip {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .device-tooltip {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        /* Time Filter Styles */
        .time-filter-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
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

        .time-filter-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .time-filter-btn {
          padding: 10px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .time-filter-btn:hover {
          border-color: #ff8c42;
          color: #ff8c42;
        }

        .time-filter-btn.active {
          background: #ff8c42;
          border-color: #ff8c42;
          color: white;
        }

        /* Custom Date Range Styles */
        .custom-date-range {
          margin-top: 16px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .date-inputs {
          display: flex;
          gap: 16px;
          align-items: end;
        }

        .date-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .date-input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #374151;
          background: white;
          transition: border-color 0.2s ease;
        }

        .date-input:focus {
          outline: none;
          border-color: #ff8c42;
          box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.1);
        }

        .date-range-info {
          margin-top: 12px;
          padding: 8px 12px;
          background: #ff8c42;
          color: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
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
          .traffic-website,
          .traffic-device,
          .traffic-location {
            min-width: auto;
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 16px;
            gap: 16px;
          }

          .time-filter-container {
            padding: 16px;
          }

          .time-filter-buttons {
            flex-direction: column;
            gap: 8px;
          }

          .time-filter-btn {
            width: 100%;
            text-align: center;
          }

          .date-inputs {
            flex-direction: column;
            gap: 12px;
          }

          .date-input-group {
            width: 100%;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .location-content {
            flex-direction: column;
            gap: 20px;
            padding: 0;
          }

          .pie-chart {
            width: 100px;
            height: 100px;
          }

          .charts-row {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
