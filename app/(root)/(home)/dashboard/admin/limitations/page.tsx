"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, X, Edit, Trash2, Eye } from "lucide-react";
import limitationService from "@/services/limitationService";

const AdminLimitations: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [active, setActive] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isUnlimited: false,
    limitValue: "",
    limitUnit: "",
    status: "active",
  });

  const filtered = items.filter((it) => {
    if (!query) return true;
    return (
      (it.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (it.description || "").toLowerCase().includes(query.toLowerCase())
    );
  });

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
        if (Array.isArray(data)) setItems(data as any[]);
        else if (data && (data as any).items)
          setItems((data as any).items || []);
        else setItems([]);
      } else {
        setError(res.error || "Không thể tải danh sách giới hạn");
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
      isUnlimited: false,
      limitValue: "",
      limitUnit: "",
      status: "active",
    });
    setShowAdd(true);
  }

  // close add modal on Escape
  useEffect(() => {
    if (!showAdd) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowAdd(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showAdd]);

  async function saveAdd() {
    if (!form.name) return alert("Tên bắt buộc");
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        isUnlimited: !!form.isUnlimited,
        limitValue: form.isUnlimited ? null : Number(form.limitValue) || 0,
        limitUnit: form.limitUnit || null,
      };
      const res = await limitationService.createLimitation(payload);
      if (res.success && res.data) {
        setItems((s) => [...s, res.data as any]);
        setShowAdd(false);
      } else {
        alert(res.error || "Tạo giới hạn thất bại");
      }
    } catch (err: any) {
      alert(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function openEdit(item: any) {
    setActive(item);
    setForm({
      name: item.name,
      description: item.description,
      isUnlimited: !!item.isUnlimited,
      limitValue: item.limitValue ?? "",
      limitUnit: item.limitUnit ?? "",
      status: item.status,
    });
    setShowEdit(true);
  }

  async function saveEdit() {
    if (!active) return;
    setLoading(true);
    try {
      const payload: any = {
        limitationId: active.id,
        name: form.name,
        description: form.description,
        isUnlimited: !!form.isUnlimited,
        limitValue: form.isUnlimited ? null : Number(form.limitValue) || 0,
        limitUnit: form.limitUnit || null,
      };
      const res = await limitationService.updateLimitation(payload);
      if (res.success && res.data) {
        setItems((s) => s.map((it) => (it.id === active.id ? res.data : it)));
        setShowEdit(false);
        setActive(null);
      } else {
        alert(res.error || "Cập nhật thất bại");
      }
    } catch (err: any) {
      alert(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function doDelete(item: any) {
    if (!confirm(`Xóa giới hạn "${item.name}"?`)) return;
    setLoading(true);
    try {
      const res = await limitationService.deleteLimitation(item.id);
      if (res.success) {
        setItems((s) => s.filter((it) => it.id !== item.id));
      } else {
        alert(res.error || res.message || "Xóa thất bại");
      }
    } catch (err: any) {
      alert(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lim-page">
      <div className="lim-header">
        <div>
          <h1>Quản lý giới hạn</h1>
          <p className="muted">Quản lý các giới hạn cho gói</p>
        </div>
        <div className="lim-actions">
          <div className="search">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
            />
          </div>
          <button className="btn add primary-cta" onClick={openAdd}>
            <Plus size={16} />
            <span className="add-label">Thêm giới hạn</span>
          </button>
        </div>
      </div>

      <div className="lim-table">
        <div className="row header">
          <div>Name</div>
          <div>LimitValue</div>
          <div>LimitUnit</div>
          <div>Actions</div>
        </div>
        {filtered.map((it) => (
          <div className="row" key={it.id}>
            <div className="title">
              <div className="name">{it.name}</div>
              <div className="desc">{it.description}</div>
            </div>
            <div>{it.limitValue ?? "-"}</div>
            <div>{it.limitUnit ?? "-"}</div>
            <div className="actions">
              <button
                className="icon"
                onClick={() => {
                  setActive(it);
                  setShowView(true);
                }}
                title="Xem"
              >
                <Eye size={14} />
              </button>
              <button className="icon" onClick={() => openEdit(it)} title="Sửa">
                <Edit size={14} />
              </button>
              <button
                className="icon danger"
                onClick={() => doDelete(it)}
                title="Xóa"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="addLimTitle"
        >
          <div className="card">
            <div className="card-head">
              <h3 id="addLimTitle">Thêm giới hạn</h3>
              <button
                className="close"
                onClick={() => setShowAdd(false)}
                aria-label="Đóng"
              >
                <X />
              </button>
            </div>
            <div className="card-body">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="lim-name">Tên</label>
                  <input
                    id="lim-name"
                    className="text-input"
                    autoFocus
                    placeholder="VD: Số dự án tối đa"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label htmlFor="lim-desc">Mô tả</label>
                  <textarea
                    id="lim-desc"
                    className="text-input"
                    placeholder="Mô tả ngắn về giới hạn"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="field checkbox-row">
                  <label />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isUnlimited}
                      onChange={(e) =>
                        setForm({ ...form, isUnlimited: e.target.checked })
                      }
                    />
                    <span>Không giới hạn</span>
                  </label>
                </div>

                <>
                  {!form.isUnlimited && (
                    <div className="field">
                      <label htmlFor="lim-value">Giá trị</label>
                      <input
                        id="lim-value"
                        type="number"
                        className="text-input"
                        value={form.limitValue}
                        onChange={(e) =>
                          setForm({ ...form, limitValue: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="lim-unit">Đơn vị</label>
                    <input
                      id="lim-unit"
                      className="text-input"
                      value={form.limitUnit}
                      onChange={(e) =>
                        setForm({ ...form, limitUnit: e.target.value })
                      }
                    />
                  </div>
                </>
              </div>
            </div>
            <div className="card-foot">
              <button className="btn" onClick={() => setShowAdd(false)}>
                Hủy
              </button>
              <button
                className="btn primary"
                onClick={saveAdd}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="modal">
          <div className="card">
            <div className="card-head">
              <h3>Chỉnh sửa</h3>
              <button className="close" onClick={() => setShowEdit(false)}>
                <X />
              </button>
            </div>
            <div className="card-body">
              <label>Tên</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <label>Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <label>
                <input
                  type="checkbox"
                  checked={form.isUnlimited}
                  onChange={(e) =>
                    setForm({ ...form, isUnlimited: e.target.checked })
                  }
                />{" "}
                Không giới hạn
              </label>
              {!form.isUnlimited && (
                <>
                  <label>Giá trị</label>
                  <input
                    type="number"
                    value={form.limitValue}
                    onChange={(e) =>
                      setForm({ ...form, limitValue: e.target.value })
                    }
                  />
                </>
              )}

              <label>Đơn vị</label>
              <input
                value={form.limitUnit}
                onChange={(e) =>
                  setForm({ ...form, limitUnit: e.target.value })
                }
              />
            </div>
            <div className="card-foot">
              <button className="btn" onClick={() => setShowEdit(false)}>
                Hủy
              </button>
              <button className="btn primary" onClick={saveEdit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && active && (
        <div className="modal">
          <div className="card small">
            <div className="card-head">
              <h3>Chi tiết</h3>
              <button className="close" onClick={() => setShowView(false)}>
                <X />
              </button>
            </div>
            <div className="card-body">
              <p>
                <strong>{active.name}</strong>
              </p>
              <p>{active.description}</p>
              <p>
                {active.isUnlimited
                  ? "Không giới hạn"
                  : `${active.limitValue} ${active.limitUnit || ""}`}
              </p>
              <p>Trạng thái: {active.status}</p>
            </div>
            <div className="card-foot">
              <button className="btn" onClick={() => setShowView(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .lim-page {
          padding: 20px;
        }
        .lim-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .lim-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .muted {
          color: #6b7280;
          margin: 0;
        }
        .lim-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .search {
          display: flex;
          gap: 8px;
          align-items: center;
          background: #fff;
          padding: 6px 8px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .search input {
          border: 0;
          outline: none;
        }
        .btn {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
        }
        .btn.add {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 600;
        }

        /* primary CTA variant for Add */
        .primary-cta {
          background: linear-gradient(90deg, #ff5e13 0%, #ff7a3a 100%);
          color: #fff;
          border: none;
          box-shadow: 0 6px 18px rgba(255, 94, 19, 0.18);
          transform: translateY(0);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .primary-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255, 94, 19, 0.18);
        }
        .primary-cta .add-label {
          margin-left: 6px;
          font-size: 15px;
        }
        .btn.primary {
          background: #ff5e13;
          color: white;
          border-color: #ff5e13;
        }

        .lim-table {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .row {
          display: grid;
          /* Title (name + description) wider, then value, status, date, actions */
          grid-template-columns: 3fr 1fr 1fr 1fr 80px;
          gap: 12px;
          padding: 12px 16px;
          align-items: center;
        }
        .row.header {
          background: #faf7f4;
          font-weight: 600;
        }
        .title .name {
          font-weight: 700;
          font-size: 18px;
        }
        .title .desc {
          color: #6b7280;
          font-size: 13px;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .icon {
          border: 0;
          background: #fff;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
        }
        .icon.danger {
          color: #ef4444;
        }

        .modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.45)
          );
          z-index: 60;
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 12px;
          width: 640px;
          max-width: 100%;
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.24);
          overflow: hidden;
        }
        .card.small {
          width: 420px;
        }
        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(
            90deg,
            rgba(255, 126, 85, 0.06),
            rgba(255, 94, 19, 0.02)
          );
        }
        .card-body {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .card-foot {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 14px 20px;
          border-top: 1px solid #f3f4f6;
        }
        textarea {
          min-height: 100px;
        }
        /* form/grid for modal */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 16px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field label {
          font-weight: 600;
          font-size: 13px;
          color: #111827;
        }
        .text-input {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
          background: #fff;
        }
        .text-input:focus {
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
          border-color: #6366f1;
        }
        .checkbox-row {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
        }
        .checkbox-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .checkbox-label input {
          width: 16px;
          height: 16px;
        }

        /* primary button disabled state */
        .btn.primary[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .btn.primary {
          background: linear-gradient(90deg, #ff5e13 0%, #ff7a3a 100%);
          color: #fff;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(255, 94, 19, 0.12);
        }
        .close {
          background: transparent;
          border: none;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
        }
        .close:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        @media (max-width: 560px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLimitations;
