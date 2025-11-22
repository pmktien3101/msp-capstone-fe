"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Users } from "lucide-react";

import packageService from "@/services/packageService";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/useUser";
import limitationService from "@/services/limitationService";

const AdminPackages = () => {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showViewPlanModal, setShowViewPlanModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeatureSidebar, setShowFeatureSidebar] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    period: "month",
    currency: "USD",
    description: "",
    features: [] as string[],
    limitations: [] as (object | string | number)[],
  });

  const [limitations, setLimitations] = useState<any[]>([]);
  const [loadingLimitations, setLoadingLimitations] = useState(false);

  const [plans, setPlans] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { userId } = useUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await packageService.getPackages();
        if (res.success && mounted && res.data) {
          // If backend returns an array or paged response, try to map to the UI shape
          const items: any[] = Array.isArray(res.data)
            ? res.data
            : res.data.items ?? res.data;

          // Map API package model to local plan structure when possible
          const mapped = items.map((p: any, idx: number) => ({
            id: (p.id ?? p.ID) || idx + 1,
            name: p.name ?? p.title ?? `Package ${idx + 1}`,
            price: p.price ?? 0,
            currency:
              p.currency ??
              p.Currency ??
              p.CurrencyCode ??
              p.CurrencySymbol ??
              "USD",
            period:
              p.period ??
              (p.billingCycle === 0
                ? "month"
                : p.billingCycle === 1
                ? "quarter"
                : p.billingCycle === 2
                ? "year"
                : "month"),
            billingCycle: p.billingCycle ?? p.BillingCycle,
            features: p.features ?? [],
            limitations: p.limitations ?? p.Limitations ?? [],
            activeSubscriptions: p.activeSubscriptions ?? 0,
            revenue: p.revenue ?? "",
            status: p.status ?? "active",
          }));

          setPlans(mapped);
        }
      } catch (e) {
        // ignore, keep mock plans
      }
    })();

    // fetch limitations for selection when creating packages
    (async () => {
      setLoadingLimitations(true);
      try {
        const res = await limitationService.getLimitations();
        if (res.success && res.data) {
          const items: any[] = Array.isArray(res.data)
            ? res.data
            : res.data.items ?? res.data;
          const mapped = items.map((it: any) => ({
            id: it.Id ?? it.id,
            name: it.Name ?? it.name,
            description: it.Description ?? it.description,
            isUnlimited: it.IsUnlimited ?? it.isUnlimited ?? false,
            limitValue: it.LimitValue ?? it.limitValue ?? null,
            limitUnit: it.LimitUnit ?? it.limitUnit ?? null,
            isDeleted: it.IsDeleted ?? it.isDeleted ?? false,
            ...it,
          }));
          // keep only not-deleted
          setLimitations(mapped.filter((x: any) => !x.isDeleted));
        }
      } catch (err) {
        // ignore
      } finally {
        setLoadingLimitations(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Handler functions for adding new plan
  const handleAddPlan = () => {
    if (newPlan.name && newPlan.price) {
      (async () => {
        // Map UI period to API billingCycle enum (0-based): month=0, quarter=1, year=2
        const billingCycleMap: Record<string, number> = {
          month: 0,
          quarter: 1,
          year: 2,
        };

        const payload: any = {
          Name: newPlan.name,
          Description: newPlan.description || undefined,
          Price: Number(newPlan.price) || 0,
          Currency: newPlan.currency || "USD",
          BillingCycle: billingCycleMap[newPlan.period] ?? 0,
          billingCycle: billingCycleMap[newPlan.period] ?? 0,
          CreatedById: userId || null,
          LimitationIds: newPlan.limitations || [],
        };

        try {
          const res = await packageService.createPackage(payload);
          if (!res.success) {
            console.error("Server rejected create package:", res.error);
            // show user the server error so it's easier to debug
            try {
              toast.error(`Create package failed: ${res.error}`);
            } catch (e) {}
          }
          if (res.success && res.data) {
            const p = res.data;
            const mapped = {
              id: p.id ?? p.ID,
              name: p.name ?? p.title ?? newPlan.name,
              price: p.price ?? payload.Price,
              period: p.period ?? newPlan.period,
              billingCycle:
                p.billingCycle ??
                p.BillingCycle ??
                payload.billingCycle ??
                payload.BillingCycle,
              features: newPlan.features,
              limitations: p.limitations ?? newPlan.limitations ?? [],
              activeSubscriptions: p.activeSubscriptions ?? 0,
              revenue: p.revenue ?? "",
              status: p.status ?? "active",
            };
            setPlans((prev) => [...prev, mapped]);
          } else {
            const planToAdd = {
              id: plans.length + 1,
              name: newPlan.name,
              price: parseInt(newPlan.price),
              currency: newPlan.currency || "USD",
              period: newPlan.period,
              billingCycle: (function () {
                const map: Record<string, number> = {
                  month: 0,
                  quarter: 1,
                  year: 2,
                };
                return map[newPlan.period] ?? 0;
              })(),
              features: newPlan.features,
              limitations: newPlan.limitations || [],
              activeSubscriptions: 0,
              revenue: "$0",
              status: "active",
            };
            setPlans((prev) => [...prev, planToAdd]);
          }
        } catch (err) {
          const planToAdd = {
            id: plans.length + 1,
            name: newPlan.name,
            price: parseInt(newPlan.price),
            currency: newPlan.currency || "USD",
            period: newPlan.period,
            features: newPlan.features,
            activeSubscriptions: 0,
            revenue: "$0",
            status: "active",
          };
          setPlans((prev) => [...prev, planToAdd]);
        }

        setNewPlan({
          name: "",
          price: "",
          period: "month",
          currency: "USD",
          description: "",
          features: [],
          limitations: [],
        });
        setShowAddPlanModal(false);
      })();
    }
  };

  const handleNewPlanChange = (field: string, value: any) => {
    setNewPlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectAllFeatures = () => {
    if (limitations && limitations.length > 0) {
      setNewPlan((prev: any) => ({
        ...prev,
        features: limitations.map((l: any) => l.name),
        limitations: limitations.map((l: any) => l.id),
      }));
      return;
    }
  };

  const handleClearAllFeatures = () => {
    setNewPlan((prev: any) => ({
      ...prev,
      features: [],
      limitations: [],
    }));
  };

  const handleToggleLimFeature = (lim: any) => {
    setNewPlan((prev: any) => {
      const features = prev.features || [];
      const limitationsSel = prev.limitations || [];
      const hasFeature = features.includes(lim.name);
      return {
        ...prev,
        features: hasFeature
          ? features.filter((f: any) => f !== lim.name)
          : [...features, lim.name],
        limitations: limitationsSel.includes(lim.id)
          ? limitationsSel.filter((id: any) => id !== lim.id)
          : [...limitationsSel, lim.id],
      };
    });
  };

  const renderFeatureLabel = (featureName: string) => {
    const lim = limitations.find((l: any) => l.name === featureName);
    if (!lim) return featureName;
    if (lim.isUnlimited) return `${lim.name} (Unlimited)`;
    if (lim.limitValue !== null && lim.limitValue !== undefined) {
      return `${lim.name}: ${lim.limitValue}${
        lim.limitUnit ? ` ${lim.limitUnit}` : ""
      }`;
    }
    return lim.name;
  };

  const formatPeriodLabel = (period?: string, billingCycle?: number) => {
    if (billingCycle === 0) return "Month";
    if (billingCycle === 1) return "Quarter";
    if (billingCycle === 2) return "Year";
    if (!period) return "";
    const p = String(period).toLowerCase();
    if (p === "month" || p === "tháng") return "Month";
    if (p === "quarter" || p === "quý") return "Quarter";
    if (p === "year" || p === "năm" || p === "nam") return "Year";
    return period;
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setNewPlan({
      name: plan.name,
      price: plan.price.toString(),
      period: plan.period,
      currency: plan.Currency ?? plan.currency ?? "USD",
      description: plan.Description ?? plan.description ?? "",
      features: plan.features || [],
      limitations: plan.limitations ?? [],
    });
    setShowEditPlanModal(true);
  };

  const handleDeletePlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePlan = async () => {
    if (!selectedPlan) return;
    setIsDeleting(true);
    try {
      const res = await packageService.deletePackage(String(selectedPlan.id));
      if (res.success) {
        setPlans((prev) => prev.filter((plan) => plan.id !== selectedPlan.id));
        try {
          toast.success("Package deleted successfully");
        } catch (e) {}
      } else {
        try {
          toast.error(
            `Delete package failed: ${
              res.error || res.message || "Server error"
            }`
          );
        } catch (e) {}
      }
    } catch (err) {
      try {
        toast.error(
          `Delete package failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } catch (e) {}
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedPlan(null);
    }
  };

  const handleUpdatePlan = () => {
    if (selectedPlan && newPlan.name && newPlan.price) {
      (async () => {
        const billingCycleMap: Record<string, number> = {
          month: 0,
          quarter: 1,
          year: 2,
        };

        const payload: any = {
          Name: newPlan.name,
          Description: newPlan.description || undefined,
          Price: Number(newPlan.price) || 0,
          Currency: newPlan.currency || "USD",
          BillingCycle: billingCycleMap[newPlan.period] ?? 0,
          billingCycle: billingCycleMap[newPlan.period] ?? 0,
          CreatedById: userId || null,
          LimitationIds: newPlan.limitations || [],
        };

        try {
          const res = await packageService.updatePackage(
            String(selectedPlan.id),
            payload
          );

          if (res.success && res.data) {
            const p = res.data;
            const mapped = {
              id: p.id ?? p.ID ?? selectedPlan.id,
              name: p.name ?? payload.name,
              price: p.price ?? payload.price,
              currency:
                p.currency ??
                p.Currency ??
                payload.Currency ??
                selectedPlan.currency ??
                selectedPlan.Currency ??
                "USD",
              period: p.period ?? payload.period,
              billingCycle:
                p.billingCycle ??
                p.BillingCycle ??
                payload.billingCycle ??
                payload.BillingCycle,
              features: p.features ?? payload.features,
              limitations: p.limitations ?? payload.limitations ?? [],
              activeSubscriptions:
                p.activeSubscriptions ?? selectedPlan.activeSubscriptions ?? 0,
              revenue: p.revenue ?? selectedPlan.revenue ?? "",
              status: p.status ?? selectedPlan.status,
            };

            setPlans((prev) =>
              prev.map((plan) => (plan.id === mapped.id ? mapped : plan))
            );
          } else {
            // fallback local update
            const updatedPlan = {
              ...selectedPlan,
              name: newPlan.name,
              price: parseInt(newPlan.price),
              currency:
                newPlan.currency ||
                selectedPlan.currency ||
                selectedPlan.Currency ||
                "USD",
              period: newPlan.period,
              features: newPlan.features,
              limitations: newPlan.limitations ?? [],
              status: selectedPlan.status,
            };
            setPlans((prev) =>
              prev.map((plan) =>
                plan.id === selectedPlan.id ? updatedPlan : plan
              )
            );
          }
        } catch (err) {
          const updatedPlan = {
            ...selectedPlan,
            name: newPlan.name,
            price: parseInt(newPlan.price),
            period: newPlan.period,
            features: newPlan.features,
            limitations: newPlan.limitations ?? [],
            status: selectedPlan.status,
          };
          setPlans((prev) =>
            prev.map((plan) =>
              plan.id === selectedPlan.id ? updatedPlan : plan
            )
          );
        } finally {
          setNewPlan({
            name: "",
            price: "",
            period: "month",
            currency: "USD",
            description: "",
            features: [],
            limitations: [],
          });
          setShowEditPlanModal(false);
          setSelectedPlan(null);
        }
      })();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "#D1FAE5", textColor: "#065F46", text: "Active" },
      trial: { color: "#FEF3C7", textColor: "#92400E", text: "Trial" },
      cancelled: { color: "#FEE2E2", textColor: "#991B1B", text: "Cancelled" },
      expired: { color: "#F3F4F6", textColor: "#6B7280", text: "Expired" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: config.color,
          color: config.textColor,
        }}
      >
        {config.text}
      </span>
    );
  };

  // Per request: don't convert or map — show the response value verbatim.
  const currencySymbol = (codeOrSymbol?: string | null) => {
    if (codeOrSymbol === undefined || codeOrSymbol === null) return "";
    return String(codeOrSymbol);
  };

  // Resolve a limitation entry which may be either an id (string) or an object
  const getLimFromItem = (item: any) => {
    if (!item) return null;
    if (typeof item === "object") return item;
    return limitations.find((l: any) => l.id === item || l.Id === item) || null;
  };

  return (
    <div className="admin-packages">
      <div className="page-header">
        <h1>Package & Subscription Management</h1>
        <p>Manage service plans and customer subscriptions</p>
      </div>

      {/* Packages (single view) */}
      <div className="plans-content">
        <div className="plans-header">
          <h2></h2>
          <button
            className="add-plan-btn"
            onClick={() => setShowAddPlanModal(true)}
          >
            + Add
          </button>
        </div>

        <div className="plans-grid">
          {plans.map((plan: any) => (
            <div key={plan.id} className="plan-card modern pricing-card">
              <div className="card-top pricing-top">
                <div className="card-title">
                  <h3>{plan.name}</h3>
                  {plan.activeSubscriptions > 5 && (
                    <span className="badge-popular">Popular</span>
                  )}
                </div>

                <div className="card-price">
                  <div className="price-wrap">
                    <span className="currency">
                      {currencySymbol(plan.currency ?? plan.Currency)}
                    </span>
                    <span className="price">{plan.price}</span>
                    <span className="period">
                      /{formatPeriodLabel(plan.period, plan.billingCycle)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modern-features pricing-features">
                <ul>
                  {(plan.limitations || [])
                    .slice(0, 6)
                    .map((limItem: any, idx: number) => {
                      const lim = getLimFromItem(limItem);
                      if (!lim)
                        return (
                          <li
                            key={String(limItem) + idx}
                            className="feature-row"
                          >
                            <span className="feature-text">
                              {String(limItem)}
                            </span>
                          </li>
                        );
                      return (
                        <li key={lim.id ?? idx} className="feature-row">
                          <span className="feature-text">
                            {lim.name ?? lim.Name}
                          </span>
                          <span className="feature-meta">
                            {lim.isUnlimited || lim.IsUnlimited
                              ? "Unlimited"
                              : lim.limitValue ?? lim.LimitValue
                              ? `${lim.limitValue ?? lim.LimitValue}${
                                  lim.limitUnit ?? lim.LimitUnit
                                    ? ` ${lim.limitUnit ?? lim.LimitUnit}`
                                    : ""
                                }`
                              : ""}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>

              <div className="plan-footer pricing-footer">
                <div className="plan-limits" />

                <div className="plan-actions modern-actions pricing-actions">
                  <div className="small-actions">
                    {/* Edit button removed per request */}
                    <button
                      className="icon-btn danger"
                      onClick={() => handleDeletePlan(plan)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddPlanModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddPlanModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Package name:</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => handleNewPlanChange("name", e.target.value)}
                  placeholder="Enter package name (e.g. Pro, Advanced...)"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) =>
                      handleNewPlanChange("price", e.target.value)
                    }
                    placeholder="Enter price (e.g. 99)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Period:</label>
                  <select
                    value={newPlan.period}
                    onChange={(e) =>
                      handleNewPlanChange("period", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                    <option value="quarter">Quarter</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) =>
                    handleNewPlanChange("description", e.target.value)
                  }
                  placeholder="Short description (optional)"
                  className="form-input"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Currency:</label>
                <select
                  value={newPlan.currency}
                  onChange={(e) =>
                    handleNewPlanChange("currency", e.target.value)
                  }
                  className="form-select"
                >
                  <option value="USD">USD</option>
                  <option value="VND">VND</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              {/* status removed from create form per request */}

              <div className="form-group">
                <label>Limits:</label>
                <div className="feature-selector">
                  <div className="selected-features-preview">
                    <span className="selected-count">
                      Selected: {newPlan.features.length} limits
                    </span>
                    {newPlan.features.length > 0 && (
                      <div className="selected-features-list">
                        {newPlan.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {renderFeatureLabel(feature)}
                          </span>
                        ))}
                        {newPlan.features.length > 3 && (
                          <span className="more-features">
                            +{newPlan.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="select-features-btn"
                    onClick={() => setShowFeatureSidebar(true)}
                  >
                    {newPlan.features.length === 0
                      ? "Select limits"
                      : "Edit limits"}
                  </button>
                </div>
              </div>
              {/* Limitations are selectable in the Feature Sidebar now; no inline list here */}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAddPlanModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleAddPlan}
                disabled={!newPlan.name || !newPlan.price}
              >
                Add Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Package Modal */}
      {showViewPlanModal && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={() => setShowViewPlanModal(false)}
        >
          <div
            className="modal-content view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Package Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowViewPlanModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="view-plan-info">
                <div className="view-plan-header">
                  <h2>{selectedPlan.name}</h2>
                  <div className="view-plan-price">
                    <span className="price">
                      {currencySymbol(
                        selectedPlan.currency ?? selectedPlan.Currency
                      )}
                      {selectedPlan.price}
                    </span>
                    <span className="period">
                      /
                      {formatPeriodLabel(
                        selectedPlan.period,
                        selectedPlan.billingCycle
                      )}
                    </span>
                  </div>
                </div>

                <div className="view-plan-status">
                  <span className="status-label">Status:</span>
                  {getStatusBadge(selectedPlan.status)}
                </div>

                <div className="view-plan-features">
                  <h4>Limits:</h4>
                  <ul className="features-list">
                    {(selectedPlan.limitations || []).length === 0 && (
                      <li className="feature-item muted">No limits</li>
                    )}
                    {(selectedPlan.limitations || []).map(
                      (limItem: any, i: number) => {
                        const lim = getLimFromItem(limItem);
                        if (!lim)
                          return (
                            <li
                              key={String(limItem) + i}
                              className="feature-item"
                            >
                              <span>{String(limItem)}</span>
                            </li>
                          );
                        return (
                          <li key={lim.id ?? i} className="feature-item">
                            <span className="feature-icon">✓</span>
                            <span>
                              {lim.name ?? lim.Name}
                              {lim.isUnlimited || lim.IsUnlimited
                                ? " (Unlimited)"
                                : lim.limitValue ?? lim.LimitValue
                                ? `: ${lim.limitValue ?? lim.LimitValue}${
                                    lim.limitUnit ?? lim.LimitUnit
                                      ? ` ${lim.limitUnit ?? lim.LimitUnit}`
                                      : ""
                                  }`
                                : ""}
                            </span>
                          </li>
                        );
                      }
                    )}
                  </ul>
                </div>

                <div className="view-plan-stats">
                  <div className="stat-item">
                    <span className="stat-label">Active subscriptions:</span>
                    <span className="stat-value">
                      {selectedPlan.activeSubscriptions}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Monthly revenue:</span>
                    <span className="stat-value">{selectedPlan.revenue}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowViewPlanModal(false)}
              >
                Close
              </button>
              {/* Edit action removed from view modal per request */}
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditPlanModal && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={() => setShowEditPlanModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Package</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditPlanModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Package name:</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => handleNewPlanChange("name", e.target.value)}
                  placeholder="Enter package name (e.g. Pro, Advanced...)"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) =>
                      handleNewPlanChange("price", e.target.value)
                    }
                    placeholder="Enter price (e.g. 99)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Period:</label>
                  <select
                    value={newPlan.period}
                    onChange={(e) =>
                      handleNewPlanChange("period", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                    <option value="quarter">Quarter</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) =>
                    handleNewPlanChange("description", e.target.value)
                  }
                  placeholder="Short description (optional)"
                  className="form-input"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Currency:</label>
                <select
                  value={newPlan.currency}
                  onChange={(e) =>
                    handleNewPlanChange("currency", e.target.value)
                  }
                  className="form-select"
                >
                  <option value="USD">USD</option>
                  <option value="VND">VND</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              {/* status removed from edit form per request */}

              <div className="form-group">
                <label>Limits:</label>
                <div className="feature-selector">
                  <div className="selected-features-preview">
                    <span className="selected-count">
                      Selected: {newPlan.limitations.length} limits
                    </span>
                    {newPlan.features.length > 0 && (
                      <div className="selected-features-list">
                        {newPlan.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {renderFeatureLabel(feature)}
                          </span>
                        ))}
                        {newPlan.features.length > 3 && (
                          <span className="more-features">
                            +{newPlan.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="select-features-btn"
                    onClick={() => setShowFeatureSidebar(true)}
                  >
                    {newPlan.features.length === 0
                      ? "Select limits"
                      : "Edit limits"}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowEditPlanModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleUpdatePlan}
                disabled={!newPlan.name || !newPlan.price}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Confirm Delete Package</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="warning-icon">⚠️</div>
                <h4>
                  Are you sure you want to delete the package "
                  {selectedPlan.name}"?
                </h4>
                <p>
                  This action cannot be undone. All data related to this package
                  will be permanently deleted.
                </p>

                <div className="plan-summary">
                  <div className="summary-item">
                    <span className="label">Package name:</span>
                    <span className="value">{selectedPlan.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Price:</span>
                    <span className="value">
                      {currencySymbol(
                        selectedPlan.currency ?? selectedPlan.Currency
                      )}
                      {selectedPlan.price}/
                      {formatPeriodLabel(
                        selectedPlan.period,
                        selectedPlan.billingCycle
                      )}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Active subscriptions:</span>
                    <span className="value">
                      {selectedPlan.activeSubscriptions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDeletePlan}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Selection Sidebar */}
      {showFeatureSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowFeatureSidebar(false)}
        >
          <div className="feature-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>Select Limits</h3>
              <button
                className="sidebar-close"
                onClick={() => setShowFeatureSidebar(false)}
              >
                ×
              </button>
            </div>

            <div className="sidebar-actions">
              <button
                className="action-btn select-all"
                onClick={handleSelectAllFeatures}
              >
                Select all
              </button>
              <button
                className="action-btn clear-all"
                onClick={handleClearAllFeatures}
              >
                Clear all
              </button>
            </div>

            <div className="sidebar-content">
              {limitations && limitations.length > 0 ? (
                <div className="feature-group">
                  <div className="group-header">
                    <div className="group-icon" style={{ color: "#ff5e13" }}>
                      {/* icon placeholder */}
                      <Users size={20} />
                    </div>
                    <h4 className="group-title">Limits</h4>
                  </div>
                  <div className="features-grid">
                    {limitations.map((lim: any) => (
                      <div
                        key={lim.id}
                        className={`feature-card ${
                          newPlan.features.includes(lim.name) ? "selected" : ""
                        }`}
                        onClick={() => handleToggleLimFeature(lim)}
                      >
                        <div className="feature-card-header">
                          <input
                            type="checkbox"
                            checked={newPlan.features.includes(lim.name)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleLimFeature(lim);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="feature-radio"
                          />
                        </div>
                        <div className="feature-card-body">
                          <div className="feature-title-row">
                            <h5 className="feature-title">{lim.name}</h5>
                            <span className="feature-meta">
                              {lim.isUnlimited
                                ? "Unlimited"
                                : lim.limitValue !== null &&
                                  lim.limitValue !== undefined
                                ? `${lim.limitValue}${
                                    lim.limitUnit ? ` ${lim.limitUnit}` : ""
                                  }`
                                : ""}
                            </span>
                          </div>
                          {lim.description && (
                            <p className="feature-description">
                              {lim.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-limitations" style={{ padding: 16 }}>
                  <p>No limits to display</p>
                </div>
              )}
            </div>

            <div className="sidebar-footer">
              <div className="selected-summary">
                <span>Selected: {newPlan.features.length} limits</span>
              </div>
              <button
                className="confirm-btn"
                onClick={() => setShowFeatureSidebar(false)}
              >
                Confirm
              </button>
            </div>
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
          color: #0d062d;
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
          border-bottom: 2px solid #f3f4f6;
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
          color: #ff5e13;
        }

        .tab-btn.active {
          color: #ff5e13;
          border-bottom-color: #ff5e13;
        }

        .plans-content,
        .subscriptions-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .plans-header,
        .subscriptions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .plans-header h2,
        .subscriptions-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0d062d;
          margin: 0;
        }

        .add-plan-btn {
          background: linear-gradient(135deg, #ffa463 0%, #ff5e13 100%);
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
          grid-template-columns: 1fr; /* fallback: single column on very small screens */
          gap: 24px;
          justify-content: center;
          width: 100%;
        }

        /* Responsive: 2 columns on medium, 3 columns on large screens */
        @media (min-width: 768px) {
          .plans-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1100px) {
          .plans-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .plan-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .plan-card:hover {
          transform: translateY(-4px);
        }

        /* Modern card styles */
        .plan-card.modern {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border-radius: 14px;
          border: 1px solid #f3f4f6;
          width: 100%;
          min-width: 0;
          max-width: 360px; /* keep cards a sensible max width */
          height: 480px;
          background: white;
        }

        .card-top {
          background: linear-gradient(180deg, #ff5e13 0%, #ff8a3d 100%);
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }

        .card-title h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .badge-popular {
          display: inline-block;
          margin-left: 8px;
          background: linear-gradient(90deg, #ffb88c, #ff5e13);
          color: white;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .card-price {
          text-align: right;
        }

        .price-wrap {
          display: flex;
          align-items: baseline;
          gap: 6px;
          justify-content: center;
        }
        .price-wrap .currency {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
        }
        .price-wrap .price {
          font-size: 34px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
        }
        .price-wrap .period {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
        }

        /* pricing-specific */
        .pricing-card {
          display: flex;
          flex-direction: column;
          /* ensure footer sticks to bottom and features scroll */
          justify-content: space-between;
        }

        .pricing-top {
          padding-top: 18px;
          padding-bottom: 18px;
        }

        .modern-features {
          padding: 0;
          background: white;
        }
        .pricing-features ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .pricing-features {
          /* take remaining space and allow scrolling if content overflows */
          flex: 1 1 auto;
          overflow: auto;
        }
        .pricing-features .feature-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          border-top: 1px solid #f3f4f6;
          font-size: 14px;
          color: #0d062d;
        }
        .pricing-features .feature-row:first-child {
          border-top: none;
        }
        .feature-meta {
          color: #6b7280;
          font-weight: 600;
          font-size: 13px;
        }
        .modern-features ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .modern-features .feature-line {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0d062d;
          font-size: 14px;
        }
        .modern-features .feature-line svg {
          flex: 0 0 18px;
        }

        .plan-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          background: #ffffff;
          border-top: 1px solid #f3f4f6;
        }

        .plan-limits {
          flex: 1 1 auto;
          min-width: 0;
        }

        .plan-limits ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .plan-limits .more-limits {
          margin-top: 6px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
        }

        .limit-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 8px;
          background: #fff;
        }

        .limit-name {
          font-weight: 600;
          color: #0d062d;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .limit-meta {
          color: #6b7280;
          font-size: 13px;
          margin-left: 8px;
          white-space: nowrap;
        }

        .btn-delete:disabled,
        .btn-cancel:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .modern-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .select-btn {
          background: linear-gradient(90deg, #ff8a3d, #ff5e13);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }
        .select-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 94, 19, 0.18);
        }

        .small-actions {
          display: flex;
          gap: 8px;
        }
        .icon-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
        }
        .icon-btn.danger {
          background: linear-gradient(90deg, #ff7b7b, #e02424);
          color: white;
          border: transparent;
        }

        .signup-btn {
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          padding: 10px 22px;
          border-radius: 24px;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }
        .signup-btn:hover {
          transform: translateY(-2px);
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
          color: #0d062d;
          margin: 0;
        }

        .plan-price {
          text-align: right;
        }

        .price {
          font-size: 24px;
          font-weight: 700;
          color: #ff5e13;
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
          color: #0d062d;
        }

        .feature-icon {
          color: #10b981;
          font-weight: bold;
        }

        .plan-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f9f4ee;
          border-radius: 10px;
          flex-grow: 1;
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
          color: #0d062d;
        }

        .plan-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #f3f4f6;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 10px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          min-width: 0;
          white-space: nowrap;
        }

        .action-btn::before {
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

        .action-btn:hover::before {
          left: 100%;
        }

        .action-btn.edit {
          color: #ff5e13;
          border-color: #ff5e13;
          background: linear-gradient(135deg, #fff5f0 0%, #ffe4d6 100%);
        }

        .action-btn.edit:hover {
          background: linear-gradient(135deg, #ff5e13 0%, #e04a0c 100%);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 94, 19, 0.4);
          border-color: #e04a0c;
        }

        .action-btn.view {
          color: #3b82f6;
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .action-btn.view:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
          border-color: #1d4ed8;
        }

        .action-btn.delete {
          color: #dc2626;
          border-color: #dc2626;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .action-btn.delete:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4);
          border-color: #b91c1c;
        }

        .action-btn:active {
          transform: translateY(0);
          transition: transform 0.1s;
        }

        .action-btn span {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.025em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .subscriptions-filters {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
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
          background: #f9f4ee;
          padding: 16px 20px;
          font-weight: 600;
          color: #0d062d;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ffa463 0%, #ff5e13 100%);
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
          background: #dbeafe;
          color: #1e40af;
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
          background: #f3f4f6;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: #e5e7eb;
          transform: scale(1.1);
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

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }

        .modal-content::-webkit-scrollbar {
          display: none; /* WebKit */
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

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #0d062d;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #0d062d;
          background: white;
          transition: border-color 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #ff5e13;
          box-shadow: 0 0 0 3px rgba(255, 94, 19, 0.1);
        }

        .feature-input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          align-items: center;
        }

        .feature-input-group .form-input {
          flex: 1;
        }

        .remove-feature-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          transition: background 0.2s ease;
        }

        .remove-feature-btn:hover {
          background: #fecaca;
        }

        .add-feature-btn {
          padding: 8px 16px;
          border: 2px dashed #ff5e13;
          background: white;
          color: #ff5e13;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-feature-btn:hover {
          background: #fff5f0;
          border-style: solid;
        }

        /* Feature Selection Styles */
        .feature-selection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px;
          background: #f9f4ee;
          border-radius: 8px;
        }

        .selected-count {
          font-size: 14px;
          font-weight: 600;
          color: #0d062d;
        }

        .feature-actions {
          display: flex;
          gap: 8px;
        }

        .select-all-btn,
        .clear-all-btn {
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-all-btn {
          color: #059669;
          border-color: #059669;
        }

        .select-all-btn:hover {
          background: #ecfdf5;
        }

        .clear-all-btn {
          color: #dc2626;
          border-color: #dc2626;
        }

        .clear-all-btn:hover {
          background: #fef2f2;
        }

        .feature-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
          padding: 8px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: #fafafa;
        }

        .feature-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .feature-option:hover {
          border-color: #ff5e13;
          background: #fff5f0;
        }

        .feature-option.selected {
          border-color: #ff5e13;
          background: #fff5f0;
        }

        .feature-checkbox {
          margin: 0;
          cursor: pointer;
        }

        .feature-text {
          font-size: 13px;
          color: #0d062d;
          flex: 1;
        }

        /* Feature Selector Styles */
        .feature-selector {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          background: #fafafa;
        }
        .limitations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 6px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          max-height: 220px;
          overflow: auto;
        }

        .limit-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .limit-item input {
          margin-right: 8px;
        }

        .limit-name {
          font-weight: 600;
          color: #0d062d;
        }

        .limit-desc {
          color: #6b7280;
          font-size: 12px;
        }

        .selected-features-preview {
          margin-bottom: 12px;
        }

        .selected-count {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #0d062d;
          margin-bottom: 8px;
        }

        .selected-features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .feature-tag {
          background: #ff5e13;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .more-features {
          background: #6b7280;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .select-features-btn {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #ffa463 0%, #ff5e13 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .select-features-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        /* Sidebar Styles */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.3s ease;
        }

        .feature-sidebar {
          width: 500px;
          height: 100vh;
          background: white;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9f4ee;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0d062d;
        }

        .sidebar-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .sidebar-close:hover {
          background: #f3f4f6;
        }

        .sidebar-actions {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .sidebar-actions .action-btn {
          flex: 1;
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-actions .action-btn.select-all {
          color: #059669;
          border-color: #059669;
        }

        .sidebar-actions .action-btn.select-all:hover {
          background: #ecfdf5;
        }

        .sidebar-actions .action-btn.clear-all {
          color: #dc2626;
          border-color: #dc2626;
        }

        .sidebar-actions .action-btn.clear-all:hover {
          background: #fef2f2;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }

        .sidebar-content::-webkit-scrollbar {
          display: none; /* WebKit */
        }

        /* Feature Groups */
        .feature-group {
          margin-bottom: 24px;
        }

        .group-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #f9f4ee;
          border-radius: 8px;
          border-left: 4px solid #ff5e13;
        }

        .group-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .group-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #0d062d;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .feature-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .feature-card:hover {
          border-color: #ff5e13;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.1);
        }

        .feature-card.selected {
          border-color: #ff5e13;
          background: #fff5f0;
        }

        .feature-card.selected::before {
          content: "";
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ff5e13;
          border-radius: 50%;
        }

        .feature-card-header {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .feature-radio {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #ff5e13;
          position: relative;
          z-index: 10;
        }

        .feature-card-body {
          text-align: center;
        }

        .feature-title-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
        }

        .feature-meta {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }

        .feature-title {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: #0d062d;
          line-height: 1.3;
        }

        .feature-description {
          margin: 0;
          font-size: 11px;
          color: #6b7280;
          line-height: 1.4;
        }

        .sidebar-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9f4ee;
        }

        .selected-summary {
          margin-bottom: 12px;
          text-align: center;
        }

        .selected-summary span {
          font-size: 14px;
          font-weight: 600;
          color: #0d062d;
        }

        .confirm-btn {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #ffa463 0%, #ff5e13 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .confirm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        /* Responsive Grid */
        @media (max-width: 1200px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .feature-sidebar {
            width: 100%;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .group-header {
            padding: 10px 12px;
          }

          .group-title {
            font-size: 14px;
          }

          .feature-card {
            padding: 12px;
          }

          .feature-title {
            font-size: 12px;
          }

          .feature-description {
            font-size: 10px;
          }
        }

        /* Responsive: make pricing cards full-width on small screens */
        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .plan-card.modern {
            width: 100%;
            min-width: 0;
            max-width: 100%;
            height: auto;
          }
          .pricing-features {
            max-height: none;
            overflow: visible;
          }
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          margin-top: 24px;
        }

        .btn-cancel,
        .btn-save {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-cancel:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-save {
          background: linear-gradient(135deg, #ffa463 0%, #ff5e13 100%);
          color: white;
          border: 2px solid transparent;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

        .btn-save:disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-edit {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: 2px solid transparent;
        }

        .btn-edit:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-delete {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: 2px solid transparent;
        }

        .btn-delete:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .btn-edit,
        .btn-delete {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        /* View Modal Styles */
        .view-modal {
          max-width: 500px;
        }

        .view-plan-info {
          padding: 0;
        }

        .view-plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .view-plan-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #0d062d;
        }

        .view-plan-price {
          text-align: right;
        }

        .view-plan-price .price {
          font-size: 28px;
          font-weight: 700;
          color: #ff5e13;
        }

        .view-plan-price .period {
          font-size: 16px;
          color: #787486;
        }

        .view-plan-status {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .status-label {
          font-size: 14px;
          font-weight: 600;
          color: #0d062d;
        }

        .view-plan-features {
          margin-bottom: 20px;
        }

        .view-plan-features h4 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #0d062d;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-list .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #0d062d;
        }

        .features-list .feature-icon {
          color: #10b981;
          font-weight: bold;
        }

        .view-plan-stats {
          background: #f9f4ee;
          border-radius: 10px;
          padding: 16px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .stat-item:last-child {
          margin-bottom: 0;
        }

        .stat-item .stat-label {
          font-size: 14px;
          color: #787486;
        }

        .stat-item .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #0d062d;
        }

        /* Delete Modal Styles */
        .delete-modal {
          max-width: 450px;
        }

        .delete-confirmation {
          text-align: center;
          padding: 20px 0;
        }

        .warning-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .delete-confirmation h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #0d062d;
        }

        .delete-confirmation p {
          margin: 0 0 24px 0;
          font-size: 14px;
          color: #787486;
          line-height: 1.5;
        }

        .plan-summary {
          background: #f9f4ee;
          border-radius: 10px;
          padding: 16px;
          text-align: left;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .summary-item:last-child {
          margin-bottom: 0;
        }

        .summary-item .label {
          font-size: 14px;
          color: #787486;
        }

        .summary-item .value {
          font-size: 14px;
          font-weight: 600;
          color: #0d062d;
        }

        @media (max-width: 768px) {
          .admin-plans {
            padding: 16px;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plans-header,
          .subscriptions-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-content {
            width: 95%;
            margin: 20px;
          }

          .modal-header {
            padding: 20px 20px 0 20px;
          }

          .modal-body {
            padding: 0 20px;
          }

          .modal-footer {
            padding: 20px;
          }

          /* Mobile button improvements */
          .plan-actions {
            flex-direction: column;
            gap: 10px;
            padding-top: 16px;
          }

          .action-btn {
            padding: 16px 12px;
            font-size: 13px;
            white-space: nowrap;
            border-radius: 10px;
          }

          .action-btn span {
            font-size: 13px;
            white-space: nowrap;
          }

          .action-btn:hover {
            transform: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }

        @media (max-width: 480px) {
          .plan-actions {
            gap: 8px;
            padding-top: 14px;
          }

          .action-btn {
            padding: 14px 10px;
            font-size: 12px;
            white-space: nowrap;
            border-radius: 8px;
          }

          .action-btn span {
            font-size: 12px;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPackages;
