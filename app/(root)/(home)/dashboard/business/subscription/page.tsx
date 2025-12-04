"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscriptionService } from "@/services/subscriptionService";
import packageService from "@/services/packageService";
import { useUser } from "@/hooks/useUser";
import { Package } from "@/types/package";
import { SubscriptionResponse } from "@/types/subscription";
import { useSubscription } from "@/hooks/useSubscription";


interface DisplayPackage extends Package {
  isPopular?: boolean;
  isCurrent?: boolean;
}

const SubscriptionBillingPage = () => {
  const router = useRouter();
  const { userId } = useUser();
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionResponse | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [packages, setPackages] = useState<DisplayPackage[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<DisplayPackage | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  // const currentSubscription = useSubscription();
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // 1) Fetch gói hiện tại (active subscription by userId)
        if (userId) {
          const activeRes = await subscriptionService.getActiveSubscriptionByUserId(String(userId));
          console.log("Active subscription response:", activeRes.data);
          if (activeRes.success && activeRes.data && mounted) {
            setCurrentSubscription(activeRes.data);
            const cycle = activeRes.data.package?.billingCycle ?? 0;
            setBillingPeriod(cycle === 2 ? "yearly" : "monthly");
          }
        }
        console.log("Current Subscription:", currentSubscription);

        // 2) Fetch lịch sử thanh toán (all subscriptions by userId)
        if (userId) {
          const historyRes = await subscriptionService.getSubscriptionByUserId(String(userId));
          if (historyRes.success && mounted) {
            const subs = Array.isArray(historyRes.data) ? historyRes.data : (historyRes.data ? [historyRes.data] : []);
            const history = subs.map((s: any) => ({
              id: s.id,
              date: s.paidAt ?? s.startDate ?? new Date().toISOString().slice(0, 10),
              amount: s.totalPrice ?? (s.package?.price ?? 0),
              status: s.status ?? "paid",
              description: s.package?.name + "-" + s.package?.billingCycle + " months",
              currency: s.package?.currency ?? "VNĐ",
            }));
            setBillingHistory(history);
          }
        }

        // 3) Fetch các gói có sẵn (all packages)
        const pkgRes = await packageService.getPackages();
        if (pkgRes.success && mounted) {
          const items = Array.isArray(pkgRes.data) ? pkgRes.data : (pkgRes.data?.items ?? []);
          const mappedPackages: DisplayPackage[] = items.map((p: any) => ({
            id: p.id ?? p.Id ?? "",
            name: p.name ?? p.Name ?? "",
            description: p.description ?? p.Description ?? null,
            price: typeof p.price === "number" ? p.price : Number(p.price ?? p.Price ?? 0),
            currency: p.currency ?? p.Currency ?? "USD",
            billingCycle: typeof p.billingCycle === "number" ? p.billingCycle : Number(p.billingCycle ?? p.BillingCycle ?? 0),
            isDeleted: !!(p.isDeleted ?? p.IsDeleted),
            limitations: p.limitations ?? p.Limitations ?? [],
            isPopular: false,
            isCurrent: (p.id ?? p.Id) === currentSubscription?.packageId,
          }));
          setPackages(mappedPackages);
        }
      } catch (err) {
        console.error("Failed to load subscription data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const handleUpgrade = (pkg: DisplayPackage) => {
    setSelectedPackage(pkg);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPackage || !userId) return;
    
    setUpgrading(true);
    try {
      const payload = {
        packageId: selectedPackage.id,
        userId: String(userId),
        returnUrl: `${process.env.NEXT_PUBLIC_FE_URL}/dashboard/business/subscription`,
        cancelUrl: `${process.env.NEXT_PUBLIC_FE_URL}/dashboard/business/subscription`,
      };

      const result = await subscriptionService.createSubscription(payload);
      
      if (result.success) {
        // Reload data to reflect new subscription
        window.location.href = result.data.paymentUrl;
      } else {
        alert(`Upgrade failed: ${result.error || "Please try again"}`);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("An error occurred while upgrading the package. Please try again.");
    } finally {
      setUpgrading(false);
      setShowUpgradeModal(false);
      setSelectedPackage(null);
    }
  };

  const cancelUpgrade = () => {
    setShowUpgradeModal(false);
    setSelectedPackage(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { text: "Paid", className: "status-badge paid" },
      pending: { text: "Pending", className: "status-badge pending" },
      failed: { text: "Failed", className: "status-badge failed" },
      active: { text: "Active", className: "status-badge paid" },
    };
    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] ?? statusConfig.paid;
    return <span className={config.className}>{config.text}</span>;
  };

  // const formatBillingCycle = (billingCycle: number) => {
  //   if (billingCycle === 0) return "tháng";
  //   if (billingCycle === 1) return "quý";
  //   if (billingCycle === 2) return "năm";
  //   return "tháng";
  // };
  const formatDateVN = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const displayBillingHistory = billingHistory.length > 0 ? billingHistory : [];

  const currentPackage = currentSubscription?.package;

  return (
    <div className="subscription-billing-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Package and Billing</h1>
          <p>Manage your subscription and billing</p>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="current-plan-section">
        <div className="section-header">
          <h2>Current Plan</h2>
        </div>
        {currentSubscription && currentPackage ? (
          <div className="current-plan-card">
            <div className="plan-header">
              <div className="plan-info">
                <h3>{currentPackage.name}</h3>
                <div className="plan-price">
                  <span className="price">{currentSubscription.totalPrice ?? currentPackage.price}{" " + currentPackage.currency}</span>
                  {/* <span className="period">/{formatBillingCycle(currentPackage.billingCycle)}</span> */}
                  <span className="period">/{currentPackage.billingCycle} months</span>

                </div>
              </div>
              <div className="plan-status">
                <span className="status-active">{currentSubscription.isActive ? "Active" : "Inactive"}</span>
                  {currentSubscription.endDate && (
                    <span className="next-billing">End date: {formatDateVN(currentSubscription.endDate)}</span>
                )}
              </div>
            </div>
            <div className="plan-features">
              <h4>Limitations included:</h4>
              <ul>
                {currentPackage.limitations && currentPackage.limitations.length > 0 ? (
                  currentPackage.limitations.map((limitation, index) => (
                    <li key={limitation.id ?? index}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>
                        {limitation.isUnlimited 
                          ? `Unlimited ${limitation.name}` 
                          : limitation.limitValue !== null && limitation.limitValue !== undefined 
                          ? `${limitation.limitValue} ${limitation.name}` 
                          : limitation.name}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>
                    <span>No limitations</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="no-subscription">
            <p>You don't have any subscription. Please select a package below.</p>
          </div>
        )}
      </div>

 {/*       {/* Billing Period Toggle */}

      {/* <div className="billing-toggle-section" style={{ marginBottom: 32 }}>
        <div className="billing-toggle">
          <button className={`toggle-btn ${billingPeriod === "monthly" ? "active" : ""}`} onClick={() => setBillingPeriod("monthly")}>
            Hàng tháng
          </button>
          <button className={`toggle-btn ${billingPeriod === "yearly" ? "active" : ""}`} onClick={() => s     </div>
      </div> */}

      {/* Available Packages */}
      <div className="available-plans-section">
        <h2>Available Packages</h2>
        <div className="plans-grid">
          {packages.length > 0 ? (
            packages.map((pkg) => {
              const isCurrent = pkg.id === currentSubscription?.packageId;
              return (
                <div key={pkg.id} className={`plan-card ${pkg.isPopular ? "popular" : ""} ${isCurrent ? "current" : ""}`}>
                  {pkg.isPopular && <div className="popular-badge">Popular</div>}
                  <div className="plan-header">
                    <h3>{pkg.name}</h3>
                    <div className="plan-price">
                      <span className="price">{pkg.price} {" " + pkg.currency}</span>
                      <span className="period">/{pkg.billingCycle} months</span>
                    </div>
                  </div>
                  {pkg.description && (
                    <div className="plan-description">
                      <p>{pkg.description}</p>
                    </div>
                  )}
                  <div className="plan-features">
                    <ul>
                      {pkg.limitations && pkg.limitations.length > 0 ? (
                        pkg.limitations.map((limitation, index) => (
                          <li key={limitation.id ?? index}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>
                              {limitation.isUnlimited 
                                ? `Unlimited ${limitation.name}` 
                                : limitation.limitValue !== null && limitation.limitValue !== undefined 
                                ? `${limitation.limitValue} ${limitation.name}` 
                                : limitation.name}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>
                          <span>No limitations</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="plan-actions">
                    {isCurrent ? (
                      <button className="current-btn" disabled>Current plan</button>
                    ) : (() => {
                      // Hide upgrade button if current package price >= selected package price (downgrade)
                      const currentPrice = currentPackage?.price ?? 0;
                      const selectedPrice = pkg.price ?? 0;
                      const isDowngrade = currentPrice >= selectedPrice;
                      
                      if (isDowngrade) {
                        return null; // Hide button for downgrade
                      }
                      
                      return (
                        <button 
                          className="upgrade-btn" 
                          onClick={() => handleUpgrade(pkg)}
                        >
                          {currentSubscription ? "Upgrade" : "Select plan"}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-packages">
              <p>No packages available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="billing-history-section">
        <h2>Billing History</h2>
        <div className="billing-table">
          <div className="table-header">
            <div className="col-date">Date</div>
            <div className="col-description">Description</div>
            <div className="col-amount">Amount</div>
            <div className="col-status">Status</div>
            {/* <div className="col-action">Thao tác</div> */}
          </div>
          {displayBillingHistory.map((bill) => (
            <div key={bill.id} className="table-row">
              <div className="col-date"><span className="date">{formatDateVN(bill.date)}</span></div>
              <div className="col-description"><span className="description">{bill.description}</span></div>
              <div className="col-amount"><span className="amount">{bill.amount} {" " + bill.currency}</span></div>
              <div className="col-status"><span className="status-badge paid">{bill.status}</span></div>
              {/* <div className="col-action">
                <button className="download-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Tải hóa đơn
                </button>
              </div> */}
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && selectedPackage && (
        <div className="modal-overlay" onClick={cancelUpgrade}>
          <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Plan Upgrade</h3>
              <button className="modal-close" onClick={cancelUpgrade}>×</button>
            </div>
            <div className="modal-body">
              <div className="upgrade-confirmation">
                <h4>Are you sure you want to switch plans?</h4>
                <p className="warning-text">
                  Your current plan will be immediately canceled and you will not be able to undo this action.
                </p>
                {currentPackage && (
                  <div className="upgrade-summary">
                    <div className="summary-row">
                      <span className="label">Current Plan:</span>
                      <span className="value current">{currentPackage.name}</span>
                    </div>
                    <div className="summary-arrow">→</div>
                    <div className="summary-row">
                      <span className="label">New Plan:</span>
                      <span className="value new">{selectedPackage.name}</span>
                    </div>
                  </div>
                )}
                <div className="price-info">
                  <div className="price-row">
                    <span>Price new plan:</span>
                    <strong>{selectedPackage.price} {" " + selectedPackage.currency} / {selectedPackage.billingCycle} months</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={cancelUpgrade} disabled={upgrading}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmUpgrade} disabled={upgrading}>
                {upgrading ? "Processing..." : "Confirm Upgrade"}
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

        .no-subscription,
        .no-packages {
          background: white;
          border-radius: 16px;
          padding: 48px 32px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .no-subscription p,
        .no-packages p {
          font-size: 16px;
          color: #787486;
          margin: 0;
        }

        .plan-description {
          margin-bottom: 16px;
        }

        .plan-description p {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
        }

        .upgrade-modal {
          max-width: 500px;
        }

        .upgrade-confirmation {
          text-align: center;
          padding: 20px 0;
        }

        .warning-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .upgrade-confirmation h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #0d062d;
        }

        .warning-text {
          margin: 0 0 24px 0;
          font-size: 14px;
          color: #dc2626;
          line-height: 1.5;
          font-weight: 500;
        }

        .upgrade-summary {
          background: #f9f4ee;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .summary-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .summary-row .label {
          font-size: 12px;
          color: #787486;
          font-weight: 500;
        }

        .summary-row .value {
          font-size: 16px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
        }

        .summary-row .value.current {
          background: #fee2e2;
          color: #dc2626;
        }

        .summary-row .value.new {
          background: #d1fae5;
          color: #059669;
        }

        .summary-arrow {
          font-size: 24px;
          color: #ff5e13;
          font-weight: bold;
        }

        .price-info {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #0d062d;
        }

        .price-row strong {
          color: #ff5e13;
          font-size: 16px;
        }

        .btn-confirm {
          background: linear-gradient(135deg, #ff5e13 0%, #e04a0c 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-confirm:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.4);
        }

        .btn-confirm:disabled {
          background: #d1d5db;
          color: #6b7280;
          cursor: not-allowed;
          transform: none;
        }

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
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #0d062d;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .modal-close:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 0 24px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          margin-top: 24px;
        }

        .btn-cancel {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
