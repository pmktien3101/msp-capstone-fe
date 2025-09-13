'use client';

import React, { useState } from 'react';

const AdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('revenue');

  const reportTypes = [
    { id: 'revenue', name: 'Doanh Thu', icon: '💰' },
    { id: 'users', name: 'Người Dùng', icon: '👥' },
    { id: 'subscriptions', name: 'Đăng Ký', icon: '💳' },
    { id: 'companies', name: 'Doanh Nghiệp', icon: '🏢' }
  ];

  const periods = [
    { id: '7days', name: '7 ngày qua' },
    { id: '30days', name: '30 ngày qua' },
    { id: '90days', name: '90 ngày qua' },
    { id: '1year', name: '1 năm qua' }
  ];

  const revenueData = [
    { month: 'Tháng 1', amount: 125430, growth: 12.5 },
    { month: 'Tháng 2', amount: 142680, growth: 8.3 },
    { month: 'Tháng 3', amount: 158920, growth: 11.4 },
    { month: 'Tháng 4', amount: 175340, growth: 10.3 },
    { month: 'Tháng 5', amount: 192180, growth: 9.6 },
    { month: 'Tháng 6', amount: 208950, growth: 8.7 }
  ];

  const topCompanies = [
    { name: 'Công ty ABC', revenue: 25000, users: 150, plan: 'Enterprise' },
    { name: 'Công ty XYZ', revenue: 18000, users: 95, plan: 'Premium' },
    { name: 'Công ty DEF', revenue: 12000, users: 60, plan: 'Premium' },
    { name: 'Công ty GHI', revenue: 8500, users: 45, plan: 'Basic' },
    { name: 'Công ty JKL', revenue: 7200, users: 38, plan: 'Basic' }
  ];

  const planDistribution = [
    { plan: 'Basic', count: 1250, percentage: 45.2, revenue: 36250 },
    { plan: 'Premium', count: 890, percentage: 32.1, revenue: 70310 },
    { plan: 'Enterprise', count: 156, percentage: 5.6, revenue: 31044 },
    { plan: 'Trial', count: 480, percentage: 17.1, revenue: 0 }
  ];

  return (
    <div className="admin-reports">
      <div className="page-header">
        <h1>Báo Cáo & Phân Tích</h1>
        <p>Phân tích dữ liệu và hiệu suất hệ thống</p>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="report-types">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              className={`report-type-btn ${selectedReport === type.id ? 'active' : ''}`}
              onClick={() => setSelectedReport(type.id)}
            >
              <span className="report-icon">{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        <div className="period-selector">
          <label>Khoảng thời gian:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Tổng Doanh Thu</h3>
            <p className="card-value">$208,950</p>
            <span className="card-change positive">+8.7%</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Người Dùng Mới</h3>
            <p className="card-value">1,247</p>
            <span className="card-change positive">+15.3%</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">💳</div>
          <div className="card-content">
            <h3>Đăng Ký Mới</h3>
            <p className="card-value">89</p>
            <span className="card-change positive">+12.1%</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Tỷ Lệ Chuyển Đổi</h3>
            <p className="card-value">23.4%</p>
            <span className="card-change positive">+2.1%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="main-chart">
          <div className="chart-header">
            <h3>Biểu Đồ Doanh Thu</h3>
            <div className="chart-actions">
              <button className="chart-btn">📊</button>
              <button className="chart-btn">📈</button>
              <button className="chart-btn">📋</button>
            </div>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <p>📈 Biểu đồ doanh thu theo thời gian</p>
              <div className="chart-data">
                {revenueData.map((data, index) => (
                  <div key={index} className="data-point">
                    <div className="data-bar" style={{ height: `${(data.amount / 250000) * 100}%` }}></div>
                    <span className="data-label">{data.month}</span>
                    <span className="data-value">${data.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="side-charts">
          <div className="chart-card">
            <h3>Phân Bố Gói Dịch Vụ</h3>
            <div className="pie-chart">
              {planDistribution.map((plan, index) => (
                <div key={index} className="pie-segment">
                  <div 
                    className="segment-color" 
                    style={{ 
                      backgroundColor: index === 0 ? '#FF5E13' : index === 1 ? '#FFA463' : index === 2 ? '#FFDBBD' : '#F3F4F6'
                    }}
                  ></div>
                  <span className="segment-label">{plan.plan}</span>
                  <span className="segment-value">{plan.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Top Doanh Nghiệp</h3>
            <div className="top-companies">
              {topCompanies.map((company, index) => (
                <div key={index} className="company-item">
                  <div className="company-rank">#{index + 1}</div>
                  <div className="company-info">
                    <span className="company-name">{company.name}</span>
                    <span className="company-details">{company.users} users • {company.plan}</span>
                  </div>
                  <div className="company-revenue">${company.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="tables-section">
        <div className="table-card">
          <h3>Chi Tiết Doanh Thu Theo Tháng</h3>
          <div className="table">
            <div className="table-header">
              <div className="table-cell">Tháng</div>
              <div className="table-cell">Doanh Thu</div>
              <div className="table-cell">Tăng Trưởng</div>
              <div className="table-cell">Xu Hướng</div>
            </div>
            {revenueData.map((data, index) => (
              <div key={index} className="table-row">
                <div className="table-cell">{data.month}</div>
                <div className="table-cell">${data.amount.toLocaleString()}</div>
                <div className="table-cell">
                  <span className={`growth-badge ${data.growth > 0 ? 'positive' : 'negative'}`}>
                    {data.growth > 0 ? '+' : ''}{data.growth}%
                  </span>
                </div>
                <div className="table-cell">
                  <span className="trend-icon">{data.growth > 0 ? '📈' : '📉'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card">
          <h3>Phân Tích Gói Dịch Vụ</h3>
          <div className="table">
            <div className="table-header">
              <div className="table-cell">Gói</div>
              <div className="table-cell">Số Lượng</div>
              <div className="table-cell">Tỷ Lệ</div>
              <div className="table-cell">Doanh Thu</div>
            </div>
            {planDistribution.map((plan, index) => (
              <div key={index} className="table-row">
                <div className="table-cell">
                  <span className="plan-badge">{plan.plan}</span>
                </div>
                <div className="table-cell">{plan.count}</div>
                <div className="table-cell">
                  <div className="percentage-bar">
                    <div 
                      className="percentage-fill" 
                      style={{ width: `${plan.percentage}%` }}
                    ></div>
                    <span className="percentage-text">{plan.percentage}%</span>
                  </div>
                </div>
                <div className="table-cell">${plan.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-reports {
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
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .page-header p {
          font-size: 16px;
          color: #787486;
          margin: 0;
        }

        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }

        .report-types {
          display: flex;
          gap: 8px;
        }

        .report-type-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px solid #E5E7EB;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .report-type-btn:hover {
          border-color: #FFA463;
          color: #FF5E13;
        }

        .report-type-btn.active {
          background: #FF5E13;
          border-color: #FF5E13;
          color: white;
        }

        .report-icon {
          font-size: 16px;
        }

        .period-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .period-selector label {
          font-size: 14px;
          font-weight: 500;
          color: #0D062D;
        }

        .period-select {
          padding: 8px 12px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.3s ease;
        }

        .summary-card:hover {
          transform: translateY(-4px);
        }

        .card-icon {
          font-size: 32px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-content h3 {
          font-size: 14px;
          color: #787486;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: #0D062D;
          margin: 0 0 4px 0;
        }

        .card-change {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .card-change.positive {
          background: #D1FAE5;
          color: #065F46;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .main-chart, .chart-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .chart-actions {
          display: flex;
          gap: 8px;
        }

        .chart-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #F3F4F6;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .chart-btn:hover {
          background: #E5E7EB;
        }

        .chart-content {
          height: 300px;
        }

        .chart-placeholder {
          height: 100%;
          background: #F9F4EE;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #787486;
          font-size: 16px;
        }

        .chart-data {
          display: flex;
          align-items: end;
          gap: 16px;
          height: 200px;
          margin-top: 20px;
        }

        .data-point {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .data-bar {
          width: 20px;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          border-radius: 4px 4px 0 0;
          min-height: 20px;
        }

        .data-label {
          font-size: 12px;
          color: #787486;
        }

        .data-value {
          font-size: 10px;
          color: #0D062D;
          font-weight: 600;
        }

        .side-charts {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .chart-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 16px 0;
        }

        .pie-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pie-segment {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .segment-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .segment-label {
          flex: 1;
          font-size: 14px;
          color: #0D062D;
        }

        .segment-value {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
        }

        .top-companies {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .company-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .company-item:hover {
          background: #F9F4EE;
        }

        .company-rank {
          width: 24px;
          height: 24px;
          background: #FF5E13;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .company-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .company-name {
          font-size: 14px;
          font-weight: 500;
          color: #0D062D;
        }

        .company-details {
          font-size: 12px;
          color: #787486;
        }

        .company-revenue {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
        }

        .tables-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .table-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .table-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 20px 0;
        }

        .table {
          display: flex;
          flex-direction: column;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          background: #F9F4EE;
          padding: 12px 16px;
          font-weight: 600;
          color: #0D062D;
          font-size: 14px;
          border-radius: 8px 8px 0 0;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          padding: 12px 16px;
          border-bottom: 1px solid #F3F4F6;
          align-items: center;
          transition: background 0.3s ease;
        }

        .table-row:hover {
          background: #F9F4EE;
        }

        .table-cell {
          font-size: 14px;
          color: #0D062D;
        }

        .growth-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .growth-badge.positive {
          background: #D1FAE5;
          color: #065F46;
        }

        .growth-badge.negative {
          background: #FEE2E2;
          color: #991B1B;
        }

        .trend-icon {
          font-size: 16px;
        }

        .plan-badge {
          padding: 4px 8px;
          background: #DBEAFE;
          color: #1E40AF;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .percentage-bar {
          position: relative;
          width: 100%;
          height: 20px;
          background: #F3F4F6;
          border-radius: 10px;
          overflow: hidden;
        }

        .percentage-fill {
          height: 100%;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .percentage-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: 600;
          color: #0D062D;
        }

        @media (max-width: 1200px) {
          .charts-section {
            grid-template-columns: 1fr;
          }

          .tables-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-reports {
            padding: 16px;
          }

          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }

          .report-types {
            justify-content: center;
            flex-wrap: wrap;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .chart-data {
            gap: 8px;
          }

          .data-bar {
            width: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminReports;
