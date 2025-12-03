"use client";

import React, { useState, useEffect } from "react";
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
import "../../../../../styles/admin-dashboard.scss";

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
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [timeFilter, setTimeFilter] = useState("This Year");
  const [businessRegPeriod, setBusinessRegPeriod] = useState("Year");
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<
    PackageDistribution[]
  >([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [recentSubscriptions, setRecentSubscriptions] = useState<
    SubscriptionInfo[]
  >([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<
    MonthlyRevenue[]
  >([]);
  const [monthlyBusinessRegData, setMonthlyBusinessRegData] = useState<
    MonthlyBusinessReg[]
  >([]);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalMeetings, setTotalMeetings] = useState(0);

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true);
        const response = await packageService.getPackages();
        if (response.success && response.data) {
          const packagesData = Array.isArray(response.data)
            ? response.data
            : [];
          setPackages(packagesData);

          // Calculate distribution - for now using mock subscription counts
          // In real scenario, you would fetch subscription data per package
          const colors = [
            "#F97316",
            "#FB923C",
            "#FDBA74",
            "#FED7AA",
            "#FFEDD5",
          ];
          const totalPackages = packagesData.length;

          const distribution = packagesData.map(
            (pkg: PackageInfo, index: number) => ({
              name: pkg.name,
              count: Math.floor(Math.random() * 50) + 10, // Mock count - replace with real data
              color: colors[index % colors.length],
              percentage: 0,
            })
          );

          // Calculate percentages
          const totalCount = distribution.reduce(
            (sum: number, item: PackageDistribution) => sum + item.count,
            0
          );
          distribution.forEach((item: PackageDistribution) => {
            item.percentage =
              totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
          });

          setPackageDistribution(distribution);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

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

          // Calculate total revenue from all subscriptions
          const total = subscriptionsData.reduce(
            (sum: number, sub: any) => sum + (sub.totalPrice || 0),
            0
          );
          setTotalRevenue(total);

          // Calculate monthly revenue for the chart
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
          const currentYear = new Date().getFullYear();
          const monthlyRevenue: { [key: string]: number } = {};

          // Initialize all months with 0
          monthNames.forEach((month) => {
            monthlyRevenue[month] = 0;
          });

          // Sum up revenue by month
          subscriptionsData.forEach((sub: any) => {
            const paidDate = sub.paidAt ? new Date(sub.paidAt) : null;
            if (paidDate && paidDate.getFullYear() === currentYear) {
              const monthName = monthNames[paidDate.getMonth()];
              monthlyRevenue[monthName] += sub.totalPrice || 0;
            }
          });

          // Convert to array format
          const revenueArray = monthNames.map((month) => ({
            month,
            revenue: monthlyRevenue[month],
          }));
          setMonthlyRevenueData(revenueArray);

          // Map and sort by paidAt date (most recent first), take top 6
          const mappedSubscriptions: SubscriptionInfo[] = subscriptionsData
            .map((sub: any) => ({
              id: sub.id,
              packageName: sub.package?.name || "Unknown Package",
              userName: sub.user?.fullName || "Unknown User",
              userEmail: sub.user?.email || "",
              totalPrice: sub.totalPrice || 0,
              paidAt: sub.paidAt || sub.startDate || "",
              status: sub.status || "unknown",
            }))
            .sort(
              (a: SubscriptionInfo, b: SubscriptionInfo) =>
                new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
            )
            .slice(0, 6);

          setRecentSubscriptions(mappedSubscriptions);
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

          // Set total businesses count
          setTotalBusinesses(businessOwners.length);

          // Calculate monthly registrations
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
          const currentYear = new Date().getFullYear();
          const monthlyReg: { [key: string]: number } = {};

          // Initialize all months with 0
          monthNames.forEach((month) => {
            monthlyReg[month] = 0;
          });

          // Count registrations by month
          businessOwners.forEach((owner: any) => {
            const createdDate = owner.createdAt
              ? new Date(owner.createdAt)
              : null;
            if (createdDate && createdDate.getFullYear() === currentYear) {
              const monthName = monthNames[createdDate.getMonth()];
              monthlyReg[monthName]++;
            }
          });

          // Convert to array format
          const regArray = monthNames.map((month) => ({
            month,
            count: monthlyReg[month],
          }));
          setMonthlyBusinessRegData(regArray);
        }
      } catch (error) {
        console.error("Error fetching business owners:", error);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    fetchBusinessOwners();
  }, []);

  // Fetch total projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();
        if (response.success && response.data) {
          const projects = response.data.items || [];
          setTotalProjects(projects.length);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Fetch total meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        // Get all projects first, then fetch meetings for each project
        const projectsResponse = await projectService.getAllProjects();
        if (projectsResponse.success && projectsResponse.data) {
          const projects = projectsResponse.data.items || [];
          let totalMeetingsCount = 0;

          // Fetch meetings for each project
          const meetingsPromises = projects.map((project: any) =>
            meetingService.getMeetingsByProjectId(project.id)
          );
          const meetingsResults = await Promise.all(meetingsPromises);

          meetingsResults.forEach((result) => {
            if (result.success && result.data) {
              totalMeetingsCount += result.data.length;
            }
          });

          setTotalMeetings(totalMeetingsCount);
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

    return `M ${padding},${height - padding} L ${points.join(" L ")} L ${
      width - padding
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
            <div className="filter-controls">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="time-filter-select"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Quarter">This Quarter</option>
                <option value="This Year">This Year</option>
                <option value="All Time">All Time</option>
              </select>
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

          {/* Revenue Overview Chart */}
          <div className="chart-card market-overview">
            <div className="chart-header">
              <h3>Revenue Overview</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-select"
              >
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Year">Year</option>
              </select>
            </div>
            <div className="chart-container">
              <div className="y-axis-labels">
                <span>$50k</span>
                <span>$25k</span>
                <span>$10k</span>
              </div>
              <svg viewBox="0 0 500 150" className="line-chart">
                <defs>
                  <linearGradient
                    id="areaGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
                    <stop
                      offset="100%"
                      stopColor="#F97316"
                      stopOpacity="0.05"
                    />
                  </linearGradient>
                </defs>
                <path d={generateAreaPath()} fill="url(#areaGradient)" />
                <path
                  d={generateChartPath()}
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="x-axis-labels">
                {revenueData.labels.map((label, index) => (
                  <span key={index}>{label}</span>
                ))}
              </div>
            </div>
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
                  <span>40</span>
                  <span>30</span>
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
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
                          style={{ height: `${(value / 40) * 100}%` }}
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
                            strokeDasharray={`${
                              (pkg.percentage / 100) * circumference
                            } ${circumference}`}
                            strokeDashoffset={-offset}
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
              <span className="currency">$</span>
              <span className="amount">{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="revenue-period">
              <span>{timeFilter}</span>
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
                        +${subscription.totalPrice}
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
