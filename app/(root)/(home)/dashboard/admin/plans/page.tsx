'use client';

import React, { useState } from 'react';

const AdminPlans = () => {
  const [activeTab, setActiveTab] = useState('plans');

  const plans = [
    {
      id: 1,
      name: 'Basic',
      price: 29,
      period: 'month',
      features: ['Tối đa 10 người dùng', '5GB lưu trữ', 'Hỗ trợ email'],
      activeSubscriptions: 1250,
      revenue: '$36,250',
      status: 'active'
    },
    {
      id: 2,
      name: 'Premium',
      price: 79,
      period: 'month',
      features: ['Tối đa 50 người dùng', '50GB lưu trữ', 'Hỗ trợ 24/7', 'API access'],
      activeSubscriptions: 890,
      revenue: '$70,310',
      status: 'active'
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 199,
      period: 'month',
      features: ['Không giới hạn người dùng', '500GB lưu trữ', 'Hỗ trợ 24/7', 'API access', 'Custom integrations'],
      activeSubscriptions: 156,
      revenue: '$31,044',
      status: 'active'
    }
  ];

  const subscriptions = [
    {
      id: 1,
      companyName: 'Công ty ABC',
      planName: 'Premium',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      amount: '$79',
      paymentMethod: 'Credit Card',
      nextBilling: '2024-02-15'
    },
    {
      id: 2,
      companyName: 'Công ty XYZ',
      planName: 'Basic',
      status: 'active',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      amount: '$29',
      paymentMethod: 'Bank Transfer',
      nextBilling: '2024-02-20'
    },
    {
      id: 3,
      companyName: 'Công ty DEF',
      planName: 'Enterprise',
      status: 'trial',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      amount: '$0',
      paymentMethod: 'Trial',
      nextBilling: '2024-02-15'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#D1FAE5', textColor: '#065F46', text: 'Hoạt động' },
      trial: { color: '#FEF3C7', textColor: '#92400E', text: 'Dùng thử' },
      cancelled: { color: '#FEE2E2', textColor: '#991B1B', text: 'Đã hủy' },
      expired: { color: '#F3F4F6', textColor: '#6B7280', text: 'Hết hạn' }
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

  return (
    <div className="admin-plans">
      <div className="page-header">
        <h1>Quản Lý Gói & Đăng Ký</h1>
        <p>Quản lý các gói dịch vụ và đăng ký của khách hàng</p>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <button 
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Gói Dịch Vụ
        </button>
        <button 
          className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Đăng Ký
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="plans-content">
          <div className="plans-header">
            <h2>Danh Sách Gói Dịch Vụ</h2>
            <button className="add-plan-btn">+ Thêm Gói Mới</button>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">${plan.price}</span>
                    <span className="period">/{plan.period}</span>
                  </div>
                </div>

                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="plan-stats">
                  <div className="stat">
                    <span className="stat-label">Đăng ký hoạt động</span>
                    <span className="stat-value">{plan.activeSubscriptions}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Doanh thu tháng</span>
                    <span className="stat-value">{plan.revenue}</span>
                  </div>
                </div>

                <div className="plan-actions">
                  <button className="action-btn edit">Chỉnh sửa</button>
                  <button className="action-btn view">Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="subscriptions-content">
          <div className="subscriptions-header">
            <h2>Danh Sách Đăng Ký</h2>
            <div className="subscriptions-filters">
              <select className="filter-select">
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="trial">Dùng thử</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="subscriptions-table">
            <div className="table-header">
              <div className="table-cell">Công ty</div>
              <div className="table-cell">Gói</div>
              <div className="table-cell">Trạng thái</div>
              <div className="table-cell">Ngày bắt đầu</div>
              <div className="table-cell">Ngày kết thúc</div>
              <div className="table-cell">Số tiền</div>
              <div className="table-cell">Phương thức</div>
              <div className="table-cell">Thanh toán tiếp</div>
              <div className="table-cell">Hành động</div>
            </div>

            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="table-row">
                <div className="table-cell">
                  <div className="company-info">
                    <div className="company-avatar">
                      {subscription.companyName.charAt(0)}
                    </div>
                    <span>{subscription.companyName}</span>
                  </div>
                </div>
                <div className="table-cell">
                  <span className="plan-badge">{subscription.planName}</span>
                </div>
                <div className="table-cell">{getStatusBadge(subscription.status)}</div>
                <div className="table-cell">{subscription.startDate}</div>
                <div className="table-cell">{subscription.endDate}</div>
                <div className="table-cell">{subscription.amount}</div>
                <div className="table-cell">{subscription.paymentMethod}</div>
                <div className="table-cell">{subscription.nextBilling}</div>
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
        </div>
      )}

      <style jsx>{`
        .admin-plans {
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

        .tabs-section {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          border-bottom: 2px solid #F3F4F6;
        }

        .tab-btn {
          padding: 12px 24px;
          border: none;
          background: none;
          font-size: 16px;
          font-weight: 500;
          color: #787486;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          color: #FF5E13;
        }

        .tab-btn.active {
          color: #FF5E13;
          border-bottom-color: #FF5E13;
        }

        .plans-content, .subscriptions-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .plans-header, .subscriptions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .plans-header h2, .subscriptions-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .add-plan-btn {
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .add-plan-btn:hover {
          transform: translateY(-2px);
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .plan-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .plan-card:hover {
          transform: translateY(-4px);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .plan-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .plan-price {
          text-align: right;
        }

        .price {
          font-size: 24px;
          font-weight: 700;
          color: #FF5E13;
        }

        .period {
          font-size: 14px;
          color: #787486;
        }

        .plan-features {
          margin-bottom: 20px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #0D062D;
        }

        .feature-icon {
          color: #10B981;
          font-weight: bold;
        }

        .plan-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #F9F4EE;
          border-radius: 10px;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #787486;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #0D062D;
        }

        .plan-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          color: #FF5E13;
          border-color: #FF5E13;
        }

        .action-btn.edit:hover {
          background: #FF5E13;
          color: white;
        }

        .action-btn.view {
          color: #6B7280;
        }

        .action-btn.view:hover {
          background: #F3F4F6;
        }

        .subscriptions-filters {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
        }

        .subscriptions-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
          background: #F9F4EE;
          padding: 16px 20px;
          font-weight: 600;
          color: #0D062D;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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

        .plan-badge {
          padding: 4px 8px;
          background: #DBEAFE;
          color: #1E40AF;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
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

        @media (max-width: 768px) {
          .admin-plans {
            padding: 16px;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plans-header, .subscriptions-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPlans;
