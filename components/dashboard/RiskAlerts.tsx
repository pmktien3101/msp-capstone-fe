'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { mockProjects, mockMilestones, mockTasks } from '@/constants/mockData';
import { 
  AlertTriangle, 
  Clock, 
  AlertCircle,
  Shield,
  TrendingDown,
  Link,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';

interface RiskAlertsProps {
  projects: Project[];
}

export const RiskAlerts = ({ projects }: RiskAlertsProps) => {
  const [activeTab, setActiveTab] = useState<'deadlines' | 'dependencies' | 'risks'>('deadlines');

  // Tính toán dự án có nguy cơ trễ deadline
  const getDeadlineRisks = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return projects
      .map(project => {
        const endDate = new Date(project.endDate);
        const daysUntilDeadline = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const progressRate = project.progress ?? 0 / Math.max(1, daysUntilDeadline);
        
        let riskLevel = 'low';
        if (daysUntilDeadline <= 3 || progressRate < 0.5) riskLevel = 'critical';
        else if (daysUntilDeadline <= 7 || progressRate < 1) riskLevel = 'high';
        else if (daysUntilDeadline <= 14 || progressRate < 1.5) riskLevel = 'medium';
        
        return {
          ...project,
          daysUntilDeadline,
          progressRate,
          riskLevel,
          isOverdue: daysUntilDeadline < 0
        };
      })
      .filter(project => project.riskLevel !== 'low')
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.daysUntilDeadline - b.daysUntilDeadline;
      });
  };

  // Tính toán task dependencies và blocked tasks
  const getDependencyIssues = () => {
    const dependencyTasks = mockTasks.filter(task => {
      // Mock: tasks có dependency nếu có milestone dependency
      return task.milestoneIds.length > 1 || task.status === 'blocked';
    });

    const blockedTasks = mockTasks.filter(task => task.status === 'blocked');
    
    return {
      dependencyTasks: dependencyTasks.slice(0, 5),
      blockedTasks: blockedTasks.slice(0, 5),
      totalBlocked: blockedTasks.length
    };
  };

  // Mock risk log
  const getRiskLog = () => {
    return [
      {
        id: 'risk-1',
        title: 'Thiếu nhân lực cho dự án Mobile Banking',
        description: 'Dự án cần thêm 2 developers nhưng chưa tuyển được',
        impact: 'high',
        probability: 'medium',
        status: 'open',
        projectId: '2',
        createdAt: '2025-01-15',
        mitigation: 'Tăng cường tuyển dụng và outsource một phần'
      },
      {
        id: 'risk-2',
        title: 'Rủi ro về công nghệ mới',
        description: 'Team chưa có kinh nghiệm với React Native',
        impact: 'medium',
        probability: 'high',
        status: 'mitigated',
        projectId: '2',
        createdAt: '2025-01-10',
        mitigation: 'Đã tổ chức training và có mentor hỗ trợ'
      },
      {
        id: 'risk-3',
        title: 'Ngân sách có thể vượt quá dự kiến',
        description: 'Chi phí infrastructure tăng cao',
        impact: 'high',
        probability: 'low',
        status: 'monitoring',
        projectId: '1',
        createdAt: '2025-01-12',
        mitigation: 'Theo dõi chi phí hàng tuần và tối ưu hóa'
      }
    ];
  };

  const deadlineRisks = getDeadlineRisks();
  const dependencyIssues = getDependencyIssues();
  const riskLog = getRiskLog();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Nguy cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return level;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#ef4444';
      case 'mitigated': return '#10b981';
      case 'monitoring': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Mở';
      case 'mitigated': return 'Đã giảm thiểu';
      case 'monitoring': return 'Theo dõi';
      default: return status;
    }
  };

  return (
    <div className="risk-alerts">
      {/* Header */}
      <div className="section-header">
        <h2>Rủi ro & Cảnh báo</h2>
        <div className="tab-controls">
          <button 
            className={`tab-button ${activeTab === 'deadlines' ? 'active' : ''}`}
            onClick={() => setActiveTab('deadlines')}
          >
            <Clock size={16} />
            Deadline
          </button>
          <button 
            className={`tab-button ${activeTab === 'dependencies' ? 'active' : ''}`}
            onClick={() => setActiveTab('dependencies')}
          >
            <Link size={16} />
            Phụ thuộc
          </button>
          <button 
            className={`tab-button ${activeTab === 'risks' ? 'active' : ''}`}
            onClick={() => setActiveTab('risks')}
          >
            <Shield size={16} />
            Rủi ro
          </button>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="alerts-summary">
        <div className="alert-card critical">
          <div className="alert-icon">
            <AlertTriangle size={20} />
          </div>
          <div className="alert-content">
            <h3>{deadlineRisks.filter(r => r.riskLevel === 'critical').length}</h3>
            <p>Cảnh báo nguy cấp</p>
          </div>
        </div>
        
        <div className="alert-card warning">
          <div className="alert-icon">
            <AlertCircle size={20} />
          </div>
          <div className="alert-content">
            <h3>{deadlineRisks.filter(r => r.riskLevel === 'high').length}</h3>
            <p>Cảnh báo cao</p>
          </div>
        </div>
        
        <div className="alert-card info">
          <div className="alert-icon">
            <Bell size={20} />
          </div>
          <div className="alert-content">
            <h3>{dependencyIssues.totalBlocked}</h3>
            <p>Task bị chặn</p>
          </div>
        </div>
      </div>

      {/* Deadline Risks Tab */}
      {activeTab === 'deadlines' && (
        <div className="deadline-risks">
          <h3>Dự án có nguy cơ trễ deadline</h3>
          <div className="risks-list">
            {deadlineRisks.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={32} />
                <p>Không có dự án nào có nguy cơ trễ deadline</p>
              </div>
            ) : (
              deadlineRisks.map(project => (
                <div key={project.id} className="risk-item">
                  <div className="risk-indicator" style={{ backgroundColor: getRiskColor(project.riskLevel) }} />
                  
                  <div className="risk-content">
                    <div className="risk-header">
                      <h4>{project.name}</h4>
                      <div 
                        className="risk-badge"
                        style={{ backgroundColor: getRiskColor(project.riskLevel) }}
                      >
                        {getRiskLabel(project.riskLevel)}
                      </div>
                    </div>
                    
                    <div className="risk-details">
                      <div className="detail-item">
                        <Clock size={14} />
                        <span>
                          {project.isOverdue 
                            ? `Quá hạn ${Math.abs(project.daysUntilDeadline)} ngày`
                            : `Còn ${project.daysUntilDeadline} ngày`
                          }
                        </span>
                      </div>
                      <div className="detail-item">
                        <TrendingDown size={14} />
                        <span>Tiến độ: {project.progress}%</span>
                      </div>
                    </div>
                    
                    <div className="risk-progress">
                      <div className="progress-header">
                        <span>Tiến độ dự án</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${project.progress}%`,
                            backgroundColor: getRiskColor(project.riskLevel)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Dependencies Tab */}
      {activeTab === 'dependencies' && (
        <div className="dependency-issues">
          <div className="dependency-section">
            <h3>Task bị chặn ({dependencyIssues.blockedTasks.length})</h3>
            <div className="blocked-tasks">
              {dependencyIssues.blockedTasks.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={32} />
                  <p>Không có task nào bị chặn</p>
                </div>
              ) : (
                dependencyIssues.blockedTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p>{task.assignee}</p>
                    </div>
                    <div className="task-status blocked">
                      <XCircle size={14} />
                      <span>Bị chặn</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dependency-section">
            <h3>Task có phụ thuộc ({dependencyIssues.dependencyTasks.length})</h3>
            <div className="dependency-tasks">
              {dependencyIssues.dependencyTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.assignee}</p>
                  </div>
                  <div className="task-status dependency">
                    <Link size={14} />
                    <span>Có phụ thuộc</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risks Tab */}
      {activeTab === 'risks' && (
        <div className="risk-log">
          <h3>Danh sách rủi ro ({riskLog.length})</h3>
          <div className="risks-grid">
            {riskLog.map(risk => (
              <div key={risk.id} className="risk-card">
                <div className="risk-card-header">
                  <h4>{risk.title}</h4>
                  <div className="risk-badges">
                    <div 
                      className="impact-badge"
                      style={{ backgroundColor: getImpactColor(risk.impact) }}
                    >
                      {risk.impact.toUpperCase()}
                    </div>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(risk.status) }}
                    >
                      {getStatusLabel(risk.status)}
                    </div>
                  </div>
                </div>
                
                <div className="risk-description">
                  <p>{risk.description}</p>
                </div>
                
                <div className="risk-mitigation">
                  <strong>Giảm thiểu:</strong>
                  <p>{risk.mitigation}</p>
                </div>
                
                <div className="risk-meta">
                  <div className="meta-item">
                    <span className="label">Dự án:</span>
                    <span className="value">
                      {mockProjects.find(p => p.id === risk.projectId)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">
                      {new Date(risk.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .risk-alerts {
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

        .alerts-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .alert-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .alert-card.critical {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .alert-card.warning {
          background: #fef3c7;
          border-color: #fde68a;
        }

        .alert-card.info {
          background: #f0f9ff;
          border-color: #bae6fd;
        }

        .alert-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.8);
        }

        .alert-card.critical .alert-icon {
          color: #ef4444;
        }

        .alert-card.warning .alert-icon {
          color: #f59e0b;
        }

        .alert-card.info .alert-icon {
          color: #3b82f6;
        }

        .alert-content h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .alert-content p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .risks-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .risk-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .risk-indicator {
          width: 4px;
          border-radius: 2px;
        }

        .risk-content {
          flex: 1;
        }

        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .risk-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .risk-badge {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .risk-details {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6b7280;
        }

        .risk-progress {
          margin-top: 12px;
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

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #6b7280;
          text-align: center;
        }

        .empty-state p {
          margin: 8px 0 0 0;
          font-size: 14px;
        }

        .dependency-section {
          margin-bottom: 24px;
        }

        .dependency-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .blocked-tasks,
        .dependency-tasks {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
        }

        .task-info h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .task-info p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .task-status {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .task-status.blocked {
          background: #fef2f2;
          color: #ef4444;
        }

        .task-status.dependency {
          background: #fef3c7;
          color: #f59e0b;
        }

        .risks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
        }

        .risk-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          background: white;
        }

        .risk-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .risk-card-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          flex: 1;
          margin-right: 12px;
        }

        .risk-badges {
          display: flex;
          gap: 6px;
        }

        .impact-badge,
        .status-badge {
          padding: 4px 6px;
          border-radius: 4px;
          color: white;
          font-size: 10px;
          font-weight: 600;
        }

        .risk-description {
          margin-bottom: 12px;
        }

        .risk-description p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .risk-mitigation {
          margin-bottom: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .risk-mitigation strong {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: #374151;
        }

        .risk-mitigation p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        .risk-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
        }

        .label {
          color: #6b7280;
        }

        .value {
          color: #111827;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .risks-grid {
            grid-template-columns: 1fr;
          }

          .alerts-summary {
            grid-template-columns: 1fr;
          }

          .tab-controls {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};
