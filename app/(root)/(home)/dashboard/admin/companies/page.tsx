'use client';

import React, { useState } from 'react';

const AdminCompanies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const companies = [
    {
      id: 1,
      name: 'Công ty ABC',
      email: 'contact@abc.com',
      plan: 'Premium',
      status: 'active',
      users: 25,
      joinDate: '2024-01-15',
      revenue: '$2,500'
    },
    {
      id: 2,
      name: 'Công ty XYZ',
      email: 'info@xyz.com',
      plan: 'Basic',
      status: 'active',
      users: 10,
      joinDate: '2024-02-20',
      revenue: '$500'
    },
    {
      id: 3,
      name: 'Công ty DEF',
      email: 'hello@def.com',
      plan: 'Enterprise',
      status: 'trial',
      users: 50,
      joinDate: '2024-03-10',
      revenue: '$0'
    },
    {
      id: 4,
      name: 'Công ty GHI',
      email: 'contact@ghi.com',
      plan: 'Premium',
      status: 'suspended',
      users: 15,
      joinDate: '2024-01-05',
      revenue: '$1,500'
    }
  ];

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#D1FAE5', textColor: '#065F46', text: 'Hoạt động' },
      trial: { color: '#FEF3C7', textColor: '#92400E', text: 'Dùng thử' },
      suspended: { color: '#FEE2E2', textColor: '#991B1B', text: 'Tạm dừng' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: config.color, 
          color: config.textColor 
        }}
      >
        {config.text}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      Basic: { color: '#E5E7EB', textColor: '#374151' },
      Premium: { color: '#DBEAFE', textColor: '#1E40AF' },
      Enterprise: { color: '#F3E8FF', textColor: '#7C3AED' }
    };
    
    const config = planConfig[plan as keyof typeof planConfig];
    return (
      <span 
        className="plan-badge"
        style={{ 
          backgroundColor: config.color, 
          color: config.textColor 
        }}
      >
        {plan}
      </span>
    );
  };

  return (
    <div className="admin-companies">
      <div className="page-header">
        <h1>Quản Lý Doanh Nghiệp</h1>
        <p>Quản lý tất cả các doanh nghiệp đang sử dụng hệ thống</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Hoạt động
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'trial' ? 'active' : ''}`}
            onClick={() => setFilterStatus('trial')}
          >
            Dùng thử
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'suspended' ? 'active' : ''}`}
            onClick={() => setFilterStatus('suspended')}
          >
            Tạm dừng
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{companies.length}</span>
          <span className="stat-label">Tổng doanh nghiệp</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{companies.filter(c => c.status === 'active').length}</span>
          <span className="stat-label">Đang hoạt động</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{companies.filter(c => c.status === 'trial').length}</span>
          <span className="stat-label">Dùng thử</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{companies.reduce((sum, c) => sum + c.users, 0)}</span>
          <span className="stat-label">Tổng người dùng</span>
        </div>
      </div>

      {/* Companies Table */}
      <div className="companies-table">
        <div className="table-header">
          <div className="table-cell">Tên công ty</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Gói</div>
          <div className="table-cell">Trạng thái</div>
          <div className="table-cell">Người dùng</div>
          <div className="table-cell">Ngày tham gia</div>
          <div className="table-cell">Doanh thu</div>
          <div className="table-cell">Hành động</div>
        </div>

        {filteredCompanies.map((company) => (
          <div key={company.id} className="table-row">
            <div className="table-cell">
              <div className="company-info">
                <div className="company-avatar">
                  {company.name.charAt(0)}
                </div>
                <span className="company-name">{company.name}</span>
              </div>
            </div>
            <div className="table-cell">{company.email}</div>
            <div className="table-cell">{getPlanBadge(company.plan)}</div>
            <div className="table-cell">{getStatusBadge(company.status)}</div>
            <div className="table-cell">{company.users}</div>
            <div className="table-cell">{company.joinDate}</div>
            <div className="table-cell">{company.revenue}</div>
            <div className="table-cell">
              <div className="action-buttons">
                <button className="action-btn view">👁️</button>
                <button className="action-btn edit">✏️</button>
                <button className="action-btn more">⋯</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .admin-companies {
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

        .filters-section {
          display: flex;
          justify-content: space-between;
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
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #787486;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #E5E7EB;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #787486;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #FFA463;
          color: #FF5E13;
        }

        .filter-btn.active {
          background: #FF5E13;
          border-color: #FF5E13;
          color: white;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          color: #0D062D;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #787486;
        }

        .companies-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
          background: #F9F4EE;
          padding: 16px 20px;
          font-weight: 600;
          color: #0D062D;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
          padding: 16px 20px;
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

        .company-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .company-name {
          font-weight: 500;
        }

        .status-badge, .plan-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
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

        .action-btn:hover {
          background: #E5E7EB;
          transform: scale(1.1);
        }

        .action-btn.view:hover {
          background: #DBEAFE;
        }

        .action-btn.edit:hover {
          background: #FEF3C7;
        }

        .action-btn.more:hover {
          background: #F3E8FF;
        }

        @media (max-width: 1200px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .table-cell {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .table-cell::before {
            content: attr(data-label);
            font-weight: 600;
            color: #787486;
          }
        }

        @media (max-width: 768px) {
          .admin-companies {
            padding: 16px;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCompanies;
