"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  FolderKanban,
  Video,
  Trophy,
  Star,
  Package,
} from "lucide-react";
import packageService from "@/services/packageService";
import { subscriptionService } from "@/services/subscriptionService";
import { userService } from "@/services/userService";
import { projectService } from "@/services/projectService";
import { meetingService } from "@/services/meetingService";
import "@/app/styles/admin-dashboard.scss";

// Helper function to get date range based on filter
const getDateRange = (filter: string, customStart?: string, customEnd?: string): { start: Date; end: Date } => {
  // If custom dates are provided, use them
  if (filter === "Custom" && customStart && customEnd) {
    const start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const now = new Date();
  let end = new Date(now);
  let start = new Date(now);

  switch (filter) {
    case "Today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "This Week":
    case "Week":
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case "This Month":
    case "Month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "This Quarter":
    case "Quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      break;
    case "This Year":
    case "Year":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case "All Time":
    default:
      start = new Date(0); // Beginning of time
      end = new Date(now.getFullYear() + 100, 11, 31); // Far future
      break;
  }

  return { start, end };
};

// Helper function to check if a date is within range
const isDateInRange = (dateStr: string, filter: string, customStart?: string, customEnd?: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const { start, end } = getDateRange(filter, customStart, customEnd);
  return date >= start && date <= end;
};

interface PackageInfo {
  id: string;
  name: string;
  price: number;
  description?: string;
  features?: string[];
  isActive?: boolean;
}

interface PackageDistribution {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

interface SubscriptionInfo {
  id: string;
  packageName: string;
  userName: string;
  userEmail: string;
  totalPrice: number;
  paidAt: string;
  status: string;
  currency: string;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface MonthlyBusinessReg {
  month: string;
  count: number;
}

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Year");
  const [businessRegPeriod, setBusinessRegPeriod] = useState("Year");

  // Custom date range states
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const year = firstDay.getFullYear();
    const month = String(firstDay.getMonth() + 1).padStart(2, '0');
    const day = String(firstDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [quickFilter, setQuickFilter] = useState<string>("");

  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<
    PackageDistribution[]
  >([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);

  // Raw data from API (unfiltered)
  const [allSubscriptions, setAllSubscriptions] = useState<any[]>([]);
  const [allBusinessOwners, setAllBusinessOwners] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allMeetings, setAllMeetings] = useState<any[]>([]);

  // Determine active filter
  const activeFilter = useMemo(() => {
    if (startDate && endDate) return "Custom";
    return quickFilter;
  }, [startDate, endDate, quickFilter]);

  // Filtered subscriptions based on date range
  const filteredSubscriptions = useMemo(() => {
    return allSubscriptions.filter((sub) =>
      isDateInRange(sub.paidAt || sub.startDate, activeFilter, startDate, endDate)
    );
  }, [allSubscriptions, activeFilter, startDate, endDate]);

  // Filtered projects based on date range
  const totalProjects = useMemo(() => {
    const filtered = allProjects.filter((project) =>
      isDateInRange(project.createdAt, activeFilter, startDate, endDate)
    );
    return filtered.length;
  }, [allProjects, activeFilter, startDate, endDate]);

  // Filtered meetings based on date range
  const totalMeetings = useMemo(() => {
    const filtered = allMeetings.filter((meeting) =>
      isDateInRange(meeting.startTime || meeting.createdAt, activeFilter, startDate, endDate)
    );
    return filtered.length;
  }, [allMeetings, activeFilter, startDate, endDate]);

  // Total revenue based on filtered subscriptions
  const totalRevenue = useMemo(() => {
    return filteredSubscriptions.reduce(
      (sum, sub) => sum + (sub.totalPrice || 0),
      0
    );
  }, [filteredSubscriptions]);

  // Recent subscriptions (filtered, sorted, sliced)
  const recentSubscriptions = useMemo(() => {
    return filteredSubscriptions
      .filter((sub: any) => sub.totalPrice !== 0 && sub.transactionId !== "FREE_PACKAGE")
      .map((sub: any) => ({
        id: sub.id,
        packageName: sub.package?.name || "Unknown Package",
        userName: sub.user?.fullName || "Unknown User",
        userEmail: sub.user?.email || "",
        totalPrice: sub.totalPrice || 0,
        paidAt: sub.paidAt || sub.startDate || "",
        status: sub.status || "unknown",
        currency: sub.package?.currency || "VND",
      }))
      .sort(
        (a: SubscriptionInfo, b: SubscriptionInfo) =>
          new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      )
      .slice(0, 6);
  }, [filteredSubscriptions]);

  // Monthly revenue data for chart based on selectedPeriod
  const monthlyRevenueData = useMemo(() => {
    const monthNames = [
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

    // Filter subscriptions based on selectedPeriod
    const periodFilteredSubs = allSubscriptions.filter((sub) =>
      isDateInRange(
        sub.paidAt || sub.startDate,
        selectedPeriod === "Week"
          ? "This Week"
          : selectedPeriod === "Month"
            ? "This Month"
            : "This Year"
      )
    );

    if (selectedPeriod === "Week") {
      // Show daily data for the week
      const { start } = getDateRange("This Week");
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyRevenue: { [key: string]: number } = {};
      dayNames.forEach((day) => {
        dailyRevenue[day] = 0;
      });

      periodFilteredSubs.forEach((sub: any) => {
        const paidDate = sub.paidAt ? new Date(sub.paidAt) : null;
        if (paidDate) {
          const dayName = dayNames[paidDate.getDay()];
          dailyRevenue[dayName] += sub.totalPrice || 0;
        }
      });

      return dayNames.map((day) => ({
        month: day,
        revenue: dailyRevenue[day],
      }));
    } else if (selectedPeriod === "Month") {
      // Show weekly data for the month
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const weeklyRevenue: { [key: string]: number } = {};
      weeks.forEach((week) => {
        weeklyRevenue[week] = 0;
      });

      periodFilteredSubs.forEach((sub: any) => {
        const paidDate = sub.paidAt ? new Date(sub.paidAt) : null;
        if (paidDate) {
          const weekOfMonth = Math.ceil(paidDate.getDate() / 7);
          const weekKey = `Week ${Math.min(weekOfMonth, 4)}`;
          weeklyRevenue[weekKey] += sub.totalPrice || 0;
        }
      });

      return weeks.map((week) => ({
        month: week,
        revenue: weeklyRevenue[week],
      }));
    } else {
      // Year - show monthly data
      const monthlyRevenue: { [key: string]: number } = {};
      monthNames.forEach((month) => {
        monthlyRevenue[month] = 0;
      });

      periodFilteredSubs.forEach((sub: any) => {
        const paidDate = sub.paidAt ? new Date(sub.paidAt) : null;
        if (paidDate) {
          const monthName = monthNames[paidDate.getMonth()];
          monthlyRevenue[monthName] += sub.totalPrice || 0;
        }
      });

      return monthNames.map((month) => ({
        month,
        revenue: monthlyRevenue[month],
      }));
    }
  }, [allSubscriptions, selectedPeriod]);

  // Filtered business owners based on date range
  const filteredBusinessOwners = useMemo(() => {
    return allBusinessOwners.filter((owner) =>
      isDateInRange(owner.createdAt, activeFilter, startDate, endDate)
    );
  }, [allBusinessOwners, activeFilter, startDate, endDate]);

  // Total businesses count
  const totalBusinesses = useMemo(() => {
    return filteredBusinessOwners.length;
  }, [filteredBusinessOwners]);

  // Monthly business registration data based on businessRegPeriod
  const monthlyBusinessRegData = useMemo(() => {
    const monthNames = [
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

    // Filter business owners based on businessRegPeriod
    const periodFilteredOwners = allBusinessOwners.filter((owner) =>
      isDateInRange(
        owner.createdAt,
        businessRegPeriod === "Week"
          ? "This Week"
          : businessRegPeriod === "Month"
            ? "This Month"
            : businessRegPeriod === "Quarter"
              ? "This Quarter"
              : "This Year"
      )
    );

    if (businessRegPeriod === "Week") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyReg: { [key: string]: number } = {};
      dayNames.forEach((day) => {
        dailyReg[day] = 0;
      });

      periodFilteredOwners.forEach((owner: any) => {
        const createdDate = owner.createdAt ? new Date(owner.createdAt) : null;
        if (createdDate) {
          const dayName = dayNames[createdDate.getDay()];
          dailyReg[dayName]++;
        }
      });

      return dayNames.map((day) => ({ month: day, count: dailyReg[day] }));
    } else if (businessRegPeriod === "Month") {
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const weeklyReg: { [key: string]: number } = {};
      weeks.forEach((week) => {
        weeklyReg[week] = 0;
      });

      periodFilteredOwners.forEach((owner: any) => {
        const createdDate = owner.createdAt ? new Date(owner.createdAt) : null;
        if (createdDate) {
          const weekOfMonth = Math.ceil(createdDate.getDate() / 7);
          const weekKey = `Week ${Math.min(weekOfMonth, 4)}`;
          weeklyReg[weekKey]++;
        }
      });

      return weeks.map((week) => ({ month: week, count: weeklyReg[week] }));
    } else if (businessRegPeriod === "Quarter") {
      const currentQuarter = Math.floor(new Date().getMonth() / 3);
      const quarterMonths = monthNames.slice(
        currentQuarter * 3,
        currentQuarter * 3 + 3
      );
      const monthlyReg: { [key: string]: number } = {};
      quarterMonths.forEach((month) => {
        monthlyReg[month] = 0;
      });

      periodFilteredOwners.forEach((owner: any) => {
        const createdDate = owner.createdAt ? new Date(owner.createdAt) : null;
        if (createdDate) {
          const monthName = monthNames[createdDate.getMonth()];
          if (quarterMonths.includes(monthName)) {
            monthlyReg[monthName]++;
          }
        }
      });

      return quarterMonths.map((month) => ({
        month,
        count: monthlyReg[month],
      }));
    } else {
      // Year
      const monthlyReg: { [key: string]: number } = {};
      monthNames.forEach((month) => {
        monthlyReg[month] = 0;
      });

      periodFilteredOwners.forEach((owner: any) => {
        const createdDate = owner.createdAt ? new Date(owner.createdAt) : null;
        if (createdDate) {
          const monthName = monthNames[createdDate.getMonth()];
          monthlyReg[monthName]++;
        }
      });

      return monthNames.map((month) => ({ month, count: monthlyReg[month] }));
    }
  }, [allBusinessOwners, businessRegPeriod]);

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true);
        const response = await packageService.getPackages();
        if (response.success && response.data) {
          const packagesData = Array.isArray(response.data) ? response.data : [];
          setPackages(packagesData);

          const colors = ["#F97316", "#FB923C", "#FDBA74", "#FED7AA", "#FFEDD5"];

          // ✅ Tổng số Business Owners (TOÀN BỘ, không filter)
          const totalBO = allBusinessOwners.length;

          console.log("Total Business Owners:", totalBO);
          console.log("All Subscriptions:", allSubscriptions);

          // ✅ Tìm subscription ACTIVE mới nhất của mỗi user (BAO GỒM FREE)
          const userActivePackages: { [userId: string]: any } = {};

          allSubscriptions.forEach((sub: any) => {
            const userId = sub.userId || sub.user?.id;
            if (!userId) return;

            // ✅ Kiểm tra active (MSP FREE không cần check endDate)
            const isFreePackage = sub.transactionID === 'FREE_PACKAGE' ||
              sub.package?.name === 'MSP FREE' ||
              sub.package?.price === 0;

            const isActive = sub.isActive === true &&
              (isFreePackage || new Date(sub.endDate) > new Date());

            if (!isActive) return;

            // Lấy subscription mới nhất (theo startDate)
            if (!userActivePackages[userId] ||
              new Date(sub.startDate) > new Date(userActivePackages[userId].startDate)) {
              userActivePackages[userId] = sub;
            }
          });

          console.log("User Active Packages:", userActivePackages);

          // ✅ Đếm số BO đang dùng từng package (BAO GỒM MSP FREE)
          const distribution = packagesData.map((pkg: PackageInfo, index: number) => {
            const count = Object.values(userActivePackages).filter(
              (sub: any) => sub.package?.id === pkg.id || sub.package?.name === pkg.name
            ).length;

            return {
              name: pkg.name,
              count: count,
              color: colors[index % colors.length],
              // ✅ Tính % dựa trên totalBO
              percentage: totalBO > 0 ? (count / totalBO) * 100 : 0,
            };
          });

          console.log("Package Distribution:", distribution);
          setPackageDistribution(distribution);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, [allSubscriptions, allBusinessOwners]); // ✅ Đổi dependencies

  // Fetch subscriptions from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setIsLoadingSubscriptions(true);
        const response = await subscriptionService.getAllSubscriptions();
        if (response.success && response.data) {
          const subscriptionsData = Array.isArray(response.data)
            ? response.data
            : [];

          // Store raw subscriptions data
          setAllSubscriptions(subscriptionsData);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setIsLoadingSubscriptions(false);
      }
    };

    fetchSubscriptions();
  }, []);

  // Fetch business owners from API
  useEffect(() => {
    const fetchBusinessOwners = async () => {
      try {
        setIsLoadingBusinesses(true);
        const response = await userService.getBusinessOwners();
        if (response.success && response.data) {
          const businessOwners = Array.isArray(response.data)
            ? response.data
            : [];

          // Store raw business owners data
          setAllBusinessOwners(businessOwners);
        }
      } catch (error) {
        console.error("Error fetching business owners:", error);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    fetchBusinessOwners();
  }, []);

  // Fetch all projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();
        if (response.success && response.data) {
          const projects = response.data.items || [];
          setAllProjects(projects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Fetch all meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        // Get all projects first, then fetch meetings for each project
        const projectsResponse = await projectService.getAllProjects();
        if (projectsResponse.success && projectsResponse.data) {
          const projects = projectsResponse.data.items || [];
          const allMeetingsList: any[] = [];

          // Fetch meetings for each project
          const meetingsPromises = projects.map((project: any) =>
            meetingService.getMeetingsByProjectId(project.id)
          );
          const meetingsResults = await Promise.all(meetingsPromises);

          meetingsResults.forEach((result) => {
            if (result.success && result.data) {
              allMeetingsList.push(...result.data);
            }
          });

          setAllMeetings(allMeetingsList);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  // Stats data - Meeting/Project/Business related (removed Tasks)
  const statsCards = [
    {
      icon: Building2,
      label: "Businesses",
      value: totalBusinesses,
      color: "#F97316",
    },
    {
      icon: FolderKanban,
      label: "Total Projects",
      value: totalProjects,
      color: "#F97316",
    },
    { icon: Video, label: "Meetings", value: totalMeetings, color: "#F97316" },
  ];

  // Revenue Overview data derived from API
  const revenueData = {
    labels: monthlyRevenueData.map((item) => item.month),
    values: monthlyRevenueData.map((item) => item.revenue),
  };

  // Business Registration data derived from API
  const businessRegData = {
    labels: monthlyBusinessRegData.map((item) => item.month),
    values: monthlyBusinessRegData.map((item) => item.count),
  };

  // Calculate max value for bar chart scale
  const barChartMaxValue = useMemo(() => {
    const maxVal = Math.max(...businessRegData.values, 1);
    // Round up to nearest nice number
    if (maxVal <= 5) return 5;
    if (maxVal <= 10) return 10;
    if (maxVal <= 20) return 20;
    if (maxVal <= 40) return 40;
    if (maxVal <= 50) return 50;
    if (maxVal <= 100) return 100;
    return Math.ceil(maxVal / 50) * 50;
  }, [businessRegData.values]);

  // Generate y-axis labels for bar chart
  const barChartYLabels = useMemo(() => {
    const step = barChartMaxValue / 4;
    return [barChartMaxValue, step * 3, step * 2, step, 0].map((v) =>
      Math.round(v)
    );
  }, [barChartMaxValue]);

  // Calculate max value for revenue chart scale
  const revenueChartMaxValue = useMemo(() => {
    const maxVal = Math.max(...revenueData.values, 1);
    // Round up to nearest nice number
    if (maxVal <= 1000) return 1000;
    if (maxVal <= 5000) return 5000;
    if (maxVal <= 10000) return 10000;
    if (maxVal <= 25000) return 25000;
    if (maxVal <= 50000) return 50000;
    return Math.ceil(maxVal / 10000) * 10000;
  }, [revenueData.values]);

  // Generate y-axis labels for revenue chart
  const revenueChartYLabels = useMemo(() => {
    const formatValue = (v: number) => {
      if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
      if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
      return `${v}`;
    };
    const step = revenueChartMaxValue / 2;
    return [revenueChartMaxValue, step, 0].map((v) =>
      formatValue(Math.round(v))
    );
  }, [revenueChartMaxValue]);

  // Helper function to get icon based on package name
  const getPackageIcon = (packageName: string) => {
    const name = packageName.toLowerCase();
    if (name.includes("enterprise") || name.includes("premium")) return Trophy;
    if (name.includes("professional") || name.includes("pro")) return Star;
    return Package;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // DD/MM/YYYY
    return date.toLocaleDateString("en-GB");
  };

  // Generate SVG path for line chart
  const generateChartPath = () => {
    if (revenueData.values.length === 0) return "";

    const width = 500;
    const height = 150;
    const padding = 20;
    const maxValue = Math.max(...revenueData.values, 1); // Ensure at least 1 to avoid division by zero
    const minValue = Math.min(...revenueData.values);
    const range = maxValue - minValue || 1; // Avoid division by zero

    const points = revenueData.values.map((value, index) => {
      const x =
        padding +
        (index * (width - 2 * padding)) / (revenueData.values.length - 1 || 1);
      const y =
        height -
        padding -
        ((value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  const generateAreaPath = () => {
    if (revenueData.values.length === 0) return "";

    const width = 500;
    const height = 150;
    const padding = 20;
    const maxValue = Math.max(...revenueData.values, 1);
    const minValue = Math.min(...revenueData.values);
    const range = maxValue - minValue || 1;

    const points = revenueData.values.map((value, index) => {
      const x =
        padding +
        (index * (width - 2 * padding)) / (revenueData.values.length - 1 || 1);
      const y =
        height -
        padding -
        ((value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${padding},${height - padding} L ${points.join(" L ")} L ${width - padding
      },${height - padding} Z`;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        {/* Left Section */}
        <div className="left-section">
          {/* Filter Header */}
          <div className="filter-header">
            <div className="filter-title">
              <h1>Dashboard Overview</h1>
              <p>Welcome back, Admin</p>
            </div>
          </div>

          {/* Date Range Filter */}
          <div
            className="date-range-filter"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e5e7eb'
            }}
          >
            <div
              className="date-inputs"
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '10px',
                flexShrink: 0
              }}
            >
              <div
                className="input-group"
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
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setQuickFilter("");
                  }}
                  max={endDate || undefined}
                  className="date-input"
                  style={{
                    padding: '9px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#1f2937',
                    background: 'white',
                    cursor: 'pointer',
                    minWidth: '150px',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <span
                className="date-separator"
                style={{
                  color: '#9ca3af',
                  fontSize: '13px',
                  fontWeight: 600,
                  paddingBottom: '9px',
                  userSelect: 'none'
                }}
              >to</span>
              <div
                className="input-group"
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
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setQuickFilter("");
                  }}
                  min={startDate || undefined}
                  className="date-input"
                  style={{
                    padding: '9px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#1f2937',
                    background: 'white',
                    cursor: 'pointer',
                    minWidth: '150px',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>
            <div
              className="quick-filters"
              style={{
                display: 'flex',
                gap: '6px',
                marginLeft: '16px',
                flex: 1,
                alignItems: 'flex-end'
              }}
            >
              <button
                className={`quick-filter-btn ${quickFilter === "This Week" ? "active" : ""}`}
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

                  setStartDate(`${startYear}-${startMonth}-${startDay}`);
                  setEndDate(`${endYear}-${endMonth}-${endDay}`);
                  setQuickFilter("This Week");
                }}
                style={{
                  padding: '9px 14px',
                  border: quickFilter === "This Week" ? 'none' : '2px solid #e5e7eb',
                  background: quickFilter === "This Week"
                    ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
                    : 'white',
                  color: quickFilter === "This Week" ? 'white' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: quickFilter === "This Week"
                    ? '0 4px 12px rgba(249, 115, 22, 0.3)'
                    : 'none'
                }}
              >
                This Week
              </button>
              <button
                className={`quick-filter-btn ${quickFilter === "This Month" ? "active" : ""}`}
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

                  const startYear = firstDay.getFullYear();
                  const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
                  const startDay = String(firstDay.getDate()).padStart(2, '0');
                  const endYear = now.getFullYear();
                  const endMonth = String(now.getMonth() + 1).padStart(2, '0');
                  const endDay = String(now.getDate()).padStart(2, '0');

                  setStartDate(`${startYear}-${startMonth}-${startDay}`);
                  setEndDate(`${endYear}-${endMonth}-${endDay}`);
                  setQuickFilter("This Month");
                }}
                style={{
                  padding: '9px 14px',
                  border: quickFilter === "This Month" ? 'none' : '2px solid #e5e7eb',
                  background: quickFilter === "This Month"
                    ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
                    : 'white',
                  color: quickFilter === "This Month" ? 'white' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: quickFilter === "This Month"
                    ? '0 4px 12px rgba(249, 115, 22, 0.3)'
                    : 'none'
                }}
              >
                This Month
              </button>
              <button
                className={`quick-filter-btn ${quickFilter === "This Year" ? "active" : ""}`}
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), 0, 1);

                  const startYear = firstDay.getFullYear();
                  const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
                  const startDay = String(firstDay.getDate()).padStart(2, '0');
                  const endYear = now.getFullYear();
                  const endMonth = String(now.getMonth() + 1).padStart(2, '0');
                  const endDay = String(now.getDate()).padStart(2, '0');

                  setStartDate(`${startYear}-${startMonth}-${startDay}`);
                  setEndDate(`${endYear}-${endMonth}-${endDay}`);
                  setQuickFilter("This Year");
                }}
                style={{
                  padding: '9px 14px',
                  border: quickFilter === "This Year" ? 'none' : '2px solid #e5e7eb',
                  background: quickFilter === "This Year"
                    ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
                    : 'white',
                  color: quickFilter === "This Year" ? 'white' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: quickFilter === "This Year"
                    ? '0 4px 12px rgba(249, 115, 22, 0.3)'
                    : 'none'
                }}
              >
                This Year
              </button>
              <button
                className="clear-btn"
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const startYear = firstDay.getFullYear();
                  const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
                  const startDay = String(firstDay.getDate()).padStart(2, '0');
                  const endYear = now.getFullYear();
                  const endMonth = String(now.getMonth() + 1).padStart(2, '0');
                  const endDay = String(now.getDate()).padStart(2, '0');
                  setStartDate(`${startYear}-${startMonth}-${startDay}`);
                  setEndDate(`${endYear}-${endMonth}-${endDay}`);
                  setQuickFilter("");
                }}
                style={{
                  padding: '9px 14px',
                  border: '2px solid #ef4444',
                  background: 'white',
                  color: '#ef4444',
                  fontSize: '13px',
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

          {/* Stats Cards Row */}
          <div className="stats-row">
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="stat-card">
                  <div className="stat-icon">
                    <IconComponent size={24} color="#F97316" />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">{stat.label}</span>
                    <span className="stat-value">
                      {stat.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>



          {/* Bottom Row - Business Registration & Package Distribution */}
          <div className="bottom-row">
            {/* Business Registration Chart */}
            <div className="chart-card map-distribution">
              <div className="chart-header">
                <h3>Business Registrations</h3>
                <select
                  value={businessRegPeriod}
                  onChange={(e) => setBusinessRegPeriod(e.target.value)}
                  className="period-select"
                >
                  <option value="Week">This Week</option>
                  <option value="Month">This Month</option>
                  <option value="Quarter">This Quarter</option>
                  <option value="Year">This Year</option>
                </select>
              </div>
              <div className="bar-chart-container">
                <div className="bar-chart-y-axis">
                  {barChartYLabels.map((label, idx) => (
                    <span key={idx}>{label}</span>
                  ))}
                </div>
                <div className="bar-chart-content">
                  <div className="bar-chart-grid">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="grid-line"></div>
                    ))}
                  </div>
                  <div className="bar-chart-bars">
                    {businessRegData.values.map((value, index) => (
                      <div key={index} className="bar-wrapper">
                        <div
                          className="bar"
                          style={{
                            height: `${(value / barChartMaxValue) * 100}%`,
                          }}
                          title={`${businessRegData.labels[index]}: ${value} businesses`}
                        >
                          <span className="bar-tooltip">{value}</span>
                        </div>
                        <span className="bar-label">
                          {businessRegData.labels[index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Distribution */}
            <div className="chart-card visitor-profile">
              <h3>Package Distribution</h3>
              {isLoadingPackages ? (
                <div className="loading-container">
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <div className="donut-chart-container">
                    <svg viewBox="0 0 120 120" className="donut-chart">
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="20"
                      />
                      {/* Dynamic segments based on package distribution */}
                      {packageDistribution.map((pkg, index) => {
                        const circumference = 2 * Math.PI * 50;
                        const offset = packageDistribution
                          .slice(0, index)
                          .reduce(
                            (sum, p) =>
                              sum + (p.percentage / 100) * circumference,
                            0
                          );
                        return (
                          <circle
                            key={pkg.name}
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={pkg.color}
                            strokeWidth="20"
                            strokeDasharray={`${(pkg.percentage / 100) * circumference
                              } ${circumference}`
                            }
                            strokeDashoffset={- offset}
                            transform="rotate(-90 60 60)"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="legend">
                    {packageDistribution.map((pkg) => (
                      <div key={pkg.name} className="legend-item">
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: pkg.color }}
                        ></span>
                        <span>
                          {pkg.name} ({pkg.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* ✅ Thêm chú thích */}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#6B7280',
                    lineHeight: '1.5',
                    textAlign: 'center'  // ✅ Căn giữa
                  }}>
                    <div>
                      <strong style={{ color: '#374151' }}></strong> Percentage calculated based on total active Business Owners
                    </div>
                    <div style={{ marginTop: '4px' }}>  {/* ✅ Xuống dòng */}
                      ({allBusinessOwners.length} users)
                    </div>
                  </div>

                </>
              )}
            </div>

          </div>
        </div>

        {/* Right Section */}
        <div className="right-section">
          {/* Total Revenue Card */}
          <div className="wallet-card">
            <div className="wallet-header">
              <span>Total Revenue</span>
            </div>
            <div className="wallet-balance">
              <span className="amount">
                {totalRevenue.toLocaleString()} VND
              </span>
            </div>
            <div className="revenue-period">
              <span>
                {startDate && endDate
                  ? `${startDate.split('-').reverse().join('/')} - ${endDate.split('-').reverse().join('/')}`
                  : quickFilter}
              </span>
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="transactions-card">
            <div className="transactions-header">
              <h3>Recent Subscriptions</h3>
              <Link href="/dashboard/admin/revenue" className="see-all-btn">
                See All
              </Link>
            </div>
            {isLoadingSubscriptions ? (
              <div className="loading-container">
                <span>Loading...</span>
              </div>
            ) : recentSubscriptions.length === 0 ? (
              <div className="empty-container">
                <span>No subscriptions found</span>
              </div>
            ) : (
              <div className="transactions-list">
                {recentSubscriptions.map((subscription) => {
                  const IconComponent = getPackageIcon(
                    subscription.packageName
                  );
                  return (
                    <div key={subscription.id} className="transaction-item">
                      <div className="transaction-icon">
                        <IconComponent size={24} color="#F97316" />
                      </div>
                      <div className="transaction-info">
                        <span className="transaction-name">
                          {subscription.packageName}
                        </span>
                        <span className="transaction-date">
                          {subscription.userName} •{" "}
                          {formatDate(subscription.paidAt)}
                        </span>
                      </div>
                      <span className="transaction-amount">
                        +{subscription.totalPrice.toLocaleString()}{" "}
                        {subscription.currency}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
