'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
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
      phone: '+84 123 456 789',
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
      phone: '+84 987 654 321',
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
      phone: '+84 555 123 456',
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
      phone: '+84 111 222 333',
      role: 'ProjectManager',
      status: 'active',
      joinDate: '2024-04-05',
      lastActive: '2024-12-20',
      projects: 4
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Member' | 'ProjectManager'>('all');
  const [importedData, setImportedData] = useState<any[]>([]);

  const [newMember, setNewMember] = useState({
    name: '',
    emailPrefix: '',
    phone: '',
    role: 'Member' as 'Member' | 'ProjectManager'
  });

  // Company domain - trong thực tế sẽ lấy từ context hoặc props
  const companyDomain = '@company.com';

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = [
      {
        'Tên': 'Nguyễn Văn A',
        'Email (phần trước @)': 'nguyenvana',
        'Số điện thoại': '+84 123 456 789',
        'Vai trò': 'Member'
      },
      {
        'Tên': 'Trần Thị B',
        'Email (phần trước @)': 'tranthib',
        'Số điện thoại': '+84 987 654 321',
        'Vai trò': 'ProjectManager'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Tên
      { wch: 25 }, // Email
      { wch: 20 }, // Số điện thoại
      { wch: 15 }  // Vai trò
    ];

    XLSX.writeFile(wb, 'template_members.xlsx');
  };

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate and format data
      const validatedData = jsonData.map((row: any, index: number) => {
        const name = row['Tên'] || '';
        const emailPrefix = row['Email (phần trước @)'] || '';
        const phone = row['Số điện thoại'] || '';
        const role = row['Vai trò'] || 'Member';

        return {
          rowIndex: index + 2, // +2 because Excel starts from row 1 and we skip header
          name: name.toString().trim(),
          emailPrefix: emailPrefix.toString().trim(),
          phone: phone.toString().trim(),
          role: role.toString().trim(),
          isValid: name && emailPrefix && phone,
          errors: [] as string[]
        };
      });

      // Validate data
      validatedData.forEach(item => {
        if (!item.name) item.errors.push('Tên không được để trống');
        if (!item.emailPrefix) item.errors.push('Email không được để trống');
        if (!item.phone) item.errors.push('Số điện thoại không được để trống');
        if (!['Member', 'ProjectManager'].includes(item.role)) {
          item.errors.push('Vai trò phải là Member hoặc ProjectManager');
        }
        item.isValid = item.errors.length === 0;
      });

      setImportedData(validatedData);
      setShowImportModal(false);
      setShowPreviewModal(true);
    };

    reader.readAsArrayBuffer(file);
  };

  // Confirm import
  const confirmImport = () => {
    const validData = importedData.filter(item => item.isValid);
    
    const newMembers: Member[] = validData.map(item => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: item.name,
      email: item.emailPrefix + companyDomain,
      phone: item.phone,
      role: item.role as 'Member' | 'ProjectManager',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      projects: 0
    }));

    setMembers(prev => [...prev, ...newMembers]);
    setImportedData([]);
    setShowPreviewModal(false);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.emailPrefix && newMember.phone) {
      const member: Member = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.emailPrefix + companyDomain,
        phone: newMember.phone,
        role: newMember.role,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        projects: 0
      };
      setMembers([...members, member]);
      setNewMember({ name: '', emailPrefix: '', phone: '', role: 'Member' });
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
          <div className="header-left">
            <h3>Danh Sách Thành Viên</h3>
            <span className="member-count">{filteredMembers.length} thành viên</span>
          </div>
          <div className="header-actions">
            <button 
              className="download-template-btn"
              onClick={downloadTemplate}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tải Template
            </button>
            <button 
              className="import-excel-btn"
              onClick={() => setShowImportModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Import Excel
            </button>
            <button 
              className="add-member-btn"
              onClick={() => setShowAddModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Thêm Thành Viên
            </button>
          </div>
        </div>
        
        <div className="members-table">
          <div className="table-header-row">
            <div className="col-name">Tên</div>
            <div className="col-email">Email</div>
            <div className="col-phone">Số điện thoại</div>
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
              
              <div className="col-phone">
                <span className="phone">{member.phone}</span>
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
                <div className="email-input-group">
                  <input
                    type="text"
                    value={newMember.emailPrefix}
                    onChange={(e) => setNewMember({...newMember, emailPrefix: e.target.value})}
                    placeholder="Nhập phần trước @"
                  />
                  <span className="email-domain">{companyDomain}</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
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
                <div className="email-input-group">
                  <input
                    type="text"
                    value={selectedMember.email.split('@')[0]}
                    onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value + companyDomain})}
                  />
                  <span className="email-domain">{companyDomain}</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={selectedMember.phone}
                  onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
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

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Import Thành Viên từ Excel</h3>
              <button 
                className="close-btn"
                onClick={() => setShowImportModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="import-instructions">
                <h4>Hướng dẫn import:</h4>
                <ol>
                  <li>Tải template Excel mẫu bằng nút "Tải Template"</li>
                  <li>Điền thông tin thành viên vào file Excel</li>
                  <li>Chọn file Excel đã điền để import</li>
                </ol>
              </div>
              
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  id="excel-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="excel-file-input" className="file-upload-label">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Chọn file Excel để import</span>
                  <small>Hỗ trợ file .xlsx, .xls</small>
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowImportModal(false)}
              >
                Hủy
              </button>
              <button 
                className="download-template-btn"
                onClick={downloadTemplate}
              >
                Tải Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Import Modal */}
      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal preview-modal">
            <div className="modal-header">
              <h3>Xem trước dữ liệu import</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="import-summary">
                <div className="summary-item">
                  <span className="label">Tổng số dòng:</span>
                  <span className="value">{importedData.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Dữ liệu hợp lệ:</span>
                  <span className="value valid">{importedData.filter(item => item.isValid).length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Dữ liệu lỗi:</span>
                  <span className="value error">{importedData.filter(item => !item.isValid).length}</span>
                </div>
              </div>
              
              <div className="preview-table">
                <div className="preview-header">
                  <div className="preview-col">Dòng</div>
                  <div className="preview-col">Tên</div>
                  <div className="preview-col">Email</div>
                  <div className="preview-col">Số điện thoại</div>
                  <div className="preview-col">Vai trò</div>
                  <div className="preview-col">Trạng thái</div>
                </div>
                
                {importedData.map((item, index) => (
                  <div key={index} className={`preview-row ${item.isValid ? 'valid' : 'error'}`}>
                    <div className="preview-col">{item.rowIndex}</div>
                    <div className="preview-col">{item.name}</div>
                    <div className="preview-col">{item.emailPrefix + companyDomain}</div>
                    <div className="preview-col">{item.phone}</div>
                    <div className="preview-col">{item.role}</div>
                    <div className="preview-col">
                      {item.isValid ? (
                        <span className="status-valid">✓ Hợp lệ</span>
                      ) : (
                        <div className="status-error">
                          <span>✗ Lỗi</span>
                          <div className="error-details">
                            {item.errors.map((error: string, i: number) => (
                              <div key={i} className="error-item">{error}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                Hủy
              </button>
              <button 
                className="confirm-import-btn"
                onClick={confirmImport}
                disabled={importedData.filter(item => item.isValid).length === 0}
              >
                Import {importedData.filter(item => item.isValid).length} thành viên
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

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
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

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .download-template-btn,
        .import-excel-btn,
        .add-member-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          background: white;
          color: #0D062D;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .download-template-btn:hover {
          border-color: #10B981;
          color: #10B981;
          background: #F0FDF4;
        }

        .import-excel-btn:hover {
          border-color: #3B82F6;
          color: #3B82F6;
          background: #EFF6FF;
        }

        .add-member-btn {
          background: #FF5E13;
          border-color: #FF5E13;
          color: white;
        }

        .add-member-btn:hover {
          background: #E04A0C;
          border-color: #E04A0C;
        }

        .members-table {
          overflow-x: auto;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr 1fr;
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
          grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr 1fr;
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

        .email-input-group {
          display: flex;
          align-items: center;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.3s ease;
        }

        .email-input-group:focus-within {
          border-color: #FF5E13;
        }

        .email-input-group input {
          flex: 1;
          border: none;
          padding: 12px;
          font-size: 14px;
          outline: none;
        }

        .email-domain {
          padding: 12px;
          background: #F9F4EE;
          color: #787486;
          font-size: 14px;
          font-weight: 500;
          border-left: 1px solid #E5E7EB;
        }

        .phone {
          color: #0D062D;
          font-size: 14px;
        }

        /* Import Modal Styles */
        .import-instructions {
          background: #F9F4EE;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .import-instructions h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #0D062D;
        }

        .import-instructions ol {
          margin: 0;
          padding-left: 20px;
        }

        .import-instructions li {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 4px;
        }

        .file-upload-area {
          border: 2px dashed #E5E7EB;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          transition: border-color 0.3s ease;
        }

        .file-upload-area:hover {
          border-color: #FF5E13;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: #6B7280;
        }

        .file-upload-label svg {
          color: #FF5E13;
        }

        .file-upload-label span {
          font-size: 16px;
          font-weight: 500;
          color: #0D062D;
        }

        .file-upload-label small {
          font-size: 12px;
          color: #6B7280;
        }

        /* Preview Modal Styles */
        .preview-modal {
          max-width: 1000px;
          width: 90%;
        }

        .import-summary {
          display: flex;
          gap: 24px;
          margin-bottom: 20px;
          padding: 16px;
          background: #F9F4EE;
          border-radius: 8px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-item .label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        .summary-item .value {
          font-size: 18px;
          font-weight: 700;
          color: #0D062D;
        }

        .summary-item .value.valid {
          color: #10B981;
        }

        .summary-item .value.error {
          color: #EF4444;
        }

        .preview-table {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
        }

        .preview-header {
          display: grid;
          grid-template-columns: 60px 1fr 1.5fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 12px 16px;
          background: #F9F4EE;
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .preview-row {
          display: grid;
          grid-template-columns: 60px 1fr 1.5fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
        }

        .preview-row.valid {
          background: white;
        }

        .preview-row.error {
          background: #FEF2F2;
        }

        .preview-col {
          display: flex;
          align-items: center;
        }

        .status-valid {
          color: #10B981;
          font-weight: 500;
        }

        .status-error {
          color: #EF4444;
          font-weight: 500;
        }

        .error-details {
          margin-top: 4px;
        }

        .error-item {
          font-size: 12px;
          color: #DC2626;
          margin-bottom: 2px;
        }

        .confirm-import-btn {
          background: #10B981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .confirm-import-btn:hover:not(:disabled) {
          background: #059669;
        }

        .confirm-import-btn:disabled {
          background: #D1D5DB;
          cursor: not-allowed;
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
