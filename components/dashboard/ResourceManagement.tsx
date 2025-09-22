'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { mockProjects, mockMembers, mockTasks } from '@/constants/mockData';
import { 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

interface ResourceManagementProps {
  projects: Project[];
}

export const ResourceManagement = ({ projects }: ResourceManagementProps) => {
  const [activeTab, setActiveTab] = useState<'allocation' | 'budget' | 'capacity'>('allocation');

  // Tính toán phân bổ nguồn lực
  const getResourceAllocation = () => {
    return mockMembers.map(member => {
      const memberProjects = projects.filter(project => 
        project.members.some(m => m.id === member.id)
      );
      
      const memberTasks = mockTasks.filter(task => task.assignee === member.id);
      
      // Tính workload score (0-100)
      const workloadScore = Math.min(100, (memberTasks.length * 20) + (memberProjects.length * 10));
      
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        projects: memberProjects,
        taskCount: memberTasks.length,
        workloadScore,
        status: workloadScore > 80 ? 'overloaded' : workloadScore > 50 ? 'busy' : 'available'
      };
    }).sort((a, b) => b.workloadScore - a.workloadScore);
  };

  // Tính toán budget tracking (mock data)
  const getBudgetData = () => {
    return projects.map(project => {
      const totalBudget = Math.floor(Math.random() * 1000000) + 500000; // 500k - 1.5M
      const usedBudget = Math.floor(totalBudget * (project.progress / 100) * (0.7 + Math.random() * 0.3));
      const remainingBudget = totalBudget - usedBudget;
      
      return {
        id: project.id,
        name: project.name,
        totalBudget,
        usedBudget,
        remainingBudget,
        budgetUtilization: Math.round((usedBudget / totalBudget) * 100),
        status: remainingBudget < totalBudget * 0.2 ? 'critical' : 
                remainingBudget < totalBudget * 0.4 ? 'warning' : 'healthy'
      };
    });
  };

  // Tính toán capacity planning
  const getCapacityData = () => {
    const totalCapacity = mockMembers.length * 100; // 100% per member
    const usedCapacity = mockMembers.reduce((sum, member) => {
      const memberTasks = mockTasks.filter(task => task.assignee === member.id);
      return sum + Math.min(100, memberTasks.length * 20);
    }, 0);
    
    const availableCapacity = totalCapacity - usedCapacity;
    
    return {
      totalCapacity,
      usedCapacity,
      availableCapacity,
      utilizationRate: Math.round((usedCapacity / totalCapacity) * 100)
    };
  };

  const resourceData = getResourceAllocation();
  const budgetData = getBudgetData();
  const capacityData = getCapacityData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overloaded': return '#ef4444';
      case 'busy': return '#f59e0b';
      case 'available': return '#10b981';
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'healthy': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overloaded': return 'Quá tải';
      case 'busy': return 'Bận';
      case 'available': return 'Sẵn sàng';
      case 'critical': return 'Nguy cấp';
      case 'warning': return 'Cảnh báo';
      case 'healthy': return 'Tốt';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="resource-management">
      {/* Header */}
      <div className="section-header">
        <h2>Quản lý nguồn lực & ngân sách</h2>
        <div className="tab-controls">
          <button 
            className={`tab-button ${activeTab === 'allocation' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocation')}
          >
            <Users size={16} />
            Phân bổ
          </button>
          <button 
            className={`tab-button ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            <DollarSign size={16} />
            Ngân sách
          </button>
          <button 
            className={`tab-button ${activeTab === 'capacity' ? 'active' : ''}`}
            onClick={() => setActiveTab('capacity')}
          >
            <TrendingUp size={16} />
            Năng lực
          </button>
        </div>
      </div>

      {/* Resource Allocation Tab */}
      {activeTab === 'allocation' && (
        <div className="allocation-view">
          <div className="allocation-summary">
            <div className="summary-card">
              <div className="summary-icon">
                <UserCheck size={24} />
              </div>
              <div className="summary-content">
                <h3>{resourceData.filter(r => r.status === 'available').length}</h3>
                <p>Thành viên sẵn sàng</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon busy">
                <Clock size={24} />
              </div>
              <div className="summary-content">
                <h3>{resourceData.filter(r => r.status === 'busy').length}</h3>
                <p>Đang bận</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon overloaded">
                <AlertTriangle size={24} />
              </div>
              <div className="summary-content">
                <h3>{resourceData.filter(r => r.status === 'overloaded').length}</h3>
                <p>Quá tải</p>
              </div>
            </div>
          </div>

          <div className="resource-list">
            <h3>Phân bổ thành viên theo dự án</h3>
            <div className="resource-grid">
              {resourceData.map(member => (
                <div key={member.id} className="resource-card">
                  <div className="member-header">
                    <div className="member-avatar">
                      {member.avatar}
                    </div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p>{member.role}</p>
                    </div>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(member.status) }}
                    >
                      {getStatusLabel(member.status)}
                    </div>
                  </div>

                  <div className="workload-section">
                    <div className="workload-header">
                      <span>Khối lượng công việc</span>
                      <span>{member.workloadScore}%</span>
                    </div>
                    <div className="workload-bar">
                      <div 
                        className="workload-fill"
                        style={{ 
                          width: `${member.workloadScore}%`,
                          backgroundColor: getStatusColor(member.status)
                        }}
                      />
                    </div>
                  </div>

                  <div className="member-details">
                    <div className="detail-item">
                      <span className="label">Dự án:</span>
                      <span className="value">{member.projects.length}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Tasks:</span>
                      <span className="value">{member.taskCount}</span>
                    </div>
                  </div>

                  <div className="project-list">
                    <span className="project-label">Dự án tham gia:</span>
                    <div className="project-tags">
                      {member.projects.map(project => (
                        <span key={project.id} className="project-tag">
                          {project.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="budget-view">
          <div className="budget-summary">
            <div className="budget-card">
              <div className="budget-icon">
                <DollarSign size={24} />
              </div>
              <div className="budget-content">
                <h3>{formatCurrency(budgetData.reduce((sum, b) => sum + b.totalBudget, 0))}</h3>
                <p>Tổng ngân sách</p>
              </div>
            </div>
            
            <div className="budget-card">
              <div className="budget-icon used">
                <TrendingUp size={24} />
              </div>
              <div className="budget-content">
                <h3>{formatCurrency(budgetData.reduce((sum, b) => sum + b.usedBudget, 0))}</h3>
                <p>Đã sử dụng</p>
              </div>
            </div>
            
            <div className="budget-card">
              <div className="budget-icon remaining">
                <CheckCircle size={24} />
              </div>
              <div className="budget-content">
                <h3>{formatCurrency(budgetData.reduce((sum, b) => sum + b.remainingBudget, 0))}</h3>
                <p>Còn lại</p>
              </div>
            </div>
          </div>

          <div className="budget-list">
            <h3>Chi tiết ngân sách theo dự án</h3>
            <div className="budget-grid">
              {budgetData.map(project => (
                <div key={project.id} className="budget-card">
                  <div className="budget-header">
                    <h4>{project.name}</h4>
                    <div 
                      className="budget-status"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      {getStatusLabel(project.status)}
                    </div>
                  </div>

                  <div className="budget-progress">
                    <div className="progress-header">
                      <span>Sử dụng ngân sách</span>
                      <span>{project.budgetUtilization}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${project.budgetUtilization}%`,
                          backgroundColor: getStatusColor(project.status)
                        }}
                      />
                    </div>
                  </div>

                  <div className="budget-details">
                    <div className="budget-item">
                      <span className="label">Tổng ngân sách:</span>
                      <span className="value">{formatCurrency(project.totalBudget)}</span>
                    </div>
                    <div className="budget-item">
                      <span className="label">Đã sử dụng:</span>
                      <span className="value">{formatCurrency(project.usedBudget)}</span>
                    </div>
                    <div className="budget-item">
                      <span className="label">Còn lại:</span>
                      <span className="value">{formatCurrency(project.remainingBudget)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Capacity Tab */}
      {activeTab === 'capacity' && (
        <div className="capacity-view">
          <div className="capacity-overview">
            <div className="capacity-chart">
              <div className="chart-header">
                <h3>Tổng quan năng lực</h3>
                <span className="utilization-rate">{capacityData.utilizationRate}%</span>
              </div>
              
              <div className="capacity-bars">
                <div className="capacity-bar">
                  <div className="bar-label">Đã sử dụng</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill used"
                      style={{ width: `${capacityData.utilizationRate}%` }}
                    />
                  </div>
                  <div className="bar-value">{capacityData.usedCapacity}%</div>
                </div>
                
                <div className="capacity-bar">
                  <div className="bar-label">Còn trống</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill available"
                      style={{ width: `${100 - capacityData.utilizationRate}%` }}
                    />
                  </div>
                  <div className="bar-value">{capacityData.availableCapacity}%</div>
                </div>
              </div>
            </div>

            <div className="capacity-recommendations">
              <h3>Khuyến nghị</h3>
              <div className="recommendations-list">
                {capacityData.utilizationRate > 80 && (
                  <div className="recommendation-item critical">
                    <AlertTriangle size={16} />
                    <span>Cần thêm thành viên để giảm tải</span>
                  </div>
                )}
                {capacityData.utilizationRate < 30 && (
                  <div className="recommendation-item info">
                    <UserCheck size={16} />
                    <span>Có thể nhận thêm dự án mới</span>
                  </div>
                )}
                <div className="recommendation-item">
                  <Clock size={16} />
                  <span>Phân bổ lại workload cho cân bằng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .resource-management {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .tab-controls {
          display: flex;
          gap: 8px;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .tab-button:hover:not(.active) {
          background: #f9fafb;
        }

        /* Allocation Styles */
        .allocation-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .summary-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          color: #6b7280;
        }

        .summary-icon.busy {
          background: #fef3c7;
          color: #f59e0b;
        }

        .summary-icon.overloaded {
          background: #fef2f2;
          color: #ef4444;
        }

        .summary-content h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .summary-content p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .resource-list h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .resource-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
        }

        .resource-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          background: white;
        }

        .member-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .member-info {
          flex: 1;
        }

        .member-info h4 {
          margin: 0 0 2px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .member-info p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .workload-section {
          margin-bottom: 16px;
        }

        .workload-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .workload-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .workload-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .member-details {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .label {
          font-size: 12px;
          color: #6b7280;
        }

        .value {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .project-list {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .project-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
          display: block;
        }

        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .project-tag {
          padding: 2px 6px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 11px;
          color: #6b7280;
        }

        /* Budget Styles */
        .budget-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .budget-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .budget-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          color: #6b7280;
        }

        .budget-icon.used {
          background: #fef3c7;
          color: #f59e0b;
        }

        .budget-icon.remaining {
          background: #dcfce7;
          color: #10b981;
        }

        .budget-content h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .budget-content p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .budget-list h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .budget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .budget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .budget-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .budget-status {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .budget-progress {
          margin-bottom: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .budget-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .budget-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .budget-item .label {
          color: #6b7280;
        }

        .budget-item .value {
          font-weight: 600;
          color: #111827;
        }

        /* Capacity Styles */
        .capacity-overview {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .capacity-chart {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .utilization-rate {
          font-size: 24px;
          font-weight: 700;
          color: #3b82f6;
        }

        .capacity-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .capacity-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bar-label {
          width: 80px;
          font-size: 14px;
          color: #6b7280;
        }

        .bar-container {
          flex: 1;
          height: 20px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .bar-fill.used {
          background: #3b82f6;
        }

        .bar-fill.available {
          background: #10b981;
        }

        .bar-value {
          width: 40px;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .capacity-recommendations {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .capacity-recommendations h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recommendation-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: white;
          border-radius: 6px;
          font-size: 14px;
          color: #6b7280;
        }

        .recommendation-item.critical {
          background: #fef2f2;
          color: #ef4444;
        }

        .recommendation-item.info {
          background: #f0f9ff;
          color: #3b82f6;
        }

        @media (max-width: 768px) {
          .capacity-overview {
            grid-template-columns: 1fr;
          }

          .resource-grid,
          .budget-grid {
            grid-template-columns: 1fr;
          }

          .allocation-summary,
          .budget-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
