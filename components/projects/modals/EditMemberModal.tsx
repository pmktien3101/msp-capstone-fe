'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Member } from '@/types/member';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateMember: (member: Member) => void;
  member: Member | null;
}

export function EditMemberModal({ 
  isOpen, 
  onClose, 
  onUpdateMember, 
  member 
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role
      });
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!member) return;

    const updatedMember: Member = {
      ...member,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    onUpdateMember(updatedMember);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', role: '' });
    onClose();
  };

  if (!isOpen || !member) return null;

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
          maxWidth: '500px',
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
            Chỉnh sửa thành viên
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
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
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
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
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px 24px 24px',
              borderTop: '1px solid #e5e7eb',
              background: 'white'
            }}
          >
            <Button
              type="button"
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: '#f1f5f9',
                color: '#374151',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cập nhật
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
