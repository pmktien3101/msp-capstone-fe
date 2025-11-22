"use client";

import React, { useState } from "react";
// Note: removed Chart.js / Doughnut import — meeting chart removed

const AdminDashboard = () => {
  // --- LOGIC GIỮ NGUYÊN ---
  const [activeTab, setActiveTab] = useState("Revenue");
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredProgress, setHoveredProgress] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedYears, setSelectedYears] = useState<string[]>([
    "2024",
    "2023",
  ]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("30");

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

  const timeFilterOptions = [
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "90", label: "3 Months" },
    { value: "365", label: "1 Year" },
    { value: "custom", label: "Custom" },
  ];

  const getPreviousLabel = (label?: string) => {
    if (!label) return "prev period";
    if (label === "Custom") return "prev period";
    if (label.startsWith("Last ")) return label.replace("Last ", "Prev ");
    return "prev period";
  };

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

  const formatNumber = (num: number, isCurrency: boolean = false) => {
    if (isCurrency) {
      return `$${num.toLocaleString()}`;
    }
    return num.toLocaleString();
  };

  const calculateDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const generateCustomStatsData = (startDate: string, endDate: string) => {
    const days = calculateDaysBetween(startDate, endDate);
    const baseRevenue = 125430;
    const baseSubscriptions = 3456;
    const baseCompanies = 1247;
    const baseMeetings = 8932;
    const growthFactor = Math.min(days / 30, 2);

    return {
      revenue: {
        current: Math.round(baseRevenue * growthFactor),
        previous: Math.round(baseRevenue * growthFactor * 0.8),
        change: 20.0,
      },
      subscriptions: {
        current: Math.round(baseSubscriptions * growthFactor),
        previous: Math.round(baseSubscriptions * growthFactor * 0.85),
        change: 15.0,
      },
      companies: {
        current: Math.round(baseCompanies * growthFactor),
        previous: Math.round(baseCompanies * growthFactor * 0.75),
        change: 25.0,
      },
      meetings: {
        current: Math.round(baseMeetings * growthFactor),
        previous: Math.round(baseMeetings * growthFactor * 0.7),
        change: 30.0,
      },
    };
  };

  const currentStats = isCustomRange
    ? generateCustomStatsData(
        customDateRange.startDate,
        customDateRange.endDate
      )
    : statsData[selectedTimeFilter as keyof typeof statsData] ||
      statsData["30"];

  const handleTimeFilterChange = (value: string) => {
    setSelectedTimeFilter(value);
    setIsCustomRange(value === "custom");
    if (
      value === "custom" &&
      (!customDateRange.startDate || !customDateRange.endDate)
    ) {
      setCustomDateRange(getDefaultDateRange());
    }
  };

  const handleCustomDateChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setCustomDateRange((prev) => {
      const newRange = { ...prev, [field]: value };
      if (newRange.startDate && newRange.endDate) {
        const startDate = new Date(newRange.startDate);
        const endDate = new Date(newRange.endDate);
        if (startDate > endDate) {
          return { startDate: newRange.endDate, endDate: newRange.startDate };
        }
      }
      return newRange;
    });
  };

  // meetingTimeData and options removed (meeting chart removed)

  const chartData = {
    Revenue: {
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
          color: "#F97316", // Primary Orange
          label: "2024",
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
          color: "#cbd5e1", // Slate 300
          label: "2023",
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
          color: "#e2e8f0", // Slate 200
          label: "2022",
        },
      },
      yLabels: ["$200K", "$150K", "$100K", "$50K", "$0"],
      maxValue: 200,
    },
    Subscriptions: {
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
          color: "#F97316",
          label: "2024",
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
          color: "#cbd5e1",
          label: "2023",
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
          color: "#e2e8f0",
          label: "2022",
        },
      },
      yLabels: ["2k", "1.5k", "1k", "0.5k", "0"],
      maxValue: 2000,
    },
    "New Companies": {
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
          color: "#F97316",
          label: "2024",
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
          color: "#cbd5e1",
          label: "2023",
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
          color: "#e2e8f0",
          label: "2022",
        },
      },
      yLabels: ["200", "150", "100", "50", "0"],
      maxValue: 200,
    },
  };

  const currentData = chartData[activeTab as keyof typeof chartData];

  const toggleYear = (year: string) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length > 1) return prev.filter((y) => y !== year);
        return prev;
      } else {
        return [...prev, year];
      }
    });
  };

  const filteredYears = Object.fromEntries(
    Object.entries(currentData.years).filter(([year]) =>
      selectedYears.includes(year)
    )
  );

  return (
    <div className="admin-dashboard">
      {/* Header / Filter Section */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Administrator</p>
        </div>

        <div className="time-filter-wrapper">
          <div className="time-filter-pills">
            {timeFilterOptions.map((option) => (
              <button
                key={option.value}
                className={`filter-pill ${
                  selectedTimeFilter === option.value ? "active" : ""
                }`}
                onClick={() => handleTimeFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {isCustomRange && (
            <div className="custom-range-picker">
              <div className="date-field">
                <span>From</span>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) =>
                    handleCustomDateChange("startDate", e.target.value)
                  }
                />
              </div>
              <div className="date-separator">-</div>
              <div className="date-field">
                <span>To</span>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) =>
                    handleCustomDateChange("endDate", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        {[
          {
            id: "revenue",
            label: "Total Revenue",
            val: currentStats.revenue.current,
            prev: currentStats.revenue.previous,
            change: currentStats.revenue.change,
            isCurrency: true,
            icon: "$",
          },
          {
            id: "companies",
            label: "Total Companies",
            val: currentStats.companies.current,
            prev: currentStats.companies.previous,
            change: currentStats.companies.change,
            isCurrency: false,
            icon: "🏢",
          },
          {
            id: "users",
            label: "Total Users",
            val: currentStats.subscriptions.current,
            prev: currentStats.subscriptions.previous,
            change: currentStats.subscriptions.change,
            isCurrency: false,
            icon: "👥",
          },
          {
            id: "meetings",
            label: "Total Meetings",
            val: currentStats.meetings.current,
            prev: currentStats.meetings.previous,
            change: currentStats.meetings.change,
            isCurrency: false,
            icon: "📅",
          },
        ].map((stat) => (
          <div
            key={stat.id}
            className="stat-card"
            onMouseEnter={() => setHoveredBar(stat.id)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="stat-top">
              <div className="stat-icon-box">{stat.icon}</div>
              <div
                className={`stat-badge ${
                  stat.change >= 0 ? "positive" : "negative"
                }`}
              >
                {stat.change >= 0 ? "↑" : "↓"} {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="stat-main">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">
                {formatNumber(stat.val, stat.isCurrency)}
              </div>
              <div className="stat-sub">
                vs {formatNumber(stat.prev, stat.isCurrency)} prev
              </div>
            </div>

            {/* Tooltip logic kept simpler visually */}
            {hoveredBar === stat.id && (
              <div className="stat-tooltip">
                <div className="tooltip-inner">
                  <span>Comparing to previous period</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section 1 */}
      <div className="charts-grid">
        {/* Main Bar Chart */}
        <div className="chart-card main-chart">
          <div className="card-header">
            <div className="chart-selector">
              {["Revenue", "Subscriptions", "New Companies"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="legend-group">
              {Object.entries(currentData.years).map(([year, data]) => (
                <label key={year} className="legend-check">
                  <input
                    type="checkbox"
                    checked={selectedYears.includes(year)}
                    onChange={() => toggleYear(year)}
                  />
                  <span
                    className="dot"
                    style={{ backgroundColor: data.color }}
                  ></span>
                  <span>{data.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="chart-body">
            <div className="y-axis">
              {currentData.yLabels.map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>
            <div className="chart-plot-area">
              <div className="grid-lines">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="line"></div>
                ))}
              </div>
              <div className="bars-container">
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
                ].map((month, idx) => (
                  <div key={month} className="month-group">
                    {Object.entries(filteredYears).map(([year, data]) => {
                      const height =
                        (data.values[idx] / currentData.maxValue) * 100;
                      return (
                        <div
                          key={year}
                          className="bar-stick"
                          style={{
                            height: `${height}%`,
                            backgroundColor: data.color,
                          }}
                          onMouseEnter={() => setHoveredBar(`${month}-${year}`)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {hoveredBar === `${month}-${year}` && (
                            <div className="bar-popup">
                              <strong>{data.displayValues[idx]}</strong>
                              <span>
                                {month} {year}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="x-axis">
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
            ].map((m) => (
              <div key={m} className="x-label">
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="chart-card side-chart">
          <div className="card-header simple">
            <h3>Subscription Plans</h3>
          </div>
          <div className="progress-list">
            {[
              {
                name: "Premium",
                width: "100%",
                count: "1,200",
                revenue: "$48k",
                color: "#F97316",
              },
              {
                name: "Professional",
                width: "75%",
                count: "900",
                revenue: "$27k",
                color: "#8B5CF6",
              },
              {
                name: "Business",
                width: "85%",
                count: "1,020",
                revenue: "$30k",
                color: "#EC4899",
              },
              {
                name: "Enterprise",
                width: "45%",
                count: "540",
                revenue: "$21k",
                color: "#10B981",
              },
              {
                name: "Basic",
                width: "60%",
                count: "720",
                revenue: "$14k",
                color: "#F59E0B",
              },
              {
                name: "Starter",
                width: "30%",
                count: "360",
                revenue: "$7k",
                color: "#64748B",
              },
            ].map((plan) => (
              <div key={plan.name} className="progress-item">
                <div className="progress-info">
                  <span className="p-name">{plan.name}</span>
                  <span className="p-val">{plan.count} users</span>
                </div>
                <div
                  className="progress-track"
                  onMouseEnter={(e) => {
                    setHoveredProgress(plan.name);
                    setMousePosition({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) =>
                    setMousePosition({ x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setHoveredProgress(null)}
                >
                  <div
                    className="progress-fill"
                    style={{ width: plan.width, backgroundColor: plan.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredProgress && (
        <div
          className="floating-tooltip"
          style={{ left: mousePosition.x + 15, top: mousePosition.y }}
        >
          <span>{hoveredProgress} Plan</span>
        </div>
      )}

      {/* Meeting times removed per design request */}

      <style jsx>{`
        /* --- GLOBAL RESET & VARS --- */
        :global(body) {
          margin: 0;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          background-color: #f3f4f6; /* Cool Gray 100 */
        }

        .admin-dashboard {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          min-height: 100vh;
        }

        h1,
        h2,
        h3,
        p {
          margin: 0;
        }

        /* --- HEADER --- */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
        }
        .header-title h1 {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.02em;
        }
        .header-title p {
          color: #6b7280;
          margin-top: 4px;
        }

        /* --- TIME FILTER --- */
        .time-filter-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }
        .time-filter-pills {
          background: #fff;
          padding: 4px;
          border-radius: 12px;
          display: flex;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .filter-pill {
          border: none;
          background: transparent;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-pill:hover {
          color: #111827;
          background: #f9fafb;
        }
        .filter-pill.active {
          background: #f97316; /* Orange 500 */
          color: #fff;
          box-shadow: 0 2px 4px rgba(249, 115, 22, 0.18);
        }

        .custom-range-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .date-field {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }
        .date-field input {
          border: none;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: inherit;
          color: #374151;
          outline: none;
        }

        /* --- STATS CARDS --- */
        .stats-grid {
          display: flex;
          gap: 24px;
          align-items: stretch;
          flex-wrap: nowrap; /* keep cards on single row and allow them to shrink */
          padding-bottom: 6px;
        }
        .stats-grid .stat-card {
          flex: 1 1 0; /* distribute available width evenly */
          min-width: 0; /* allow shrinking below content width when needed */
        }
        .stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.02);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
        }
        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .stat-icon-box {
          width: 40px;
          height: 40px;
          background: #fff7ed;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #f97316;
        }
        .stat-badge {
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .stat-badge.positive {
          background: #ecfdf5;
          color: #059669;
        }
        .stat-badge.negative {
          background: #fef2f2;
          color: #dc2626;
        }

        .stat-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        .stat-value {
          font-size: 28px;
          color: #111827;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .stat-sub {
          font-size: 12px;
          color: #9ca3af;
        }

        .stat-tooltip {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          pointer-events: none;
          white-space: nowrap;
          z-index: 10;
        }

        /* --- CHARTS GRID --- */
        .charts-grid {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .chart-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }
        .main-chart {
          flex: 2;
          min-width: 600px;
          height: 400px;
        }
        .side-chart {
          flex: 1;
          min-width: 300px;
          height: 400px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .card-header.simple h3 {
          font-size: 18px;
          color: #111827;
          font-weight: 600;
        }
        .chart-selector {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 2px;
          display: flex;
        }
        .tab-btn {
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
        }
        .tab-btn.active {
          background: #fff;
          color: #111827;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .legend-group {
          display: flex;
          gap: 16px;
        }
        .legend-check {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #4b5563;
          cursor: pointer;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Custom Bar Chart CSS */
        .chart-body {
          display: flex;
          height: 100%;
          gap: 12px;
          padding-bottom: 10px;
        }
        .y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: right;
          color: #9ca3af;
          font-size: 12px;
          padding-bottom: 24px;
        }
        .chart-plot-area {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .grid-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: calc(100% - 24px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 0;
        }
        .line {
          height: 1px;
          background: #f3f4f6;
          border-bottom: 1px dashed #e5e7eb;
        }

        .bars-container {
          position: absolute;
          top: 12px;
          left: 0;
          width: 100%;
          height: calc(100% - 24px);
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          z-index: 1;
        }
        .month-group {
          height: 100%;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          width: 40px;
          justify-content: center;
        }
        .bar-stick {
          width: 12px;
          border-radius: 4px 4px 0 0;
          transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.2s;
          position: relative;
        }
        .bar-stick:hover {
          filter: brightness(90%);
        }
        .bar-popup {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          background: #1f2937;
          color: white;
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
          white-space: nowrap;
          z-index: 20;
          pointer-events: none;
        }
        .x-axis {
          display: flex;
          justify-content: space-around;
          padding-left: 40px;
          margin-top: -20px;
        }
        .x-label {
          font-size: 12px;
          color: #9ca3af;
          width: 40px;
          text-align: center;
        }

        /* Progress List */
        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }
        .p-val {
          color: #6b7280;
          font-weight: 400;
        }
        .progress-track {
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s ease-out;
        }

        .floating-tooltip {
          position: fixed;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          pointer-events: none;
          z-index: 100;
        }

        /* Meeting chart removed - related styles deleted */

        /* Responsive */
        @media (max-width: 1024px) {
          .charts-grid {
            flex-direction: column;
          }
          .main-chart,
          .side-chart {
            width: 100%;
            min-width: unset;
          }
        }
        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 16px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .stats-grid .stat-card {
            min-width: unset;
            flex: 1 1 auto;
          }
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .time-filter-wrapper {
            align-items: flex-start;
            width: 100%;
          }
          .bars-container {
            gap: 2px;
          }
          .bar-stick {
            width: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
