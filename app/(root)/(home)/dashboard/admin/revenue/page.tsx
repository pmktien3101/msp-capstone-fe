"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface Revenue {
  id: number;
  businessOwner: string;
  packageName: string;
  amount: number;
  paidDate: string;
}

const initialRevenues: Revenue[] = [
  {
    id: 1,
    businessOwner: "Nguyễn Văn A",
    packageName: "Gói Pro",
    amount: 5000000,
    paidDate: "2024-09-01",
  },
  {
    id: 2,
    businessOwner: "Trần Thị B",
    packageName: "Gói Basic",
    amount: 2000000,
    paidDate: "2024-09-05",
  },
  {
    id: 3,
    businessOwner: "Lê Văn C",
    packageName: "Gói Premium",
    amount: 10000000,
    paidDate: "2024-09-10",
  },
  {
    id: 4,
    businessOwner: "Phạm Thị D",
    packageName: "Gói Pro",
    amount: 5000000,
    paidDate: "2024-09-12",
  },
  {
    id: 5,
    businessOwner: "Ngô Văn E",
    packageName: "Gói Basic",
    amount: 2000000,
    paidDate: "2024-09-15",
  },
];

const packageOptions = [
  "Tất cả",
  ...Array.from(new Set(initialRevenues.map((r) => r.packageName))),
];

const AdminRevenue = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [packageFilter, setPackageFilter] = useState("Tất cả");

  const filteredRevenues = initialRevenues.filter((revenue) => {
    const matchesSearch =
      revenue.businessOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revenue.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage =
      packageFilter === "Tất cả" || revenue.packageName === packageFilter;
    return matchesSearch && matchesPackage;
  });

  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);

  // Tính tổng doanh thu theo từng gói
  const packageRevenueMap: Record<string, number> = {};
  filteredRevenues.forEach((r) => {
    packageRevenueMap[r.packageName] =
      (packageRevenueMap[r.packageName] || 0) + r.amount;
  });

  // Tìm gói có doanh thu cao nhất
  const highestPackage =
    Object.entries(packageRevenueMap).length > 0
      ? Object.entries(packageRevenueMap).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )
      : ["-", 0];

  return (
    <div className="admin-revenue">
      <div className="page-header">
        <h1>Quản Lý Doanh Thu</h1>
        <p>Danh sách các gói dịch vụ mà Business Owner đã thanh toán.</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên Business Owner hoặc gói..."
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

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{filteredRevenues.length}</span>
          <span className="stat-label">Tổng giao dịch</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalRevenue.toLocaleString()}₫</span>
          <span className="stat-label">Tổng doanh thu</span>
        </div>
        <div className="stat-item stat-highlight">
          <span className="stat-number">
            {highestPackage[0]}
            <br />
            <span style={{ fontSize: 14, color: "#fff" }}>
              {highestPackage[1].toLocaleString()}₫
            </span>
          </span>
          <span className="stat-label">Gói có doanh thu cao nhất</span>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="revenue-table">
        <div className="table-header">
          <div className="table-cell">Business Owner</div>
          <div className="table-cell">Gói dịch vụ</div>
          <div className="table-cell">Số tiền</div>
          <div className="table-cell">Ngày thanh toán</div>
        </div>

        {filteredRevenues.map((revenue) => (
          <div key={revenue.id} className="table-row">
            <div className="table-cell" data-label="Business Owner">
              {revenue.businessOwner}
            </div>
            <div className="table-cell" data-label="Gói dịch vụ">
              <span className="package-badge">{revenue.packageName}</span>
            </div>
            <div className="table-cell" data-label="Số tiền">
              {revenue.amount.toLocaleString()}₫
            </div>
            <div className="table-cell" data-label="Ngày thanh toán">
              {revenue.paidDate}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .admin-revenue {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
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
