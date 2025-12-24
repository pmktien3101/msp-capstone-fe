"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { useUser } from "@/hooks/useUser";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import packageService from "@/services/packageService";
import limitationService from "@/services/limitationService";
import { Project } from "@/types/project";
import { GetUserResponse } from "@/types/user";
import {
  PricingCard,
  PricingPlan,
  PricingPlanFeature,
} from "@/components/pricing";
import "../../../../styles/business-dashboard.scss";

const BusinessDashboard = () => {
  const router = useRouter();
  const { userId } = useUser();

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<GetUserResponse[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [limitations, setLimitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [selectedPeriod, setSelectedPeriod] = useState("custom");
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [showPackages, setShowPackages] = useState(false);
  const [packageViewMode, setPackageViewMode] = useState<"grid" | "list">(
    "grid"
  );
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  const [customDateRange, setCustomDateRange] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = firstDay.getFullYear();
    const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
    const startDay = String(firstDay.getDate()).padStart(2, '0');
    const endYear = now.getFullYear();
    const endMonth = String(now.getMonth() + 1).padStart(2, '0');
    const endDay = String(now.getDate()).padStart(2, '0');
    return {
      startDate: `${startYear}-${startMonth}-${startDay}`,
      endDate: `${endYear}-${endMonth}-${endDay}`,
    };
  });
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Helper function to get date range based on selected period
  const getDateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date;
    let endDate: Date = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (selectedPeriod) {
      case "week":
        // This week (Monday to Sunday)
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - diffToMonday);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        // This month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "quarter":
        // This quarter
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "year":
        // This year
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last-week":
        // Last week
        const lastWeekDay = today.getDay();
        const diffToLastMonday = lastWeekDay === 0 ? 13 : lastWeekDay + 6;
        startDate = new Date(today);
        startDate.setDate(today.getDate() - diffToLastMonday);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last-month":
        // Last month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last-quarter":
        // Last quarter
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const lastQuarterYear =
          lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedLastQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        startDate = new Date(lastQuarterYear, adjustedLastQuarter * 3, 1);
        endDate = new Date(lastQuarterYear, (adjustedLastQuarter + 1) * 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last-year":
        // Last year
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "custom":
        // Custom date range
        if (customDateRange.startDate && customDateRange.endDate) {
          startDate = new Date(customDateRange.startDate);
          endDate = new Date(customDateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Default to this month if custom dates not set
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }, [selectedPeriod, customDateRange]);


  // Filter projects by date range
  const filteredProjects = useMemo(() => {
    const { startDate, endDate } = getDateRange;
    return projects.filter((p) => {
      const createdAt = new Date(p.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });
  }, [projects, getDateRange]);

  // Filter employees by date range (createdAt only)
  const filteredEmployees = useMemo(() => {
    const { startDate, endDate } = getDateRange;
    return employees.filter((e) => {
      if (!e.createdAt) return false;
      const createdAt = new Date(e.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });
  }, [employees, getDateRange]);

  // Fetch real data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 1. Fetch projects owned by this business owner
        const projectRes = await projectService.getProjectsByBOId(userId);
        const projectList: Project[] =
          projectRes.success && projectRes.data ? projectRes.data.items : [];

        if (mounted) setProjects(projectList);

        // 2. Fetch employees managed by this business owner
        const employeeRes = await userService.getMembersByBO(userId);
        const employeeList: GetUserResponse[] =
          employeeRes.success && employeeRes.data ? employeeRes.data : [];

        if (mounted) setEmployees(employeeList);

        // 3. Fetch packages
        const pkgRes = await packageService.getPackages();
        if (pkgRes.success && pkgRes.data && mounted) {
          const items: any[] = Array.isArray(pkgRes.data)
            ? pkgRes.data
            : pkgRes.data.items ?? pkgRes.data;

          const mapped = items.map((p: any, idx: number) => ({
            id: (p.id ?? p.ID) || idx + 1,
            name: p.name ?? p.title ?? `Package ${idx + 1}`,
            price: p.price ?? 0,
            currency: p.currency ?? p.Currency ?? "VND",
            period:
              p.period ??
              (p.billingCycle === 0
                ? "month"
                : p.billingCycle === 2
                ? "year"
                : "month"),
            billingCycle: p.billingCycle ?? p.BillingCycle,
            features: p.features ?? [],
            limitations: p.limitations ?? p.Limitations ?? [],
            description: p.description ?? p.Description ?? "",
            status: p.status ?? "active",
            isDeleted: !!(p.isDeleted ?? p.IsDeleted),
          }));

          setPackages(mapped.filter((p) => !p.isDeleted));
        }

        // 4. Fetch limitations
        const limRes = await limitationService.getLimitations();
        if (limRes.success && limRes.data && mounted) {
          const items: any[] = Array.isArray(limRes.data)
            ? limRes.data
            : limRes.data.items ?? limRes.data;

          const mapped = items.map((it: any) => ({
            id: it.Id ?? it.id,
            name: it.Name ?? it.name,
            description: it.Description ?? it.description,
            isUnlimited: it.IsUnlimited ?? it.isUnlimited ?? false,
            limitValue: it.LimitValue ?? it.limitValue ?? null,
            limitUnit: it.LimitUnit ?? it.limitUnit ?? null,
            isDeleted: it.IsDeleted ?? it.isDeleted ?? false,
            ...it,
          }));

          setLimitations(mapped.filter((x: any) => !x.isDeleted));
        }
      } catch (err) {
        console.error("Error loading business dashboard data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [userId]);

  // Helper: Get limitation from item
  const getLimFromItem = (item: any) => {
    if (!item) return null;
    if (typeof item === "object") return item;
    return limitations.find((l: any) => l.id === item || l.Id === item) || null;
  };

  // Helper: Convert to pricing plan
  const convertToPricingPlan = (plan: any): PricingPlan => {
    const planLimitations: PricingPlanFeature[] = (plan.limitations || []).map(
      (limItem: any) => {
        const lim = getLimFromItem(limItem);
        if (!lim) {
          return {
            name: String(limItem),
          };
        }

        // Keep limitValue and name separate
        return {
          name: lim.name ?? lim.Name,
          limitValue: lim.limitValue ?? lim.LimitValue ?? null,
          isUnlimited: lim.isUnlimited || lim.IsUnlimited,
        };
      }
    );

    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      billingCycle: plan.billingCycle ?? 1,
      description: plan.description,
      limitations: planLimitations,
    };
  };

  // Helper: Render feature label
  const renderFeatureLabel = (featureName: string) => {
    const lim = limitations.find((l: any) => l.name === featureName);
    if (!lim) return featureName;
    if (lim.isUnlimited) return `${lim.name} (Unlimited)`;
    if (lim.limitValue !== null && lim.limitValue !== undefined) {
      return `${lim.name}: ${lim.limitValue}${
        lim.limitUnit ? ` ${lim.limitUnit}` : ""
      }`;
    }
    return lim.name;
  };

  // Calculate statistics from filtered data
  const stats = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const activeProjects = filteredProjects.filter(
      (p) => p.status === "InProgress"
    ).length;
    const completedProjects = filteredProjects.filter(
      (p) => p.status === "Completed"
    ).length;
    const notStartedProjects = filteredProjects.filter(
      (p) => p.status === "NotStarted"
    ).length;
    const onHoldProjects = filteredProjects.filter(
      (p) => p.status === "OnHold"
    ).length;
    const cancelledProjects = filteredProjects.filter(
      (p) => p.status === "Cancelled"
    ).length;
    const totalEmployees = filteredEmployees.length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      notStartedProjects,
      onHoldProjects,
      cancelledProjects,
      totalEmployees,
    };
  }, [filteredProjects, filteredEmployees]);

  // Calculate project trend data based on selected period
  const projectTrendData = useMemo(() => {
    const { startDate, endDate } = getDateRange;
    const months = [
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
    ];

    // For week-based periods, show daily data
    if (selectedPeriod === "week" || selectedPeriod === "last-week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const trendData = [];
      const currentDate = new Date(startDate);

      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(currentDate);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        const projectsOnDay = projects.filter((p) => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= dayStart && createdAt <= dayEnd;
        }).length;

        trendData.push({
          month: days[i],
          projects: projectsOnDay,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      return trendData;
    }

    // For month-based periods, show weekly data
    if (selectedPeriod === "month" || selectedPeriod === "last-month") {
      const trendData = [];
      const currentDate = new Date(startDate);
      let weekNum = 1;

      while (currentDate <= endDate) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
        weekEnd.setHours(23, 59, 59, 999);

        const projectsInWeek = projects.filter((p) => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= weekStart && createdAt <= weekEnd;
        }).length;

        trendData.push({
          month: `Week ${weekNum}`,
          projects: projectsInWeek,
        });

        currentDate.setDate(currentDate.getDate() + 7);
        weekNum++;
      }
      return trendData;
    }

    // For quarter/year periods, show monthly data
    const trendData = [];
    const currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );

    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      monthEnd.setHours(23, 59, 59, 999);

      const projectsInMonth = projects.filter((p) => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length;

      trendData.push({
        month: months[currentDate.getMonth()],
        projects: projectsInMonth,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return trendData;
  }, [projects, getDateRange, selectedPeriod]);

  // Project status chart
  useEffect(() => {
    if (chartRef.current && !loading) {
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
            labels: ["Completed", "In Progress", "Not Started", "On Hold", "Cancelled"],
            datasets: [
              {
                data: [
                  stats.completedProjects,
                  stats.activeProjects,
                  stats.notStartedProjects,
                  stats.onHoldProjects,
                  stats.cancelledProjects,
                ],
                backgroundColor: [
                  "#10b981", // Green for completed
                  "#f59e0b", // Orange for in-progress
                  "#6b7280", // Gray for not started
                  "#3b82f6", // Blue for on hold
                  "#ef4444", // Red for cancelled
                ],
                borderColor: ["#059669", "#d97706", "#4b5563", "#2563eb", "#dc2626"],
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
                    return `${label}: ${value} projects (${percentage}%)`;
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
  }, [
    loading,
    stats.completedProjects,
    stats.activeProjects,
    stats.notStartedProjects,
    stats.onHoldProjects,
    stats.cancelledProjects,
  ]);

  // Stats cards data
  const statsCards = [
    {
      id: "revenue",
      title: "Total Projects",
      value: stats.totalProjects.toString(),
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
      title: "Active Projects",
      value: stats.activeProjects.toString(),
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
      title: "Employees",
      value: stats.totalEmployees.toString(),
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
  ];

  // Loading state
  // if (loading) {
  //   return (
  //     <div className="business-dashboard">
  //       <div
  //         className="loading-container"
  //         style={{
  //           display: "flex",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           height: "50vh",
  //         }}
  //       >
  //         <div
  //           className="loading-spinner"
  //           style={{
  //             width: "40px",
  //             height: "40px",
  //             border: "4px solid #f3f3f3",
  //             borderTop: "4px solid #FF5E13",
  //             borderRadius: "50%",
  //             animation: "spin 1s linear infinite",
  //           }}
  //         ></div>
  //         <p style={{ marginLeft: "16px" }}>Loading dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="business-dashboard">
      {/* Dashboard Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1f2937',
          margin: '0 0 4px 0',
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Business Dashboard</h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0,
          fontWeight: 400
        }}>Overview of your business activities</p>
      </div>

      {/* Date Range Filter */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '24px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
          flexWrap: 'wrap'
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            flexShrink: 0
          }}
        >
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <label style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0
            }}>From</label>
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => {
                setCustomDateRange((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }));
                setSelectedPeriod('custom');
              }}
              max={customDateRange.endDate || undefined}
              style={{
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1f2937',
                background: 'white',
                cursor: 'pointer',
                minWidth: '160px',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
          <span 
            style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontWeight: 600,
              paddingBottom: '10px',
              userSelect: 'none'
            }}
          >to</span>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <label style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0
            }}>To</label>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => {
                setCustomDateRange((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }));
                setSelectedPeriod('custom');
              }}
              min={customDateRange.startDate || undefined}
              style={{
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1f2937',
                background: 'white',
                cursor: 'pointer',
                minWidth: '160px',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        </div>
        
        <div 
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginLeft: 'auto'
          }}
        >
          <button
            onClick={() => {
              const now = new Date();
              const dayOfWeek = now.getDay();
              const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              const monday = new Date(now);
              monday.setDate(now.getDate() - diffToMonday);
              
              const startYear = monday.getFullYear();
              const startMonth = String(monday.getMonth() + 1).padStart(2, '0');
              const startDay = String(monday.getDate()).padStart(2, '0');
              const endYear = now.getFullYear();
              const endMonth = String(now.getMonth() + 1).padStart(2, '0');
              const endDay = String(now.getDate()).padStart(2, '0');
              
              setCustomDateRange({
                startDate: `${startYear}-${startMonth}-${startDay}`,
                endDate: `${endYear}-${endMonth}-${endDay}`
              });
              setSelectedPeriod('week');
            }}
            style={{
              padding: '10px 18px',
              border: selectedPeriod === 'week' ? 'none' : '2px solid #e5e7eb',
              background: selectedPeriod === 'week' 
                ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' 
                : 'white',
              color: selectedPeriod === 'week' ? 'white' : '#6b7280',
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: selectedPeriod === 'week' 
                ? '0 4px 12px rgba(249, 115, 22, 0.3)' 
                : 'none'
            }}
          >
            This Week
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
              
              const startYear = firstDay.getFullYear();
              const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
              const startDay = String(firstDay.getDate()).padStart(2, '0');
              const endYear = now.getFullYear();
              const endMonth = String(now.getMonth() + 1).padStart(2, '0');
              const endDay = String(now.getDate()).padStart(2, '0');
              
              setCustomDateRange({
                startDate: `${startYear}-${startMonth}-${startDay}`,
                endDate: `${endYear}-${endMonth}-${endDay}`
              });
              setSelectedPeriod('month');
            }}
            style={{
              padding: '10px 18px',
              border: selectedPeriod === 'month' ? 'none' : '2px solid #e5e7eb',
              background: selectedPeriod === 'month' 
                ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' 
                : 'white',
              color: selectedPeriod === 'month' ? 'white' : '#6b7280',
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: selectedPeriod === 'month' 
                ? '0 4px 12px rgba(249, 115, 22, 0.3)' 
                : 'none'
            }}
          >
            This Month
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), 0, 1);
              
              const startYear = firstDay.getFullYear();
              const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
              const startDay = String(firstDay.getDate()).padStart(2, '0');
              const endYear = now.getFullYear();
              const endMonth = String(now.getMonth() + 1).padStart(2, '0');
              const endDay = String(now.getDate()).padStart(2, '0');
              
              setCustomDateRange({
                startDate: `${startYear}-${startMonth}-${startDay}`,
                endDate: `${endYear}-${endMonth}-${endDay}`
              });
              setSelectedPeriod('year');
            }}
            style={{
              padding: '10px 18px',
              border: selectedPeriod === 'year' ? 'none' : '2px solid #e5e7eb',
              background: selectedPeriod === 'year' 
                ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' 
                : 'white',
              color: selectedPeriod === 'year' ? 'white' : '#6b7280',
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: selectedPeriod === 'year' 
                ? '0 4px 12px rgba(249, 115, 22, 0.3)' 
                : 'none'
            }}
          >
            This Year
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
              const startYear = firstDay.getFullYear();
              const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
              const startDay = String(firstDay.getDate()).padStart(2, '0');
              const endYear = now.getFullYear();
              const endMonth = String(now.getMonth() + 1).padStart(2, '0');
              const endDay = String(now.getDate()).padStart(2, '0');
              setCustomDateRange({
                startDate: `${startYear}-${startMonth}-${startDay}`,
                endDate: `${endYear}-${endMonth}-${endDay}`
              });
              setSelectedPeriod('custom');
            }}
            style={{
              padding: '10px 18px',
              border: '2px solid #ef4444',
              background: 'white',
              color: '#ef4444',
              fontSize: '13.5px',
              fontWeight: 600,
              borderRadius: '10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Old time filter - hidden */}
      <div style={{ display: 'none' }}>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {statsCards.map((stat) => (
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
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Project Overview Chart */}
        <div className="main-chart-container" style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.3s ease',
        }}>
          <div className="chart-header" style={{
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f3f4f6',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 11V17M12 10V17M15 8V17M3 21H21M3 3H21M5 3V21M19 3V21"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#1f2937',
                letterSpacing: '-0.02em'
              }}>Project Statistics</h3>
            </div>
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
                  <span className="status-count">
                    {stats.completedProjects}
                  </span>
                  <span className="status-label">Completed</span>
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
                  <span className="status-count">{stats.activeProjects}</span>
                  <span className="status-label">In Progress</span>
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
                  <span className="status-count">{stats.notStartedProjects}</span>
                  <span className="status-label">Not Started</span>
                </div>
              </div>
              <div className="status-item on-hold">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 9V15M14 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="status-info">
                  <span className="status-count">{stats.onHoldProjects}</span>
                  <span className="status-label">On Hold</span>
                </div>
              </div>
              <div className="status-item cancelled">
                <div className="status-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6L18 18"
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
                  <span className="status-count">{stats.cancelledProjects}</span>
                  <span className="status-label">Cancelled</span>
                </div>
              </div>
            </div>
            <div className="chart-wrapper">
              <canvas ref={chartRef} width="400" height="200"></canvas>
            </div>
          </div>
        </div>

        {/* Project Trend Chart */}
        <div className="revenue-trend-section" style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.3s ease',
        }}>
          <div className="section-header" style={{
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f3f4f6',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3V21M21 21H3M7 13L12 8L16 12L21 7M21 7V13M21 7H15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#1f2937',
                letterSpacing: '-0.02em'
              }}>Project Trend</h3>
            </div>
            <div className="revenue-stats" style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div className="revenue-stat" style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #bae6fd',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '100px'
              }}>
                <span className="stat-label" style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#0369a1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Total Projects</span>
                <span className="stat-value" style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#0c4a6e',
                  lineHeight: 1
                }}>{stats.totalProjects}</span>
              </div>
              <div className="revenue-stat" style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #fcd34d',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '100px'
              }}>
                <span className="stat-label" style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#92400e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Active</span>
                <span className="stat-value positive" style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#78350f',
                  lineHeight: 1
                }}>{stats.activeProjects}</span>
              </div>
            </div>
          </div>

          <div className="revenue-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={projectTrendData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value}`}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    color: "#1f2937",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{
                    color: "#6b7280",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                  formatter={(value: any) => [
                    `${value} ${value === 1 ? 'project' : 'projects'}`,
                    "Total"
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{
                    fill: "#ffffff",
                    stroke: "#f97316",
                    strokeWidth: 3,
                    r: 5,
                  }}
                  activeDot={{ 
                    r: 7,
                    fill: "#f97316",
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BusinessDashboard;
