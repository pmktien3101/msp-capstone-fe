'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Member } from '@/types/member';
import { Plus, Search, X, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { userService } from '@/services/userService';
import { projectService } from '@/services/projectService';
import '@/app/styles/add-member-modal.scss';
import { useMemberInProjectLimitationCheck } from '@/hooks/useLimitationCheck';

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
  const { checkMemberInProjectLimit } = useMemberInProjectLimitationCheck();
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
      setError('Owner ID not found');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await userService.getMembersByBO(ownerId);
      
      if (result.success && result.data) {
        setAvailableUsers(result.data);
      } else {
        setError(result.error || 'Unable to load user list');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'An error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  // Filter out ACTIVE members only (not former members who can be re-added)
  // Support both Member format (id) and User format (userId or id)
  const activeMemberUserIds = existingMembers
    .filter(m => !m.leftAt) // Only filter active members
    .map(m => m.id || (m as any).userId)
    .filter(Boolean);
  const activeMemberEmails = existingMembers
    .filter(m => !m.leftAt) // Only filter active members
    .map(m => m.email?.toLowerCase())
    .filter(Boolean);
  
  const filteredUsers = availableUsers.filter(availableUser => {
    // Get user ID - API might return 'id' or 'userId'
    const userIdentifier = availableUser.userId || availableUser.id;
    
    // Check if user is already an ACTIVE member (leftAt == null)
    const isActiveMemberById = activeMemberUserIds.includes(userIdentifier);
    const isActiveMemberByEmail = activeMemberEmails.includes(availableUser.email?.toLowerCase());
    const isActiveMember = isActiveMemberById || isActiveMemberByEmail;
    
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
    
    return !isActiveMember && matchesSearch;
  });

  const handleAddMember = async (selectedUser: any) => {
    if (!projectId) {
      setError('Project ID not found');
      return;
    }

    // Get user ID - API might return 'userId' or 'id'
    const userIdToAdd = selectedUser.userId || selectedUser.id;
    
    if (!userIdToAdd) {
      setError('Invalid User ID');
      console.error('Invalid user selected:', selectedUser);
      return;
    }

    // Check member count limitation before adding
    const newMemberCount = existingMembers.length + 1;
    if (!checkMemberInProjectLimit(newMemberCount)) {
      return; // Limit exceeded, don't add
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
          avatar: selectedUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          avatarUrl: selectedUser.avatarUrl || null
        };
        
        onAddMember(newMember);
        setSuccess(`Added ${selectedUser.fullName} to the project!`);
        
        // Refresh available users list
        await fetchAvailableUsers();
        
        // Don't close modal automatically - let user add multiple members
        // setTimeout(() => {
        //   handleClose();
        // }, 1500);
      } else {
        const errorMsg = result.error || 'Unable to add member';
        setError(errorMsg);
        console.error('Add member failed:', errorMsg);
      }
    } catch (err: any) {
      console.error('Error adding member:', err);
      const errorMsg = err.response?.data?.message || err.message || 'An error occurred while adding member';
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
    <div className="add-member-modal-overlay" onClick={onClose}>
      <div className="add-member-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-member-modal-header">
          <h2>
            {userRole === 'businessowner' ? 'Add Manager' : 'Add Member'}
          </h2>
          <button className="btn-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="add-member-modal-body">
          {/* Error Message */}
          {error && (
            <div className="alert-message error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="alert-message success">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <Loader2 size={20} />
              <span>Loading member list...</span>
            </div>
          )}

          {/* Search */}
          <div className="search-field">
            <label>Search members</label>
            <div className="search-input-wrapper">
              <Search size={16} />
              <Input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Current Members */}
          {existingMembers.length > 0 && (
            <div className="members-section">
              <h4>Current Members ({existingMembers.length})</h4>
              <div className="members-list">
                {existingMembers.map((member, index) => (
                  <div key={member.id || (member as any).userId || `existing-${index}`} className="member-item">
                    <div className="member-avatar existing">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} />
                      ) : (
                        member.avatar
                      )}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-details">{member.email} • {member.role}</div>
                    </div>
                    {/* Show delete button based on user role */}
                    {(userRole?.toLowerCase() === 'businessowner' || 
                      (userRole?.toLowerCase() === 'projectmanager' && member.role?.toLowerCase() === 'member')) && (
                      <button className="btn-remove" onClick={() => onRemoveMember(member.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Users */}
          {!loading && filteredUsers.length > 0 && (
            <div className="members-section">
              <h4>Available Members ({filteredUsers.length})</h4>
              <div className="members-list">
                {filteredUsers.map((availableUser, index) => {
                  const userId = availableUser.userId || availableUser.id;
                  const userRole = availableUser.role || availableUser.roleName || 'Member';
                  
                  return (
                    <div
                      key={userId || availableUser.email || `available-${index}`}
                      className={`member-item clickable ${adding ? 'disabled' : ''}`}
                      onClick={() => !adding && handleAddMember(availableUser)}
                    >
                      <div className="member-avatar available">
                        {availableUser.avatarUrl ? (
                          <img src={availableUser.avatarUrl} alt={availableUser.fullName} />
                        ) : (
                          availableUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                        )}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{availableUser.fullName}</div>
                        <div className="member-details">{availableUser.email} • {userRole}</div>
                      </div>
                      {adding ? (
                        <Loader2 size={16} className="icon-loading" />
                      ) : (
                        <Plus size={16} className="icon-add" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Available Users */}
          {!loading && filteredUsers.length === 0 && availableUsers.length > 0 && (
            <div className="empty-state">
              No members found matching your search
            </div>
          )}

          {!loading && availableUsers.length === 0 && (
            <div className="empty-state">
              No available members to add to the project
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
