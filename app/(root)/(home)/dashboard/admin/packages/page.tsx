"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  X,
  Check,
  AlertTriangle,
  Search,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";

import packageService from "@/services/packageService";
import { toast } from "react-toastify";
import { useUser } from "@/hooks/useUser";
import limitationService from "@/services/limitationService";
import {
  PricingCard,
  PricingPlan,
  PricingPlanFeature,
} from "@/components/pricing";
import "../../../../../styles/packages.scss";

const AdminPackages = () => {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeatureSidebar, setShowFeatureSidebar] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    period: "month",
    billingCycle: "",
    currency: "VND",
    description: "",
    features: [] as string[], // Store limitation IDs
    limitations: [] as (object | string | number)[], // Store limitation IDs
  });

  // Format price with dot separator (e.g., 20.000)
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "0";
    return numPrice.toLocaleString("de-DE");
  };

  const [limitations, setLimitations] = useState<any[]>([]);
  const [loadingLimitations, setLoadingLimitations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [plans, setPlans] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { userId } = useUser();

  // Stats calculations
  const totalPackages = plans.length;
  const activePackages = plans.filter((p) => p.status === "active").length;
  const totalSubscriptions = plans.reduce(
    (sum, p) => sum + (p.activeSubscriptions || 0),
    0
  );
  const totalRevenue = plans.reduce((sum, p) => {
    const revenue = p.revenue
      ? parseFloat(String(p.revenue).replace(/[^0-9.-]+/g, ""))
      : 0;
    return sum + (isNaN(revenue) ? 0 : revenue);
  }, 0);

  // Filter plans by search query
  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.description &&
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    (async () => {
      try {
        const res = await packageService.getPackages();
        if (res.success && mounted && res.data) {
          const items: any[] = Array.isArray(res.data)
            ? res.data
            : res.data.items ?? res.data;

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
      } finally {
        if (mounted) setIsLoading(false);
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
            limitationType: it.LimitationType ?? it.limitationType,
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
    if (newPlan.name && newPlan.price && newPlan.billingCycle) {
      (async () => {
        const billingCycleValue = Number(newPlan.billingCycle) || 0;

        const payload: any = {
          Name: newPlan.name,
          Description: newPlan.description || undefined,
          Price: Number(newPlan.price) || 0,
          Currency: newPlan.currency || "USD",
          BillingCycle: billingCycleValue,
          billingCycle: billingCycleValue,
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
              currency: "VND",
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
              currency: "VND",
              period: newPlan.period,
              description: newPlan.description,
              billingCycle: billingCycleValue,
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
            currency: newPlan.currency || "VND",
            period: newPlan.period,
            billingCycle: billingCycleValue,
            features: newPlan.features,
            activeSubscriptions: 0,
            revenue: "0",
            status: "active",
          };
          setPlans((prev) => [...prev, planToAdd]);
        }

        setNewPlan({
          name: "",
          price: "",
          period: "month",
          billingCycle: "",
          currency: "VND",
          description: "",
          features: [],
          limitations: [],
        });
        setShowAddPlanModal(false);
      })();
    }
  };

  const handleNewPlanChange = (field: string, value: any) => {
    // Validate billingCycle - must be positive integer
    if (field === "billingCycle") {
      const numValue = Number(value);
      if (value !== "" && numValue < 1) {
        return; // Don't allow values less than 1
      }
    }
    
    setNewPlan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle toggle limitation selection
  const handleToggleLimitation = (limitation: any) => {
    setNewPlan((prev) => {
      const currentLimIds = prev.limitations || [];
      const currentFeatureIds = prev.features || [];
      const limId = limitation.id;
      const limType = limitation.limitationType;

      // Check if this limitation is already selected
      const isSelected = currentLimIds.includes(limId);

      if (isSelected) {
        // Remove if already selected
        return {
          ...prev,
          limitations: currentLimIds.filter((id: any) => id !== limId),
          features: currentFeatureIds.filter((id: any) => id !== limId),
        };
      }

      // Find if there's already a limitation of the same type selected
      const sameTypeLimit = limitations.find((l: any) => 
        l.limitationType === limType && currentLimIds.includes(l.id)
      );

      let newLimIds = currentLimIds;
      let newFeatureIds = currentFeatureIds;

      // If same type exists, remove it first
      if (sameTypeLimit) {
        newLimIds = currentLimIds.filter((id: any) => id !== sameTypeLimit.id);
        newFeatureIds = currentFeatureIds.filter((id: any) => id !== sameTypeLimit.id);
      }

      // Add the new limitation
      return {
        ...prev,
        limitations: [...newLimIds, limId],
        features: [...newFeatureIds, limId],
      };
    });
  };

  // Clear all limitations
  const handleClearAllLimitations = () => {
    setNewPlan((prev) => ({
      ...prev,
      limitations: [],
      features: [],
    }));
  };

  const renderFeatureLabel = (featureId: string) => {
    const lim = limitations.find((l: any) => l.id === featureId);
    if (!lim) return featureId;
    if (lim.isUnlimited) return `${lim.name} (Unlimited)`;
    if (lim.limitValue !== null && lim.limitValue !== undefined) {
      return `${lim.name}: ${lim.limitValue}${
        lim.limitUnit ? ` ${lim.limitUnit}` : ""
      }`;
    }
    return lim.name;
  };

  // const formatPeriodLabel = (period?: string, billingCycle?: number) => {
  //   return billingCycle + pe;
  // };

  const handleEditPlan = async (plan: any) => {
    setSelectedPlan(plan);

    try {
      const res = await packageService.getPackageById(String(plan.id));
      if (res.success && res.data) {
        const packageData = res.data;
        const apiLimitations = packageData.limitations || packageData.Limitations || [];
        
        // Convert API limitations to limitation IDs
        const limitationIds = apiLimitations.map((lim: any) => {
          if (typeof lim === "object") return lim.id;
          return lim;
        });

        setNewPlan({
          name: packageData.name ?? packageData.Name ?? plan.name,
          price: String(packageData.price ?? packageData.Price ?? plan.price),
          period: packageData.period ?? plan.period ?? "month",
          billingCycle: String(packageData.billingCycle ?? packageData.BillingCycle ?? plan.billingCycle ?? ""),
          currency: packageData.currency ?? packageData.Currency ?? plan.currency ?? "USD",
          description: packageData.description ?? packageData.Description ?? plan.description ?? "",
          features: limitationIds,
          limitations: limitationIds,
        });
      } else {
        // Fallback
        const limitationIds = (plan.limitations || []).map((lim: any) =>
          typeof lim === "object" ? lim.id : lim
        );

        setNewPlan({
          name: plan.name,
          price: plan.price.toString(),
          period: plan.period,
          billingCycle: String(plan.billingCycle ?? ""),
          currency: plan.currency ?? "USD",
          description: plan.description ?? "",
          features: limitationIds,
          limitations: limitationIds,
        });
      }
    } catch (err) {
      // Fallback on error
      const limitationIds = (plan.limitations || []).map((lim: any) =>
        typeof lim === "object" ? lim.id : lim
      );

      setNewPlan({
        name: plan.name,
        price: String(plan.price),
        period: plan.period,
        billingCycle: String(plan.billingCycle),
        currency: plan.currency,
        description: plan.description,
        features: limitationIds,
        limitations: limitationIds,
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
    if (selectedPlan && newPlan.name && newPlan.price && newPlan.billingCycle) {
      (async () => {
        const billingCycleValue = Number(newPlan.billingCycle) || 0;

        const payload: any = {
          Name: newPlan.name,
          Description: newPlan.description || undefined,
          Price: Number(newPlan.price) || 0,
          Currency: "VND",
          BillingCycle: billingCycleValue,
          billingCycle: billingCycleValue,
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
              currency: "VND",
              period: res.data?.period ?? newPlan.period,
              billingCycle:
                res.data?.billingCycle ??
                res.data?.BillingCycle ??
                billingCycleValue,
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
              currency: "VND",
              period: newPlan.period,
              billingCycle: billingCycleValue,
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
            billingCycle: billingCycleValue,
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
            billingCycle: "",
            currency: "VND",
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
        
        // Keep limitValue and name separate
        return {
          name: lim.name ?? lim.Name,
          limitValue: (lim.limitValue ?? lim.LimitValue) ?? null,
          isUnlimited: lim.isUnlimited || lim.IsUnlimited,
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
      {/* Hero Header */}
      <div className="packages-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Package size={32} />
          </div>
          <div className="hero-text">
            <h1>Package Management</h1>
            <p>Create and manage subscription packages for your customers</p>
          </div>
        </div>
        <button
          className="add-package-btn"
          onClick={() => setShowAddPlanModal(true)}
        >
          <Plus size={20} />
          <span>Create Package</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="packages-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Packages Content */}
      <div className="packages-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading packages...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={48} />
            </div>
            <h3>No packages found</h3>
            <p>
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first package to get started"}
            </p>
            {!searchQuery && (
              <button
                className="add-package-btn secondary"
                onClick={() => setShowAddPlanModal(true)}
              >
                <Plus size={18} />
                <span>Create Package</span>
              </button>
            )}
          </div>
        ) : (
          <div
            className={`pricing-grid ${viewMode === "list" ? "list-view" : ""}`}
          >
            {filteredPlans.map((plan: any) => (
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
        )}
      </div>

      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddPlanModal(false)}
        >
          <div
            className="modal-content modern"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon add">
                  <Plus size={20} />
                </div>
                <div>
                  <h3>Create New Package</h3>
                  <p>Add a new subscription package for your customers</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowAddPlanModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h4 className="section-title">Basic Information</h4>
                <div className="form-group">
                  <label>
                    Package Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) =>
                      handleNewPlanChange("name", e.target.value)
                    }
                    placeholder="e.g., Professional, Enterprise..."
                    className={`form-input ${
                      !newPlan.name &&
                      (newPlan.price || newPlan.limitations.length > 0)
                        ? "input-error"
                        : ""
                    }`}
                  />
                  {!newPlan.name &&
                    (newPlan.price || newPlan.limitations.length > 0) && (
                      <span className="error-text">
                        Package name is required
                      </span>
                    )}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) =>
                      handleNewPlanChange("description", e.target.value)
                    }
                    placeholder="Brief description of what's included..."
                    className="form-input"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Pricing</h4>
                <div className="form-row three-cols">
                  <div className="form-group">
                    <label>
                      Price (VND) <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="currency-icon">VND</span>
                      <input
                        type="number"
                        value={newPlan.price}
                        onChange={(e) =>
                          handleNewPlanChange("price", e.target.value)
                        }
                        placeholder="20000"
                        className={`form-input ${
                          (!newPlan.price &&
                            (newPlan.name || newPlan.limitations.length > 0)) ||
                          Number(newPlan.price) < 0
                            ? "input-error"
                            : ""
                        }`}
                        min="0"
                      />
                    </div>
                    {!newPlan.price &&
                      (newPlan.name || newPlan.limitations.length > 0) && (
                        <span className="error-text">Price is required</span>
                      )}
                    {Number(newPlan.price) < 0 && (
                      <span className="error-text">
                        Price cannot be negative
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <div className="currency-display">
                      <span>VND</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>
                      Billing Cycle (months) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={newPlan.billingCycle}
                      onChange={(e) =>
                        handleNewPlanChange("billingCycle", e.target.value)
                      }
                      placeholder="e.g., 1, 3, 12..."
                      className="form-input"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Features & Limitations</h4>
                <div className="form-group">
                  <div
                    className={`feature-selector modern ${
                      newPlan.limitations.length === 0 &&
                      newPlan.name &&
                      newPlan.price
                        ? "selector-error"
                        : ""
                    }`}
                  >
                    <div className="selected-features-preview">
                      <div className="preview-header">
                        <span className="selected-count">
                          <Check size={16} />
                          {newPlan.features.length} limitation(s) selected
                        </span>
                      </div>
                      {newPlan.features.length > 0 && (
                        <div className="selected-features-list">
                          {newPlan.features
                            .slice(0, 4)
                            .map((feature, index) => (
                              <span key={index} className="feature-tag">
                                {renderFeatureLabel(feature)}
                              </span>
                            ))}
                          {newPlan.features.length > 4 && (
                            <span className="more-features">
                              +{newPlan.features.length - 4} more
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
                      <Sparkles size={16} />
                      {newPlan.features.length === 0
                        ? "Select Limitations"
                        : "Manage Limitations"}
                    </button>
                  </div>
                  {newPlan.limitations.length === 0 &&
                    newPlan.name &&
                    newPlan.price && (
                      <span className="error-text">
                        Please select at least one limitation
                      </span>
                    )}
                </div>
              </div>
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
                disabled={
                  !newPlan.name ||
                  !newPlan.price ||
                  !newPlan.billingCycle ||
                  Number(newPlan.price) < 0 ||
                  newPlan.limitations.length === 0
                }
              >
                <Plus size={16} />
                Create Package
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
          <div
            className="modal-content modern"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon edit">
                  <Package size={20} />
                </div>
                <div>
                  <h3>Edit Package</h3>
                  <p>Update the details of "{selectedPlan.name}"</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowEditPlanModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h4 className="section-title">Basic Information</h4>
                <div className="form-group">
                  <label>Package Name</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) =>
                      handleNewPlanChange("name", e.target.value)
                    }
                    placeholder="e.g., Professional, Enterprise..."
                    className={`form-input ${
                      !newPlan.name ? "input-error" : ""
                    }`}
                  />
                  {!newPlan.name && (
                    <span className="error-text">Package name is required</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) =>
                      handleNewPlanChange("description", e.target.value)
                    }
                    placeholder="Brief description of what's included..."
                    className="form-input"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Pricing</h4>
                <div className="form-row three-cols">
                  <div className="form-group">
                    <label>Price (VND)</label>
                    <div className="input-with-icon">
                      <span className="currency-icon">VND</span>
                      <input
                        type="number"
                        value={newPlan.price}
                        onChange={(e) =>
                          handleNewPlanChange("price", e.target.value)
                        }
                        placeholder="20000"
                        className={`form-input ${
                          !newPlan.price || Number(newPlan.price) < 0
                            ? "input-error"
                            : ""
                        }`}
                        min="0"
                      />
                    </div>
                    {!newPlan.price && (
                      <span className="error-text">Price is required</span>
                    )}
                    {Number(newPlan.price) < 0 && (
                      <span className="error-text">
                        Price cannot be negative
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <div className="currency-display">
                      <span>VND</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>
                      Billing Cycle (months) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={newPlan.billingCycle}
                      onChange={(e) =>
                        handleNewPlanChange("billingCycle", e.target.value)
                      }
                      placeholder="e.g., 1, 3, 12..."
                      className="form-input"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Features & Limitations</h4>
                <div className="form-group">
                  <div
                    className={`feature-selector modern ${
                      newPlan.limitations.length === 0 ? "selector-error" : ""
                    }`}
                  >
                    <div className="selected-features-preview">
                      <div className="preview-header">
                        <span className="selected-count">
                          <Check size={16} />
                          {newPlan.limitations.length} limitation(s) selected
                        </span>
                      </div>
                      {newPlan.features.length > 0 && (
                        <div className="selected-features-list">
                          {newPlan.features
                            .slice(0, 4)
                            .map((feature, index) => (
                              <span key={index} className="feature-tag">
                                {renderFeatureLabel(feature)}
                              </span>
                            ))}
                          {newPlan.features.length > 4 && (
                            <span className="more-features">
                              +{newPlan.features.length - 4} more
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
                      <Sparkles size={16} />
                      {newPlan.features.length === 0
                        ? "Select Limitations"
                        : "Manage Limitations"}
                    </button>
                  </div>
                  {newPlan.limitations.length === 0 && (
                    <span className="error-text">
                      Please select at least one limitation
                    </span>
                  )}
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
                disabled={
                  !newPlan.name ||
                  !newPlan.price ||
                  !newPlan.billingCycle ||
                  Number(newPlan.price) < 0 ||
                  newPlan.limitations.length === 0
                }
              >
                <Check size={16} />
                Save Changes
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
            className="modal-content delete-modal modern"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header delete-header">
              <div className="modal-title-group">
                <div className="modal-icon delete">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3>Delete Package</h3>
                  <p>This action cannot be undone</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-message">
                  <p>
                    Are you sure you want to delete{" "}
                    <strong>"{selectedPlan.name}"</strong>?
                  </p>
                  <span className="warning-text">
                    All associated data will be permanently removed.
                  </span>
                </div>

                <div className="plan-summary modern">
                  <div className="summary-item">
                    <Package size={16} />
                    <span className="label">Package</span>
                    <span className="value">{selectedPlan.name}</span>
                  </div>
                  <div className="summary-item">
                    <DollarSign size={16} />
                    <span className="label">Price</span>
                    <span className="value">
                      {formatPrice(selectedPlan.price)} VND/month
                    </span>
                  </div>
                  <div className="summary-item">
                    <Users size={16} />
                    <span className="label">Subscriptions</span>
                    <span className="value">
                      {selectedPlan.activeSubscriptions} active
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
                {isDeleting ? (
                  <>
                    <span className="btn-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    Delete Package
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Limitation Selection Sidebar */}
      {showFeatureSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowFeatureSidebar(false)}
        >
          <div
            className="feature-sidebar modern"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sidebar-header">
              <div className="sidebar-title-group">
                <Sparkles size={20} className="sidebar-icon" />
                <div>
                  <h3>Select Limitations</h3>
                  <p>Choose one limitation per type</p>
                </div>
              </div>
              <button
                className="sidebar-close"
                onClick={() => setShowFeatureSidebar(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sidebar-actions">
              <button
                className="action-btn clear-all"
                onClick={handleClearAllLimitations}
              >
                <X size={14} />
                Clear All
              </button>
            </div>

            <div className="sidebar-content">
              {limitations && limitations.length > 0 ? (
                <div className="feature-group">
                  <div className="features-grid modern">
                    {limitations.map((lim: any) => {
                      const limId = lim.id ?? lim.Id;
                      const limName = lim.name ?? lim.Name;
                      const limType = lim.limitationType ?? lim.LimitationType;
                      
                      // Check if this limitation is selected
                      const isSelected = newPlan.limitations.includes(limId);
                      
                      // Check if there's another limitation of the same type selected
                      const sameTypeSelected = limitations.find((l: any) => {
                        const lType = l.limitationType ?? l.LimitationType;
                        const lId = l.id ?? l.Id;
                        return lType === limType && 
                               newPlan.limitations.includes(lId) && 
                               lId !== limId;
                      });
                      
                      // Disable if same type is selected and this one is not
                      const isDisabled = sameTypeSelected && !isSelected;

                      return (
                        <div
                          key={limId}
                          className={`feature-card ${
                            isSelected ? "selected" : ""
                          } ${isDisabled ? "disabled-same-type" : ""}`}
                          onClick={() => !isDisabled && handleToggleLimitation(lim)}
                        >
                          <div className="feature-card-check">
                            {isSelected && <Check size={14} />}
                          </div>
                          <div className="feature-card-body">
                            <div className="feature-title-row">
                              <h5 className="feature-title">{limName}</h5>
                              {isDisabled && (
                                <span className="type-hint">
                                  🔒 Locked
                                </span>
                              )}
                            </div>
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
                            {lim.description && (
                              <p className="feature-description">
                                {lim.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="no-limitations">
                  <Package size={40} />
                  <p>No limitations available</p>
                </div>
              )}
            </div>

            <div className="sidebar-footer">
              <div className="selected-summary">
                <Check size={16} />
                <span>{newPlan.limitations.length} limitation(s) selected</span>
              </div>
              <button
                className="confirm-btn"
                onClick={() => setShowFeatureSidebar(false)}
              >
                <Check size={16} />
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPackages;
