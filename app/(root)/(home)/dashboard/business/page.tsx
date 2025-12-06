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
import { meetingService } from "@/services/meetingService";
import { userService } from "@/services/userService";
import packageService from "@/services/packageService";
import limitationService from "@/services/limitationService";
import { Project } from "@/types/project";
import { MeetingItem } from "@/types/meeting";
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
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [employees, setEmployees] = useState<GetUserResponse[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [limitations, setLimitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const [packageViewMode, setPackageViewMode] = useState<"grid" | "list">("grid");
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const meetingChartRef = useRef<HTMLCanvasElement>(null);
  const meetingChartInstance = useRef<Chart | null>(null);

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

  // Filter meetings by date range
  const filteredMeetings = useMemo(() => {
    const { startDate, endDate } = getDateRange;
    return meetings.filter((m) => {
      if (!m.startTime) return false;
      const meetingDate = new Date(m.startTime);
      return meetingDate >= startDate && meetingDate <= endDate;
    });
  }, [meetings, getDateRange]);

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

        // 3. Fetch meetings for each project
        const meetingPromises = projectList.map((p) =>
          meetingService.getMeetingsByProjectId(p.id)
        );
        const meetingResults = await Promise.all(meetingPromises);
        const allMeetings: MeetingItem[] = meetingResults.reduce((acc, res) => {
          if (res.success && Array.isArray(res.data)) {
            return acc.concat(res.data);
          }
          return acc;
        }, [] as MeetingItem[]);

        if (mounted) setMeetings(allMeetings);

        // 4. Fetch packages
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

        // 5. Fetch limitations
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
          limitValue: (lim.limitValue ?? lim.LimitValue) ?? null,
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
    const totalMeetings = filteredMeetings.length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalEmployees,
      totalMeetings,
    };
  }, [filteredProjects, employees, filteredMeetings]);

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

  // Filter upcoming meetings
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((m) => {
        if (!m.startTime) return false;
        const status = m.status?.toLowerCase();
        if (status === "finished" || status === "cancel") return false;
        return new Date(m.startTime) >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()
      )
      .map((m) => {
        const start = new Date(m.startTime!);
        const end = m.endTime ? new Date(m.endTime) : undefined;
        return {
          id: m.id,
          title: m.title,
          time: end
            ? `${start.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${end.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : start.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
          date: formatMeetingDate(start),
          participants: m.attendees?.length || 0,
          projectName: m.projectName,
        };
      });
  }, [meetings]);

  // Meeting time distribution for chart (filtered)
  const meetingTimeDistribution = useMemo(() => {
    const distribution = { morning: 0, afternoon: 0, evening: 0, other: 0 };

    filteredMeetings.forEach((m) => {
      if (!m.startTime) return;
      const hour = new Date(m.startTime).getHours();
      if (hour >= 9 && hour < 12) distribution.morning++;
      else if (hour >= 13 && hour < 17) distribution.afternoon++;
      else if (hour >= 18 && hour < 20) distribution.evening++;
      else distribution.other++;
    });

    return [
      distribution.morning,
      distribution.afternoon,
      distribution.evening,
      distribution.other,
    ];
  }, [filteredMeetings]);

  // Completed meetings count (filtered)
  const completedMeetingsCount = useMemo(() => {
    return filteredMeetings.filter(
      (m) => m.status?.toLowerCase() === "finished"
    ).length;
  }, [filteredMeetings]);

  // Helper function to format meeting date
  function formatMeetingDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const meetingDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (meetingDay.getTime() === today.getTime()) return "Today";
    if (meetingDay.getTime() === tomorrow.getTime()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

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

  // Meeting time distribution chart
  useEffect(() => {
    if (meetingChartRef.current && !loading) {
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
            labels: ["9:00-12:00", "13:00-17:00", "18:00-20:00", "Other"],
            datasets: [
              {
                label: "Number of meetings",
                data: meetingTimeDistribution,
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
                    return `${context.label}: ${context.parsed.y} meetings`;
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
  }, [loading, meetingTimeDistribution]);

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
    {
      id: "meetings",
      title: "Total Meetings",
      value: stats.totalMeetings.toString(),
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
      {/* Time Filter */}
      <div className="time-filter-container">
        <div className="time-filter-header">
          <h3>Time Filter</h3>
        </div>
        <div className="time-filter-select">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="time-filter-dropdown"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="last-year">Last Year</option>
            <option value="custom">Custom</option>
          </select>

          {selectedPeriod === "custom" && (
            <div className="custom-date-range">
              <div className="date-input-group">
                <label>From:</label>
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
                <label>To:</label>
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
                    console.log("Apply time range:", customDateRange);
                    // Add logic to filter data by time range here
                  }
                }}
                disabled={
                  !customDateRange.startDate || !customDateRange.endDate
                }
              >
                Apply
              </button>
            </div>
          )}
        </div>
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

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Upcoming Meetings */}
        <div className="upcoming-meetings">
          <div className="section-header">
            <h3>Upcoming Meetings</h3>
            {upcomingMeetings.length > 4 && (
              <button
                className="create-btn"
                onClick={() => setShowAllMeetings(!showAllMeetings)}
              >
                {showAllMeetings ? "Collapse" : "View All"}
              </button>
            )}
          </div>

          <div className="meetings-list">
            {upcomingMeetings.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "#6b7280",
                }}
              >
                <p>No upcoming meetings</p>
              </div>
            ) : (
              (showAllMeetings
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
                      {meeting.participants} participants
                    </span>
                  </div>

                  <button
                    className="join-btn"
                    onClick={() => router.push(`/meeting/${meeting.id}`)}
                  >
                    Join
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Meeting Statistics Chart */}
        <div className="meeting-stats-section">
          <div className="section-header">
            <h3>Meeting Statistics</h3>
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
                  <span className="stat-label">Total Meetings</span>
                  <span className="stat-value">{stats.totalMeetings}</span>
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
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{completedMeetingsCount}</span>
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
                  <span className="stat-label">Upcoming</span>
                  <span className="stat-value">{upcomingMeetings.length}</span>
                </div>
              </div>
            </div>

            <div className="meeting-chart-wrapper">
              <canvas ref={meetingChartRef} width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
