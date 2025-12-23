"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Banknote,
  Receipt,
  Crown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Building2,
  Box,
  RotateCw,
} from "lucide-react";
import { subscriptionService } from "@/services/subscriptionService";
import "../../../../../styles/revenue.scss";

type Revenue = {
  id: string;
  businessOwner: string;
  packageName: string;
  amount: number;
  currency?: string;
  paidDate: string;
};

const AdminRevenue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [packageFilter, setPackageFilter] = useState("All");
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [packageOptions, setPackageOptions] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionService.getAllSubscriptions();
      if (!res.success) {
        setError(res.error || "Failed to load subscriptions");
        setRevenues([]);
        setPackageOptions(["All"]);
      } else {
        // Filter out subscriptions with status "pending" or totalPrice = 0
        const filteredData = (res.data || []).filter(
          (s: any) =>
            s.status?.toLowerCase() !== "pending" &&
            (typeof s.totalPrice === "number"
              ? s.totalPrice
              : Number(s.totalPrice) || 0) > 0
        );
        const mapped: Revenue[] = filteredData.map((s: any) => ({
          id: s.id,
          businessOwner: s.user?.fullName || "-",
          packageName: s.package?.name || "-",
          amount:
            typeof s.totalPrice === "number"
              ? s.totalPrice
              : Number(s.totalPrice) || 0,
          currency: s.package?.currency,
          paidDate: s.paidAt
            ? new Date(s.paidAt).toLocaleDateString("en-US")
            : s.startDate || "-",
        }));
        setRevenues(mapped);
        const options = Array.from(new Set(mapped.map((r) => r.packageName)));
        setPackageOptions(["All", ...options]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRevenues = revenues.filter((revenue) => {
    const matchesSearch =
      revenue.businessOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revenue.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revenue.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage =
      packageFilter === "All" || revenue.packageName === packageFilter;
    return matchesSearch && matchesPackage;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRevenues.length / itemsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, packageFilter, revenues]);

  const displayedRevenues = filteredRevenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Overall stats
  const overallTotalTransactions = revenues.length;
  const overallTotalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const overallPackageRevenueMap: Record<string, number> = {};
  revenues.forEach((r) => {
    overallPackageRevenueMap[r.packageName] =
      (overallPackageRevenueMap[r.packageName] || 0) + r.amount;
  });
  const overallHighestPackage =
    Object.entries(overallPackageRevenueMap).length > 0
      ? Object.entries(overallPackageRevenueMap).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )
      : ["-", 0];

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="admin-revenue">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Revenue Management</h1>
            <p>Track and analyze subscription revenue from business owners</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon transactions">
            <Receipt size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{overallTotalTransactions}</span>
            <span className="stat-label">Total Transactions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <Banknote size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {overallTotalRevenue.toLocaleString()}
              <small>VND</small>
            </span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon top">
            <Crown size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{overallHighestPackage[0]}</span>
            <span className="stat-sub">
              {Number(overallHighestPackage[1]).toLocaleString()} VND
            </span>
            <span className="stat-label">Top Earning Package</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="filters-header">
          <SlidersHorizontal size={16} />
          <span>Filter Transactions</span>
        </div>
        <div className="filters-content">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by owner, package or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Box size={16} />
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
            >
              {packageOptions.map((pkg) => (
                <option key={pkg} value={pkg}>
                  {pkg === "All" ? "All Packages" : pkg}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || packageFilter !== "All") && (
          <div className="active-filters">
            <span className="filter-count">
              Showing {filteredRevenues.length} of {revenues.length}{" "}
              transactions
            </span>
            {(searchTerm || packageFilter !== "All") && (
              <button
                className="clear-filters"
                onClick={() => {
                  setSearchTerm("");
                  setPackageFilter("All");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading transactions...</span>
        </div>
      ) : error ? (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <span className="error-text">Error: {error}</span>
          <button className="retry-btn" onClick={loadData}>
            Try Again
          </button>
        </div>
      ) : filteredRevenues.length === 0 ? (
        <div className="empty-state">
          <Banknote size={40} />
          <h3>No transactions found</h3>
          <p>
            {searchTerm || packageFilter !== "All"
              ? "Try adjusting your filters"
              : "Revenue transactions will appear here"}
          </p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>
                    <Building2 size={13} />
                    <span>Business Owner</span>
                  </th>
                  <th>
                    <Box size={13} />
                    <span>Package</span>
                  </th>
                  <th>
                    <Banknote size={13} />
                    <span>Amount</span>
                  </th>
                  <th>
                    <Clock size={13} />
                    <span>Paid Date</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedRevenues.map((revenue, index) => (
                  <tr
                    key={revenue.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td>
                      <div className="owner-cell">
                        <div className="owner-avatar">
                          {revenue.businessOwner.charAt(0).toUpperCase()}
                        </div>
                        <span className="owner-name">
                          {revenue.businessOwner}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="package-badge">
                        {revenue.packageName}
                      </span>
                    </td>
                    <td>
                      <span className="amount">
                        {revenue.amount.toLocaleString()}{" "}
                        <small>{revenue.currency || "VND"}</small>
                      </span>
                    </td>
                    <td>
                      <span className="date">{revenue.paidDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="page-info">
              Showing{" "}
              <strong>
                {filteredRevenues.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              -{" "}
              <strong>
                {Math.min(currentPage * itemsPerPage, filteredRevenues.length)}
              </strong>{" "}
              of <strong>{filteredRevenues.length}</strong> transactions
            </div>
            <div className="page-controls">
              <button
                className="page-btn nav"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </button>

              {getPageNumbers().map((page, i) =>
                typeof page === "number" ? (
                  <button
                    key={i}
                    className={`page-btn ${
                      page === currentPage ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={i} className="page-ellipsis">
                    {page}
                  </span>
                )
              )}

              <button
                className="page-btn nav"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRevenue;
