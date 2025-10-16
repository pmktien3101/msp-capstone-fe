'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { mockProjects, mockMilestones, mockTasks, mockMembers } from '@/constants/mockData';
import { 
  BarChart3, 
  Users, 
  TrendingUp,
  Activity,
  PieChart
} from 'lucide-react';

interface ProjectVisualizationProps {
  projects: Project[];
}

export const ProjectVisualization = ({ projects }: ProjectVisualizationProps) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'resources'>('progress');


  // Tính toán resource allocation
  const getResourceAllocation = () => {
    const memberWorkload = mockMembers.map(member => {
      const memberTasks = mockTasks.filter(task => task.assignee === member.id);
      // Comment out projects filter since members property doesn't exist
      // const memberProjects = projects.filter(project => 
      //   project.members?.some(m => m.id === member.id)
      // );
      
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        taskCount: memberTasks.length,
        projectCount: 0, // Set to 0 since we can't access project.members
        workload: memberTasks.length > 5 ? 'high' : memberTasks.length > 2 ? 'medium' : 'low'
      };
    });

    return memberWorkload.sort((a, b) => b.taskCount - a.taskCount);
  };

  // Tính toán progress distribution - comment out since progress doesn't exist
  // const getProgressDistribution = () => {
  //   const distribution = {
  //     '0-25%': projects.filter(p => (p.progress ?? 0) >= 0 && (p.progress ?? 0) <= 25).length,
  //     '26-50%': projects.filter(p => (p.progress ?? 0) > 25 && (p.progress ?? 0) <= 50).length,
  //     '51-75%': projects.filter(p => (p.progress ?? 0) > 50 && (p.progress ?? 0) <= 75).length,
  //     '76-100%': projects.filter(p => (p.progress ?? 0) > 75 && (p.progress ?? 0) <= 100).length,
  //   };
  //   return distribution;
  // };

  const resourceData = getResourceAllocation();
  // const progressDistribution = getProgressDistribution();

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getWorkloadLabel = (workload: string) => {
    switch (workload) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      default: return 'Thấp';
    }
  };

  return (
    <div className="project-visualization">
      {/* Header */}
      <div className="section-header">
        <h2>Biểu đồ trực quan</h2>
        <div className="tab-controls">
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <BarChart3 size={16} />
            Tiến độ
          </button>
          <button 
            className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <Users size={16} />
            Nguồn lực
          </button>
        </div>
      </div>


      {/* Progress View */}
      {activeTab === 'progress' && (
        <div className="progress-view">
          <div className="progress-grid">
            {/* Progress Bars */}
            <div className="progress-bars-section">
              <div className="progress-bars">
                {projects.map(project => (
                  <div key={project.id} className="progress-item">
                    <div className="progress-header">
                      <span className="project-name">{project.name}</span>
                      {/* <span className="progress-percentage">0%</span> */}
                    </div>
                    {/* <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `0%` }}
                      />
                    </div> */}
                    <div className="progress-details">
                      {/* <span>0 thành viên</span> */}
                      <span>{project.endDate ? new Date(project.endDate).toLocaleDateString('vi-VN') : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources View */}
      {activeTab === 'resources' && (
        <div className="resources-view">
          <div className="resource-allocation">
            <div className="resource-list">
              {resourceData.map(member => (
                <div key={member.id} className="resource-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.avatar}
                    </div>
                    <div className="member-details">
                      <h4>{member.name}</h4>
                      <p>{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="workload-info">
                    <div className="workload-stats">
                      <span className="task-count">{member.taskCount} tasks</span>
                      <span className="project-count">{member.projectCount} dự án</span>
                    </div>
                    <div 
                      className="workload-indicator"
                      style={{ backgroundColor: getWorkloadColor(member.workload) }}
                    >
                      {getWorkloadLabel(member.workload)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .project-visualization {
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


        /* Progress Styles */
        .progress-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .progress-bars-section h3,
        .progress-distribution h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .progress-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .progress-item {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          width: 100%;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .project-name {
          font-weight: 600;
          color: #111827;
        }

        .progress-percentage {
          font-weight: 600;
          color: #3b82f6;
        }

        .progress-bar-container {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #10b981);
          transition: width 0.3s ease;
        }

        .progress-details {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #6b7280;
        }

        .distribution-chart {
          display: flex;
          align-items: end;
          gap: 12px;
          height: 200px;
        }

        .distribution-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .distribution-bar {
          width: 100%;
          height: 150px;
          background: #f3f4f6;
          border-radius: 4px;
          display: flex;
          align-items: end;
        }

        .distribution-fill {
          width: 100%;
          border-radius: 4px;
          transition: height 0.3s ease;
        }

        .distribution-label {
          text-align: center;
        }

        .range {
          display: block;
          font-size: 12px;
          color: #6b7280;
        }

        .count {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        /* Resources Styles */
        .resource-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .resource-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 12px;
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

        .member-details h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .member-details p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .workload-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .workload-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 12px;
          color: #6b7280;
        }

        .workload-indicator {
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 11px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .tab-controls {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};
