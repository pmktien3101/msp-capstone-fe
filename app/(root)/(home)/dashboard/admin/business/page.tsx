"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  X,
  Search,
  CheckCircle,
  XCircle,
  UserX,
  Briefcase,
  Users,
  Clock,
  UserCheck,
  UserMinus,
  Mail,
  Phone,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";
import type { BusinessOwner } from "@/types/auth";
import "../../../../../styles/business.scss";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      (filterStatus === "active" &&
        businessOwner.isApproved &&
        businessOwner.isActive) ||
      (filterStatus === "inactive" &&
        businessOwner.isApproved &&
        !businessOwner.isActive);
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBusinessOwners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBusinessOwners = filteredBusinessOwners.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

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

    if (!isApproved) {
      return <span className="status-badge pending">Pending</span>;
    } else if (isActive) {
      return <span className="status-badge active">Active</span>;
    } else {
      return <span className="status-badge inactive">Inactive</span>;
    }
  };

  // Stats calculations
  const totalOwners = businessOwners.length;
  const pendingCount = businessOwners.filter((bo) => !bo.isApproved).length;
  const activeCount = businessOwners.filter(
    (bo) => bo.isApproved && bo.isActive
  ).length;
  const inactiveCount = businessOwners.filter(
    (bo) => bo.isApproved && !bo.isActive
  ).length;

  return (
    <div className="admin-business">
      {/* Page Header */}
      <div className="page-header">
        <h1>
          <Briefcase size={26} className="header-icon" />
          Manage Business Owners
        </h1>
        <p>Manage all business owners using the system</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Owners</span>
            <div className="stat-icon total">
              <Users size={16} />
            </div>
          </div>
          <div className="stat-value">{totalOwners}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pending</span>
            <div className="stat-icon pending">
              <Clock size={16} />
            </div>
          </div>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active</span>
            <div className="stat-icon active">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="stat-value">{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Inactive</span>
            <div className="stat-icon inactive">
              <UserMinus size={16} />
            </div>
          </div>
          <div className="stat-value">{inactiveCount}</div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="filters-card">
        <div className="filters-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">
              <Search size={15} />
            </span>
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All
            </button>
            <button
              className={`filter-tab ${
                filterStatus === "pending" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${
                filterStatus === "active" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("active")}
            >
              Active
            </button>
            <button
              className={`filter-tab ${
                filterStatus === "inactive" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("inactive")}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading business owners...</p>
          </div>
        ) : filteredBusinessOwners.length === 0 ? (
          <div className="empty-state">
            <Users size={40} className="empty-icon" />
            <p>No business owners found</p>
          </div>
        ) : (
          <table className="business-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <Users size={13} />
                    Full Name
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Mail size={13} />
                    Email
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Phone size={13} />
                    Phone
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Building2 size={13} />
                    Organization
                  </div>
                </th>
                <th>Status</th>
                <th>
                  <div className="th-content">
                    <Calendar size={13} />
                    Created
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBusinessOwners.map((businessOwner) => (
                <tr key={businessOwner.id}>
                  <td data-label="Full Name">
                    <div className="owner-info">
                      <div className="owner-avatar">
                        {businessOwner.fullName.charAt(0)}
                      </div>
                      <span className="owner-name">
                        {businessOwner.fullName}
                      </span>
                    </div>
                  </td>
                  <td data-label="Email">{businessOwner.email}</td>
                  <td data-label="Phone">{businessOwner.phoneNumber || "-"}</td>
                  <td data-label="Organization">
                    <span className="org-badge">
                      <Building2 size={12} />
                      {businessOwner.organization}
                    </span>
                  </td>
                  <td data-label="Status">{getStatusBadge(businessOwner)}</td>
                  <td data-label="Created">
                    {new Date(businessOwner.createdAt).toLocaleDateString(
                      "en-US"
                    )}
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        title="View Details"
                        onClick={() => handleViewBusinessOwner(businessOwner)}
                      >
                        <Eye size={15} />
                      </button>
                      {!businessOwner.isApproved ? (
                        <>
                          <button
                            className="action-btn approve"
                            title="Approve"
                            onClick={() =>
                              handleApproveBusinessOwner(businessOwner)
                            }
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            className="action-btn reject"
                            title="Reject"
                            onClick={() =>
                              handleRejectBusinessOwner(businessOwner)
                            }
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      ) : (
                        businessOwner.isApproved && (
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
                            <UserX size={15} />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!isLoading && filteredBusinessOwners.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} -{" "}
              {Math.min(endIndex, filteredBusinessOwners.length)} of{" "}
              {filteredBusinessOwners.length} business owners
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`pagination-page ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
              title="Close"
            >
              <X size={20} />
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
    </div>
  );
};

export default AdminBusinessOwners;
