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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [upgradeOption, setUpgradeOption] = useState<'immediate' | 'end_of_period'>('immediate');

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

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleDowngrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowDowngradeModal(true);
  };

  const processUpgrade = () => {
    if (!selectedPlan) return;
    
    // Giả định thanh toán thành công
    setTimeout(() => {
      if (upgradeOption === 'immediate') {
        setCurrentPlan(selectedPlan.id);
        alert(`Nâng cấp thành công! Bạn đã được chuyển sang gói ${selectedPlan.name} ngay lập tức.`);
      } else {
        alert(`Thanh toán thành công! Bạn sẽ được chuyển sang gói ${selectedPlan.name} sau khi gói hiện tại kết thúc (01/01/2025).`);
      }
      setShowUpgradeModal(false);
      setSelectedPlan(null);
    }, 1000);
  };

  const processDowngrade = () => {
    if (!selectedPlan) return;
    
    // Giả định thanh toán thành công
    setTimeout(() => {
      alert(`Thanh toán thành công! Bạn sẽ được chuyển sang gói ${selectedPlan.name} sau khi gói hiện tại kết thúc (01/01/2025).`);
      setShowDowngradeModal(false);
      setSelectedPlan(null);
    }, 1000);
  };

  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy gói đăng ký? Gói sẽ hết hạn vào cuối chu kỳ thanh toán hiện tại.')) {
      alert('Đã hủy gói đăng ký. Gói sẽ hết hạn vào cuối chu kỳ thanh toán.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { 
        text: 'Đã thanh toán',
        className: 'status-badge paid'
      },
      pending: { 
        text: 'Chờ thanh toán',
        className: 'status-badge pending'
      },
      failed: { 
        text: 'Thất bại',
        className: 'status-badge failed'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={config.className}>
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
                    onClick={() => handleUpgrade(plan)}
                  >
                    Nâng cấp
                  </button>
                ) : (
                  <button 
                    className="downgrade-btn"
                    onClick={() => handleDowngrade(plan)}
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
                <span className="amount">{getStatusBadge(bill.status)}</span> 
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
      {/* <div className="payment-method-section">
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
      </div> */}

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Nâng cấp gói {selectedPlan.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="plan-comparison">
                <div className="current-plan">
                  <h4>Gói hiện tại: {currentPlanData?.name}</h4>
                  <div className="price">${currentPlanData?.price}/{billingPeriod === 'monthly' ? 'tháng' : 'năm'}</div>
                </div>
                <div className="arrow">→</div>
                <div className="new-plan">
                  <h4>Gói mới: {selectedPlan.name}</h4>
                  <div className="price">${selectedPlan.price}/{billingPeriod === 'monthly' ? 'tháng' : 'năm'}</div>
                </div>
              </div>
              
              <div className="upgrade-options">
                <h4>Chọn thời điểm nâng cấp:</h4>
                <div className="option-group">
                  <label className="option-item">
                    <input
                      type="radio"
                      name="upgradeOption"
                      value="immediate"
                      checked={upgradeOption === 'immediate'}
                      onChange={(e) => setUpgradeOption(e.target.value as 'immediate' | 'end_of_period')}
                    />
                    <div className="option-content">
                      <div className="option-title">Nâng cấp ngay lập tức</div>
                      <div className="option-description">Chuyển sang gói mới ngay bây giờ</div>
                    </div>
                  </label>
                  
                  <label className="option-item">
                    <input
                      type="radio"
                      name="upgradeOption"
                      value="end_of_period"
                      checked={upgradeOption === 'end_of_period'}
                      onChange={(e) => setUpgradeOption(e.target.value as 'immediate' | 'end_of_period')}
                    />
                    <div className="option-content">
                      <div className="option-title">Nâng cấp sau khi kết thúc gói hiện tại</div>
                      <div className="option-description">Chuyển sang gói mới vào 01/01/2025</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowUpgradeModal(false)}
              >
                Hủy
              </button>
              <button 
                className="confirm-btn"
                onClick={processUpgrade}
              >
                Thanh toán và nâng cấp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Modal */}
      {showDowngradeModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Hạ cấp gói {selectedPlan.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDowngradeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-message">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  <h4>Bạn có chắc chắn muốn hạ cấp xuống gói {selectedPlan.name}?</h4>
                  <p>Một số tính năng có thể bị hạn chế sau khi hạ cấp.</p>
                </div>
              </div>
              
              <div className="plan-comparison">
                <div className="current-plan">
                  <h4>Gói hiện tại: {currentPlanData?.name}</h4>
                  <div className="price">${currentPlanData?.price}/{billingPeriod === 'monthly' ? 'tháng' : 'năm'}</div>
                </div>
                <div className="arrow">→</div>
                <div className="new-plan">
                  <h4>Gói mới: {selectedPlan.name}</h4>
                  <div className="price">${selectedPlan.price}/{billingPeriod === 'monthly' ? 'tháng' : 'năm'}</div>
                </div>
              </div>
              
              <div className="downgrade-info">
                <p><strong>Lưu ý:</strong> Bạn sẽ được chuyển sang gói {selectedPlan.name} sau khi gói hiện tại kết thúc (01/01/2025).</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDowngradeModal(false)}
              >
                Hủy
              </button>
              <button 
                className="confirm-btn downgrade"
                onClick={processDowngrade}
              >
                Đồng ý và thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

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
          display: flex;
          flex-direction: column;
          height: 100%;
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
          flex-grow: 1;
        }

        .plan-actions {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #F3F4F6;
        }

        .upgrade-btn, .downgrade-btn, .current-btn {
          width: 100%;
          padding: 14px 24px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .upgrade-btn {
          background: linear-gradient(135deg, #FF5E13, #FF8C42);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        .upgrade-btn:hover {
          background: linear-gradient(135deg, #FF8C42, #FFA463);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 94, 19, 0.4);
        }

        .upgrade-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .upgrade-btn:hover::before {
          left: 100%;
        }

        .downgrade-btn {
          background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
          color: #0D062D;
          border: 2px solid #D1D5DB;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .downgrade-btn:hover {
          background: linear-gradient(135deg, #E5E7EB, #D1D5DB);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #9CA3AF;
        }

        .current-btn {
          background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
          color: #065F46;
          cursor: not-allowed;
          border: 2px solid #10B981;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        }

        .current-btn:hover {
          transform: none;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
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
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid #F1F5F9;
          position: relative;
        }

        .billing-table::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #FF5E13, transparent);
          opacity: 0.3;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 2px solid #E2E8F0;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .table-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF5E13, #FF8C42, #FFA463);
          border-radius: 0 0 2px 2px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #F1F5F9;
          align-items: center;
          transition: all 0.3s ease;
          background: white;
        }

        .table-row:nth-child(even) {
          background: #FAFBFC;
        }

        .table-row:hover {
          background: linear-gradient(135deg, #FEF7F0 0%, #FFF5F0 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.08);
          border-left: 3px solid #FF5E13;
        }

        .table-row:nth-child(even):hover {
          background: linear-gradient(135deg, #FEF7F0 0%, #FFF5F0 100%);
        }

        .date {
          font-size: 14px;
          color: #475569;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .table-row:hover .date {
          color: #FF5E13;
        }

        .description {
          font-size: 14px;
          color: #0D062D;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .table-row:hover .description {
          color: #FF5E13;
        }

        .amount {
          font-size: 16px;
          font-weight: 700;
          color: #059669;
          background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .table-row:hover .amount {
          background: linear-gradient(135deg, #FEF7F0, #FFF5F0);
          color: #FF5E13;
          transform: scale(1.05);
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 2px solid #E5E7EB;
          background: linear-gradient(135deg, #FFFFFF, #F9FAFB);
          color: #475569;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .download-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 94, 19, 0.1), transparent);
          transition: left 0.5s;
        }

        .download-btn:hover::before {
          left: 100%;
        }

        .download-btn:hover {
          border-color: #FF5E13;
          color: #FF5E13;
          background: linear-gradient(135deg, #FEF7F0, #FFF5F0);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.2);
        }

        .download-btn svg {
          transition: transform 0.3s ease;
        }

        .download-btn:hover svg {
          transform: translateY(-1px);
        }

        /* .payment-method-section h2 {
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
        } */

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: inline-block;
        }

        .status-badge.paid {
          font-size: 16px;
          font-weight: 700;
          color: #059669;
          background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .status-badge.pending {
          color: #92400E;
          background: linear-gradient(135deg, #FEF3C7, #FDE68A);
          font-weight: 700;
        }

        .status-badge.failed {
          color: #DC2626;
          background: linear-gradient(135deg, #FEE2E2, #FECACA);
          font-weight: 700;
        }

        .table-row:hover .status-badge.paid {
          background: linear-gradient(135deg, #FEF7F0, #FFF5F0);
          color: #FF5E13;
          transform: scale(1.05);
        }

        .table-row:hover .status-badge.pending {
          background: linear-gradient(135deg, #FEF7F0, #FFF5F0);
          color: #FF5E13;
          transform: scale(1.05);
        }

        .table-row:hover .status-badge.failed {
          background: linear-gradient(135deg, #FEF7F0, #FFF5F0);
          color: #FF5E13;
          transform: scale(1.05);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #F3F4F6;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #787486;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #F3F4F6;
          color: #0D062D;
        }

        .modal-body {
          padding: 0 24px;
        }

        .plan-comparison {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F9F4EE;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .current-plan, .new-plan {
          text-align: center;
          flex: 1;
        }

        .current-plan h4, .new-plan h4 {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .current-plan .price, .new-plan .price {
          font-size: 18px;
          font-weight: 700;
          color: #FF5E13;
        }

        .arrow {
          font-size: 24px;
          color: #FF5E13;
          margin: 0 20px;
        }

        .upgrade-options h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0D062D;
          margin: 0 0 16px 0;
        }

        .option-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .option-item:hover {
          border-color: #FF5E13;
          background: #FEF7F0;
        }

        .option-item input[type="radio"] {
          margin: 0;
          accent-color: #FF5E13;
        }

        .option-item input[type="radio"]:checked + .option-content {
          color: #FF5E13;
        }

        .option-item:has(input[type="radio"]:checked) {
          border-color: #FF5E13;
          background: #FEF7F0;
        }

        .option-content {
          flex: 1;
        }

        .option-title {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
          margin-bottom: 4px;
        }

        .option-description {
          font-size: 12px;
          color: #787486;
        }

        .warning-message {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #FEF3C7;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          border-left: 4px solid #F59E0B;
        }

        .warning-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .warning-text h4 {
          font-size: 14px;
          font-weight: 600;
          color: #92400E;
          margin: 0 0 4px 0;
        }

        .warning-text p {
          font-size: 12px;
          color: #92400E;
          margin: 0;
        }

        .downgrade-info {
          background: #F3F4F6;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .downgrade-info p {
          font-size: 14px;
          color: #0D062D;
          margin: 0;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #F3F4F6;
          margin-top: 24px;
        }

        .modal-footer .cancel-btn {
          padding: 12px 24px;
          border: 2px solid #E5E7EB;
          background: white;
          color: #787486;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-footer .cancel-btn:hover {
          border-color: #D1D5DB;
          color: #0D062D;
        }

        .modal-footer .confirm-btn {
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

        .modal-footer .confirm-btn:hover {
          background: #FF8C42;
        }

        .modal-footer .confirm-btn.downgrade {
          background: #DC2626;
        }

        .modal-footer .confirm-btn.downgrade:hover {
          background: #B91C1C;
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

          .plan-card {
            height: auto;
            min-height: 400px;
          }

          .plan-actions {
            margin-top: 20px;
            padding-top: 16px;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          /* .payment-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          } */

          .modal {
            width: 95%;
            margin: 20px;
          }

          .plan-comparison {
            flex-direction: column;
            gap: 16px;
          }

          .arrow {
            transform: rotate(90deg);
            margin: 8px 0;
          }

          .modal-footer {
            flex-direction: column;
          }

          .modal-footer .cancel-btn,
          .modal-footer .confirm-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionBillingPage;
