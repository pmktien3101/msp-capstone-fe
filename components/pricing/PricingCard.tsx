"use client";

import React from "react";
import Link from "next/link";
import "./pricing-card.scss";

export interface PricingPlanFeature {
  name: string;
  value?: string | number;
  isUnlimited?: boolean;
}

export interface PricingPlan {
  id?: string | number;
  name: string;
  price: number | string;
  currency?: string;
  period?: string;
  billingCycle?: number;
  description?: string;
  features?: string[];
  limitations?: PricingPlanFeature[];
  featured?: boolean;
  status?: string;
  activeSubscriptions?: number;
}

export interface PricingCardProps {
  plan: PricingPlan;
  isYearlyBilling?: boolean;
  showActions?: boolean;
  actionType?: "link" | "button";
  actionLink?: string;
  actionLabel?: string;
  featuredLabel?: string;
  onAction?: (plan: PricingPlan) => void;
  onEdit?: (plan: PricingPlan) => void;
  onDelete?: (plan: PricingPlan) => void;
  showEdit?: boolean;
  showDelete?: boolean;
  className?: string;
}

const formatPeriodLabel = (period?: string, billingCycle?: number): string => {
  if (billingCycle === 0) return "month";
  if (billingCycle === 1) return "quarter";
  if (billingCycle === 2) return "year";
  if (!period) return "month";
  const p = String(period).toLowerCase();
  if (p === "month" || p === "tháng") return "month";
  if (p === "quarter" || p === "quý") return "quarter";
  if (p === "year" || p === "năm" || p === "nam") return "year";
  return period;
};

const getCurrencySymbol = (currency?: string): string => {
  return "₫"; // VND only
};

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0";
  return numPrice.toLocaleString("de-DE");
};

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isYearlyBilling = false,
  showActions = true,
  actionType = "link",
  actionLink = "/sign-up",
  actionLabel,
  featuredLabel = "Most Popular",
  onAction,
  onEdit,
  onDelete,
  showEdit = false,
  showDelete = false,
  className = "",
}) => {
  const isFeatured =
    plan.featured || (plan.activeSubscriptions && plan.activeSubscriptions > 5);

  const periodLabel = formatPeriodLabel(plan.period, plan.billingCycle);
  const currencySymbol = getCurrencySymbol(plan.currency);

  const defaultActionLabel = isFeatured ? "Get Started" : "Subscribe";
  const buttonLabel = actionLabel || defaultActionLabel;

  const handleAction = () => {
    if (onAction) {
      onAction(plan);
    }
  };

  // Render features from either features array or limitations array
  const renderFeatures = () => {
    // Priority: limitations with more detail, then features
    if (plan.limitations && plan.limitations.length > 0) {
      return plan.limitations.map((lim, index) => (
        <div key={index} className="feature-item">
          <div className="feature-check-wrapper">
            <svg
              className="feature-check"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span>
            {lim.name}
            {lim.isUnlimited && (
              <span className="feature-unlimited">Unlimited</span>
            )}
            {!lim.isUnlimited && lim.value && (
              <span className="feature-value">: {lim.value}</span>
            )}
          </span>
        </div>
      ));
    }

    if (plan.features && plan.features.length > 0) {
      return plan.features.map((feature, index) => (
        <div key={index} className="feature-item">
          <div className="feature-check-wrapper">
            <svg
              className="feature-check"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span>{feature}</span>
        </div>
      ));
    }

    return null;
  };

  return (
    <div
      className={`pricing-card ${isFeatured ? "featured" : ""} ${className}`}
    >
      {isFeatured && <span className="featured-badge">{featuredLabel}</span>}

      <div className="plan-header">
        <h3 className="plan-name">{plan.name}</h3>
        <div className="plan-price">
          <span className="amount">{formatPrice(plan.price)}</span>
          <span className="currency">{currencySymbol}</span>
          <span className="period">/{periodLabel}</span>
        </div>
        {plan.description && (
          <p className="plan-description">{plan.description}</p>
        )}
      </div>

      <div className="plan-features">{renderFeatures()}</div>

      {showActions && (
        <div className="plan-actions">
          {/* Main action button - only show if not in admin mode */}
          {!showEdit &&
            !showDelete &&
            (actionType === "link" ? (
              <Link
                href={actionLink}
                className={`btn ${isFeatured ? "btn-primary" : "btn-outline"}`}
              >
                {buttonLabel}
              </Link>
            ) : (
              <button
                className={`btn ${isFeatured ? "btn-primary" : "btn-outline"}`}
                onClick={handleAction}
              >
                {buttonLabel}
              </button>
            ))}

          {/* Admin action buttons */}
          {(showEdit || showDelete) && (
            <div className="admin-actions">
              {showEdit && onEdit && (
                <button
                  className="btn-action btn-edit"
                  onClick={() => onEdit(plan)}
                  title="Edit"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Edit</span>
                </button>
              )}

              {showDelete && onDelete && (
                <button
                  className="btn-action btn-delete-action"
                  onClick={() => onDelete(plan)}
                  title="Delete"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6H5H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingCard;
