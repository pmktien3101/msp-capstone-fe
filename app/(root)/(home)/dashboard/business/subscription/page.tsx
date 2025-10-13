"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

const SubscriptionBillingPage = () => {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState("professional");
  const [currentPlanPrice, setCurrentPlanPrice] = useState(79);
  const [currentPlanPeriod, setCurrentPlanPeriod] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: billingPeriod === "monthly" ? 29 : 290,
      period: billingPeriod,
      features: [
        "Tối đa 5 dự án",
        "Tối đa 10 thành viên",
        "5GB lưu trữ",
        "Hỗ trợ email",
        "Báo cáo cơ bản",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      price: billingPeriod === "monthly" ? 79 : 790,
      period: billingPeriod,
      features: [
        "Tối đa 25 dự án",
        "Tối đa 50 thành viên",
        "50GB lưu trữ",
        "Hỗ trợ ưu tiên",
        "Báo cáo nâng cao",
        "Tích hợp API",
        "Backup tự động",
      ],
      isPopular: true,
      isCurrent: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: billingPeriod === "monthly" ? 199 : 1990,
      period: billingPeriod,
      features: [
        "Dự án không giới hạn",
        "Thành viên không giới hạn",
        "500GB lưu trữ",
        "Hỗ trợ 24/7",
        "Báo cáo tùy chỉnh",
        "Tích hợp nâng cao",
        "Backup nâng cao",
        "Quản lý bảo mật",
        "SLA 99.9%",
      ],
    },
  ];

  const billingHistory = [
    {
      id: "1",
      date: "2024-12-01",
      amount: 79,
      status: "paid",
      description: "Professional Plan - Monthly",
    },
    {
      id: "2",
      date: "2024-11-01",
      amount: 79,
      status: "paid",
      description: "Professional Plan - Monthly",
    },
    {
      id: "3",
      date: "2024-10-01",
      amount: 79,
      status: "paid",
      description: "Professional Plan - Monthly",
    },
    {
      id: "4",
      date: "2024-09-01",
      amount: 29,
      status: "paid",
      description: "Basic Plan - Monthly",
    },
  ];

  const handleUpgrade = (plan: SubscriptionPlan) => {
    router.push(
      `/dashboard/business/payment?planId=${plan.id}&price=${
        plan.price
      }&name=${encodeURIComponent(plan.name)}&period=${plan.period}`
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        text: "Đã thanh toán",
        className: "status-badge paid",
      },
      pending: {
        text: "Chờ thanh toán",
        className: "status-badge pending",
      },
      failed: {
        text: "Thất bại",
        className: "status-badge failed",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <span className={config.className}>{config.text}</span>;
  };

  const currentPlanData = plans.find((plan) => plan.id === currentPlan);

  return (
    <div className="subscription-billing-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gói và thanh toán</h1>
          <p>Quản lý gói đăng ký và thanh toán</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="current-plan-section">
        <div className="section-header">
          <h2>Gói Hiện Tại</h2>
        </div>
        {currentPlanData && (
          <div className="current-plan-card">
            <div className="plan-header">
              <div className="plan-info">
                <h3>{currentPlanData.name} Plan</h3>
                <div className="plan-price">
                  <span className="price">${currentPlanPrice}</span>
                  <span className="period">
                    /{currentPlanPeriod === "monthly" ? "tháng" : "năm"}
                  </span>
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
                      <path
                        d="M9 12L11 14L15 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Billing Period Toggle */}
      <div className="billing-toggle-section" style={{ marginBottom: 32 }}>
        <div className="billing-toggle">
          <button
            className={`toggle-btn ${
              billingPeriod === "monthly" ? "active" : ""
            }`}
            onClick={() => setBillingPeriod("monthly")}
          >
            Hàng tháng
          </button>
          <button
            className={`toggle-btn ${
              billingPeriod === "yearly" ? "active" : ""
            }`}
            onClick={() => setBillingPeriod("yearly")}
          >
            Hàng năm
            <span className="discount-badge">Tiết kiệm 20%</span>
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div className="available-plans-section">
        <h2>Gói Có Sẵn</h2>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.isPopular ? "popular" : ""} ${
                plan.isCurrent ? "current" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="popular-badge">Phổ biến nhất</div>
              )}

              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">${plan.price}</span>
                  <span className="period">
                    /{billingPeriod === "monthly" ? "tháng" : "năm"}
                  </span>
                </div>
              </div>

              <div className="plan-features">
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
                ) : null}
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
                    <path
                      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 10L12 15L17 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15V3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Tải hóa đơn
                </button>
              </div>
            </div>
          ))}
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
          color: #0d062d;
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
          color: #0d062d;
          margin: 0;
        }

        .billing-toggle {
          display: flex;
          background: #f3f4f6;
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
          color: #0d062d;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .discount-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff5e13;
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
          border: 2px solid #ff5e13;
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
          color: #0d062d;
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
          color: #ff5e13;
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
          background: #d1fae5;
          color: #065f46;
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
          color: #0d062d;
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
          color: #0d062d;
        }

        .plan-features li svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .plan-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .available-plans-section {
          margin-bottom: 48px;
        }

        .available-plans-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0d062d;
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
          border-color: #ff5e13;
        }

        .plan-card.current {
          border-color: #10b981;
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff5e13;
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
          color: #0d062d;
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
          border-top: 1px solid #f3f4f6;
        }

        .upgrade-btn,
        .current-btn {
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
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        .upgrade-btn:hover {
          background: linear-gradient(135deg, #ff8c42, #ffa463);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 94, 19, 0.4);
        }

        .upgrade-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .upgrade-btn:hover::before {
          left: 100%;
        }

        .current-btn {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          cursor: not-allowed;
          border: 2px solid #10b981;
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
          color: #0d062d;
          margin: 0 0 24px 0;
        }

        .billing-table {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid #f1f5f9;
          position: relative;
        }

        .billing-table::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ff5e13, transparent);
          opacity: 0.3;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 2px solid #e2e8f0;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .table-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff5e13, #ff8c42, #ffa463);
          border-radius: 0 0 2px 2px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          align-items: center;
          transition: all 0.3s ease;
          background: white;
        }

        .table-row:nth-child(even) {
          background: #fafbfc;
        }

        .table-row:hover {
          background: linear-gradient(135deg, #fef7f0 0%, #fff5f0 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.08);
          border-left: 3px solid #ff5e13;
        }

        .table-row:nth-child(even):hover {
          background: linear-gradient(135deg, #fef7f0 0%, #fff5f0 100%);
        }

        .date {
          font-size: 14px;
          color: #475569;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .table-row:hover .date {
          color: #ff5e13;
        }

        .description {
          font-size: 14px;
          color: #0d062d;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .table-row:hover .description {
          color: #ff5e13;
        }

        .amount {
          font-size: 16px;
          font-weight: 700;
          color: #059669;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .table-row:hover .amount {
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          color: #ff5e13;
          transform: scale(1.05);
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          background: linear-gradient(135deg, #ffffff, #f9fafb);
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
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 94, 19, 0.1),
            transparent
          );
          transition: left 0.5s;
        }

        .download-btn:hover::before {
          left: 100%;
        }

        .download-btn:hover {
          border-color: #ff5e13;
          color: #ff5e13;
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.2);
        }

        .download-btn svg {
          transition: transform 0.3s ease;
        }

        .download-btn:hover svg {
          transform: translateY(-1px);
        }

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
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          padding: 6px 12px;
          border-radius: 8px;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .status-badge.pending {
          color: #92400e;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          font-weight: 700;
        }

        .status-badge.failed {
          color: #dc2626;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          font-weight: 700;
        }

        .table-row:hover .status-badge.paid {
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          color: #ff5e13;
          transform: scale(1.05);
        }

        .table-row:hover .status-badge.pending {
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          color: #ff5e13;
          transform: scale(1.05);
        }

        .table-row:hover .status-badge.failed {
          background: linear-gradient(135deg, #fef7f0, #fff5f0);
          color: #ff5e13;
          transform: scale(1.05);
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
