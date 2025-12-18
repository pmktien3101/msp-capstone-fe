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
      (p) => p.status === "InProgress" || p.status === "Active"
    ).length;
    const completedProjects = filteredProjects.filter(
      (p) => p.status === "Done" || p.status === "Completed"
    ).length;
    const pendingProjects = filteredProjects.filter(
      (p) => p.status === "NotStarted" || p.status === "Pending"
    ).length;
    const totalEmployees = employees.length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalEmployees,
    };
  }, [filteredProjects, employees]);

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
            labels: ["Completed", "In Progress", "Pending"],
            datasets: [
              {
                data: [
                  stats.completedProjects,
                  stats.activeProjects,
                  stats.pendingProjects,
                ],
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
    stats.pendingProjects,
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
        <div className="main-chart-container">
          <div className="chart-header">
            <h3>Project Statistics</h3>
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
                  <span className="status-count">{stats.pendingProjects}</span>
                  <span className="status-label">Pending</span>
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
            <h3>Project Trend</h3>
            <div className="revenue-stats">
              <div className="revenue-stat">
                <span className="stat-label">Total</span>
                <span className="stat-value">{stats.totalProjects}</span>
              </div>
              <div className="revenue-stat">
                <span className="stat-label">Active</span>
                <span className="stat-value positive">
                  {stats.activeProjects}
                </span>
              </div>
            </div>
          </div>

          <div className="revenue-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectTrendData}>
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
                  formatter={(value: any) => [`${value} projects`, "Projects"]}
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

      {/* Packages Section */}
      <div className="packages-section">
        <div className="section-header">
          <h3>Available Packages</h3>
          <button
            className="create-btn"
            onClick={() => setShowPackages(!showPackages)}
          >
            {showPackages ? "Hide" : "View Packages"}
          </button>
        </div>

        {showPackages && (
          <div className="packages-content">
            {/* Search and View Toggle */}
            <div className="packages-controls">
              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={packageSearchQuery}
                  onChange={(e) => setPackageSearchQuery(e.target.value)}
                />
              </div>

              <div className="view-toggle">
                <button
                  className={`toggle-btn ${
                    packageViewMode === "grid" ? "active" : ""
                  }`}
                  onClick={() => setPackageViewMode("grid")}
                  title="Grid view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <button
                  className={`toggle-btn ${
                    packageViewMode === "list" ? "active" : ""
                  }`}
                  onClick={() => setPackageViewMode("list")}
                  title="List view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Packages Grid/List */}
            <div
              className={`pricing-grid ${
                packageViewMode === "list" ? "list-view" : ""
              }`}
            >
              {packages.length > 0 ? (
                packages
                  .filter(
                    (pkg) =>
                      pkg.name
                        .toLowerCase()
                        .includes(packageSearchQuery.toLowerCase()) ||
                      (pkg.description &&
                        pkg.description
                          .toLowerCase()
                          .includes(packageSearchQuery.toLowerCase()))
                  )
                  .map((plan: any) => (
                    <PricingCard
                      key={plan.id}
                      plan={convertToPricingPlan(plan)}
                      showDelete={false}
                    />
                  ))
              ) : (
                <div className="empty-state">
                  <p>No packages available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
