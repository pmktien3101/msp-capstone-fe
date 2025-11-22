"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { subscriptionService } from "@/services/subscriptionService";

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

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await subscriptionService.getAllSubscriptions();
        if (!mounted) return;
        if (!res.success) {
          setError(res.error || "Failed to load subscriptions");
          setRevenues([]);
          setPackageOptions(["All"]);
        } else {
          const mapped: Revenue[] = (res.data || []).map((s: any) => ({
            id: s.id,
            businessOwner: s.user?.fullName || "-",
            packageName: s.package?.name || "-",
            amount:
              typeof s.totalPrice === "number"
                ? s.totalPrice
                : Number(s.totalPrice) || 0,
            currency: s.package?.currency,
            paidDate: s.paidAt
              ? new Date(s.paidAt).toLocaleString()
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
    load();
    return () => {
      mounted = false;
    };
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

  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRevenues.length / itemsPerPage)
  );

  useEffect(() => {
    // reset to first page when filters or data change
    setCurrentPage(1);
  }, [searchTerm, packageFilter, revenues]);

  const displayedRevenues = filteredRevenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const packageRevenueMap: Record<string, number> = {};
  filteredRevenues.forEach((r) => {
    packageRevenueMap[r.packageName] =
      (packageRevenueMap[r.packageName] || 0) + r.amount;
  });

  // Overall stats (not affected by search/package filters)
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

  return (
    <div className="admin-revenue">
      <div className="page-header">
        <h1>Revenue Management</h1>
        <p>List of packages paid by business owners</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by owner, package or id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">
            <Search size={16} />
          </span>
        </div>
        <select
          className="package-filter"
          value={packageFilter}
          onChange={(e) => setPackageFilter(e.target.value)}
        >
          {packageOptions.map((pkg) => (
            <option key={pkg} value={pkg}>
              {pkg}
            </option>
          ))}
        </select>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{overallTotalTransactions}</span>
          <span className="stat-label">Total Transactions</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {overallTotalRevenue.toLocaleString()}
          </span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-item stat-highlight">
          <span className="stat-number">
            {overallHighestPackage[0]}
            <br />
            <span style={{ fontSize: 14, color: "#fff" }}>
              {Number(overallHighestPackage[1]).toLocaleString()}
            </span>
          </span>
          <span className="stat-label">Top Earning Package</span>
        </div>
      </div>

      {loading ? (
        <div>Loading subscriptions...</div>
      ) : error ? (
        <div style={{ color: "#d9534f" }}>Error: {error}</div>
      ) : (
        <div className="revenue-table">
          <div className="table-header">
            <div className="table-cell">Business Owner</div>
            <div className="table-cell">Package</div>
            <div className="table-cell">Amount</div>
            <div className="table-cell">Paid Date</div>
          </div>

          {displayedRevenues.map((revenue) => (
            <div key={revenue.id} className="table-row">
              <div className="table-cell" data-label="Business Owner">
                {revenue.businessOwner}
              </div>
              <div className="table-cell" data-label="Package">
                <span className="package-badge">{revenue.packageName}</span>
              </div>
              <div className="table-cell" data-label="Amount">
                {revenue.amount.toLocaleString()} {revenue.currency || "VND"}
              </div>
              <div className="table-cell" data-label="Paid Date">
                {revenue.paidDate}
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          <div className="pagination">
            <div className="page-info">
              Showing{" "}
              {filteredRevenues.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{" "}
              - {Math.min(currentPage * itemsPerPage, filteredRevenues.length)}{" "}
              of {filteredRevenues.length}
            </div>
            <div className="page-controls">
              <button
                className="page-button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-button ${p === currentPage ? "active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className="page-button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-revenue {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-top: 1px solid #f3f4f6;
          gap: 12px;
        }
        .page-info {
          color: #6b6b6b;
          font-size: 14px;
        }
        .page-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .page-button {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
        }
        .page-button[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-button.active {
          background: #ff5e13;
          color: #fff;
          border-color: #ff5e13;
        }
        .page-header {
          margin-bottom: 32px;
        }
        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0d062d;
          margin: 0 0 8px 0;
        }
        .page-header p {
          font-size: 16px;
          color: #787486;
          margin: 0;
        }
        .filters-section {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }
        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }
        .search-box input:focus {
          outline: none;
          border-color: #ff5e13;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #787486;
        }
        .package-filter {
          padding: 10px 16px;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          font-size: 14px;
          background: #fff;
          color: #0d062d;
          min-width: 160px;
        }
        .package-filter:focus {
          outline: none;
          border-color: #ff5e13;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        .stat-item {
          background: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #0d062d;
          margin-bottom: 4px;
        }
        .stat-label {
          display: block;
          font-size: 14px;
          color: #787486;
        }
        .stat-highlight {
          background: linear-gradient(90deg, #ff5e13 0%, #ffb347 100%);
          color: #fff;
        }
        .stat-highlight .stat-label {
          color: #fff;
        }
        .revenue-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          background: #f9f4ee;
          padding: 16px 20px;
          font-weight: 600;
          color: #0d062d;
          font-size: 14px;
        }
        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
          transition: background 0.3s ease;
        }
        .table-row:hover {
          background: #f9f4ee;
        }
        .table-cell {
          font-size: 14px;
          color: #0d062d;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 4px;
        }
        .package-badge {
          display: inline-block;
          background: linear-gradient(90deg, #ffb347 0%, #ff5e13 100%);
          color: #fff;
          font-weight: 600;
          padding: 4px 14px;
          border-radius: 16px;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.08);
          letter-spacing: 0.5px;
        }
        @media (max-width: 1400px) {
          .table-header {
            display: none;
          }
          .table-row {
            display: block;
            margin-bottom: 16px;
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
          }
          .table-cell {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px 0;
            white-space: normal;
            overflow: visible;
            text-overflow: unset;
          }
          .table-cell:last-child {
            margin-bottom: 0;
          }
          .table-cell::before {
            content: attr(data-label);
            font-weight: 600;
            color: #787486;
            min-width: 120px;
          }
        }
        @media (max-width: 768px) {
          .admin-revenue {
            padding: 16px;
          }
          .page-header h1 {
            font-size: 24px;
          }
          .filters-section {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          .search-box {
            max-width: none;
          }
          .stats-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .stat-item {
            padding: 16px;
          }
          .stat-number {
            font-size: 20px;
          }
        }
        @media (max-width: 480px) {
          .admin-revenue {
            padding: 12px;
          }
          .page-header h1 {
            font-size: 20px;
          }
          .stats-row {
            grid-template-columns: 1fr;
          }
          .table-cell::before {
            min-width: 100px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminRevenue;
