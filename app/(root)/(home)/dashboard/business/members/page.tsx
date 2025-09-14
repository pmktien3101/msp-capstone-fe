'use client';

import React, { useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Member' | 'ProjectManager';
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
  projects: number;
}

const MembersRolesPage = () => {
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@company.com',
      role: 'ProjectManager',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-12-20',
      projects: 5
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@company.com',
      role: 'Member',
      status: 'active',
      joinDate: '2024-02-20',
      lastActive: '2024-12-19',
      projects: 3
    },
    {
      id: '3',
      name: 'Lê Văn C',
      email: 'levanc@company.com',
      role: 'Member',
      status: 'inactive',
      joinDate: '2024-03-10',
      lastActive: '2024-12-15',
      projects: 2
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      email: 'phamthid@company.com',
      role: 'ProjectManager',
      status: 'active',
      joinDate: '2024-04-05',
      lastActive: '2024-12-20',
      projects: 4
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Member' | 'ProjectManager'>('all');

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Member' as 'Member' | 'ProjectManager'
  });

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member: Member = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        projects: 0
      };
      setMembers([...members, member]);
      setNewMember({ name: '', email: '', role: 'Member' });
      setShowAddModal(false);
    }
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(members.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    ));
    setShowEditModal(false);
    setSelectedMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      setMembers(members.filter(member => member.id !== memberId));
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ProjectManager: { color: '#DBEAFE', textColor: '#1E40AF', text: 'Project Manager' },
      Member: { color: '#D1FAE5', textColor: '#065F46', text: 'Member' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <span 
        className="role-badge"
        style={{ 
          backgroundColor: config.color, 
          color: config.textColor 
        }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#D1FAE5', textColor: '#065F46', text: 'Hoạt động' },
      inactive: { color: '#FEE2E2', textColor: '#DC2626', text: 'Không hoạt động' }
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
    <div className="members-roles-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Quản Lý Thành Viên & Vai Trò</h1>
          <p>Quản lý thành viên trong team và phân quyền vai trò</p>
        </div>
        <button 
          className="add-member-btn"
          onClick={() => setShowAddModal(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Thêm Thành Viên
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="role-filter">
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ProjectManager">Project Manager</option>
            <option value="Member">Member</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Tổng Thành Viên</h3>
            <p className="stat-number">{members.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Project Managers</h3>
            <p className="stat-number">{members.filter(m => m.role === 'ProjectManager').length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Thành Viên Hoạt Động</h3>
            <p className="stat-number">{members.filter(m => m.status === 'active').length}</p>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="members-table-container">
        <div className="table-header">
          <h3>Danh Sách Thành Viên</h3>
          <span className="member-count">{filteredMembers.length} thành viên</span>
        </div>
        
        <div className="members-table">
          <div className="table-header-row">
            <div className="col-name">Tên</div>
            <div className="col-email">Email</div>
            <div className="col-role">Vai trò</div>
            <div className="col-status">Trạng thái</div>
            <div className="col-projects">Dự án</div>
            <div className="col-actions">Thao tác</div>
          </div>
          
          {filteredMembers.map((member) => (
            <div key={member.id} className="table-row">
              <div className="col-name">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-details">
                    <span className="member-name">{member.name}</span>
                    <span className="join-date">Tham gia: {member.joinDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="col-email">
                <span className="email">{member.email}</span>
              </div>
              
              <div className="col-role">
                {getRoleBadge(member.role)}
              </div>
              
              <div className="col-status">
                {getStatusBadge(member.status)}
              </div>
              
              <div className="col-projects">
                <span className="project-count">{member.projects} dự án</span>
              </div>
              
              <div className="col-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => handleEditMember(member)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteMember(member.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Thêm Thành Viên Mới</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tên thành viên</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="Nhập tên thành viên"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="Nhập email"
                />
              </div>
              
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value as 'Member' | 'ProjectManager'})}
                >
                  <option value="Member">Member</option>
                  <option value="ProjectManager">Project Manager</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button 
                className="save-btn"
                onClick={handleAddMember}
              >
                Thêm Thành Viên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Chỉnh Sửa Thành Viên</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Tên thành viên</label>
                <input
                  type="text"
                  value={selectedMember.name}
                  onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedMember.email}
                  onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={selectedMember.role}
                  onChange={(e) => setSelectedMember({...selectedMember, role: e.target.value as 'Member' | 'ProjectManager'})}
                >
                  <option value="Member">Member</option>
                  <option value="ProjectManager">Project Manager</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={selectedMember.status}
                  onChange={(e) => setSelectedMember({...selectedMember, status: e.target.value as 'active' | 'inactive'})}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button 
                className="save-btn"
                onClick={() => handleUpdateMember(selectedMember)}
              >
                Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .members-roles-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0D062D;
          margin: 0 0 8px 0;
        }

        .header-content p {
          font-size: 16px;
          color: #787486;
          margin: 0;
        }

        .add-member-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FF5E13;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-member-btn:hover {
          background: #FFA463;
          transform: translateY(-2px);
        }

        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #787486;
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .role-filter select {
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .role-filter select:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: #F9F4EE;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF5E13;
        }

        .stat-content h3 {
          font-size: 12px;
          color: #787486;
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #0D062D;
          margin: 0;
        }

        .members-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #F3F4F6;
        }

        .table-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .member-count {
          font-size: 14px;
          color: #787486;
        }

        .members-table {
          overflow-x: auto;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 16px 24px;
          background: #F9F4EE;
          font-size: 12px;
          font-weight: 600;
          color: #787486;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid #F3F4F6;
          align-items: center;
          transition: background-color 0.3s ease;
        }

        .table-row:hover {
          background: #F9F4EE;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          background: #FF5E13;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        .member-details {
          display: flex;
          flex-direction: column;
        }

        .member-name {
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
        }

        .join-date {
          font-size: 12px;
          color: #787486;
        }

        .email {
          font-size: 14px;
          color: #0D062D;
        }

        .role-badge, .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .project-count {
          font-size: 14px;
          color: #0D062D;
        }

        .col-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          background: #DBEAFE;
          color: #1E40AF;
        }

        .action-btn.edit:hover {
          background: #BFDBFE;
        }

        .action-btn.delete {
          background: #FEE2E2;
          color: #DC2626;
        }

        .action-btn.delete:hover {
          background: #FECACA;
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
          border-bottom: 1px solid #F3F4F6;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0D062D;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #787486;
          padding: 4px;
        }

        .close-btn:hover {
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
          font-size: 14px;
          font-weight: 500;
          color: #0D062D;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #FF5E13;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #F3F4F6;
        }

        .cancel-btn {
          padding: 10px 20px;
          border: 2px solid #E5E7EB;
          background: white;
          color: #787486;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          border-color: #D1D5DB;
          color: #0D062D;
        }

        .save-btn {
          padding: 10px 20px;
          border: none;
          background: #FF5E13;
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-btn:hover {
          background: #FFA463;
        }

        @media (max-width: 768px) {
          .members-roles-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .filters-section {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header-row,
          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .col-name,
          .col-email,
          .col-role,
          .col-status,
          .col-projects,
          .col-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #F3F4F6;
          }

          .col-name::before { content: "Tên: "; font-weight: 600; }
          .col-email::before { content: "Email: "; font-weight: 600; }
          .col-role::before { content: "Vai trò: "; font-weight: 600; }
          .col-status::before { content: "Trạng thái: "; font-weight: 600; }
          .col-projects::before { content: "Dự án: "; font-weight: 600; }
          .col-actions::before { content: "Thao tác: "; font-weight: 600; }
        }
      `}</style>
    </div>
  );
};

export default MembersRolesPage;
