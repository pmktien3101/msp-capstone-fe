'use client';

import React, { useState } from 'react';
import { Eye, Edit, Pause, Trash2, X, Search } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  email: string;
  domain: string;
  phone: string;
  plan: string;
  status: 'active' | 'trial' | 'suspended' | 'inactive';
  users: number;
  joinDate: string;
  revenue: string;
}

const AdminCompanies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: 'Công ty ABC',
      email: 'contact@abc.com',
      domain: '@abc.com',
      phone: '+84 123 456 789',
      plan: 'Premium',
      status: 'active',
      users: 25,
      joinDate: '2024-01-15',
      revenue: '$2,500'
    },
    {
      id: 2,
      name: 'Công ty XYZ',
      email: 'info@xyz.com',
      domain: '@xyz.com',
      phone: '+84 987 654 321',
      plan: 'Basic',
      status: 'active',
      users: 10,
      joinDate: '2024-02-20',
      revenue: '$500'
    },
    {
      id: 3,
      name: 'Công ty DEF',
      email: 'hello@def.com',
      domain: '@def.com',
      phone: '+84 555 123 456',
      plan: 'Enterprise',
      status: 'trial',
      users: 50,
      joinDate: '2024-03-10',
      revenue: '$0'
    },
    {
      id: 4,
      name: 'Công ty GHI',
      email: 'contact@ghi.com',
      domain: '@ghi.com',
      phone: '+84 111 222 333',
      plan: 'Premium',
      status: 'suspended',
      users: 15,
      joinDate: '2024-01-05',
      revenue: '$1,500'
    },
    {
      id: 5,
      name: 'Công ty JKL',
      email: 'support@jkl.com',
      domain: '@jkl.com',
      phone: '+84 444 555 666',
      plan: 'Basic',
      status: 'inactive',
      users: 5,
      joinDate: '2024-04-01',
      revenue: '$0'
    }
  ]);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleDeactivateCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowDeactivateModal(true);
  };

  const confirmDelete = () => {
    if (selectedCompany) {
      setCompanies(companies.filter(c => c.id !== selectedCompany.id));
      setShowDeleteModal(false);
      setSelectedCompany(null);
    }
  };

  const confirmDeactivate = () => {
    if (selectedCompany) {
      setCompanies(companies.map(c => 
        c.id === selectedCompany.id 
          ? { ...c, status: 'inactive' as const }
          : c
      ));
      setShowDeactivateModal(false);
      setSelectedCompany(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#D1FAE5', textColor: '#065F46', text: 'Hoạt động' },
      trial: { color: '#FEF3C7', textColor: '#92400E', text: 'Dùng thử' },
      suspended: { color: '#FEE2E2', textColor: '#991B1B', text: 'Tạm dừng' },
      inactive: { color: '#F3F4F6', textColor: '#6B7280', text: 'Không hoạt động' }
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

  const getPlanBadge = (plan: string) => {
    const planConfig = {
      Basic: { color: '#E5E7EB', textColor: '#374151' },
      Premium: { color: '#DBEAFE', textColor: '#1E40AF' },
      Enterprise: { color: '#F3E8FF', textColor: '#7C3AED' }
    };
    
    const config = planConfig[plan as keyof typeof planConfig];
    return (
      <span 
        className="plan-badge"
        style={{ 
          backgroundColor: config.color, 
          color: config.textColor 
        }}
      >
        {plan}
      </span>
    );
  };

  return (
    <div className="admin-companies">
      <div className="page-header">
        <h1>Quản Lý Doanh Nghiệp</h1>
        <p>Quản lý tất cả các doanh nghiệp đang sử dụng hệ thống</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon"><Search size={16}/></span>
          {/* <Search className="search-icon" size={16} /> */}
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
            className={`filter-btn ${filterStatus === 'trial' ? 'active' : ''}`}
            onClick={() => setFilterStatus('trial')}
          >
            Dùng thử
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'suspended' ? 'active' : ''}`}
            onClick={() => setFilterStatus('suspended')}
          >
            Tạm dừng
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            Không hoạt động
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{companies.length}</span>
          <span className="stat-label">Tổng doanh nghiệp</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{companies.filter(c => c.status === 'active').length}</span>
          <span className="stat-label">Đang hoạt động</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{companies.filter(c => c.status === 'trial').length}</span>
          <span className="stat-label">Dùng thử</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{companies.reduce((sum, c) => sum + c.users, 0)}</span>
          <span className="stat-label">Tổng người dùng</span>
        </div>
      </div>

      {/* Companies Table */}
      <div className="companies-table">
        <div className="table-header">
          <div className="table-cell">Tên công ty</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Domain</div>
          <div className="table-cell">Số điện thoại</div>
          <div className="table-cell">Gói</div>
          <div className="table-cell">Trạng thái</div>
          <div className="table-cell">Người dùng</div>
          <div className="table-cell">Ngày tham gia</div>
          <div className="table-cell">Doanh thu</div>
          <div className="table-cell">Hành động</div>
        </div>

        {filteredCompanies.map((company) => (
          <div key={company.id} className="table-row">
            <div className="table-cell" data-label="Tên công ty">
              <div className="company-info">
                <div className="company-avatar">
                  {company.name.charAt(0)}
                </div>
                <span className="company-name">{company.name}</span>
              </div>
            </div>
            <div className="table-cell" data-label="Email">{company.email}</div>
            <div className="table-cell" data-label="Domain">
              <span className="domain-badge">{company.domain}</span>
            </div>
            <div className="table-cell" data-label="Số điện thoại">{company.phone}</div>
            <div className="table-cell" data-label="Gói">{getPlanBadge(company.plan)}</div>
            <div className="table-cell" data-label="Trạng thái">{getStatusBadge(company.status)}</div>
            <div className="table-cell" data-label="Người dùng">{company.users}</div>
            <div className="table-cell" data-label="Ngày tham gia">{company.joinDate}</div>
            <div className="table-cell" data-label="Doanh thu">{company.revenue}</div>
            <div className="table-cell" data-label="Hành động">
              <div className="action-buttons">
                <button className="action-btn view" title="Xem chi tiết">
                  <Eye size={16} />
                </button>
                <button className="action-btn edit" title="Chỉnh sửa">
                  <Edit size={16} />
                </button>
                {company.status !== 'inactive' && (
                  <button 
                    className="action-btn deactivate" 
                    title="Vô hiệu hóa"
                    onClick={() => handleDeactivateCompany(company)}
                  >
                    <Pause size={16} />
                  </button>
                )}
                <button 
                  className="action-btn delete" 
                  title="Xóa"
                  onClick={() => handleDeleteCompany(company)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompany && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xác nhận xóa công ty</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa công ty <strong>{selectedCompany.name}</strong>?</p>
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
      {showDeactivateModal && selectedCompany && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xác nhận vô hiệu hóa công ty</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeactivateModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn vô hiệu hóa công ty <strong>{selectedCompany.name}</strong>?</p>
              <p className="info-text">Công ty sẽ không thể truy cập hệ thống nhưng dữ liệu sẽ được giữ lại.</p>
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
        .admin-companies {
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

        .companies-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
          background: #F9F4EE;
          padding: 16px 20px;
          font-weight: 600;
          color: #0D062D;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
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
        }

        .company-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-avatar {
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

        .company-name {
          font-weight: 500;
        }

        .status-badge, .plan-badge, .domain-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .domain-badge {
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

        @media (max-width: 1200px) {
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
          .admin-companies {
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
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-item {
            padding: 16px;
          }

          .stat-number {
            font-size: 20px;
          }

          .company-info {
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
          .admin-companies {
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

          .company-name {
            font-size: 14px;
          }

          .status-badge, .plan-badge, .domain-badge {
            font-size: 10px;
            padding: 2px 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminCompanies;
