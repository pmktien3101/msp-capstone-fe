'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Member } from '@/types/member';
import { Plus, Search, X } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Member) => void;
  existingMembers: Member[];
}

export function AddMemberModal({ 
  isOpen, 
  onClose, 
  onAddMember, 
  existingMembers 
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [customMember, setCustomMember] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Mock available users - in real app this would come from API
  const availableUsers: Member[] = [
    {
      id: 'user-1',
      name: 'Nguyễn Văn A',
      email: 'a@msp.com',
      role: 'Developer',
      avatar: 'NA'
    },
    {
      id: 'user-2',
      name: 'Trần Thị B',
      email: 'b@msp.com',
      role: 'Designer',
      avatar: 'TB'
    },
    {
      id: 'user-3',
      name: 'Lê Văn C',
      email: 'c@msp.com',
      role: 'QA Tester',
      avatar: 'LC'
    },
    {
      id: 'user-4',
      name: 'Phạm Thị D',
      email: 'd@msp.com',
      role: 'DevOps Engineer',
      avatar: 'PD'
    },
    {
      id: 'user-5',
      name: 'Hoàng Văn E',
      email: 'e@msp.com',
      role: 'Business Analyst',
      avatar: 'HE'
    },
    {
      id: 'user-6',
      name: 'Vũ Thị F',
      email: 'f@msp.com',
      role: 'Product Manager',
      avatar: 'VF'
    }
  ];

  const existingMemberIds = existingMembers.map(m => m.id);
  const filteredUsers = availableUsers.filter(user => 
    !existingMemberIds.includes(user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddExistingMember = (member: Member) => {
    onAddMember(member);
    handleClose();
  };

  const handleAddCustomMember = () => {
    if (!customMember.name || !customMember.email || !customMember.role) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const newMember: Member = {
      id: `custom-${Date.now()}`,
      name: customMember.name,
      email: customMember.email,
      role: customMember.role,
      avatar: customMember.name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    onAddMember(newMember);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedMember(null);
    setCustomMember({ name: '', email: '', role: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1f2937',
              margin: 0
            }}
          >
            Thêm thành viên
          </h2>
          <button
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            overflowY: 'auto'
          }}
        >
          {/* Search */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}
            >
              Tìm kiếm thành viên
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}
              />
              <Input
                type="text"
                placeholder="Tìm theo tên, email hoặc vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Available Users */}
          {filteredUsers.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}
              >
                Thành viên có sẵn ({filteredUsers.length})
              </h4>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => handleAddExistingMember(user)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      {user.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '14px'
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}
                      >
                        {user.email} • {user.role}
                      </div>
                    </div>
                    <Plus size={16} style={{ color: '#6b7280' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#6b7280',
              fontSize: '14px'
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span>hoặc</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Add Custom Member */}
          <div>
            <h4
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151',
                margin: '0 0 16px 0'
              }}
            >
              Thêm thành viên mới
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px'
                  }}
                >
                  Tên <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nhập tên thành viên"
                  value={customMember.name}
                  onChange={(e) => setCustomMember(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px'
                  }}
                >
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <Input
                  type="email"
                  placeholder="Nhập email thành viên"
                  value={customMember.email}
                  onChange={(e) => setCustomMember(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px'
                  }}
                >
                  Vai trò <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={customMember.role}
                  onChange={(e) => setCustomMember(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="">Chọn vai trò</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="QA Tester">QA Tester</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Tech Lead">Tech Lead</option>
                  <option value="Team Lead">Team Lead</option>
                </select>
              </div>

              <Button
                onClick={handleAddCustomMember}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Thêm thành viên mới
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
