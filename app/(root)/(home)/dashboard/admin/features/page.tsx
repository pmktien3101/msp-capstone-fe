'use client';

import React, { useState } from 'react';
import { 
  Plus, Search, Filter, X, Check, Edit, Trash2, Eye, 
  Users, HardDrive, Headphones, Plug, Shield, BarChart3, 
  Handshake, Video, Palette, Zap, Save, ArrowLeft,
  CheckCircle,
  CheckCircle2
} from 'lucide-react';

const AdminFeatures = () => {
  const [activeTab, setActiveTab] = useState('features');
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showEditFeatureModal, setShowEditFeatureModal] = useState(false);
  const [showViewFeatureModal, setShowViewFeatureModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');

  // Danh sách các nhóm tính năng
  const featureGroups = [
    { id: 'users', name: 'Số lượng người dùng', icon: Users, color: '#3B82F6' },
    { id: 'storage', name: 'Dung lượng lưu trữ', icon: HardDrive, color: '#10B981' },
    { id: 'support', name: 'Hỗ trợ khách hàng', icon: Headphones, color: '#F59E0B' },
    { id: 'integrations', name: 'Tích hợp & API', icon: Plug, color: '#8B5CF6' },
    { id: 'security', name: 'Bảo mật & Sao lưu', icon: Shield, color: '#EF4444' },
    { id: 'analytics', name: 'Phân tích & Báo cáo', icon: BarChart3, color: '#06B6D4' },
    { id: 'collaboration', name: 'Cộng tác & Quản lý', icon: Handshake, color: '#84CC16' },
    { id: 'communication', name: 'Giao tiếp & Họp', icon: Video, color: '#EC4899' },
    { id: 'customization', name: 'Tùy chỉnh & Giao diện', icon: Palette, color: '#F97316' },
    { id: 'automation', name: 'Tự động hóa', icon: Zap, color: '#EAB308' }
  ];

  // State cho feature mới
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    groupId: '',
    status: 'active'
  });

  // Sample data - trong thực tế sẽ lấy từ API
  const [features, setFeatures] = useState([
    {
      id: 1,
      name: 'Tối đa 10 người dùng',
      description: 'Cho phép tối đa 10 thành viên trong team',
      groupId: 'users',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Tối đa 25 người dùng',
      description: 'Cho phép tối đa 25 thành viên trong team',
      groupId: 'users',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 3,
      name: '5GB lưu trữ',
      description: 'Dung lượng lưu trữ 5GB',
      groupId: 'storage',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 4,
      name: 'Hỗ trợ email',
      description: 'Hỗ trợ khách hàng qua email',
      groupId: 'support',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 5,
      name: 'API access',
      description: 'Truy cập API để tích hợp với hệ thống khác',
      groupId: 'integrations',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  // Filter features
  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || feature.groupId === filterGroup;
    return matchesSearch && matchesGroup;
  });

  // Handler functions
  const handleInputChange = (field: string, value: string) => {
    setNewFeature(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    if (!newFeature.name || !newFeature.description || !newFeature.groupId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const feature = {
      id: features.length + 1,
      ...newFeature,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setFeatures(prev => [...prev, feature]);
    setNewFeature({ name: '', description: '', groupId: '', status: 'active' });
    setShowAddFeatureModal(false);
  };

  const handleEditFeature = (feature: any) => {
    setSelectedFeature(feature);
    setNewFeature({
      name: feature.name,
      description: feature.description,
      groupId: feature.groupId,
      status: feature.status
    });
    setShowEditFeatureModal(true);
  };

  const handleUpdateFeature = () => {
    if (!newFeature.name || !newFeature.description || !newFeature.groupId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setFeatures(prev => prev.map(feature => 
      feature.id === selectedFeature?.id 
        ? { ...feature, ...newFeature, updatedAt: new Date().toISOString().split('T')[0] }
        : feature
    ));

    setNewFeature({ name: '', description: '', groupId: '', status: 'active' });
    setSelectedFeature(null);
    setShowEditFeatureModal(false);
  };

  const handleDeleteFeature = (feature: any) => {
    setSelectedFeature(feature);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setFeatures(prev => prev.filter(feature => feature.id !== selectedFeature.id));
    setSelectedFeature(null);
    setShowDeleteConfirm(false);
  };

  const handleViewFeature = (feature: any) => {
    setSelectedFeature(feature);
    setShowViewFeatureModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { text: string; class: string }> = {
      active: { text: 'Hoạt động', class: 'status-active' },
      inactive: { text: 'Không hoạt động', class: 'status-inactive' }
    };
    return (
      <span className={`status-badge ${config[status]?.class || 'status-inactive'}`}>
        {config[status]?.text || 'Không xác định'}
      </span>
    );
  };

  const getGroupInfo = (groupId: string) => {
    return featureGroups.find(group => group.id === groupId);
  };

  return (
    <div className="admin-features">
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div>
              <h1>Quản Lý Tính Năng</h1>
              <p>Quản lý các tính năng cho gói dịch vụ</p>
            </div>
          </div>
          <button 
            className="add-btn"
            onClick={() => setShowAddFeatureModal(true)}
          >
            <Plus size={20} />
            Thêm tính năng
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card stat-card-total">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{features.length}</h3>
            <p>Tổng tính năng</p>
          </div>
        </div>
        <div className="stat-card stat-card-active">
          <div className="stat-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <h3>{features.filter(f => f.status === 'active').length}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div className="stat-card stat-card-inactive">
          <div className="stat-icon">
            <X size={24} />
          </div>
          <div className="stat-content">
            <h3>{features.filter(f => f.status === 'inactive').length}</h3>
            <p>Không hoạt động</p>
          </div>
        </div>
        <div className="stat-card stat-card-groups">
          <div className="stat-icon">
            <Filter size={24} />
          </div>
          <div className="stat-content">
            <h3>{featureGroups.length}</h3>
            <p>Nhóm tính năng</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          {/* <Search className="search-icon" size={16} /> */}
          <span className="search-icon"><Search size={16}/></span>

          <input
            type="text"
            placeholder="Tìm kiếm tính năng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterGroup === 'all' ? 'active' : ''}`}
            onClick={() => setFilterGroup('all')}
          >
            Tất cả
          </button>
          {featureGroups.map(group => {
            const IconComponent = group.icon;
            return (
              <button
                key={group.id}
                className={`filter-btn ${filterGroup === group.id ? 'active' : ''}`}
                onClick={() => setFilterGroup(group.id)}
              >
                <IconComponent size={16} style={{ color: group.color }} />
                {group.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Features Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-cell">Tên tính năng</div>
          <div className="table-cell">Mô tả</div>
          <div className="table-cell">Nhóm</div>
          <div className="table-cell">Trạng thái</div>
          <div className="table-cell">Ngày tạo</div>
          <div className="table-cell">Thao tác</div>
        </div>
        {filteredFeatures.map((feature) => {
          const groupInfo = getGroupInfo(feature.groupId);
          const IconComponent = groupInfo?.icon;
          return (
            <div key={feature.id} className="table-row">
              <div className="table-cell" data-label="Tên tính năng">
                <div className="feature-name">
                  <span className="feature-text">{feature.name}</span>
                </div>
              </div>
              <div className="table-cell" data-label="Mô tả">
                <span className="feature-description">{feature.description}</span>
              </div>
              <div className="table-cell" data-label="Nhóm">
                <div className="group-badge">
                  {IconComponent && <IconComponent size={16} style={{ color: groupInfo.color }} />}
                  <span>{groupInfo?.name}</span>
                </div>
              </div>
              <div className="table-cell" data-label="Trạng thái">
                {getStatusBadge(feature.status)}
              </div>
              <div className="table-cell" data-label="Ngày tạo">
                <span className="date-text">{feature.createdAt}</span>
              </div>
              <div className="table-cell" data-label="Thao tác">
                <div className="action-buttons">
                  <button
                    className="action-btn view"
                    onClick={() => handleViewFeature(feature)}
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditFeature(feature)}
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteFeature(feature)}
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Feature Modal */}
      {showAddFeatureModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Thêm tính năng mới</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddFeatureModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên tính năng *</label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên tính năng"
                />
              </div>
              <div className="form-group">
                <label>Mô tả *</label>
                <textarea
                  value={newFeature.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Nhập mô tả tính năng"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Nhóm tính năng *</label>
                <select
                  value={newFeature.groupId}
                  onChange={(e) => handleInputChange('groupId', e.target.value)}
                >
                  <option value="">Chọn nhóm tính năng</option>
                  {featureGroups.map(group => {
                    const IconComponent = group.icon;
                    return (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={newFeature.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowAddFeatureModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                onClick={handleAddFeature}
              >
                <Save size={16} />
                Thêm tính năng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Feature Modal */}
      {showEditFeatureModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Chỉnh sửa tính năng</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditFeatureModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên tính năng *</label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nhập tên tính năng"
                />
              </div>
              <div className="form-group">
                <label>Mô tả *</label>
                <textarea
                  value={newFeature.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Nhập mô tả tính năng"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Nhóm tính năng *</label>
                <select
                  value={newFeature.groupId}
                  onChange={(e) => handleInputChange('groupId', e.target.value)}
                >
                  <option value="">Chọn nhóm tính năng</option>
                  {featureGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={newFeature.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowEditFeatureModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                onClick={handleUpdateFeature}
              >
                <Save size={16} />
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Feature Modal */}
      {showViewFeatureModal && selectedFeature && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Chi tiết tính năng</h2>
              <button
                className="close-btn"
                onClick={() => setShowViewFeatureModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="feature-details">
                <div className="detail-item">
                  <label>Tên tính năng:</label>
                  <span>{selectedFeature.name}</span>
                </div>
                <div className="detail-item">
                  <label>Mô tả:</label>
                  <span>{selectedFeature.description}</span>
                </div>
                <div className="detail-item">
                  <label>Nhóm:</label>
                  <div className="group-badge">
                    {(() => {
                      const groupInfo = getGroupInfo(selectedFeature.groupId);
                      const IconComponent = groupInfo?.icon;
                      return (
                        <>
                          {IconComponent && <IconComponent size={16} style={{ color: groupInfo.color }} />}
                          <span>{groupInfo?.name}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  {getStatusBadge(selectedFeature.status)}
                </div>
                <div className="detail-item">
                  <label>Ngày tạo:</label>
                  <span>{selectedFeature.createdAt}</span>
                </div>
                <div className="detail-item">
                  <label>Cập nhật lần cuối:</label>
                  <span>{selectedFeature.updatedAt}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowViewFeatureModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedFeature && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
              <button
                className="close-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa tính năng <strong>"{selectedFeature.name}"</strong>?</p>
              <p className="warning-text">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="btn-danger"
                onClick={confirmDelete}
              >
                <Trash2 size={16} />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-features {
          padding: 24px;
          background: #F8FAFC;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: white;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          border-color: #FF5E13;
          color: #FF5E13;
        }

        .page-header h1 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: #0D062D;
        }

        .page-header p {
          margin: 0;
          color: #6B7280;
          font-size: 14px;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #FF5E13;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          background: #E04A0C;
          transform: translateY(-1px);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        /* Card-specific colors */
        .stat-card-total::before {
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
        }

        .stat-card-active::before {
          background: linear-gradient(90deg, #10B981, #34D399);
        }

        .stat-card-inactive::before {
          background: linear-gradient(90deg, #EF4444, #F87171);
        }

        .stat-card-groups::before {
          background: linear-gradient(90deg, #8B5CF6, #A78BFA);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-card-total:hover {
          border-color: #3B82F6;
        }

        .stat-card-active:hover {
          border-color: #10B981;
        }

        .stat-card-inactive:hover {
          border-color: #EF4444;
        }

        .stat-card-groups:hover {
          border-color: #8B5CF6;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
        }

        .stat-card-total .stat-icon {
          background: linear-gradient(135deg, #3B82F6, #60A5FA);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .stat-card-active .stat-icon {
          background: linear-gradient(135deg, #10B981, #34D399);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .stat-card-inactive .stat-icon {
          background: linear-gradient(135deg, #EF4444, #F87171);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .stat-card-groups .stat-icon {
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .stat-card-total .stat-icon::after {
          background: linear-gradient(135deg, #3B82F6, #60A5FA);
        }

        .stat-card-active .stat-icon::after {
          background: linear-gradient(135deg, #10B981, #34D399);
        }

        .stat-card-inactive .stat-icon::after {
          background: linear-gradient(135deg, #EF4444, #F87171);
        }

        .stat-card-groups .stat-icon::after {
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
        }

        .stat-icon::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 14px;
          z-index: -1;
          opacity: 0.2;
        }

        .stat-content {
          flex: 1;
        }

        .stat-content h3 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 800;
          color: #0D062D;
          line-height: 1;
        }

        .stat-content p {
          margin: 0;
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
        }

        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          margin-bottom: 24px;
        }

        .search-box {
          position: relative;
          margin-bottom: 16px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6B7280;
          pointer-events: none;
          z-index: 1;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }

        .search-box input:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          background: white;
          color: #6B7280;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #FF5E13;
          color: #FF5E13;
        }

        .filter-btn.active {
          background: #FF5E13;
          border-color: #FF5E13;
          color: white;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px 20px;
          background: #F9F4EE;
          border-bottom: 1px solid #E5E7EB;
          font-weight: 600;
          color: #0D062D;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid #F3F4F6;
          transition: background 0.3s ease;
        }

        .table-row:hover {
          background: #F9F4EE;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-cell {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #0D062D;
        }

        .feature-name {
          font-weight: 600;
        }

        .feature-description {
          color: #6B7280;
          line-height: 1.4;
        }

        .group-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          background: #F3F4F6;
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

        .status-active {
          background: #D1FAE5;
          color: #065F46;
        }

        .status-inactive {
          background: #FEE2E2;
          color: #991B1B;
        }

        .date-text {
          color: #6B7280;
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
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

        .action-btn.delete {
          color: #EF4444;
        }

        .action-btn.delete:hover {
          background: #FEE2E2;
          color: #DC2626;
        }

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

        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          color: #6B7280;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #F3F4F6;
          color: #0D062D;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #0D062D;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #E5E7EB;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #FF5E13;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #E04A0C;
          transform: translateY(-1px);
        }

        .btn-secondary {
          padding: 12px 20px;
          background: white;
          color: #6B7280;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        .btn-danger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #EF4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          background: #DC2626;
          transform: translateY(-1px);
        }

        .feature-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item label {
          font-weight: 600;
          color: #0D062D;
          font-size: 14px;
        }

        .detail-item span {
          color: #6B7280;
          font-size: 14px;
        }

        .warning-text {
          color: #EF4444;
          font-size: 13px;
          margin-top: 8px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .table-header {
            display: none;
          }

          .table-row {
            display: block;
            padding: 16px;
            margin-bottom: 12px;
            border-radius: 8px;
            border: 1px solid #E5E7EB;
          }

          .table-cell {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #F3F4F6;
          }

          .table-cell:last-child {
            border-bottom: none;
          }

          .table-cell::before {
            content: attr(data-label);
            font-weight: 600;
            color: #0D062D;
            min-width: 120px;
          }
        }

        @media (max-width: 768px) {
          .admin-features {
            padding: 16px;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .stat-card {
            padding: 20px;
            gap: 16px;
          }

          .stat-icon {
            width: 48px;
            height: 48px;
          }

          .stat-content h3 {
            font-size: 24px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .filter-buttons {
            flex-direction: column;
          }

          .filter-btn {
            justify-content: center;
          }

          .action-buttons {
            flex-direction: column;
            gap: 4px;
          }

          .action-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .stats-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .stat-card {
            padding: 16px;
            gap: 12px;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
          }

          .stat-content h3 {
            font-size: 20px;
          }

          .stat-content p {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminFeatures;
