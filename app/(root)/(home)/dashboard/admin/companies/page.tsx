'use client';

import React, { useState } from 'react';
import { Eye, Edit, Pause, Trash2, X, Search } from 'lucide-react';

interface BusinessOwner {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastLogin: string;
}

const AdminBusinessOwners = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedBusinessOwner, setSelectedBusinessOwner] = useState<BusinessOwner | null>(null);

  const [businessOwners, setBusinessOwners] = useState<BusinessOwner[]>([
    {
      id: 1,
      fullName: 'Nguyễn Văn An',
      email: 'an.nguyen@abc.com',
      phone: '+84 123 456 789',
      organizationName: 'Công ty ABC',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-12-20'
    },
    {
      id: 2,
      fullName: 'Trần Thị Bình',
      email: 'binh.tran@xyz.com',
      phone: '+84 987 654 321',
      organizationName: 'Công ty XYZ',
      status: 'active',
      joinDate: '2024-02-20',
      lastLogin: '2024-12-19'
    },
    {
      id: 3,
      fullName: 'Lê Văn Cường',
      email: 'cuong.le@def.com',
      phone: '+84 555 123 456',
      organizationName: 'Công ty DEF',
      status: 'active',
      joinDate: '2024-03-10',
      lastLogin: '2024-12-18'
    },
    {
      id: 4,
      fullName: 'Phạm Thị Dung',
      email: 'dung.pham@ghi.com',
      phone: '+84 111 222 333',
      organizationName: 'Công ty GHI',
      status: 'inactive',
      joinDate: '2024-01-05',
      lastLogin: '2024-12-10'
    },
    {
      id: 5,
      fullName: 'Hoàng Văn Em',
      email: 'em.hoang@jkl.com',
      phone: '+84 444 555 666',
      organizationName: 'Công ty JKL',
      status: 'inactive',
      joinDate: '2024-04-01',
      lastLogin: '2024-11-15'
    }
  ]);

  const filteredBusinessOwners = businessOwners.filter(businessOwner => {
    const matchesSearch = businessOwner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         businessOwner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         businessOwner.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         businessOwner.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || businessOwner.status === filterStatus;
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

  const confirmDelete = () => {
    if (selectedBusinessOwner) {
      setBusinessOwners(businessOwners.filter(bo => bo.id !== selectedBusinessOwner.id));
      setShowDeleteModal(false);
      setSelectedBusinessOwner(null);
    }
  };

  const confirmDeactivate = () => {
    if (selectedBusinessOwner) {
      setBusinessOwners(businessOwners.map(bo => 
        bo.id === selectedBusinessOwner.id 
          ? { ...bo, status: 'inactive' as const }
          : bo
      ));
      setShowDeactivateModal(false);
      setSelectedBusinessOwner(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#D1FAE5', textColor: '#065F46', text: 'Hoạt động' },
      inactive: { color: '#F3F4F6', textColor: '#6B7280', text: 'Ngừng hoạt động' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: config.color, 
          color: config.textColor 
        }}
      >
        {config.text}
      </span>
    );
  };


  return (
    <div className="admin-business-owners">
      <div className="page-header">
        <h1>Quản Lý Business Owner</h1>
        <p>Quản lý tất cả các Business Owner đang sử dụng hệ thống</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc tên tổ chức..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon"><Search size={16}/></span>
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Hoạt động
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            Ngừng hoạt động
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{businessOwners.length}</span>
          <span className="stat-label">Tổng Business Owner</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{businessOwners.filter(bo => bo.status === 'active').length}</span>
          <span className="stat-label">Đang hoạt động</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{businessOwners.filter(bo => bo.status === 'inactive').length}</span>
          <span className="stat-label">Ngừng hoạt động</span>
        </div>
      </div>

      {/* Business Owners Table */}
      <div className="business-owners-table">
        <div className="table-header">
          <div className="table-cell">Họ và tên</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Số điện thoại</div>
          <div className="table-cell">Tên tổ chức</div>
          <div className="table-cell">Trạng thái</div>
          <div className="table-cell">Ngày tham gia</div>
          <div className="table-cell">Lần đăng nhập cuối</div>
          <div className="table-cell">Hành động</div>
        </div>

        {filteredBusinessOwners.map((businessOwner) => (
          <div key={businessOwner.id} className="table-row">
            <div className="table-cell" data-label="Họ và tên">
              <div className="business-owner-info">
                <div className="business-owner-avatar">
                  {businessOwner.fullName.charAt(0)}
                </div>
                <span className="business-owner-name">{businessOwner.fullName}</span>
              </div>
            </div>
            <div className="table-cell" data-label="Email">{businessOwner.email}</div>
            <div className="table-cell" data-label="Số điện thoại">{businessOwner.phone}</div>
            <div className="table-cell" data-label="Tên tổ chức">
              <span className="organization-badge">{businessOwner.organizationName}</span>
            </div>
            <div className="table-cell" data-label="Trạng thái">{getStatusBadge(businessOwner.status)}</div>
            <div className="table-cell" data-label="Ngày tham gia">{businessOwner.joinDate}</div>
            <div className="table-cell" data-label="Lần đăng nhập cuối">{businessOwner.lastLogin}</div>
            <div className="table-cell" data-label="Hành động">
              <div className="action-buttons">
                <button className="action-btn view" title="Xem chi tiết">
                  <Eye size={16} />
                </button>
                <button className="action-btn edit" title="Chỉnh sửa">
                  <Edit size={16} />
                </button>
                {businessOwner.status !== 'inactive' && (
                  <button 
                    className="action-btn deactivate" 
                    title="Vô hiệu hóa"
                    onClick={() => handleDeactivateBusinessOwner(businessOwner)}
                  >
                    <Pause size={16} />
                  </button>
                )}
                <button 
                  className="action-btn delete" 
                  title="Xóa"
                  onClick={() => handleDeleteBusinessOwner(businessOwner)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBusinessOwner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xác nhận xóa Business Owner</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa Business Owner <strong>{selectedBusinessOwner.fullName}</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-delete"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && selectedBusinessOwner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xác nhận vô hiệu hóa Business Owner</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeactivateModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn vô hiệu hóa Business Owner <strong>{selectedBusinessOwner.fullName}</strong>?</p>
              <p className="info-text">Business Owner sẽ không thể truy cập hệ thống nhưng dữ liệu sẽ được giữ lại.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeactivateModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-deactivate"
                onClick={confirmDeactivate}
              >
                Vô hiệu hóa
              </button>
            </div>
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
          color: #0D062D;
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
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #FF5E13;
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
          border: 2px solid #E5E7EB;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #787486;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #FFA463;
          color: #FF5E13;
        }

        .filter-btn.active {
          background: #FF5E13;
          border-color: #FF5E13;
          color: white;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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
          color: #0D062D;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #787486;
        }

        .business-owners-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .table-header {
          display: grid;
          grid-template-columns: 180px 200px 140px 180px 120px 120px 120px 140px;
          background: #F9F4EE;
          padding: 16px 20px;
          font-weight: 600;
          color: #0D062D;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 180px 200px 140px 180px 120px 120px 120px 140px;
          padding: 16px 20px;
          border-bottom: 1px solid #F3F4F6;
          align-items: center;
          transition: background 0.3s ease;
        }

        .table-row:hover {
          background: #F9F4EE;
        }

        .table-cell {
          font-size: 14px;
          color: #0D062D;
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
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
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

        .status-badge, .organization-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .organization-badge {
          background: #E0F2FE;
          color: #0369A1;
          border: 1px solid #BAE6FD;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #F3F4F6;
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
          color: #3B82F6;
        }

        .action-btn.view:hover {
          background: #DBEAFE;
          color: #1D4ED8;
        }

        .action-btn.edit {
          color: #F59E0B;
        }

        .action-btn.edit:hover {
          background: #FEF3C7;
          color: #D97706;
        }

        .action-btn.deactivate {
          color: #F59E0B;
        }

        .action-btn.deactivate:hover {
          background: #FEF3C7;
          color: #D97706;
        }

        .action-btn.delete {
          color: #EF4444;
        }

        .action-btn.delete:hover {
          background: #FEE2E2;
          color: #DC2626;
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
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #6B7280;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #F3F4F6;
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
          color: #DC2626;
          font-size: 14px;
          font-weight: 500;
        }

        .info-text {
          color: #059669;
          font-size: 14px;
          font-weight: 500;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #E5E7EB;
        }

        .btn-cancel, .btn-delete, .btn-deactivate {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-cancel {
          background: #F3F4F6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #E5E7EB;
        }

        .btn-delete {
          background: #DC2626;
          color: white;
        }

        .btn-delete:hover {
          background: #B91C1C;
        }

        .btn-deactivate {
          background: #F59E0B;
          color: white;
        }

        .btn-deactivate:hover {
          background: #D97706;
        }

        @media (max-width: 1400px) {
          .table-header {
            display: none;
          }

          .table-row {
            display: block;
            margin-bottom: 16px;
            padding: 16px;
            border: 1px solid #E5E7EB;
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

          .status-badge, .organization-badge {
            font-size: 10px;
            padding: 2px 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBusinessOwners;
