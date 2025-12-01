"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  Trash2,
  Eye,
  Pencil,
  Gauge,
  LayoutGrid,
  List,
  AlertTriangle,
  Infinity,
  Hash,
  FolderKanban,
  Calendar,
  Building2,
  Users,
  Video,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "react-toastify";
import limitationService from "@/services/limitationService";
import "../../../../../styles/limitations.scss";

const AdminLimitations: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [active, setActive] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    name: "",
    description: "",
    limitationType: "",
    isUnlimited: false,
    limitValue: "",
    limitUnit: "",
    isDeleted: false,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    limitationType?: string;
    limitValue?: string;
    limitUnit?: string;
  }>({});

  // Validation constants
  const VALIDATION = {
    NAME_MIN: 3,
    NAME_MAX: 100,
    DESCRIPTION_MAX: 500,
    UNIT_MAX: 20,
    VALUE_MIN: 0,
    VALUE_MAX: 999999999,
  };

  const limitationTypeOptions = [
    { value: "NumberProject", label: "Number of projects", icon: FolderKanban },
    { value: "NumberMeeting", label: "Number of meetings", icon: Calendar },
    {
      value: "NumberMemberInOrganization",
      label: "Members in organization",
      icon: Building2,
    },
    {
      value: "NumberMemberInProject",
      label: "Members in project",
      icon: Users,
    },
    {
      value: "NumberMemberInMeeting",
      label: "Members in meeting",
      icon: Video,
    },
  ];

  const getLimitationTypeLabel = (type: string) => {
    const found = limitationTypeOptions.find((opt) => opt.value === type);
    return found ? found.label : type;
  };

  const getLimitationTypeIcon = (type: string) => {
    const found = limitationTypeOptions.find((opt) => opt.value === type);
    const IconComponent = found ? found.icon : ClipboardList;
    return <IconComponent size={18} />;
  };

  const filtered = items.filter((it) => {
    if (it.isDeleted) return false;
    if (!query) return true;
    return (
      (it.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (it.description || "").toLowerCase().includes(query.toLowerCase())
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    fetchLimitations();
  }, []);

  async function fetchLimitations() {
    setLoading(true);
    setError(null);
    try {
      const res = await limitationService.getLimitations();
      if (res.success) {
        const data = res.data;
        const normalize = (it: any) => ({
          id: it.Id ?? it.id,
          name: it.Name ?? it.name,
          description: it.Description ?? it.description,
          limitationType: it.LimitationType ?? it.limitationType,
          isUnlimited: it.IsUnlimited ?? it.isUnlimited ?? false,
          limitValue: it.LimitValue ?? it.limitValue ?? null,
          limitUnit: it.LimitUnit ?? it.limitUnit ?? null,
          isDeleted: it.IsDeleted ?? it.isDeleted ?? false,
          ...it,
        });

        if (Array.isArray(data)) setItems((data as any[]).map(normalize));
        else if (data && (data as any).items)
          setItems(((data as any).items || []).map(normalize));
        else setItems([]);
      } else {
        setError(res.error || "Unable to load limitations list");
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm({
      name: "",
      description: "",
      limitationType: "",
      isUnlimited: false,
      limitValue: "",
      limitUnit: "",
      isDeleted: false,
    });
    setFormErrors({});
    setShowAdd(true);
  }

  // Validate form fields
  function validateForm(): boolean {
    const errors: typeof formErrors = {};

    // Name validation
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      errors.name = "Name is required";
    } else if (trimmedName.length < VALIDATION.NAME_MIN) {
      errors.name = `Name must be at least ${VALIDATION.NAME_MIN} characters`;
    } else if (trimmedName.length > VALIDATION.NAME_MAX) {
      errors.name = `Name must not exceed ${VALIDATION.NAME_MAX} characters`;
    }

    // Limitation type validation
    if (!form.limitationType) {
      errors.limitationType = "Limitation type is required";
    }

    // Description validation (optional but with max length)
    if (
      form.description &&
      form.description.length > VALIDATION.DESCRIPTION_MAX
    ) {
      errors.description = `Description must not exceed ${VALIDATION.DESCRIPTION_MAX} characters`;
    }

    // Value validation (only if not unlimited)
    if (!form.isUnlimited) {
      const value = Number(form.limitValue);
      if (form.limitValue === "" || isNaN(value)) {
        errors.limitValue = "Value is required when not unlimited";
      } else if (value < VALIDATION.VALUE_MIN) {
        errors.limitValue = "Value cannot be negative";
      } else if (value > VALIDATION.VALUE_MAX) {
        errors.limitValue = `Value must not exceed ${VALIDATION.VALUE_MAX.toLocaleString()}`;
      } else if (!Number.isInteger(value)) {
        errors.limitValue = "Value must be a whole number";
      }
    }

    // Unit validation (optional but with max length)
    if (form.limitUnit && form.limitUnit.length > VALIDATION.UNIT_MAX) {
      errors.limitUnit = `Unit must not exceed ${VALIDATION.UNIT_MAX} characters`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  useEffect(() => {
    if (!showAdd && !showEdit && !showView && !showDeleteConfirm) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowAdd(false);
        setShowEdit(false);
        setShowView(false);
        setShowDeleteConfirm(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAdd, showEdit, showView, showDeleteConfirm]);

  async function saveAdd() {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        limitationType: form.limitationType,
        isUnlimited: !!form.isUnlimited,
        ...(form.isUnlimited
          ? {}
          : { limitValue: Number(form.limitValue) || 0 }),
        limitUnit: form.limitUnit || null,
        isDeleted: !!form.isDeleted,
      };
      const res = await limitationService.createLimitation(payload);
      if (res.success && res.data) {
        const created = res.data;
        const normalize = (it: any) => ({
          id: it.Id ?? it.id,
          name: it.Name ?? it.name,
          description: it.Description ?? it.description,
          limitationType: it.LimitationType ?? it.limitationType,
          isUnlimited: it.IsUnlimited ?? it.isUnlimited ?? false,
          limitValue: it.LimitValue ?? it.limitValue ?? null,
          limitUnit: it.LimitUnit ?? it.limitUnit ?? null,
          isDeleted: it.IsDeleted ?? it.isDeleted ?? false,
          ...it,
        });
        setItems((s) => [...s, normalize(created) as any]);
        setShowAdd(false);
        toast.success("Limitation created successfully!");
      } else {
        toast.error(res.error || "Failed to create limitation");
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function openEdit(item: any) {
    setActive(item);
    setForm({
      name: item.name,
      description: item.description,
      limitationType: item.limitationType ?? "",
      isUnlimited: !!item.isUnlimited,
      limitValue: item.limitValue ?? "",
      limitUnit: item.limitUnit ?? "",
      isDeleted: !!item.isDeleted,
    });
    setFormErrors({});
    setShowEdit(true);
  }

  async function saveEdit() {
    if (!active) return;
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        limitationId: active.id,
        name: form.name,
        description: form.description,
        limitationType: form.limitationType,
        isUnlimited: !!form.isUnlimited,
        ...(form.isUnlimited
          ? {}
          : { limitValue: Number(form.limitValue) || 0 }),
        limitUnit: form.limitUnit || null,
        isDeleted: !!form.isDeleted,
      };
      const res = await limitationService.updateLimitation(payload);
      if (res.success && res.data) {
        const updated = res.data;
        const normalize = (it: any) => ({
          id: it.Id ?? it.id,
          name: it.Name ?? it.name,
          description: it.Description ?? it.description,
          limitationType: it.LimitationType ?? it.limitationType,
          isUnlimited: it.IsUnlimited ?? it.isUnlimited ?? false,
          limitValue: it.LimitValue ?? it.limitValue ?? null,
          limitUnit: it.LimitUnit ?? it.limitUnit ?? null,
          isDeleted: it.IsDeleted ?? it.isDeleted ?? false,
          ...it,
        });
        setItems((s) =>
          s.map((it) => (it.id === active.id ? normalize(updated) : it))
        );
        setShowEdit(false);
        setActive(null);
        toast.success("Limitation updated successfully!");
      } else {
        toast.error(res.error || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function openDeleteConfirm(item: any) {
    setActive(item);
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!active) return;
    setLoading(true);
    try {
      const res = await limitationService.deleteLimitation(active.id);
      if (res.success) {
        setItems((s) => s.filter((it) => it.id !== active.id));
        toast.success("Limitation deleted successfully!");
        setShowDeleteConfirm(false);
        setActive(null);
      } else {
        toast.error(res.error || res.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-limitations">
      {/* Hero Header */}
      <div className="limitations-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Gauge size={32} />
          </div>
          <div className="hero-text">
            <h1>Limitation Management</h1>
            <p>Create and manage feature limitations for your packages</p>
          </div>
        </div>
        <button className="add-limitation-btn" onClick={openAdd}>
          <Plus size={20} />
          <span>Create Limitation</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="limitations-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search limitations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

      {/* Content */}
      <div className="limitations-content">
        {loading && items.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading limitations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Gauge size={48} />
            </div>
            <h3>No limitations found</h3>
            <p>
              {query
                ? "Try adjusting your search query"
                : "Create your first limitation to get started"}
            </p>
            {!query && (
              <button
                className="add-limitation-btn secondary"
                onClick={openAdd}
              >
                <Plus size={18} />
                <span>Create Limitation</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={`limitations-grid ${
                viewMode === "list" ? "list-view" : ""
              }`}
            >
              {paginatedItems.map((it) => (
                <div className="limitation-card" key={it.id}>
                  <div className="card-header">
                    <div className="type-badge">
                      <span className="type-icon">
                        {getLimitationTypeIcon(it.limitationType)}
                      </span>
                      <span className="type-label">
                        {getLimitationTypeLabel(it.limitationType)}
                      </span>
                    </div>
                    <div className="card-actions">
                      <button
                        className="action-btn view"
                        onClick={() => {
                          setActive(it);
                          setShowView(true);
                        }}
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => openEdit(it)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => openDeleteConfirm(it)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{it.name}</h3>
                    <p className="card-description">
                      {it.description || "No description provided"}
                    </p>
                  </div>
                  <div className="card-footer">
                    <div
                      className={`limit-badge ${
                        it.isUnlimited ? "unlimited" : "limited"
                      }`}
                    >
                      {it.isUnlimited ? (
                        <>
                          <Infinity size={16} />
                          <span>Unlimited</span>
                        </>
                      ) : (
                        <>
                          <Hash size={16} />
                          <span>
                            {it.limitValue}
                            {it.limitUnit ? ` ${it.limitUnit}` : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(endIndex, filtered.length)} of {filtered.length}{" "}
                  limitations
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    title="First page"
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, index, arr) => (
                        <React.Fragment key={page}>
                          {index > 0 && arr[index - 1] !== page - 1 && (
                            <span className="pagination-ellipsis">...</span>
                          )}
                          <button
                            className={`pagination-page ${
                              currentPage === page ? "active" : ""
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    title="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Last page"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon add">
                  <Plus size={20} />
                </div>
                <div>
                  <h3>Create New Limitation</h3>
                  <p>Add a new feature limitation for your packages</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h4 className="section-title">Basic Information</h4>
                <div className="form-group">
                  <label>
                    Limitation Type <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${
                      formErrors.limitationType ? "input-error" : ""
                    }`}
                    value={form.limitationType}
                    onChange={(e) => {
                      setForm({ ...form, limitationType: e.target.value });
                      if (formErrors.limitationType) {
                        setFormErrors({
                          ...formErrors,
                          limitationType: undefined,
                        });
                      }
                    }}
                  >
                    <option value="">-- Select limitation type --</option>
                    {limitationTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.limitationType && (
                    <span className="error-text">
                      {formErrors.limitationType}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                    <span className="char-count">
                      {form.name.length}/{VALIDATION.NAME_MAX}
                    </span>
                  </label>
                  <input
                    className={`form-input ${
                      formErrors.name ? "input-error" : ""
                    }`}
                    autoFocus
                    placeholder="E.g.: Max number of projects"
                    value={form.name}
                    maxLength={VALIDATION.NAME_MAX}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: undefined });
                      }
                    }}
                  />
                  {formErrors.name && (
                    <span className="error-text">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Description
                    <span className="char-count">
                      {form.description.length}/{VALIDATION.DESCRIPTION_MAX}
                    </span>
                  </label>
                  <textarea
                    className={`form-input ${
                      formErrors.description ? "input-error" : ""
                    }`}
                    placeholder="Short description of the limitation"
                    value={form.description}
                    rows={3}
                    maxLength={VALIDATION.DESCRIPTION_MAX}
                    onChange={(e) => {
                      setForm({ ...form, description: e.target.value });
                      if (formErrors.description) {
                        setFormErrors({
                          ...formErrors,
                          description: undefined,
                        });
                      }
                    }}
                  />
                  {formErrors.description && (
                    <span className="error-text">{formErrors.description}</span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Limit Configuration</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isUnlimited}
                      onChange={(e) => {
                        setForm({ ...form, isUnlimited: e.target.checked });
                        if (e.target.checked && formErrors.limitValue) {
                          setFormErrors({
                            ...formErrors,
                            limitValue: undefined,
                          });
                        }
                      }}
                    />
                    <span className="checkbox-text">
                      <Infinity size={16} />
                      Unlimited
                    </span>
                  </label>
                </div>

                {!form.isUnlimited && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Value <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-input ${
                          formErrors.limitValue ? "input-error" : ""
                        }`}
                        value={form.limitValue}
                        placeholder="Enter limit value"
                        min={VALIDATION.VALUE_MIN}
                        max={VALIDATION.VALUE_MAX}
                        onChange={(e) => {
                          setForm({ ...form, limitValue: e.target.value });
                          if (formErrors.limitValue) {
                            setFormErrors({
                              ...formErrors,
                              limitValue: undefined,
                            });
                          }
                        }}
                      />
                      {formErrors.limitValue && (
                        <span className="error-text">
                          {formErrors.limitValue}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>
                        Unit (optional)
                        <span className="char-count">
                          {form.limitUnit.length}/{VALIDATION.UNIT_MAX}
                        </span>
                      </label>
                      <input
                        className={`form-input ${
                          formErrors.limitUnit ? "input-error" : ""
                        }`}
                        value={form.limitUnit}
                        placeholder="e.g.: users, GB, etc."
                        maxLength={VALIDATION.UNIT_MAX}
                        onChange={(e) => {
                          setForm({ ...form, limitUnit: e.target.value });
                          if (formErrors.limitUnit) {
                            setFormErrors({
                              ...formErrors,
                              limitUnit: undefined,
                            });
                          }
                        }}
                      />
                      {formErrors.limitUnit && (
                        <span className="error-text">
                          {formErrors.limitUnit}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={saveAdd} disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Limitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && active && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon edit">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3>Edit Limitation</h3>
                  <p>Update the details of "{active.name}"</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowEdit(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h4 className="section-title">Basic Information</h4>
                <div className="form-group">
                  <label>
                    Limitation Type <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select ${
                      formErrors.limitationType ? "input-error" : ""
                    }`}
                    value={form.limitationType}
                    onChange={(e) => {
                      setForm({ ...form, limitationType: e.target.value });
                      if (formErrors.limitationType) {
                        setFormErrors({
                          ...formErrors,
                          limitationType: undefined,
                        });
                      }
                    }}
                  >
                    <option value="">-- Select limitation type --</option>
                    {limitationTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.limitationType && (
                    <span className="error-text">
                      {formErrors.limitationType}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                    <span className="char-count">
                      {form.name.length}/{VALIDATION.NAME_MAX}
                    </span>
                  </label>
                  <input
                    className={`form-input ${
                      formErrors.name ? "input-error" : ""
                    }`}
                    autoFocus
                    placeholder="E.g.: Max number of projects"
                    value={form.name}
                    maxLength={VALIDATION.NAME_MAX}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors({ ...formErrors, name: undefined });
                      }
                    }}
                  />
                  {formErrors.name && (
                    <span className="error-text">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Description
                    <span className="char-count">
                      {form.description.length}/{VALIDATION.DESCRIPTION_MAX}
                    </span>
                  </label>
                  <textarea
                    className={`form-input ${
                      formErrors.description ? "input-error" : ""
                    }`}
                    placeholder="Short description of the limitation"
                    value={form.description}
                    rows={3}
                    maxLength={VALIDATION.DESCRIPTION_MAX}
                    onChange={(e) => {
                      setForm({ ...form, description: e.target.value });
                      if (formErrors.description) {
                        setFormErrors({
                          ...formErrors,
                          description: undefined,
                        });
                      }
                    }}
                  />
                  {formErrors.description && (
                    <span className="error-text">{formErrors.description}</span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Limit Configuration</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isUnlimited}
                      onChange={(e) => {
                        setForm({ ...form, isUnlimited: e.target.checked });
                        if (e.target.checked && formErrors.limitValue) {
                          setFormErrors({
                            ...formErrors,
                            limitValue: undefined,
                          });
                        }
                      }}
                    />
                    <span className="checkbox-text">
                      <Infinity size={16} />
                      Unlimited
                    </span>
                  </label>
                </div>

                {!form.isUnlimited && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Value <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-input ${
                          formErrors.limitValue ? "input-error" : ""
                        }`}
                        value={form.limitValue}
                        placeholder="Enter limit value"
                        min={VALIDATION.VALUE_MIN}
                        max={VALIDATION.VALUE_MAX}
                        onChange={(e) => {
                          setForm({ ...form, limitValue: e.target.value });
                          if (formErrors.limitValue) {
                            setFormErrors({
                              ...formErrors,
                              limitValue: undefined,
                            });
                          }
                        }}
                      />
                      {formErrors.limitValue && (
                        <span className="error-text">
                          {formErrors.limitValue}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>
                        Unit (optional)
                        <span className="char-count">
                          {form.limitUnit.length}/{VALIDATION.UNIT_MAX}
                        </span>
                      </label>
                      <input
                        className={`form-input ${
                          formErrors.limitUnit ? "input-error" : ""
                        }`}
                        value={form.limitUnit}
                        placeholder="e.g.: users, GB, etc."
                        maxLength={VALIDATION.UNIT_MAX}
                        onChange={(e) => {
                          setForm({ ...form, limitUnit: e.target.value });
                          if (formErrors.limitUnit) {
                            setFormErrors({
                              ...formErrors,
                              limitUnit: undefined,
                            });
                          }
                        }}
                      />
                      {formErrors.limitUnit && (
                        <span className="error-text">
                          {formErrors.limitUnit}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={saveEdit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && active && (
        <div className="modal-overlay" onClick={() => setShowView(false)}>
          <div
            className="modal-content view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon view">
                  <Eye size={20} />
                </div>
                <div>
                  <h3>Limitation Details</h3>
                  <p>View complete limitation information</p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowView(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-card">
                <div className="detail-header">
                  <span className="detail-type-icon">
                    {getLimitationTypeIcon(active.limitationType)}
                  </span>
                  <span className="detail-type-label">
                    {getLimitationTypeLabel(active.limitationType)}
                  </span>
                </div>
                <h2 className="detail-title">{active.name}</h2>
                <p className="detail-description">
                  {active.description || "No description provided"}
                </p>
                <div
                  className={`detail-limit ${
                    active.isUnlimited ? "unlimited" : "limited"
                  }`}
                >
                  {active.isUnlimited ? (
                    <>
                      <Infinity size={20} />
                      <span>Unlimited</span>
                    </>
                  ) : (
                    <>
                      <Hash size={20} />
                      <span>
                        Limit: {active.limitValue}
                        {active.limitUnit ? ` ${active.limitUnit}` : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowView(false)}>
                Close
              </button>
              <button
                className="btn-edit"
                onClick={() => {
                  setShowView(false);
                  openEdit(active);
                }}
              >
                <Pencil size={16} />
                Edit Limitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && active && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header delete-header">
              <div className="modal-title-group">
                <div className="modal-icon delete">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3>Delete Limitation</h3>
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
                    <strong>"{active.name}"</strong>?
                  </p>
                  <span className="warning-text">
                    All packages using this limitation will be affected.
                  </span>
                </div>
                <div className="delete-summary">
                  <div className="summary-item">
                    <Gauge size={16} />
                    <span className="label">Limitation</span>
                    <span className="value">{active.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="type-icon-wrapper">
                      {getLimitationTypeIcon(active.limitationType)}
                    </span>
                    <span className="label">Type</span>
                    <span className="value">
                      {getLimitationTypeLabel(active.limitationType)}
                    </span>
                  </div>
                  <div className="summary-item">
                    {active.isUnlimited ? (
                      <Infinity size={16} />
                    ) : (
                      <Hash size={16} />
                    )}
                    <span className="label">Value</span>
                    <span className="value">
                      {active.isUnlimited
                        ? "Unlimited"
                        : `${active.limitValue}${
                            active.limitUnit ? ` ${active.limitUnit}` : ""
                          }`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Limitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLimitations;
