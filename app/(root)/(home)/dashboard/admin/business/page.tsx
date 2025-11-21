"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  X,
  Search,
  CheckCircle,
  XCircle,
  UserX,
} from "lucide-react";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";
import type { BusinessOwner } from "@/types/auth";

const AdminBusinessOwners = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLicensePreview, setShowLicensePreview] = useState(false);
  const [selectedBusinessOwner, setSelectedBusinessOwner] =
    useState<BusinessOwner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [businessOwners, setBusinessOwners] = useState<BusinessOwner[]>([]);

  // Load business owners from API
  useEffect(() => {
    const loadBusinessOwners = async () => {
      setIsLoading(true);
      try {
        const result = await userService.getBusinessOwners();
        if (result.success && result.data) {
          setBusinessOwners(result.data);
        } else {
          console.error("Failed to load business owners:", result.error);
        }
      } catch (error) {
        console.error("Error loading business owners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessOwners();
  }, []);

  const filteredBusinessOwners = businessOwners.filter((businessOwner) => {
    const matchesSearch =
      businessOwner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      businessOwner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      businessOwner.organization
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (businessOwner.phoneNumber &&
        businessOwner.phoneNumber.includes(searchTerm));
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "pending" && !businessOwner.isApproved) ||
      (filterStatus === "active" && businessOwner.isApproved);
    return matchesSearch && matchesFilter;
  });

  const handleDeleteBusinessOwner = (businessOwner: BusinessOwner) => {
    setSelectedBusinessOwner(businessOwner);
    setShowDeleteModal(true);
  };

  const handleDeactivateBusinessOwner = (businessOwner: BusinessOwner) => {
    setSelectedBusinessOwner(businessOwner);
    setShowDeactivateModal(true);
  };

  const handleApproveBusinessOwner = (businessOwner: BusinessOwner) => {
    setSelectedBusinessOwner(businessOwner);
    setShowApproveModal(true);
  };

  const handleRejectBusinessOwner = (businessOwner: BusinessOwner) => {
    setSelectedBusinessOwner(businessOwner);
    setShowRejectModal(true);
  };

  const handleViewBusinessOwner = (businessOwner: BusinessOwner) => {
    setSelectedBusinessOwner(businessOwner);
    setShowDetailModal(true);
  };

  const confirmDelete = () => {
    if (selectedBusinessOwner) {
      setBusinessOwners(
        businessOwners.filter((bo) => bo.id !== selectedBusinessOwner.id)
      );
      setShowDeleteModal(false);
      setSelectedBusinessOwner(null);
    }
  };

  const confirmDeactivate = async () => {
    if (selectedBusinessOwner) {
      try {
        const result = await userService.toggleActive(selectedBusinessOwner.id);
        if (result.success) {
          setBusinessOwners(
            businessOwners.map((bo) =>
              bo.id === selectedBusinessOwner.id
                ? { ...bo, isActive: !bo.isActive }
                : bo
            )
          );
          toast.success(
            result.message || "Active status updated successfully!"
          );
        } else {
          toast.error(result.error || "Could not update active status");
        }
      } catch (error) {
        console.error("Error toggling active status:", error);
        toast.error("An error occurred while updating active status");
      }
      setShowDeactivateModal(false);
      setSelectedBusinessOwner(null);
    }
  };

  const confirmApprove = async () => {
    if (selectedBusinessOwner) {
      try {
        const result = await userService.approveBusinessOwner(
          selectedBusinessOwner.id
        );
        if (result.success) {
          setBusinessOwners(
            businessOwners.map((bo) =>
              bo.id === selectedBusinessOwner.id
                ? { ...bo, isApproved: true }
                : bo
            )
          );
          toast.success(
            result.message || "Business account approved successfully!"
          );
        } else {
          toast.error(result.error || "Could not approve business account");
        }
      } catch (error) {
        console.error("Error approving business owner:", error);
        toast.error("An error occurred while approving business account");
      }
      setShowApproveModal(false);
      setSelectedBusinessOwner(null);
    }
  };

  const confirmReject = async () => {
    if (selectedBusinessOwner) {
      try {
        const result = await userService.rejectBusinessOwner(
          selectedBusinessOwner.id
        );
        if (result.success) {
          setBusinessOwners(
            businessOwners.filter((bo) => bo.id !== selectedBusinessOwner.id)
          );
          toast.success(
            result.message || "Business account rejected successfully!"
          );
        } else {
          toast.error(result.error || "Could not reject business account");
        }
      } catch (error) {
        console.error("Error rejecting business owner:", error);
        toast.error("An error occurred while rejecting business account");
      }
      setShowRejectModal(false);
      setSelectedBusinessOwner(null);
    }
  };

  const getStatusBadge = (businessOwner: BusinessOwner) => {
    const isApproved = businessOwner.isApproved;
    const isActive = businessOwner.isActive;

    const statusConfig = {
      active: { color: "#D1FAE5", textColor: "#065F46", text: "Active" },
      inactive: {
        color: "#F3F4F6",
        textColor: "#6B7280",
        text: "Inactive",
      },
      pending: { color: "#FEF3C7", textColor: "#D97706", text: "Pending" },
    };

    let config;
    if (!isApproved) {
      config = statusConfig.pending;
    } else if (isActive) {
      config = statusConfig.active;
    } else {
      config = statusConfig.inactive;
    }

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

  function getDaysLeft(expireDate?: string) {
    if (!expireDate) return "-";
    const today = new Date();
    const exp = new Date(expireDate);
    const diff = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  }

  return (
    <div className="admin-business-owners">
      <div className="page-header">
        <h1>Manage Business Owners</h1>
        <p>Manage all business owners using the system</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">
            <Search size={16} />
          </span>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "pending" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "active" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("active")}
          >
            Active
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "inactive" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("inactive")}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{businessOwners.length}</span>
          <span className="stat-label">Total Owners</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {businessOwners.filter((bo) => !bo.isApproved).length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {businessOwners.filter((bo) => bo.isApproved).length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {
              businessOwners.filter((bo) => bo.isApproved && !bo.isActive)
                .length
            }
          </span>
          <span className="stat-label">Inactive</span>
        </div>
      </div>

      {/* Business Owners Table */}
      <div className="business-owners-table">
        <div className="table-header">
          <div className="table-cell">Full Name</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Phone</div>
          <div className="table-cell">Organization</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Account Created</div>
          <div className="table-cell">Actions</div>
        </div>

        {filteredBusinessOwners.map((businessOwner) => (
          <div key={businessOwner.id} className="table-row">
            <div className="table-cell" data-label="Full Name">
              <div className="business-owner-info">
                <div className="business-owner-avatar">
                  {businessOwner.fullName.charAt(0)}
                </div>
                <span className="business-owner-name">
                  {businessOwner.fullName}
                </span>
              </div>
            </div>
            <div className="table-cell" data-label="Email">
              {businessOwner.email}
            </div>
            <div className="table-cell" data-label="Phone">
              {businessOwner.phoneNumber}
            </div>
            <div className="table-cell" data-label="Organization">
              <span className="organization-badge">
                {businessOwner.organization}
              </span>
            </div>
            <div className="table-cell" data-label="Status">
              {getStatusBadge(businessOwner)}
            </div>
            <div className="table-cell" data-label="Account Created">
              {new Date(businessOwner.createdAt).toLocaleDateString("en-US")}
            </div>
            <div className="table-cell" data-label="Actions">
              <div className="action-buttons">
                <button
                  className="action-btn view"
                  title="View Details"
                  onClick={() => handleViewBusinessOwner(businessOwner)}
                >
                  <Eye size={16} />
                </button>
                {!businessOwner.isApproved ? (
                  <>
                    <button
                      className="action-btn approve"
                      title="Approve"
                      onClick={() => handleApproveBusinessOwner(businessOwner)}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      className="action-btn reject"
                      title="Reject"
                      onClick={() => handleRejectBusinessOwner(businessOwner)}
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="action-btn edit" title="Edit">
                      <Edit size={16} />
                    </button>
                    {businessOwner.isApproved && (
                      <button
                        className={`action-btn ${
                          businessOwner.isActive ? "deactivate" : "activate"
                        }`}
                        title={
                          businessOwner.isActive ? "Deactivate" : "Activate"
                        }
                        onClick={() =>
                          handleDeactivateBusinessOwner(businessOwner)
                        }
                      >
                        <UserX size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deactivate/Activate Confirmation Modal */}
      {showDeactivateModal && selectedBusinessOwner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {selectedBusinessOwner.isActive
                  ? "Confirm Deactivate Business Owner"
                  : "Confirm Activate Business Owner"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowDeactivateModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to{" "}
                {selectedBusinessOwner.isActive ? "deactivate" : "activate"}{" "}
                Business Owner <strong>{selectedBusinessOwner.fullName}</strong>
                ?
              </p>
              <p
                className={
                  selectedBusinessOwner.isActive ? "warning-text" : "info-text"
                }
              >
                {selectedBusinessOwner.isActive
                  ? "The business owner will not be able to access the system, but data will be retained."
                  : "The business owner will be able to access and use the system again."}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </button>
              <button
                className={
                  selectedBusinessOwner.isActive
                    ? "btn-deactivate"
                    : "btn-activate"
                }
                onClick={confirmDeactivate}
              >
                {selectedBusinessOwner.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedBusinessOwner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Approval of Business Owner</h3>
              <button
                className="modal-close"
                onClick={() => setShowApproveModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to approve Business Owner{" "}
                <strong>{selectedBusinessOwner.fullName}</strong>?
              </p>
              <p className="success-text">
                After approval, the business owner will be able to access and
                use the system.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button className="btn-approve" onClick={confirmApprove}>
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedBusinessOwner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Rejection of Business Owner</h3>
              <button
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to reject the registration request of{" "}
                <strong>{selectedBusinessOwner.fullName}</strong>?
              </p>
              <p className="warning-text">
                The registration request will be removed and the business owner
                will not be able to access the system.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button className="btn-reject" onClick={confirmReject}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBusinessOwner && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <div className="modal-header">
              <h3>Business Owner Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-modal-grid">
                <div className="detail-modal-left">
                  <div className="detail-avatar">
                    {selectedBusinessOwner.fullName.charAt(0)}
                  </div>
                  <div className="detail-name">
                    {selectedBusinessOwner.fullName}
                  </div>
                  <div className="detail-status">
                    {getStatusBadge(selectedBusinessOwner)}
                  </div>
                </div>
                <div className="detail-modal-right">
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {selectedBusinessOwner.email}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {selectedBusinessOwner.phoneNumber || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Organization:</span>
                    <span className="detail-value">
                      {selectedBusinessOwner.organization}
                    </span>
                  </div>
                  {selectedBusinessOwner.businessLicense && (
                    <div className="detail-row license-row">
                      <span className="detail-label">Business License:</span>
                      <div className="license-display">
                        <img
                          src={selectedBusinessOwner.businessLicense}
                          alt="Business License"
                          className="license-thumbnail"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <button
                          className="view-license-btn"
                          onClick={() => setShowLicensePreview(true)}
                          title="View license"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Account Created:</span>
                    <span className="detail-value">
                      {new Date(
                        selectedBusinessOwner.createdAt
                      ).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <hr style={{ margin: "16px 0" }} />
                  <div className="detail-row">
                    <span className="detail-label">Subscription Plan:</span>
                    <span className="detail-value">
                      {(selectedBusinessOwner as any).packageName || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Expiry Date:</span>
                    <span className="detail-value">
                      {(selectedBusinessOwner as any).packageExpireDate || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Days Left:</span>
                    <span className="detail-value">
                      {getDaysLeft(
                        (selectedBusinessOwner as any).packageExpireDate
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {!selectedBusinessOwner.isApproved && (
                <>
                  <button
                    className="btn-reject"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleRejectBusinessOwner(selectedBusinessOwner);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApproveBusinessOwner(selectedBusinessOwner);
                    }}
                  >
                    Approve
                  </button>
                </>
              )}
              <button
                className="btn-cancel"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* License Preview Modal */}
      {showLicensePreview && selectedBusinessOwner?.businessLicense && (
        <div
          className="modal-overlay"
          onClick={() => setShowLicensePreview(false)}
        >
          <div
            className="license-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="license-preview-close"
              onClick={() => setShowLicensePreview(false)}
              title="Đóng"
            >
              <X size={24} />
            </button>
            <img
              src={selectedBusinessOwner.businessLicense}
              alt="Business License Full View"
              className="license-preview-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23999'%3EUnable to load image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-business-owners {
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

        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 40px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #ff5e13;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #787486;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #787486;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #ffa463;
          color: #ff5e13;
        }

        .filter-btn.active {
          background: #ff5e13;
          border-color: #ff5e13;
          color: white;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-item {
          background: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #0d062d;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #787486;
        }

        .business-owners-table {
          background: white;
          border-radius: 16px;
          overflow-x: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          min-width: 100%; /* Đảm bảo bảng có thể scroll ngang */
        }

        .table-header,
        .table-row {
          min-width: 1200px; /* Đặt chiều rộng tối thiểu cho bảng */
        }

        .table-header {
          display: grid;
          grid-template-columns: 180px 200px 140px 180px 120px 160px 140px;
          background: #f9f4ee;
          padding: 16px 20px;
          font-weight: 600;
          color: #0d062d;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 180px 200px 140px 180px 120px 160px 140px;
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
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 4px;
        }

        .business-owner-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .business-owner-avatar {
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

        .business-owner-name {
          font-weight: 500;
        }

        .status-badge,
        .organization-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .organization-badge {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
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
          transform: scale(1.1);
        }

        .action-btn.view {
          color: #3b82f6;
        }

        .action-btn.view:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .action-btn.edit {
          color: #f59e0b;
        }

        .action-btn.edit:hover {
          background: #fef3c7;
          color: #d97706;
        }

        .action-btn.deactivate {
          color: #f50b0b;
        }

        .action-btn.deactivate:hover {
          background: #fed5c7;
          color: #f50b0b;
        }

        .action-btn.activate {
          color: #10b981;
        }

        .action-btn.activate:hover {
          background: #d1fae5;
          color: #059669;
        }

        .action-btn.delete {
          color: #ef4444;
        }

        .action-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn.approve {
          color: #10b981;
        }

        .action-btn.approve:hover {
          background: #d1fae5;
          color: #059669;
        }

        .action-btn.reject {
          color: #ef4444;
        }

        .action-btn.reject:hover {
          background: #fee2e2;
          color: #dc2626;
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
          border-radius: 12px;
          max-width: 700px; /* tăng lên */
          width: 98%; /* tăng lên */
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .detail-modal {
          max-width: 700px; /* thêm dòng này nếu chưa có */
          width: 98%;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0d062d;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body p {
          margin: 0 0 12px 0;
          color: #374151;
          line-height: 1.5;
        }

        .warning-text {
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
        }

        .info-text {
          color: #059669;
          font-size: 14px;
          font-weight: 500;
        }

        .success-text {
          color: #059669;
          font-size: 14px;
          font-weight: 500;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel,
        .btn-delete,
        .btn-deactivate,
        .btn-approve,
        .btn-reject {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #0369a1;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-delete {
          background: #dc2626;
          color: white;
        }

        .btn-delete:hover {
          background: #b91c1c;
        }

        .btn-deactivate {
          background: #f59e0b;
          color: white;
        }

        .btn-deactivate:hover {
          background: #d97706;
        }

        .btn-activate {
          background: #10b981;
          color: white;
        }

        .btn-activate:hover {
          background: #059669;
        }

        .btn-approve {
          background: #10b981;
          color: white;
        }

        .btn-approve:hover {
          background: #059669;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-reject:hover {
          background: #dc2626;
        }

        @media (max-width: 1400px) {
          .table-header {
            display: none;
          }

          .table-row {
            display: block;
            margin-bottom: 16px;
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
          }

          .table-cell {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px 0;
            white-space: normal;
            overflow: visible;
            text-overflow: unset;
          }

          .table-cell:last-child {
            margin-bottom: 0;
          }

          .table-cell::before {
            content: attr(data-label);
            font-weight: 600;
            color: #787486;
            min-width: 120px;
          }

          .action-buttons {
            justify-content: flex-end;
          }
        }

        @media (max-width: 768px) {
          .admin-business-owners {
            padding: 16px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .search-box {
            max-width: none;
          }

          .filter-buttons {
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px;
          }

          .filter-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .stats-row {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .stat-item {
            padding: 16px;
          }

          .stat-number {
            font-size: 20px;
          }

          .business-owner-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .action-buttons {
            flex-wrap: wrap;
            gap: 4px;
          }

          .action-btn {
            width: 28px;
            height: 28px;
          }

          .modal-content {
            width: 95%;
            margin: 20px;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .admin-business-owners {
            padding: 12px;
          }

          .page-header h1 {
            font-size: 20px;
          }

          .stats-row {
            grid-template-columns: 1fr;
          }

          .filter-buttons {
            gap: 4px;
          }

          .filter-btn {
            padding: 4px 8px;
            font-size: 11px;
          }

          .table-cell::before {
            min-width: 100px;
            font-size: 12px;
          }

          .business-owner-name {
            font-size: 14px;
          }

          .status-badge,
          .organization-badge {
            font-size: 10px;
            padding: 2px 6px;
          }
        }
        .detail-modal-grid {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          padding: 26px 0;
        }
        .detail-modal-left {
          min-width: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .detail-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #ffa463 0%, #ff5e13 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 28px;
          margin-bottom: 4px;
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.15);
        }
        .detail-name {
          font-size: 18px;
          font-weight: 600;
          color: #0d062d;
          text-align: center;
        }
        .detail-status {
          margin-top: 4px;
        }
        .detail-modal-right {
          flex: 1;
          background: #f9f4ee;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .detail-label {
          font-weight: 500;
          color: #787486;
          min-width: 120px;
        }
        .detail-value {
          color: #0d062d;
          font-weight: 500;
          text-align: right;
          word-break: break-word;
        }
        @media (max-width: 768px) {
          .detail-modal-grid {
            flex-direction: column;
            gap: 16px;
          }
          .detail-modal-right {
            padding: 12px;
          }
          .detail-avatar {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
        }

        .license-row {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 12px;
        }

        .license-display {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .license-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          transition: transform 0.2s ease;
        }

        .license-thumbnail:hover {
          transform: scale(1.05);
        }

        .view-license-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #ff5e13;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-license-btn:hover {
          background: #e85a0a;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(255, 94, 19, 0.2);
        }

        .license-preview-modal {
          background: white;
          border-radius: 12px;
          padding: 20px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
          position: relative;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .license-preview-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .license-preview-close:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .license-preview-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 8px;
          display: block;
          margin: 0 auto;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .license-row {
            flex-direction: column;
          }

          .license-display {
            flex-direction: column;
            align-items: flex-start;
          }

          .license-thumbnail {
            width: 80px;
            height: 80px;
          }

          .license-preview-modal {
            max-width: 95vw;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBusinessOwners;
