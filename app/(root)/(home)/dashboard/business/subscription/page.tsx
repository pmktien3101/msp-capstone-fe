'use client';

import React, { useState } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

const SubscriptionBillingPage = () => {
  const [currentPlan, setCurrentPlan] = useState('professional');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingPeriod === 'monthly' ? 29 : 290,
      period: billingPeriod,
      features: [
        'Tối đa 5 dự án',
        'Tối đa 10 thành viên',
        '5GB lưu trữ',
        'Hỗ trợ email',
        'Báo cáo cơ bản'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingPeriod === 'monthly' ? 79 : 790,
      period: billingPeriod,
      features: [
        'Tối đa 25 dự án',
        'Tối đa 50 thành viên',
        '50GB lưu trữ',
        'Hỗ trợ ưu tiên',
        'Báo cáo nâng cao',
        'Tích hợp API',
        'Backup tự động'
      ],
      isPopular: true,
      isCurrent: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingPeriod === 'monthly' ? 199 : 1990,
      period: billingPeriod,
      features: [
        'Dự án không giới hạn',
        'Thành viên không giới hạn',
        '500GB lưu trữ',
        'Hỗ trợ 24/7',
        'Báo cáo tùy chỉnh',
        'Tích hợp nâng cao',
        'Backup nâng cao',
        'Quản lý bảo mật',
        'SLA 99.9%'
      ]
    }
  ];

  const billingHistory = [
    {
      id: '1',
      date: '2024-12-01',
      amount: 79,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: '2',
      date: '2024-11-01',
      amount: 79,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: '3',
      date: '2024-10-01',
      amount: 79,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: '4',
      date: '2024-09-01',
      amount: 29,
      status: 'paid',
      description: 'Basic Plan - Monthly'
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (confirm('Bạn có chắc chắn muốn nâng cấp gói này?')) {
      setCurrentPlan(planId);
      alert('Nâng cấp thành công!');
    }
  };

  const handleDowngrade = (planId: string) => {
    if (confirm('Bạn có chắc chắn muốn hạ cấp gói này?')) {
      setCurrentPlan(planId);
      alert('Hạ cấp thành công!');
    }
  };

  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy gói đăng ký? Gói sẽ hết hạn vào cuối chu kỳ thanh toán hiện tại.')) {
      alert('Đã hủy gói đăng ký. Gói sẽ hết hạn vào cuối chu kỳ thanh toán.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: '#D1FAE5', textColor: '#065F46', text: 'Đã thanh toán' },
      pending: { color: '#FEF3C7', textColor: '#92400E', text: 'Chờ thanh toán' },
      failed: { color: '#FEE2E2', textColor: '#DC2626', text: 'Thất bại' }
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

  const currentPlanData = plans.find(plan => plan.id === currentPlan);

  return (
    <div className="subscription-billing-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Subscription & Billing</h1>
          <p>Quản lý gói đăng ký và thanh toán</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="current-plan-section">
        <div className="section-header">
          <h2>Gói Hiện Tại</h2>
          <div className="billing-toggle">
            <button 
              className={`toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Hàng tháng
            </button>
            <button 
              className={`toggle-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Hàng năm
              <span className="discount-badge">Tiết kiệm 20%</span>
            </button>
          </div>
        </div>

        {currentPlanData && (
          <div className="current-plan-card">
            <div className="plan-header">
              <div className="plan-info">
                <h3>{currentPlanData.name} Plan</h3>
                <div className="plan-price">
                  <span className="price">${currentPlanData.price}</span>
                  <span className="period">/{billingPeriod === 'monthly' ? 'tháng' : 'năm'}</span>
                </div>
              </div>
              <div className="plan-status">
                <span className="status-active">Đang hoạt động</span>
                <span className="next-billing">Gia hạn: 01/01/2025</span>
              </div>
            </div>
            
            <div className="plan-features">
              <h4>Tính năng bao gồm:</h4>
              <ul>
                {currentPlanData.features.map((feature, index) => (
                  <li key={index}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                Hủy gói đăng ký
              </button>
              <button className="manage-btn">
                Quản lý thanh toán
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="available-plans-section">
        <h2>Gói Có Sẵn</h2>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.isPopular ? 'popular' : ''} ${plan.isCurrent ? 'current' : ''}`}
            >
              {plan.isPopular && (
                <div className="popular-badge">Phổ biến nhất</div>
              )}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">${plan.price}</span>
                  <span className="period">/{billingPeriod === 'monthly' ? 'tháng' : 'năm'}</span>
                </div>
              </div>

              <div className="plan-features">
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-actions">
                {plan.isCurrent ? (
                  <button className="current-btn" disabled>
                    Gói hiện tại
                  </button>
                ) : plan.price > (currentPlanData?.price || 0) ? (
                  <button 
                    className="upgrade-btn"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    Nâng cấp
                  </button>
                ) : (
                  <button 
                    className="downgrade-btn"
                    onClick={() => handleDowngrade(plan.id)}
                  >
                    Hạ cấp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="billing-history-section">
        <h2>Lịch Sử Thanh Toán</h2>
        <div className="billing-table">
          <div className="table-header">
            <div className="col-date">Ngày</div>
            <div className="col-description">Mô tả</div>
            <div className="col-amount">Số tiền</div>
            <div className="col-status">Trạng thái</div>
            <div className="col-action">Thao tác</div>
          </div>
          
          {billingHistory.map((bill) => (
            <div key={bill.id} className="table-row">
              <div className="col-date">
                <span className="date">{bill.date}</span>
              </div>
              <div className="col-description">
                <span className="description">{bill.description}</span>
              </div>
              <div className="col-amount">
                <span className="amount">${bill.amount}</span>
              </div>
              <div className="col-status">
                {getStatusBadge(bill.status)}
              </div>
              <div className="col-action">
                <button className="download-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Tải hóa đơn
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="payment-method-section">
        <h2>Phương Thức Thanh Toán</h2>
        <div className="payment-card">
          <div className="payment-info">
            <div className="card-info">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="card-details">
                <span className="card-type">Visa</span>
                <span className="card-number">•••• •••• •••• 4242</span>
                <span className="card-expiry">Hết hạn: 12/25</span>
              </div>
            </div>
            <button className="update-card-btn">
              Cập nhật thẻ
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .subscription-billing-page {
          max-width: 1200px;
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

        .current-plan-section {
          margin-bottom: 48px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .billing-toggle {
          display: flex;
          background: #F3F4F6;
          border-radius: 8px;
          padding: 4px;
          position: relative;
        }

        .toggle-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #787486;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
          position: relative;
        }

        .toggle-btn.active {
          background: white;
          color: #0D062D;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .discount-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #FF5E13;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .current-plan-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #FF5E13;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .plan-info h3 {
          font-size: 24px;
          font-weight: 700;
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .plan-price .price {
          font-size: 32px;
          font-weight: 700;
          color: #FF5E13;
        }

        .plan-price .period {
          font-size: 16px;
          color: #787486;
        }

        .plan-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .status-active {
          background: #D1FAE5;
          color: #065F46;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .next-billing {
          font-size: 12px;
          color: #787486;
        }

        .plan-features h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 16px 0;
        }

        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .plan-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #0D062D;
        }

        .plan-features li svg {
          color: #10B981;
          flex-shrink: 0;
        }

        .plan-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .cancel-btn {
          padding: 12px 24px;
          border: 2px solid #FEE2E2;
          background: white;
          color: #DC2626;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: #FEE2E2;
        }

        .manage-btn {
          padding: 12px 24px;
          border: none;
          background: #FF5E13;
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .manage-btn:hover {
          background: #FFA463;
        }

        .available-plans-section {
          margin-bottom: 48px;
        }

        .available-plans-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 24px 0;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .plan-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid transparent;
          position: relative;
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .plan-card.popular {
          border-color: #FF5E13;
        }

        .plan-card.current {
          border-color: #10B981;
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #FF5E13;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .plan-card .plan-header {
          margin-bottom: 20px;
        }

        .plan-card .plan-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .plan-card .plan-price .price {
          font-size: 28px;
        }

        .plan-card .plan-features ul {
          grid-template-columns: 1fr;
          margin-bottom: 24px;
        }

        .upgrade-btn, .downgrade-btn, .current-btn {
          width: 100%;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upgrade-btn {
          background: #FF5E13;
          color: white;
        }

        .upgrade-btn:hover {
          background: #FFA463;
        }

        .downgrade-btn {
          background: #F3F4F6;
          color: #0D062D;
          border: 2px solid #E5E7EB;
        }

        .downgrade-btn:hover {
          background: #E5E7EB;
        }

        .current-btn {
          background: #D1FAE5;
          color: #065F46;
          cursor: not-allowed;
        }

        .billing-history-section {
          margin-bottom: 48px;
        }

        .billing-history-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 24px 0;
        }

        .billing-table {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px 24px;
          background: #F9F4EE;
          font-size: 12px;
          font-weight: 600;
          color: #787486;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #F3F4F6;
          align-items: center;
        }

        .table-row:hover {
          background: #F9F4EE;
        }

        .date, .description, .amount {
          font-size: 14px;
          color: #0D062D;
        }

        .amount {
          font-weight: 600;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid #E5E7EB;
          background: white;
          color: #787486;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .download-btn:hover {
          border-color: #FF5E13;
          color: #FF5E13;
        }

        .payment-method-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 24px 0;
        }

        .payment-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .payment-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .card-icon {
          width: 48px;
          height: 48px;
          background: #F3F4F6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #787486;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-type {
          font-size: 16px;
          font-weight: 600;
          color: #0D062D;
        }

        .card-number {
          font-size: 14px;
          color: #787486;
        }

        .card-expiry {
          font-size: 12px;
          color: #787486;
        }

        .update-card-btn {
          padding: 10px 20px;
          border: 2px solid #FF5E13;
          background: white;
          color: #FF5E13;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .update-card-btn:hover {
          background: #FF5E13;
          color: white;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .subscription-billing-page {
            padding: 16px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .plan-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .plan-actions {
            flex-direction: column;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .payment-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionBillingPage;
