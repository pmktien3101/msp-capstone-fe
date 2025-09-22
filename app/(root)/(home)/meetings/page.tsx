'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { mockMeetings, mockProject, mockMilestones } from '@/constants/mockData';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video,
  ChevronDown,
  Plus
} from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  roomUrl?: string;
  projectId: string;
  milestoneId?: string;
  participates: string[];
}

const MeetingsPage = () => {
  const { role } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedMilestone, setSelectedMilestone] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter meetings based on search and filters
  const filteredMeetings = useMemo(() => {
    return mockMeetings.filter((meeting: any) => {
      const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProject = selectedProject === 'all' || meeting.projectId === selectedProject;
      
      const matchesMilestone = selectedMilestone === 'all' || 
                              (meeting.milestoneId && meeting.milestoneId === selectedMilestone) ||
                              (!meeting.milestoneId && selectedMilestone === 'no-milestone');
      
      const matchesStatus = selectedStatus === 'all' || meeting.status === selectedStatus;
      
      const meetingDate = new Date(meeting.startTime).toISOString().split('T')[0];
      const matchesDate = !selectedDate || meetingDate === selectedDate;
      
      return matchesSearch && matchesProject && matchesMilestone && matchesStatus && matchesDate;
    });
  }, [searchTerm, selectedProject, selectedMilestone, selectedStatus, selectedDate]);

  const getProjectName = (projectId: string) => {
    return mockProject.id === projectId ? mockProject.name : 'Không xác định';
  };

  const getMilestoneName = (milestoneId?: string) => {
    if (!milestoneId) return 'Không có milestone';
    const milestone = mockMilestones.find(m => m.id === milestoneId);
    return milestone ? milestone.name : 'Không xác định';
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return 'Đã lên lịch';
      case 'completed':
      case 'finished':
        return 'Đã hoàn thành';
      case 'cancelled':
      case 'canceled':
        return 'Đã hủy';
      case 'in-progress':
      case 'ongoing':
        return 'Đang diễn ra';
      case 'pending':
        return 'Chờ xử lý';
      case 'draft':
        return 'Bản nháp';
      default: 
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300';
      case 'completed':
      case 'finished':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
      case 'cancelled':
      case 'canceled':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
      case 'in-progress':
      case 'ongoing':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
      default: 
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
    }
  };

  const handleCardClick = (meetingId: string) => {
    // router.push(`/meeting-detail/${meetingId}`);
    router.push(`/meeting-detail/3b2140ee-24c5-4d12-8eb8-6de2a3f4fdd0`);
  };

  const handleJoinMeeting = (e: React.MouseEvent, meetingTitle: string) => {
    e.stopPropagation(); // Ngăn chặn event bubbling lên card
    alert(`Tham gia cuộc họp: ${meetingTitle}`);
  };

  // Redirect if not PM
  if (role !== 'pm') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-500">Chỉ Project Manager mới có thể xem trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meetings-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Danh sách cuộc Họp</h1>
          <p className="page-subtitle">Quản lý và theo dõi các cuộc họp dự án</p>
        </div>
        <button className="create-meeting-btn">
          <Plus size={16} />
          Tạo cuộc họp mới
        </button>
      </div>

      <div className="filters-section">
        <div className="search-bar">
            <span className='search-icon'><Search size={20} /></span>
          {/* <Search size={20} className="search-icon" /> */}
          <input
            type="text"
            placeholder="Tìm kiếm cuộc họp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          Bộ lọc
          <ChevronDown size={16} className={`chevron ${showFilters ? 'rotated' : ''}`} />
        </button>

        <button 
          className="clear-filters-btn"
          onClick={() => {
            setSearchTerm('');
            setSelectedProject('all');
            setSelectedMilestone('all');
            setSelectedStatus('all');
            setSelectedDate('');
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          Xóa bộ lọc
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Dự án</label>
              <select 
                value={selectedProject} 
                onChange={(e) => setSelectedProject(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả dự án</option>
                <option key={mockProject.id} value={mockProject.id}>
                  {mockProject.name}
                </option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Milestone</label>
              <select 
                value={selectedMilestone} 
                onChange={(e) => setSelectedMilestone(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả milestone</option>
                <option value="no-milestone">Không có milestone</option>
                {mockMilestones.map(milestone => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Trạng thái</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="in-progress">Đang diễn ra</option>
                <option value="pending">Chờ xử lý</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="filter-date"
              />
            </div>
          </div>
        </div>
      )}

      <div className="meetings-content">
        <div className="meetings-stats">
          <div className="stat-card">
            <div className="stat-number">{filteredMeetings.length}</div>
            <div className="stat-label">Tổng cuộc họp</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {filteredMeetings.filter(m => m.status === 'scheduled').length}
            </div>
            <div className="stat-label">Đã lên lịch</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {filteredMeetings.filter(m => m.status === 'completed').length}
            </div>
            <div className="stat-label">Đã hoàn thành</div>
          </div>
        </div>

        <div className="meetings-list">
          {filteredMeetings.length === 0 ? (
            <div className="empty-state">
                <span className='empty-icon'><Calendar size={48} /></span>
              <h3 className="empty-title">Không có cuộc họp nào</h3>
              <p className="empty-description">
                {searchTerm || selectedProject !== 'all' || selectedMilestone !== 'all' || 
                 selectedStatus !== 'all' || selectedDate
                  ? 'Không tìm thấy cuộc họp phù hợp với bộ lọc.'
                  : 'Chưa có cuộc họp nào được tạo.'}
              </p>
            </div>
          ) : (
            <div className="meetings-grid">
               {filteredMeetings.map((meeting: any) => (
                 <div key={meeting.id} className="meeting-card" onClick={() => handleCardClick(meeting.id)}>
                  <div className="meeting-header">
                    <h3 className="meeting-title">{meeting.title}</h3>
                    <span className={`status-badge ${getStatusColor(meeting.status)}`}>
                      {getStatusLabel(meeting.status)}
                    </span>
                  </div>
                  
                  <p className="meeting-description">{meeting.description}</p>
                  
                  <div className="meeting-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{new Date(meeting.startTime).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>
                        {new Date(meeting.startTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(meeting.endTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      {meeting.roomUrl ? <Video size={16} /> : <MapPin size={16} />}
                      <span>{meeting.roomUrl ? 'Online' : 'Offline'}</span>
                    </div>
                    <div className="detail-item">
                      <Users size={16} />
                      <span>{meeting.participates.length} người tham gia</span>
                    </div>
                  </div>
                  
                  <div className="meeting-meta">
                    <div className="meta-item">
                      <span className="meta-label">Dự án:</span>
                      <span className="meta-value">{getProjectName(meeting.projectId)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Milestone:</span>
                      <span className="meta-value">{getMilestoneName(meeting.milestoneId)}</span>
                    </div>
                     {meeting.roomUrl && (
                       <div className="meta-item">
                         <span className="meta-label">Link:</span>
                         <button 
                           onClick={(e) => handleJoinMeeting(e, meeting.title)}
                           className="meta-link"
                         >
                           Tham gia cuộc họp
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .meetings-page {
          padding: 16px;
          background: #f8fafc;
          min-height: 100vh;
          position: relative;
        }


        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 94, 19, 0.1);
          position: relative;
          overflow: hidden;
        }


        .header-content {
          flex: 1;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          background: black;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }

        .page-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .create-meeting-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 4px rgba(255, 94, 19, 0.3);
          position: relative;
          overflow: hidden;
        }

        .create-meeting-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .create-meeting-btn:hover::before {
          left: 100%;
        }

        .create-meeting-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 94, 19, 0.4);
        }

        .filters-section {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          align-items: center;
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(255, 94, 19, 0.08);
        }

        .search-bar {
          position: relative;
          flex: 1;
          max-width: 450px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #ff5e13;
          z-index: 2;
        }

        .search-input {
          width: 100%;
          padding: 10px 10px 10px 36px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          background: #f8fafc;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
        }

        .search-input:focus {
          outline: none;
          border-color: #ff5e13;
          background: white;
          box-shadow: 0 0 0 4px rgba(255, 94, 19, 0.1);
          transform: translateY(-1px);
        }

        .search-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          background: linear-gradient(135deg, #fdf0d2, #fef3c7);
          border: 2px solid #ff5e13;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #ff5e13;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .filter-toggle-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 94, 19, 0.1), transparent);
          transition: left 0.5s;
        }

        .filter-toggle-btn:hover::before {
          left: 100%;
        }

        .filter-toggle-btn:hover {
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 94, 19, 0.3);
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 2px solid #ef4444;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .clear-filters-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent);
          transition: left 0.5s;
        }

        .clear-filters-btn:hover::before {
          left: 100%;
        }

        .clear-filters-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }

        .chevron {
          transition: transform 0.2s ease;
        }

        .chevron.rotated {
          transform: rotate(180deg);
        }

        .filters-panel {
          background: white;
          border: 2px solid rgba(255, 94, 19, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }


        .filter-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-select,
        .filter-date {
          padding: 8px 10px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          background: #f8fafc;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
        }

        .filter-select:focus,
        .filter-date:focus {
          outline: none;
          border-color: #ff5e13;
          background: white;
          box-shadow: 0 0 0 4px rgba(255, 94, 19, 0.1);
          transform: translateY(-1px);
        }

        .meetings-content {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 94, 19, 0.1);
          position: relative;
          overflow: hidden;
        }


        .meetings-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .stat-card {
          text-align: center;
          padding: 12px 8px;
          background: linear-gradient(135deg, #fdf0d2, #fef3c7);
          border-radius: 6px;
          border: 1px solid rgba(255, 94, 19, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }


        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(255, 94, 19, 0.2);
          border-color: #ff5e13;
        }

        .stat-number {
          font-size: 20px;
          font-weight: 600;
          background: linear-gradient(135deg, #ff5e13, #ff8c42);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 3px;
        }

        .stat-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .meetings-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .meeting-card {
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }


        .meeting-card:hover {
          border-color: #ff5e13;
          box-shadow: 0 12px 40px rgba(255, 94, 19, 0.15);
          transform: translateY(-6px) scale(1.02);
        }

        .meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .meeting-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
          flex: 1;
          line-height: 1.3;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .status-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .status-badge:hover::before {
          left: 100%;
        }

        .meeting-description {
          color: #64748b;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .meeting-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .detail-item svg {
          color: #ff5e13;
          background: rgba(255, 94, 19, 0.1);
          padding: 3px;
          border-radius: 4px;
        }

        .meeting-meta {
          border-top: 2px solid #f1f5f9;
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .meta-label {
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meta-value {
          color: #1e293b;
          font-weight: 700;
        }

         .meta-link {
           color: #ff5e13;
           text-decoration: none;
           font-weight: 700;
           padding: 6px 12px;
           background: rgba(255, 94, 19, 0.1);
           border-radius: 8px;
           transition: all 0.2s ease;
           border: none;
           cursor: pointer;
           font-size: 12px;
         }

         .meta-link:hover {
           background: #ff5e13;
           color: white;
           transform: translateY(-1px);
         }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #64748b;
          background: linear-gradient(135deg, #fdf0d2, #fef3c7);
          border-radius: 20px;
          border: 2px solid rgba(255, 94, 19, 0.2);
        }

        .empty-icon {
          color: #ff5e13;
          margin-bottom: 24px;
          opacity: 0.7;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .empty-description {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .meetings-page {
            padding: 12px;
          }

          .page-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
            padding: 16px;
          }

          .page-title {
            font-size: 20px;
          }

          .page-subtitle {
            font-size: 13px;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
            padding: 12px;
            gap: 10px;
          }

          .search-bar {
            max-width: none;
          }

          .filter-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .meetings-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .meetings-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .meetings-content {
            padding: 16px;
          }

          .meeting-card {
            padding: 12px;
          }
        }

        @media (max-width: 480px) {
          .meetings-page {
            padding: 8px;
          }

          .page-header {
            padding: 12px;
          }

          .page-title {
            font-size: 18px;
          }

          .filters-section {
            padding: 10px;
          }

          .meetings-stats {
            grid-template-columns: 1fr;
          }

          .meetings-content {
            padding: 12px;
          }

          .meeting-card {
            padding: 10px;
          }

          .meeting-details {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, 1fr);
          }

          .meetings-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 10px 8px;
          }

          .stat-number {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default MeetingsPage;
