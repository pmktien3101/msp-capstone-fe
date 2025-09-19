'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { Project } from '@/types/project';
import { mockTasks, additionalMockTasks } from '@/constants/mockData';
import { MemberProjectCard } from '@/components/projects/MemberProjectCard';
import { MemberTaskCard } from '@/components/tasks/MemberTaskCard';
import '@/app/styles/dashboard.scss';

export default function MemberDashboardPage() {
  const router = useRouter();
  const { userId, email, role, image } = useUser();
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Mock data for member's assigned projects
  const mockAssignedProjects: Project[] = [
    {
      id: '1',
      name: 'Project Management System',
      description: 'A system to manage company projects and resources',
      status: 'active' as const,
      startDate: '2025-09-01',
      endDate: '2025-12-31',
      manager: 'John Doe',
      members: [
        { id: '1', name: 'John Doe', role: 'Project Manager', email: 'john.doe@example.com', avatar: '/avatars/john.png' },
        { id: '4', name: 'Member', role: 'Developer', email: email || 'member@gmail.com', avatar: image || '/avatars/member.png' }
      ],
      progress: 75
    },
    {
      id: '4',
      name: 'E-commerce Platform',
      description: 'Online shopping platform with payment integration',
      status: 'active' as const,
      startDate: '2025-08-01',
      endDate: '2026-02-28',
      manager: 'Alice Johnson',
      members: [
        { id: '7', name: 'Alice Johnson', role: 'Product Manager', email: 'alice.johnson@example.com', avatar: '/avatars/alice.png' },
        { id: '4', name: 'Member', role: 'Frontend Developer', email: email || 'member@gmail.com', avatar: image || '/avatars/member.png' }
      ],
      progress: 45
    }
  ];

  // Get tasks assigned to current member
  const getMyTasks = () => {
    const allTasks = [...mockTasks, ...additionalMockTasks];
    // Filter tasks that are assigned to current member (mock logic)
    return allTasks.filter(task => 
      task.assignee === 'Member' ||
      task.assignee === email ||
      task.assignee === 'member@gmail.com'
    );
    // return allTasks;
  };

  // Mock data for upcoming meetings
  const mockUpcomingMeetings = [
    {
      id: '1',
      title: 'Daily Standup Meeting',
      date: '2025-09-20',
      time: '09:00 - 09:30',
      location: 'Meeting Room A',
      attendees: ['John Doe', 'Alice Johnson', 'Member', 'Sarah Wilson'],
      type: 'daily'
    },
    {
      id: '2',
      title: 'Project Review Meeting',
      date: '2025-09-21',
      time: '14:00 - 15:30',
      location: 'Conference Room B',
      attendees: ['PM John', 'Business Owner', 'Member', 'Tech Lead'],
      type: 'review'
    },
    {
      id: '3',
      title: 'Client Presentation',
      date: '2025-09-22',
      time: '10:00 - 11:30',
      location: 'Client Office - Floor 15',
      attendees: ['PM John', 'Member', 'Client Team'],
      type: 'presentation'
    },
    {
      id: '4',
      title: 'Sprint Planning',
      date: '2025-09-23',
      time: '09:00 - 12:00',
      location: 'Online - Teams',
      attendees: ['PM John', 'All Developers', 'QA Team'],
      type: 'planning'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAssignedProjects(mockAssignedProjects);
      setMyTasks(getMyTasks());
      setUpcomingMeetings(mockUpcomingMeetings);
      setLoading(false);
    }, 500);
  }, [email]);

  // Calculate statistics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(task => task.status === 'done' || task.status === 'completed').length;
  const inProgressTasks = myTasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = myTasks.filter(task => task.status === 'todo' || task.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'planning':
        return '#f59e0b';
      case 'on-hold':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'todo':
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case 'done':
      case 'completed':
        return 'Hoàn thành';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'todo':
      case 'pending':
        return 'Chờ thực hiện';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="member-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Chào mừng, Member!</h1>
            <p>Đây là tổng quan về công việc của bạn</p>
          </div>
          <button 
            className="view-all-projects-link"
            onClick={() => router.push('/projects')}
          >
            Xem tất cả dự án
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{completedTasks}</div>
            <div className="stat-label">Nhiệm vụ hoàn thành</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{inProgressTasks}</div>
            <div className="stat-label">Đang thực hiện</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{pendingTasks}</div>
            <div className="stat-label">Chờ thực hiện</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{assignedProjects.length}</div>
            <div className="stat-label">Dự án tham gia</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* My Tasks */}
        <div className="content-card">
          <div className="card-header">
            <h3>Công việc được giao</h3>
            <span className="task-count">{totalTasks} nhiệm vụ</span>
          </div>
          <div className="card-content">
            {myTasks.length === 0 ? (
              <div className="empty-state">
                <p>Bạn chưa có nhiệm vụ nào</p>
              </div>
             ) : (
               <div className="tasks-list">
                 {(showAllTasks ? myTasks : myTasks.slice(0, 3)).map((task, index) => (
                   <MemberTaskCard 
                     key={task.id} 
                     task={task} 
                     index={index}
                   />
                 ))}
                 {myTasks.length > 3 && !showAllTasks && (
                   <div className="view-more">
                     <button 
                       className="view-more-button"
                       onClick={() => setShowAllTasks(true)}
                     >
                       <span>Xem thêm {myTasks.length - 3} nhiệm vụ khác</span>
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                         <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     </button>
                   </div>
                 )}
                 {showAllTasks && myTasks.length > 3 && (
                   <div className="view-more">
                     <button 
                       className="view-less-button"
                       onClick={() => setShowAllTasks(false)}
                     >
                       <span>Thu gọn</span>
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                         <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Right Column - Projects and Meetings */}
        <div className="right-column">
          {/* Assigned Projects */}
          <div className="content-card">
            <div className="card-header">
              <h3>Dự án gần đây</h3>
              <span className="project-count">{assignedProjects.length} dự án</span>
            </div>
            <div className="card-content">
              {assignedProjects.length === 0 ? (
                <div className="empty-state">
                  <p>Bạn chưa được giao dự án nào</p>
                </div>
              ) : (
                <div className="projects-list">
                  {assignedProjects.map((project, index) => (
                    <MemberProjectCard 
                      key={project.id} 
                      project={project} 
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="content-card">
            <div className="card-header">
              <h3>Cuộc họp sắp tới</h3>
              <span className="meeting-count">{upcomingMeetings.length} cuộc họp</span>
            </div>
            <div className="card-content">
              {upcomingMeetings.length === 0 ? (
                <div className="empty-state">
                  <p>Bạn không có cuộc họp nào sắp tới</p>
                </div>
              ) : (
                <div className="meetings-list">
                  {upcomingMeetings.slice(0, 3).map((meeting, index) => (
                    <div key={meeting.id} className="meeting-item">
                      <div className="meeting-header">
                        <div className="meeting-type">
                          <div className={`type-icon ${meeting.type}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.11 2H7.11C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.03996 3.23945 9.11 3.72C9.23662 4.68007 9.47144 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span className="type-label">Cuộc họp</span>
                        </div>
                        <div className="meeting-date">
                          {new Date(meeting.date).toLocaleDateString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      <div className="meeting-content">
                        <h4 className="meeting-title">{meeting.title}</h4>
                        <div className="meeting-details">
                          <div className="meeting-time">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{meeting.time}</span>
                          </div>
                          <div className="meeting-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{meeting.location}</span>
                          </div>
                          <div className="meeting-attendees">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
                              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{meeting.attendees.length} người tham gia</span>
                          </div>
                        </div>
                        
                        {/* Join Button */}
                        <div className="meeting-action">
                          <button 
                            className="join-meeting-btn"
                            onClick={() => {
                              if (meeting.location?.includes('Online')) {
                                alert(`Tham gia cuộc họp: ${meeting.title}\nThời gian: ${meeting.time}\nĐịa điểm: ${meeting.location}`);
                              } else {
                                alert(`Tham gia cuộc họp: ${meeting.title}\nThời gian: ${meeting.time}\nĐịa điểm: ${meeting.location}`);
                              }
                            }}
                          >
                            <span>Tham gia</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.11 2H7.11C7.59531 1.99522 8.06679 2.16708 8.43376 2.48353C8.80073 2.79999 9.03996 3.23945 9.11 3.72C9.23662 4.68007 9.47144 5.62273 9.81 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {upcomingMeetings.length > 3 && (
                    <div className="view-more">
                      <button 
                        className="view-more-button"
                        onClick={() => router.push('/calendar')}
                      >
                        <span>Xem tất cả cuộc họp</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .member-dashboard {
          width: 100%;
          min-height: 100vh;
          background: #F9F4EE;
          padding: 24px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #ff5e13;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-section h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .welcome-section p {
          color: #6b7280;
          margin: 0;
          font-size: 16px;
        }

        .view-all-projects-link {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          transition: all 0.2s ease;
        }

        .view-all-projects-link:hover {
          color: #1d4ed8;
        }

        .view-all-projects-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #3b82f6;
        }

        .view-all-projects-link:hover::after {
          width: 100%;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: #fdf0d2;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff5e13;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .content-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .task-count,
        .project-count {
          background: #f3f4f6;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .card-content {
          padding: 24px;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 40px 20px;
        }

          .tasks-list {
            display: flex;
            flex-direction: column;
            gap: 0;
          }

        .view-more {
          text-align: center;
          padding: 16px;
        }

        .view-more-button,
        .view-less-button {
          background: none;
          color: #3b82f6;
          border: none;
          padding: 2px 0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 auto;
          transition: all 0.2s ease;
          text-decoration: none;
          position: relative;
        }

        .view-more-button:hover,
        .view-less-button:hover {
          color: #1d4ed8;
        }

        .view-more-button::after,
        .view-less-button::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #3b82f6;
          transition: width 0.2s ease;
        }

        .view-more-button:hover::after,
        .view-less-button:hover::after {
          width: 100%;
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .meetings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meeting-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .meeting-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .meeting-type {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .type-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .type-icon.daily {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .type-icon.review {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .type-icon.presentation {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .type-icon.planning {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .type-label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
        }

        .meeting-date {
          background: #e2e8f0;
          color: #475569;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .meeting-content {
          margin-bottom: 8px;
        }

        .meeting-title {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .meeting-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meeting-time,
        .meeting-location,
        .meeting-attendees {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
        }

        .meeting-time svg,
        .meeting-location svg,
        .meeting-attendees svg {
          color: #94a3b8;
        }

        .meeting-count {
          background: #f3f4f6;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .meeting-action {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
        }

        .join-meeting-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .join-meeting-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        .join-meeting-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          
          .header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .meeting-item {
            padding: 12px;
          }

          .meeting-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .meeting-details {
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
