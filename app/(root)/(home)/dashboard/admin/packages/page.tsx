"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Users } from "lucide-react";

import packageService from "@/services/packageService";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/useUser";
import limitationService from "@/services/limitationService";
import {
  PricingCard,
  PricingPlan,
  PricingPlanFeature,
} from "@/components/pricing";
import "./packages.scss";

const AdminPackages = () => {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
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
            description: p.description ?? p.Description ?? "",
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
            toast.error(`Failed to create package: ${res.error}`);
          }
          if (res.success && res.data) {
            const p = res.data;
            const mapped = {
              id: p.id ?? p.ID,
              name: p.name ?? p.title ?? newPlan.name,
              price: p.price ?? payload.Price,
              currency: p.currency ?? p.Currency ?? newPlan.currency ?? "USD",
              period: p.period ?? newPlan.period,
              description: p.description ?? newPlan.description,
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
            toast.success("Package created successfully!");
          } else {
            const planToAdd = {
              id: plans.length + 1,
              name: newPlan.name,
              price: parseInt(newPlan.price),
              currency: newPlan.currency || "USD",
              period: newPlan.period,
              description: newPlan.description,
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

  const handleEditPlan = async (plan: any) => {
    setSelectedPlan(plan);

    // Lấy dữ liệu chi tiết từ API để có đầy đủ thông tin limitations
    try {
      const res = await packageService.getPackageById(String(plan.id));
      if (res.success && res.data) {
        const packageData = res.data;

        // Map limitations từ API response
        const limitationIds = (
          packageData.limitations ||
          packageData.Limitations ||
          []
        ).map((lim: any) => {
          if (typeof lim === "object") return lim.id ?? lim.Id;
          return lim;
        });

        const featureNames = (
          packageData.limitations ||
          packageData.Limitations ||
          []
        )
          .map((lim: any) => {
            if (typeof lim === "object") return lim.name ?? lim.Name;
            return limitations.find((l: any) => l.id === lim)?.name || "";
          })
          .filter(Boolean);

        setNewPlan({
          name: packageData.name ?? packageData.Name ?? plan.name,
          price: String(packageData.price ?? packageData.Price ?? plan.price),
          period: packageData.period ?? plan.period ?? "month",
          currency:
            packageData.currency ??
            packageData.Currency ??
            plan.currency ??
            "USD",
          description:
            packageData.description ??
            packageData.Description ??
            plan.description ??
            "",
          features: featureNames,
          limitations: limitationIds,
        });
      } else {
        // Fallback nếu API không trả về
        setNewPlan({
          name: plan.name,
          price: plan.price.toString(),
          period: plan.period,
          currency: plan.Currency ?? plan.currency ?? "USD",
          description: plan.Description ?? plan.description ?? "",
          features: plan.features || [],
          limitations: (plan.limitations || []).map((lim: any) =>
            typeof lim === "object" ? lim.id ?? lim.Id : lim
          ),
        });
      }
    } catch (err) {
      // Fallback nếu có lỗi
      setNewPlan({
        name: plan.name,
        price: plan.price.toString(),
        period: plan.period,
        currency: plan.Currency ?? plan.currency ?? "USD",
        description: plan.Description ?? plan.description ?? "",
        features: plan.features || [],
        limitations: (plan.limitations || []).map((lim: any) =>
          typeof lim === "object" ? lim.id ?? lim.Id : lim
        ),
      });
    }

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
        toast.success("Package deleted successfully!");
      } else {
        toast.error(
          `Failed to delete package: ${
            res.error || res.message || "Server error"
          }`
        );
      }
    } catch (err) {
      toast.error(
        `Failed to delete package: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
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

          if (res.success) {
            // Map features names từ limitations đã chọn
            const selectedFeatureNames = newPlan.limitations
              .map((limId: any) => {
                const lim = limitations.find((l: any) => l.id === limId);
                return lim?.name || "";
              })
              .filter(Boolean);

            const mapped = {
              id: res.data?.id ?? res.data?.ID ?? selectedPlan.id,
              name: res.data?.name ?? newPlan.name,
              price: res.data?.price ?? Number(newPlan.price),
              currency:
                res.data?.currency ??
                res.data?.Currency ??
                newPlan.currency ??
                "USD",
              period: res.data?.period ?? newPlan.period,
              billingCycle:
                res.data?.billingCycle ??
                res.data?.BillingCycle ??
                billingCycleMap[newPlan.period],
              description: res.data?.description ?? newPlan.description,
              features: selectedFeatureNames,
              limitations: res.data?.limitations ?? newPlan.limitations,
              activeSubscriptions:
                res.data?.activeSubscriptions ??
                selectedPlan.activeSubscriptions ??
                0,
              revenue: res.data?.revenue ?? selectedPlan.revenue ?? "",
              status: res.data?.status ?? selectedPlan.status ?? "active",
            };

            setPlans((prev) =>
              prev.map((plan) => (plan.id === mapped.id ? mapped : plan))
            );

            toast.success("Package updated successfully!");
          } else {
            toast.error(
              `Failed to update package: ${res.error || "Server error"}`
            );

            // Fallback local update
            const selectedFeatureNames = newPlan.limitations
              .map((limId: any) => {
                const lim = limitations.find((l: any) => l.id === limId);
                return lim?.name || "";
              })
              .filter(Boolean);

            const updatedPlan = {
              ...selectedPlan,
              name: newPlan.name,
              price: parseInt(newPlan.price),
              currency: newPlan.currency || selectedPlan.currency || "USD",
              period: newPlan.period,
              description: newPlan.description,
              features: selectedFeatureNames,
              limitations: newPlan.limitations,
            };
            setPlans((prev) =>
              prev.map((plan) =>
                plan.id === selectedPlan.id ? updatedPlan : plan
              )
            );
          }
        } catch (err) {
          toast.error(
            `Failed to update package: ${
              err instanceof Error ? err.message : String(err)
            }`
          );

          // Fallback local update
          const selectedFeatureNames = newPlan.limitations
            .map((limId: any) => {
              const lim = limitations.find((l: any) => l.id === limId);
              return lim?.name || "";
            })
            .filter(Boolean);

          const updatedPlan = {
            ...selectedPlan,
            name: newPlan.name,
            price: parseInt(newPlan.price),
            period: newPlan.period,
            description: newPlan.description,
            features: selectedFeatureNames,
            limitations: newPlan.limitations,
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

  const getLimFromItem = (item: any) => {
    if (!item) return null;
    if (typeof item === "object") return item;
    return limitations.find((l: any) => l.id === item || l.Id === item) || null;
  };

  // Convert plan to PricingPlan format for the component
  const convertToPricingPlan = (plan: any): PricingPlan => {
    const planLimitations: PricingPlanFeature[] = (plan.limitations || []).map(
      (limItem: any) => {
        const lim = getLimFromItem(limItem);
        if (!lim) {
          return {
            name: String(limItem),
          };
        }
        return {
          name: lim.name ?? lim.Name,
          isUnlimited: lim.isUnlimited || lim.IsUnlimited,
          value:
            lim.limitValue ?? lim.LimitValue
              ? `${lim.limitValue ?? lim.LimitValue}${
                  lim.limitUnit ?? lim.LimitUnit
                    ? ` ${lim.limitUnit ?? lim.LimitUnit}`
                    : ""
                }`
              : undefined,
        };
      }
    );

    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency ?? plan.Currency,
      period: plan.period,
      billingCycle: plan.billingCycle,
      description: plan.description ?? plan.Description,
      limitations: planLimitations,
      featured: (plan.activeSubscriptions ?? 0) > 5,
      status: plan.status,
    };
  };

  return (
    <div className="admin-packages">
      <div className="page-header">
        <h1>Package Management</h1>
        <p>Manage service packages and customer subscriptions</p>
      </div>

      <div className="packages-content">
        <div className="packages-header">
          <h2>Package List</h2>
          <button
            className="add-package-btn"
            onClick={() => setShowAddPlanModal(true)}
          >
            + Add New Package
          </button>
        </div>

        <div className="pricing-grid">
          {plans.map((plan: any) => (
            <PricingCard
              key={plan.id}
              plan={convertToPricingPlan(plan)}
              showActions={true}
              actionType="button"
              featuredLabel="Popular"
              showEdit={true}
              showDelete={true}
              onEdit={() => handleEditPlan(plan)}
              onDelete={() => handleDeletePlan(plan)}
            />
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
              <h3>Add New Package</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddPlanModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Package Name:</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => handleNewPlanChange("name", e.target.value)}
                  placeholder="Enter package name (e.g., Pro, Advanced...)"
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
                    placeholder="Enter price (e.g., 99)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Billing Cycle:</label>
                  <select
                    value={newPlan.period}
                    onChange={(e) =>
                      handleNewPlanChange("period", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="quarter">Quarterly</option>
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
                <label>Limitations:</label>
                <div className="feature-selector">
                  <div className="selected-features-preview">
                    <span className="selected-count">
                      Selected: {newPlan.features.length} limitation(s)
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
                      ? "Select Limitations"
                      : "Edit Limitations"}
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
                <label>Package Name:</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => handleNewPlanChange("name", e.target.value)}
                  placeholder="Enter package name (e.g., Pro, Advanced...)"
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
                    placeholder="Enter price (e.g., 99)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Billing Cycle:</label>
                  <select
                    value={newPlan.period}
                    onChange={(e) =>
                      handleNewPlanChange("period", e.target.value)
                    }
                    className="form-select"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="quarter">Quarterly</option>
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
                <label>Limitations:</label>
                <div className="feature-selector">
                  <div className="selected-features-preview">
                    <span className="selected-count">
                      Selected: {newPlan.limitations.length} limitation(s)
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
                      ? "Select Limitations"
                      : "Edit Limitations"}
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
                <h4>Are you sure you want to delete "{selectedPlan.name}"?</h4>
                <p>
                  This action cannot be undone. All data related to this package
                  will be permanently deleted.
                </p>

                <div className="plan-summary">
                  <div className="summary-item">
                    <span className="label">Package Name:</span>
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
                    <span className="label">Active Subscriptions:</span>
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
                {isDeleting ? "Deleting..." : "Delete Package"}
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
              <h3>Select Limitations</h3>
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
                Select All
              </button>
              <button
                className="action-btn clear-all"
                onClick={handleClearAllFeatures}
              >
                Clear All
              </button>
            </div>

            <div className="sidebar-content">
              {limitations && limitations.length > 0 ? (
                <div className="feature-group">
                  <div className="group-header">
                    <div className="group-icon" style={{ color: "#ff5e13" }}>
                      <Users size={20} />
                    </div>
                    <h4 className="group-title">Limitations</h4>
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
                  <p>No limitations to display</p>
                </div>
              )}
            </div>

            <div className="sidebar-footer">
              <div className="selected-summary">
                <span>Selected: {newPlan.features.length} limitation(s)</span>
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
    </div>
  );
};

export default AdminPackages;
