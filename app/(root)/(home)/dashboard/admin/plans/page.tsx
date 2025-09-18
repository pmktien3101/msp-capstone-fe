'use client';

import React, { useState } from 'react';
import { 
  Eye, Edit, Trash2, Plus, Search, Filter, X, Check, ChevronDown, ChevronUp,
  Users, HardDrive, Headphones, Plug, Shield, BarChart3, Handshake, Video,
  Palette, Zap, Calendar, DollarSign, Clock, FileText, Settings
} from 'lucide-react';

const AdminPlans = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showViewPlanModal, setShowViewPlanModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeatureSidebar, setShowFeatureSidebar] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    period: 'month',
    features: [] as string[],
    status: 'active'
  });

  // Danh sách các tính năng được phân nhóm
  const featureGroups = [
    {
      id: 'users',
      name: 'Số lượng người dùng',
      icon: Users,
      color: '#3B82F6',
      features: [
        { id: 'users_10', name: 'Tối đa 10 người dùng', description: 'Cho phép tối đa 10 thành viên trong team' },
        { id: 'users_25', name: 'Tối đa 25 người dùng', description: 'Cho phép tối đa 25 thành viên trong team' },
        { id: 'users_50', name: 'Tối đa 50 người dùng', description: 'Cho phép tối đa 50 thành viên trong team' },
        { id: 'users_100', name: 'Tối đa 100 người dùng', description: 'Cho phép tối đa 100 thành viên trong team' },
        { id: 'users_unlimited', name: 'Không giới hạn người dùng', description: 'Không giới hạn số lượng thành viên' }
      ]
    },
    {
      id: 'storage',
      name: 'Dung lượng lưu trữ',
      icon: HardDrive,
      color: '#10B981',
      features: [
        { id: 'storage_5gb', name: '5GB lưu trữ', description: 'Dung lượng lưu trữ 5GB' },
        { id: 'storage_10gb', name: '10GB lưu trữ', description: 'Dung lượng lưu trữ 10GB' },
        { id: 'storage_25gb', name: '25GB lưu trữ', description: 'Dung lượng lưu trữ 25GB' },
        { id: 'storage_50gb', name: '50GB lưu trữ', description: 'Dung lượng lưu trữ 50GB' },
        { id: 'storage_100gb', name: '100GB lưu trữ', description: 'Dung lượng lưu trữ 100GB' },
        { id: 'storage_500gb', name: '500GB lưu trữ', description: 'Dung lượng lưu trữ 500GB' },
        { id: 'storage_1tb', name: '1TB lưu trữ', description: 'Dung lượng lưu trữ 1TB' },
        { id: 'storage_unlimited', name: 'Không giới hạn lưu trữ', description: 'Dung lượng lưu trữ không giới hạn' }
      ]
    },
    {
      id: 'support',
      name: 'Hỗ trợ khách hàng',
      icon: Headphones,
      color: '#F59E0B',
      features: [
        { id: 'support_email', name: 'Hỗ trợ email', description: 'Hỗ trợ khách hàng qua email' },
        { id: 'support_chat', name: 'Hỗ trợ chat', description: 'Hỗ trợ khách hàng qua chat trực tuyến' },
        { id: 'support_24_7', name: 'Hỗ trợ 24/7', description: 'Hỗ trợ khách hàng 24/7' },
        { id: 'support_phone', name: 'Hỗ trợ phone', description: 'Hỗ trợ khách hàng qua điện thoại' },
        { id: 'support_priority', name: 'Priority support', description: 'Hỗ trợ ưu tiên cao' }
      ]
    },
    {
      id: 'integrations',
      name: 'Tích hợp & API',
      icon: Plug,
      color: '#8B5CF6',
      features: [
        { id: 'api_access', name: 'API access', description: 'Truy cập API để tích hợp với hệ thống khác' },
        { id: 'custom_integrations', name: 'Custom integrations', description: 'Tích hợp tùy chỉnh với các công cụ khác' },
        { id: 'sso_integration', name: 'SSO integration', description: 'Tích hợp Single Sign-On' },
        { id: 'webhook_support', name: 'Webhook support', description: 'Hỗ trợ webhook' }
      ]
    },
    {
      id: 'security',
      name: 'Bảo mật & Sao lưu',
      icon: Shield,
      color: '#EF4444',
      features: [
        { id: 'advanced_security', name: 'Advanced security', description: 'Bảo mật nâng cao' },
        { id: 'backup_recovery', name: 'Backup & recovery', description: 'Sao lưu và khôi phục dữ liệu' },
        { id: 'white_label', name: 'White-label solution', description: 'Giải pháp white-label' }
      ]
    },
    {
      id: 'analytics',
      name: 'Phân tích & Báo cáo',
      icon: BarChart3,
      color: '#06B6D4',
      features: [
        { id: 'advanced_analytics', name: 'Advanced analytics', description: 'Phân tích dữ liệu nâng cao' },
        { id: 'custom_reports', name: 'Custom reports', description: 'Báo cáo tùy chỉnh' }
      ]
    },
    {
      id: 'collaboration',
      name: 'Cộng tác & Quản lý',
      icon: Handshake,
      color: '#84CC16',
      features: [
        { id: 'team_collaboration', name: 'Team collaboration tools', description: 'Công cụ cộng tác nhóm' },
        { id: 'project_management', name: 'Project management', description: 'Quản lý dự án' },
        { id: 'time_tracking', name: 'Time tracking', description: 'Theo dõi thời gian' },
        { id: 'file_sharing', name: 'File sharing', description: 'Chia sẻ tệp tin' },
        { id: 'document_collaboration', name: 'Document collaboration', description: 'Cộng tác tài liệu' },
        { id: 'version_control', name: 'Version control', description: 'Kiểm soát phiên bản' }
      ]
    },
    {
      id: 'communication',
      name: 'Giao tiếp & Họp',
      icon: Video,
      color: '#EC4899',
      features: [
        { id: 'video_conferencing', name: 'Video conferencing', description: 'Họp video trực tuyến' },
        { id: 'screen_sharing', name: 'Screen sharing', description: 'Chia sẻ màn hình' }
      ]
    },
    {
      id: 'customization',
      name: 'Tùy chỉnh & Giao diện',
      icon: Palette,
      color: '#F97316',
      features: [
        { id: 'custom_branding', name: 'Custom branding', description: 'Tùy chỉnh thương hiệu' },
        { id: 'multi_language', name: 'Multi-language support', description: 'Hỗ trợ đa ngôn ngữ' },
        { id: 'mobile_app', name: 'Mobile app access', description: 'Truy cập ứng dụng di động' },
        { id: 'desktop_app', name: 'Desktop app access', description: 'Truy cập ứng dụng desktop' }
      ]
    },
    {
      id: 'automation',
      name: 'Tự động hóa',
      icon: Zap,
      color: '#EAB308',
      features: [
        { id: 'automated_workflows', name: 'Automated workflows', description: 'Quy trình tự động' }
      ]
    }
  ];

  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Basic',
      price: 29,
      period: 'month',
      features: ['Tối đa 10 người dùng', '5GB lưu trữ', 'Hỗ trợ email'],
      activeSubscriptions: 1250,
      revenue: '$36,250',
      status: 'active'
    },
    {
      id: 2,
      name: 'Premium',
      price: 79,
      period: 'month',
      features: ['Tối đa 50 người dùng', '50GB lưu trữ', 'Hỗ trợ 24/7', 'API access'],
      activeSubscriptions: 890,
      revenue: '$70,310',
      status: 'active'
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 199,
      period: 'month',
      features: ['Không giới hạn người dùng', '500GB lưu trữ', 'Hỗ trợ 24/7', 'API access', 'Custom integrations'],
      activeSubscriptions: 156,
      revenue: '$31,044',
      status: 'active'
    }
  ]);

  const subscriptions = [
    {
      id: 1,
      companyName: 'Công ty ABC',
      planName: 'Premium',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      amount: '$79',
      paymentMethod: 'Credit Card',
      nextBilling: '2024-02-15'
    },
    {
      id: 2,
      companyName: 'Công ty XYZ',
      planName: 'Basic',
      status: 'active',
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      amount: '$29',
      paymentMethod: 'Bank Transfer',
      nextBilling: '2024-02-20'
    },
    {
      id: 3,
      companyName: 'Công ty DEF',
      planName: 'Enterprise',
      status: 'trial',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      amount: '$0',
      paymentMethod: 'Trial',
      nextBilling: '2024-02-15'
    }
  ];

  // Handler functions for adding new plan
  const handleAddPlan = () => {
    if (newPlan.name && newPlan.price && newPlan.features.length > 0) {
      const planToAdd = {
        id: plans.length + 1,
        name: newPlan.name,
        price: parseInt(newPlan.price),
        period: newPlan.period,
        features: newPlan.features,
        activeSubscriptions: 0,
        revenue: '$0',
        status: newPlan.status
      };
      
      setPlans(prev => [...prev, planToAdd]);
      setNewPlan({
        name: '',
        price: '',
        period: 'month',
        features: [],
        status: 'active'
      });
      setShowAddPlanModal(false);
    }
  };

  const handleNewPlanChange = (field: string, value: any) => {
    setNewPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (featureId: string, groupId: string) => {
    setNewPlan(prev => {
      const currentFeatures = prev.features;
      
      // Tìm nhóm hiện tại
      const currentGroup = featureGroups.find(g => g.id === groupId);
      if (!currentGroup) return prev;
      
      // Lấy tên feature từ ID
      const feature = currentGroup.features.find(f => f.id === featureId);
      if (!feature) return prev;
      
      // Xóa tất cả features trong nhóm này
      const otherGroupFeatures = currentGroup.features.map(f => f.name);
      const featuresWithoutCurrentGroup = currentFeatures.filter(f => !otherGroupFeatures.includes(f));
      
      // Nếu feature đã được chọn, bỏ chọn nó
      if (currentFeatures.includes(feature.name)) {
        return {
          ...prev,
          features: featuresWithoutCurrentGroup
        };
      } else {
        // Nếu chưa chọn, thêm feature mới
        return {
          ...prev,
          features: [...featuresWithoutCurrentGroup, feature.name]
        };
      }
    });
  };

  const handleSelectAllFeatures = () => {
    // Chọn feature đầu tiên của mỗi nhóm
    const firstFeatures = featureGroups.map(group => group.features[0].name);
    setNewPlan(prev => ({
      ...prev,
      features: firstFeatures
    }));
  };

  const handleClearAllFeatures = () => {
    setNewPlan(prev => ({
      ...prev,
      features: []
    }));
  };

  // Handler functions for plan actions
  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowViewPlanModal(true);
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setNewPlan({
      name: plan.name,
      price: plan.price.toString(),
      period: plan.period,
      features: plan.features || [],
      status: plan.status
    });
    setShowEditPlanModal(true);
  };

  const handleDeletePlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePlan = () => {
    if (selectedPlan) {
      setPlans(prev => prev.filter(plan => plan.id !== selectedPlan.id));
      setShowDeleteConfirm(false);
      setSelectedPlan(null);
    }
  };

  const handleUpdatePlan = () => {
    if (selectedPlan && newPlan.name && newPlan.price && newPlan.features.length > 0) {
      const updatedPlan = {
        ...selectedPlan,
        name: newPlan.name,
        price: parseInt(newPlan.price),
        period: newPlan.period,
        features: newPlan.features,
        status: newPlan.status
      };
      
      setPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id ? updatedPlan : plan
      ));
      
      setNewPlan({
        name: '',
        price: '',
        period: 'month',
        features: [],
        status: 'active'
      });
      setShowEditPlanModal(false);
      setSelectedPlan(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#D1FAE5', textColor: '#065F46', text: 'Hoạt động' },
      trial: { color: '#FEF3C7', textColor: '#92400E', text: 'Dùng thử' },
      cancelled: { color: '#FEE2E2', textColor: '#991B1B', text: 'Đã hủy' },
      expired: { color: '#F3F4F6', textColor: '#6B7280', text: 'Hết hạn' }
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
    <div className="admin-plans">
      <div className="page-header">
        <h1>Quản Lý Gói & Đăng Ký</h1>
        <p>Quản lý các gói dịch vụ và đăng ký của khách hàng</p>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <button 
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Gói Dịch Vụ
        </button>
        <button 
          className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Đăng Ký
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="plans-content">
          <div className="plans-header">
            <h2>Danh Sách Gói Dịch Vụ</h2>
            <button 
              className="add-plan-btn"
              onClick={() => setShowAddPlanModal(true)}
            >
              + Thêm Gói Mới
            </button>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">${plan.price}</span>
                    <span className="period">/{plan.period}</span>
                  </div>
                </div>

                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="plan-stats">
                  <div className="stat">
                    <span className="stat-label">Đăng ký hoạt động</span>
                    <span className="stat-value">{plan.activeSubscriptions}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Doanh thu tháng</span>
                    <span className="stat-value">{plan.revenue}</span>
                  </div>
                </div>

                 <div className="plan-actions">
                   <button 
                     className="action-btn edit"
                     onClick={() => handleEditPlan(plan)}
                   >
                     Chỉnh sửa
                   </button>
                   <button 
                     className="action-btn view"
                     onClick={() => handleViewPlan(plan)}
                   >
                     Xem chi tiết
                   </button>
                   <button 
                     className="action-btn delete"
                     onClick={() => handleDeletePlan(plan)}
                   >
                     Xóa
                   </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="subscriptions-content">
          <div className="subscriptions-header">
            <h2>Danh Sách Đăng Ký</h2>
            <div className="subscriptions-filters">
              <select className="filter-select">
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="trial">Dùng thử</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="subscriptions-table">
            <div className="table-header">
              <div className="table-cell">Công ty</div>
              <div className="table-cell">Gói</div>
              <div className="table-cell">Trạng thái</div>
              <div className="table-cell">Ngày bắt đầu</div>
              <div className="table-cell">Ngày kết thúc</div>
              <div className="table-cell">Số tiền</div>
              <div className="table-cell">Phương thức</div>
              <div className="table-cell">Thanh toán tiếp</div>
              <div className="table-cell">Hành động</div>
            </div>

            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="table-row">
                <div className="table-cell">
                  <div className="company-info">
                    <div className="company-avatar">
                      {subscription.companyName.charAt(0)}
                    </div>
                    <span>{subscription.companyName}</span>
                  </div>
                </div>
                <div className="table-cell">
                  <span className="plan-badge">{subscription.planName}</span>
                </div>
                <div className="table-cell">{getStatusBadge(subscription.status)}</div>
                <div className="table-cell">{subscription.startDate}</div>
                <div className="table-cell">{subscription.endDate}</div>
                <div className="table-cell">{subscription.amount}</div>
                <div className="table-cell">{subscription.paymentMethod}</div>
                <div className="table-cell">{subscription.nextBilling}</div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button className="action-btn view">👁️</button>
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn more">⋯</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div className="modal-overlay" onClick={() => setShowAddPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Gói Dịch Vụ Mới</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddPlanModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên gói:</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => handleNewPlanChange('name', e.target.value)}
                  placeholder="Nhập tên gói (ví dụ: Pro, Advanced...)"
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Giá:</label>
                  <input
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => handleNewPlanChange('price', e.target.value)}
                    placeholder="Nhập giá (ví dụ: 99)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Chu kỳ:</label>
                  <select
                    value={newPlan.period}
                    onChange={(e) => handleNewPlanChange('period', e.target.value)}
                    className="form-select"
                  >
                    <option value="month">Tháng</option>
                    <option value="year">Năm</option>
                    <option value="quarter">Quý</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Trạng thái:</label>
                <select
                  value={newPlan.status}
                  onChange={(e) => handleNewPlanChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="active">Hoạt động</option>
                  <option value="trial">Dùng thử</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tính năng:</label>
                <div className="feature-selector">
                  <div className="selected-features-preview">
                    <span className="selected-count">
                      Đã chọn: {newPlan.features.length} tính năng
                    </span>
                    {newPlan.features.length > 0 && (
                      <div className="selected-features-list">
                        {newPlan.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                        {newPlan.features.length > 3 && (
                          <span className="more-features">
                            +{newPlan.features.length - 3} khác
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
                    {newPlan.features.length === 0 ? 'Chọn tính năng' : 'Chỉnh sửa tính năng'}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowAddPlanModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-save"
                onClick={handleAddPlan}
                disabled={!newPlan.name || !newPlan.price || newPlan.features.length === 0}
              >
                Thêm gói
              </button>
            </div>
          </div>
         </div>
       )}

       {/* View Plan Modal */}
       {showViewPlanModal && selectedPlan && (
         <div className="modal-overlay" onClick={() => setShowViewPlanModal(false)}>
           <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3>Chi Tiết Gói Dịch Vụ</h3>
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
                     <span className="price">${selectedPlan.price}</span>
                     <span className="period">/{selectedPlan.period}</span>
                   </div>
                 </div>
                 
                 <div className="view-plan-status">
                   <span className="status-label">Trạng thái:</span>
                   {getStatusBadge(selectedPlan.status)}
                 </div>

                 <div className="view-plan-features">
                   <h4>Tính năng:</h4>
                   <ul className="features-list">
                     {selectedPlan.features.map((feature: string, index: number) => (
                       <li key={index} className="feature-item">
                         <span className="feature-icon">✓</span>
                         <span>{feature}</span>
                       </li>
                     ))}
                   </ul>
                 </div>

                 <div className="view-plan-stats">
                   <div className="stat-item">
                     <span className="stat-label">Đăng ký hoạt động:</span>
                     <span className="stat-value">{selectedPlan.activeSubscriptions}</span>
                   </div>
                   <div className="stat-item">
                     <span className="stat-label">Doanh thu tháng:</span>
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
                 Đóng
               </button>
               <button 
                 className="btn-edit"
                 onClick={() => {
                   setShowViewPlanModal(false);
                   handleEditPlan(selectedPlan);
                 }}
               >
                 Chỉnh sửa
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Edit Plan Modal */}
       {showEditPlanModal && selectedPlan && (
         <div className="modal-overlay" onClick={() => setShowEditPlanModal(false)}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3>Chỉnh Sửa Gói Dịch Vụ</h3>
               <button 
                 className="modal-close"
                 onClick={() => setShowEditPlanModal(false)}
               >
                 ×
               </button>
             </div>
             <div className="modal-body">
               <div className="form-group">
                 <label>Tên gói:</label>
                 <input
                   type="text"
                   value={newPlan.name}
                   onChange={(e) => handleNewPlanChange('name', e.target.value)}
                   placeholder="Nhập tên gói (ví dụ: Pro, Advanced...)"
                   className="form-input"
                 />
               </div>
               
               <div className="form-row">
                 <div className="form-group">
                   <label>Giá:</label>
                   <input
                     type="number"
                     value={newPlan.price}
                     onChange={(e) => handleNewPlanChange('price', e.target.value)}
                     placeholder="Nhập giá (ví dụ: 99)"
                     className="form-input"
                   />
                 </div>
                 <div className="form-group">
                   <label>Chu kỳ:</label>
                   <select
                     value={newPlan.period}
                     onChange={(e) => handleNewPlanChange('period', e.target.value)}
                     className="form-select"
                   >
                     <option value="month">Tháng</option>
                     <option value="year">Năm</option>
                     <option value="quarter">Quý</option>
                   </select>
                 </div>
               </div>

               <div className="form-group">
                 <label>Trạng thái:</label>
                 <select
                   value={newPlan.status}
                   onChange={(e) => handleNewPlanChange('status', e.target.value)}
                   className="form-select"
                 >
                   <option value="active">Hoạt động</option>
                   <option value="trial">Dùng thử</option>
                   <option value="inactive">Không hoạt động</option>
                 </select>
               </div>

               <div className="form-group">
                 <label>Tính năng:</label>
                 <div className="feature-selector">
                   <div className="selected-features-preview">
                     <span className="selected-count">
                       Đã chọn: {newPlan.features.length} tính năng
                     </span>
                     {newPlan.features.length > 0 && (
                       <div className="selected-features-list">
                         {newPlan.features.slice(0, 3).map((feature, index) => (
                           <span key={index} className="feature-tag">
                             {feature}
                           </span>
                         ))}
                         {newPlan.features.length > 3 && (
                           <span className="more-features">
                             +{newPlan.features.length - 3} khác
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
                     {newPlan.features.length === 0 ? 'Chọn tính năng' : 'Chỉnh sửa tính năng'}
                   </button>
                 </div>
               </div>
             </div>
             <div className="modal-footer">
               <button 
                 className="btn-cancel"
                 onClick={() => setShowEditPlanModal(false)}
               >
                 Hủy
               </button>
               <button 
                 className="btn-save"
                 onClick={handleUpdatePlan}
                 disabled={!newPlan.name || !newPlan.price || newPlan.features.length === 0}
               >
                 Cập nhật
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && selectedPlan && (
         <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
           <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3>Xác nhận xóa gói</h3>
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
                 <h4>Bạn có chắc chắn muốn xóa gói "{selectedPlan.name}"?</h4>
                 <p>Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến gói này sẽ bị xóa vĩnh viễn.</p>
                 
                 <div className="plan-summary">
                   <div className="summary-item">
                     <span className="label">Tên gói:</span>
                     <span className="value">{selectedPlan.name}</span>
                   </div>
                   <div className="summary-item">
                     <span className="label">Giá:</span>
                     <span className="value">${selectedPlan.price}/{selectedPlan.period}</span>
                   </div>
                   <div className="summary-item">
                     <span className="label">Đăng ký hoạt động:</span>
                     <span className="value">{selectedPlan.activeSubscriptions}</span>
                   </div>
                 </div>
               </div>
             </div>
             <div className="modal-footer">
               <button 
                 className="btn-cancel"
                 onClick={() => setShowDeleteConfirm(false)}
               >
                 Hủy
               </button>
               <button 
                 className="btn-delete"
                 onClick={confirmDeletePlan}
               >
                 Xóa gói
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Feature Selection Sidebar */}
       {showFeatureSidebar && (
         <div className="sidebar-overlay" onClick={() => setShowFeatureSidebar(false)}>
           <div className="feature-sidebar" onClick={(e) => e.stopPropagation()}>
             <div className="sidebar-header">
               <h3>Chọn Tính Năng</h3>
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
                 Chọn tất cả
               </button>
               <button
                 className="action-btn clear-all"
                 onClick={handleClearAllFeatures}
               >
                 Xóa tất cả
               </button>
             </div>

             <div className="sidebar-content">
               {featureGroups.map((group) => {
                 const IconComponent = group.icon;
                 return (
                   <div key={group.id} className="feature-group">
                     <div className="group-header">
                       <div className="group-icon" style={{ color: group.color }}>
                         <IconComponent size={20} />
                       </div>
                       <h4 className="group-title">{group.name}</h4>
                     </div>
                   <div className="features-grid">
                     {group.features.map((feature) => (
                       <div
                         key={feature.id}
                         className={`feature-card ${newPlan.features.includes(feature.name) ? 'selected' : ''}`}
                         onClick={() => handleFeatureToggle(feature.id, group.id)}
                       >
                         <div className="feature-card-header">
                           <input
                             type="radio"
                             name={group.id}
                             checked={newPlan.features.includes(feature.name)}
                             onChange={(e) => {
                               e.stopPropagation();
                               handleFeatureToggle(feature.id, group.id);
                             }}
                             onClick={(e) => e.stopPropagation()}
                             className="feature-radio"
                           />
                         </div>
                         <div className="feature-card-body">
                           <h5 className="feature-title">{feature.name}</h5>
                           <p className="feature-description">{feature.description}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
                 );
               })}
             </div>

             <div className="sidebar-footer">
               <div className="selected-summary">
                 <span>Đã chọn: {newPlan.features.length} tính năng</span>
               </div>
               <button
                 className="confirm-btn"
                 onClick={() => setShowFeatureSidebar(false)}
               >
                 Xác nhận
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
          color: #0D062D;
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
          border-bottom: 2px solid #F3F4F6;
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
          color: #FF5E13;
        }

        .tab-btn.active {
          color: #FF5E13;
          border-bottom-color: #FF5E13;
        }

        .plans-content, .subscriptions-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .plans-header, .subscriptions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .plans-header h2, .subscriptions-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .add-plan-btn {
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
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
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .plan-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .plan-card:hover {
          transform: translateY(-4px);
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
          color: #0D062D;
          margin: 0;
        }

        .plan-price {
          text-align: right;
        }

        .price {
          font-size: 24px;
          font-weight: 700;
          color: #FF5E13;
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
          color: #0D062D;
        }

        .feature-icon {
          color: #10B981;
          font-weight: bold;
        }

        .plan-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #F9F4EE;
          border-radius: 10px;
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
          color: #0D062D;
        }

        .plan-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          color: #FF5E13;
          border-color: #FF5E13;
        }

        .action-btn.edit:hover {
          background: #FF5E13;
          color: white;
        }

        .action-btn.view {
          color: #6B7280;
        }

         .action-btn.view:hover {
           background: #F3F4F6;
         }

         .action-btn.delete {
           color: #DC2626;
           border-color: #DC2626;
         }

         .action-btn.delete:hover {
           background: #DC2626;
           color: white;
         }

        .subscriptions-filters {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          padding: 8px 12px;
          border: 2px solid #E5E7EB;
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
          background: #F9F4EE;
          padding: 16px 20px;
          font-weight: 600;
          color: #0D062D;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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

        .plan-badge {
          padding: 4px 8px;
          background: #DBEAFE;
          color: #1E40AF;
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
          background: #F3F4F6;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: #E5E7EB;
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
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid #E5E7EB;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #0D062D;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: #6B7280;
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
          background: #F3F4F6;
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
          color: #0D062D;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          color: #0D062D;
          background: white;
          transition: border-color 0.2s ease;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #FF5E13;
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
          background: #FEE2E2;
          color: #DC2626;
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
          background: #FECACA;
        }

        .add-feature-btn {
          padding: 8px 16px;
          border: 2px dashed #FF5E13;
          background: white;
          color: #FF5E13;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-feature-btn:hover {
          background: #FFF5F0;
          border-style: solid;
        }

        /* Feature Selection Styles */
        .feature-selection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px;
          background: #F9F4EE;
          border-radius: 8px;
        }

        .selected-count {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
        }

        .feature-actions {
          display: flex;
          gap: 8px;
        }

        .select-all-btn, .clear-all-btn {
          padding: 6px 12px;
          border: 1px solid #E5E7EB;
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
          background: #ECFDF5;
        }

        .clear-all-btn {
          color: #DC2626;
          border-color: #DC2626;
        }

        .clear-all-btn:hover {
          background: #FEF2F2;
        }

        .feature-selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
          padding: 8px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          background: #FAFAFA;
        }

        .feature-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .feature-option:hover {
          border-color: #FF5E13;
          background: #FFF5F0;
        }

        .feature-option.selected {
          border-color: #FF5E13;
          background: #FFF5F0;
        }

        .feature-checkbox {
          margin: 0;
          cursor: pointer;
        }

        .feature-text {
          font-size: 13px;
          color: #0D062D;
          flex: 1;
        }

        /* Feature Selector Styles */
        .feature-selector {
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          padding: 16px;
          background: #FAFAFA;
        }

        .selected-features-preview {
          margin-bottom: 12px;
        }

        .selected-count {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
          margin-bottom: 8px;
        }

        .selected-features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .feature-tag {
          background: #FF5E13;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .more-features {
          background: #6B7280;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .select-features-btn {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
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
          border-bottom: 1px solid #E5E7EB;
          background: #F9F4EE;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
        }

        .sidebar-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6B7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .sidebar-close:hover {
          background: #F3F4F6;
        }

        .sidebar-actions {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .sidebar-actions .action-btn {
          flex: 1;
          padding: 8px 16px;
          border: 1px solid #E5E7EB;
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
          background: #ECFDF5;
        }

        .sidebar-actions .action-btn.clear-all {
          color: #DC2626;
          border-color: #DC2626;
        }

        .sidebar-actions .action-btn.clear-all:hover {
          background: #FEF2F2;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
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
          background: #F9F4EE;
          border-radius: 8px;
          border-left: 4px solid #FF5E13;
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
          color: #0D062D;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .feature-card {
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .feature-card:hover {
          border-color: #FF5E13;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.1);
        }

        .feature-card.selected {
          border-color: #FF5E13;
          background: #FFF5F0;
        }

        .feature-card.selected::before {
          content: '';
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #FF5E13;
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
          accent-color: #FF5E13;
          position: relative;
          z-index: 10;
        }

        .feature-card-body {
          text-align: center;
        }

        .feature-title {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: #0D062D;
          line-height: 1.3;
        }

        .feature-description {
          margin: 0;
          font-size: 11px;
          color: #6B7280;
          line-height: 1.4;
        }

        .sidebar-footer {
          padding: 20px 24px;
          border-top: 1px solid #E5E7EB;
          background: #F9F4EE;
        }

        .selected-summary {
          margin-bottom: 12px;
          text-align: center;
        }

        .selected-summary span {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
        }

        .confirm-btn {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
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

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #E5E7EB;
          margin-top: 24px;
        }

        .btn-cancel, .btn-save {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: white;
          color: #6B7280;
          border: 2px solid #E5E7EB;
        }

        .btn-cancel:hover {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        .btn-save {
          background: linear-gradient(135deg, #FFA463 0%, #FF5E13 100%);
          color: white;
          border: 2px solid transparent;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 94, 19, 0.3);
        }

         .btn-save:disabled {
           background: #D1D5DB;
           color: #9CA3AF;
           cursor: not-allowed;
           transform: none;
           box-shadow: none;
         }

         .btn-edit {
           background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
           color: white;
           border: 2px solid transparent;
         }

         .btn-edit:hover {
           transform: translateY(-1px);
           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
         }

         .btn-delete {
           background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
           color: white;
           border: 2px solid transparent;
         }

         .btn-delete:hover {
           transform: translateY(-1px);
           box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
         }

         .btn-edit, .btn-delete {
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
           border-bottom: 1px solid #E5E7EB;
         }

         .view-plan-header h2 {
           margin: 0;
           font-size: 24px;
           font-weight: 600;
           color: #0D062D;
         }

         .view-plan-price {
           text-align: right;
         }

         .view-plan-price .price {
           font-size: 28px;
           font-weight: 700;
           color: #FF5E13;
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
           color: #0D062D;
         }

         .view-plan-features {
           margin-bottom: 20px;
         }

         .view-plan-features h4 {
           margin: 0 0 12px 0;
           font-size: 16px;
           font-weight: 600;
           color: #0D062D;
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
           color: #0D062D;
         }

         .features-list .feature-icon {
           color: #10B981;
           font-weight: bold;
         }

         .view-plan-stats {
           background: #F9F4EE;
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
           color: #0D062D;
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
           color: #0D062D;
         }

         .delete-confirmation p {
           margin: 0 0 24px 0;
           font-size: 14px;
           color: #787486;
           line-height: 1.5;
         }

         .plan-summary {
           background: #F9F4EE;
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
           color: #0D062D;
         }

        @media (max-width: 768px) {
          .admin-plans {
            padding: 16px;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plans-header, .subscriptions-header {
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
        }
      `}</style>
    </div>
  );
};

export default AdminPlans;
