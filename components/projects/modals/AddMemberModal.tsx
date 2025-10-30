'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Member } from '@/types/member';
import { Plus, Search, X, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { userService } from '@/services/userService';
import { projectService } from '@/services/projectService';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: Member) => void;
  onRemoveMember: (memberId: string) => void;
  existingMembers: Member[];
  projectId: string;
  ownerId: string;
  userRole?: string;
}

export function AddMemberModal({ 
  isOpen, 
  onClose, 
  onAddMember, 
  onRemoveMember,
  existingMembers,
  projectId,
  ownerId,
  userRole
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Fetch available users when modal opens
  useEffect(() => {
    if (isOpen && ownerId) {
      fetchAvailableUsers();
    }
  }, [isOpen, ownerId]);

  const fetchAvailableUsers = async () => {
    if (!ownerId) {
      setError('Không tìm thấy Owner ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await userService.getMembersByBO(ownerId);
      
      if (result.success && result.data) {
        setAvailableUsers(result.data);
      } else {
        setError(result.error || 'Không thể tải danh sách người dùng');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Filter out existing members and apply search
  // Support both Member format (id) and User format (userId or id)
  const existingMemberUserIds = existingMembers.map(m => m.id || (m as any).userId).filter(Boolean);
  const existingMemberEmails = existingMembers.map(m => m.email?.toLowerCase()).filter(Boolean);
  
  const filteredUsers = availableUsers.filter(availableUser => {
    // Get user ID - API might return 'id' or 'userId'
    const userIdentifier = availableUser.userId || availableUser.id;
    
    // Check if user already exists by ID or email
    const isExistingMemberById = existingMemberUserIds.includes(userIdentifier);
    const isExistingMemberByEmail = existingMemberEmails.includes(availableUser.email?.toLowerCase());
    const isExistingMember = isExistingMemberById || isExistingMemberByEmail;
    
    // Role-based filtering
    const userRoleValue = availableUser.role || availableUser.roleName || '';
    const userRoleLower = userRoleValue.toLowerCase();
    
    // If user is Business Owner, only show ProjectManager role
    if (userRole === 'businessowner') {
      const isProjectManager = userRoleLower === 'projectmanager';
      if (!isProjectManager) return false;
    }
    
    // If user is Project Manager, only show Member role
    if (userRole === 'projectmanager') {
      const isMember = userRoleLower === 'member';
      if (!isMember) return false;
    }
    
    // Apply search filter
    const matchesSearch = !searchQuery || 
      availableUser.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      availableUser.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userRoleValue.toLowerCase().includes(searchQuery.toLowerCase());
    
    return !isExistingMember && matchesSearch;
  });

  const handleAddMember = async (selectedUser: any) => {
    if (!projectId) {
      setError('Không tìm thấy ID dự án');
      return;
    }

    // Get user ID - API might return 'userId' or 'id'
    const userIdToAdd = selectedUser.userId || selectedUser.id;
    
    if (!userIdToAdd) {
      setError('User ID không hợp lệ');
      console.error('Invalid user selected:', selectedUser);
      return;
    }

    setAdding(true);
    setError('');
    setSuccess('');

    try {
      console.log('Adding member to project:', { 
        projectId, 
        userId: userIdToAdd,
        userName: selectedUser.fullName,
        userEmail: selectedUser.email 
      });
      
      const result = await projectService.addProjectMember(projectId, userIdToAdd);
      
      if (result.success && result.data) {
        console.log('Member added successfully:', result.data);
        
        // Convert to Member format for UI
        const newMember: Member = {
          id: userIdToAdd,
          name: selectedUser.fullName,
          email: selectedUser.email,
          role: selectedUser.role || selectedUser.roleName || 'Member',
          avatar: selectedUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        };
        
        onAddMember(newMember);
        setSuccess(`Đã thêm ${selectedUser.fullName} vào dự án!`);
        
        // Refresh available users list
        await fetchAvailableUsers();
        
        // Close modal after 1.5 seconds
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        const errorMsg = result.error || 'Không thể thêm thành viên';
        setError(errorMsg);
        console.error('Add member failed:', errorMsg);
      }
    } catch (err: any) {
      console.error('Error adding member:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi thêm thành viên';
      setError(errorMsg);
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setError('');
    setSuccess('');
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
            {userRole === 'businessowner' ? 'Thêm người quản lý' : 'Thêm thành viên'}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
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
          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
              <span style={{ color: '#991b1b', fontSize: '14px' }}>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                padding: '12px 16px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <span style={{ color: '#15803d', fontSize: '14px' }}>{success}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <Loader2 size={20} style={{ color: '#FF5E13', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách thành viên...</span>
            </div>
          )}

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

          {/* Current Members */}
          {existingMembers.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#374151',
                  margin: '0 0 12px 0'
                }}
              >
                Thành viên hiện tại ({existingMembers.length})
              </h4>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                {existingMembers.map((member, index) => (
                  <div
                    key={member.id || (member as any).userId || `existing-${index}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s ease'
                    }}
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
                        background: '#FF5E13',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '14px'
                        }}
                      >
                        {member.name}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}
                      >
                        {member.email} • {member.role}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Users */}
          {!loading && filteredUsers.length > 0 && (
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
                {filteredUsers.map((availableUser, index) => {
                  const userId = availableUser.userId || availableUser.id;
                  const userRole = availableUser.role || availableUser.roleName || 'Member';
                  
                  return (
                    <div
                      key={userId || availableUser.email || `available-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6',
                        cursor: adding ? 'not-allowed' : 'pointer',
                        opacity: adding ? 0.6 : 1,
                        transition: 'background-color 0.2s ease'
                      }}
                      onClick={() => !adding && handleAddMember(availableUser)}
                      onMouseEnter={(e) => {
                        if (!adding) e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                      >
                        {availableUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            color: '#374151',
                            fontSize: '14px'
                          }}
                        >
                          {availableUser.fullName}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#6b7280'
                          }}
                        >
                          {availableUser.email} • {userRole}
                        </div>
                      </div>
                      {adding ? (
                        <Loader2 size={16} style={{ color: '#FF5E13', animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Plus size={16} style={{ color: '#10b981' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Available Users */}
          {!loading && filteredUsers.length === 0 && availableUsers.length > 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}
            >
              Không tìm thấy thành viên phù hợp với tìm kiếm của bạn
            </div>
          )}

          {!loading && availableUsers.length === 0 && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}
            >
              Không có thành viên khả dụng để thêm vào dự án
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
