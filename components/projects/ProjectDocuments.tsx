'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/types/project';
import { 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Archive, 
  Database, 
  Palette,
  File,
  FolderOpen
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  description?: string;
}

interface ProjectDocumentsProps {
  project: Project;
}

export const ProjectDocuments = ({ project }: ProjectDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-1',
      name: 'Project Requirements.pdf',
      type: 'pdf',
      size: 2048576, // 2MB
      uploadedBy: 'John Doe',
      uploadedAt: '2025-01-15T10:30:00Z',
      url: '/documents/project-requirements.pdf',
      description: 'Tài liệu yêu cầu chi tiết của dự án'
    },
    {
      id: 'doc-2',
      name: 'Database Schema.sql',
      type: 'sql',
      size: 512000, // 512KB
      uploadedBy: 'Quang Lê',
      uploadedAt: '2025-01-14T14:20:00Z',
      url: '/documents/database-schema.sql',
      description: 'Schema cơ sở dữ liệu cho hệ thống'
    },
    {
      id: 'doc-3',
      name: 'UI Mockups.fig',
      type: 'fig',
      size: 1536000, // 1.5MB
      uploadedBy: 'Bình Nguyễn',
      uploadedAt: '2025-01-13T09:15:00Z',
      url: '/documents/ui-mockups.fig',
      description: 'Thiết kế giao diện người dùng'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    const iconProps = { size: 24, className: "text-gray-600" };
    
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText {...iconProps} className="text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText {...iconProps} className="text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet {...iconProps} className="text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FileText {...iconProps} className="text-orange-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage {...iconProps} className="text-purple-600" />;
      case 'zip':
      case 'rar':
        return <Archive {...iconProps} className="text-yellow-600" />;
      case 'sql':
        return <Database {...iconProps} className="text-indigo-600" />;
      case 'fig':
        return <Palette {...iconProps} className="text-pink-600" />;
      default:
        return <File {...iconProps} className="text-gray-600" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUpload = () => {
    if (!uploadFile) return;

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: uploadFile.name,
      type: uploadFile.name.split('.').pop() || 'unknown',
      size: uploadFile.size,
      uploadedBy: 'Current User', // Replace with actual user
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(uploadFile),
      description: uploadDescription
    };

    setDocuments(prev => [newDocument, ...prev]);
    setUploadFile(null);
    setUploadDescription('');
    setShowUploadModal(false);
  };

  const handleDownload = (document: Document) => {
    // In real implementation, this would download the actual file
    console.log('Downloading:', document.name);
    alert(`Tải xuống: ${document.name}`);
  };

  const handleDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="project-documents">
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '0 4px'
        }}
      >
        <div>
          <h3 
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}
          >
            Tài liệu dự án
          </h3>
          <p 
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}
          >
            Quản lý và chia sẻ tài liệu liên quan đến dự án
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          style={{
            background: 'transparent',
            color: '#FF5E13',
            border: '1px solid #FF5E13',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FF5E13';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#FF5E13';
          }}
        >
          <Upload size={16} />
          Tải lên tài liệu
        </Button>
      </div>

      {/* Search */}
      <div 
        style={{
          marginBottom: '24px',
          position: 'relative'
        }}
      >
        <Input
          type="text"
          placeholder="Tìm kiếm tài liệu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 40px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280'
          }}
        >
          <Search size={16} />
        </div>
      </div>

      {/* Documents List */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {filteredDocuments.length === 0 ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b7280',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <FolderOpen size={48} className="text-gray-400" />
            </div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {searchQuery ? 'Không tìm thấy tài liệu nào' : 'Chưa có tài liệu nào'}
            </p>
            {!searchQuery && (
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                Hãy tải lên tài liệu đầu tiên của bạn
              </p>
            )}
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <div
              key={document.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF5E13';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(255, 94, 19, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* File Icon */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  background: '#f3f4f6',
                  borderRadius: '8px'
                }}
              >
                {getFileIcon(document.type)}
              </div>

              {/* File Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1f2937',
                    margin: '0 0 4px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {document.name}
                </h4>
                {document.description && (
                  <p 
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {document.description}
                  </p>
                )}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}
                >
                  <span>{formatFileSize(document.size)}</span>
                  <span>•</span>
                  <span>Tải lên bởi {document.uploadedBy}</span>
                  <span>•</span>
                  <span>{formatDate(document.uploadedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div 
                style={{
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <Button
                  onClick={() => handleDownload(document)}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={14} />
                  Tải xuống
                </Button>
                <Button
                  onClick={() => handleDelete(document.id)}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={14} />
                  Xóa
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
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
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1f2937',
                margin: '0 0 20px 0'
              }}
            >
              Tải lên tài liệu
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label 
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Chọn tài liệu
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {uploadFile && (
                <p 
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '8px 0 0 0'
                  }}
                >
                  Đã chọn: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                </p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label 
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}
              >
                Mô tả (tùy chọn)
              </label>
              <Input
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Mô tả ngắn về tài liệu..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div 
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}
            >
              <Button
                onClick={() => setShowUploadModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile}
                style={{
                  padding: '10px 20px',
                  background: uploadFile ? 'transparent' : '#f3f4f6',
                  color: uploadFile ? '#FF5E13' : '#9ca3af',
                  border: uploadFile ? '1px solid #FF5E13' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: uploadFile ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (uploadFile) {
                    e.currentTarget.style.background = '#FF5E13';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (uploadFile) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#FF5E13';
                  }
                }}
              >
                Tải lên
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
