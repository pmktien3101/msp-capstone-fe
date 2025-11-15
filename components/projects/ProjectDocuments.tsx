'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/types/project';
import { GetDocumentResponse } from '@/types/document';
import { documentService } from '@/services/documentService';
import { uploadFileToCloudinary } from '@/services/uploadFileService';
import { useUser } from '@/hooks/useUser';
import { toast } from 'react-toastify';
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
  FolderOpen,
  Loader2
} from 'lucide-react';

interface ProjectDocumentsProps {
  project: Project;
}

export const ProjectDocuments = ({ project }: ProjectDocumentsProps) => {
  const userState = useUser();
  const currentUser = {
    id: userState.userId,
    email: userState.email,
    fullName: userState.fullName,
    role: userState.role,
    avatarUrl: userState.avatarUrl
  };
  
  const [documents, setDocuments] = useState<GetDocumentResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<GetDocumentResponse | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5; 

  // Fetch documents when component mounts
  useEffect(() => {
    fetchDocuments();
  }, [project.id, currentPage]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const result = await documentService.getDocumentsByProjectId(project.id, {
        pageIndex: currentPage,
        pageSize: pageSize
      });

      if (result.success && result.data) {
        setDocuments(result.data.items);
        setTotalPages(Math.ceil(result.data.totalItems / result.data.pageSize));
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (filename: string) => {
    const iconProps = { size: 24, className: "text-gray-600" };
    const ext = getFileExtension(filename);
    
    switch (ext) {
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
      case 'webp':
        return <FileImage {...iconProps} className="text-purple-600" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive {...iconProps} className="text-yellow-600" />;
      case 'sql':
        return <Database {...iconProps} className="text-indigo-600" />;
      case 'fig':
      case 'sketch':
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

  const handleUpload = async () => {
    if (!uploadFile || !currentUser.id) {
      toast.error('Vui lòng chọn file và đăng nhập');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload file to Cloudinary
      const fileUrl = await uploadFileToCloudinary(uploadFile);
      
      if (!fileUrl) {
        toast.error('Không thể tải file lên Cloudinary');
        return;
      }

      // 2. Create document record in database
      const result = await documentService.createDocument({
        name: uploadFile.name,
        ownerId: currentUser.id,
        projectId: project.id,
        fileUrl: fileUrl,
        description: uploadDescription || undefined,
        size: uploadFile.size
      });

      if (result.success) {
        toast.success('Tải lên tài liệu thành công!');
        setUploadFile(null);
        setUploadDescription('');
        setShowUploadModal(false);
        // Refresh documents list
        fetchDocuments();
      } else {
        toast.error(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Có lỗi xảy ra khi tải lên tài liệu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (document: GetDocumentResponse) => {
    // Open file URL in new tab to download
    window.open(document.fileUrl, '_blank');
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return;
    }

    try {
      const result = await documentService.deleteDocument(documentId);
      
      if (result.success) {
        toast.success('Xóa tài liệu thành công!');
        // Refresh documents list
        fetchDocuments();
      } else {
        toast.error(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Có lỗi xảy ra khi xóa tài liệu');
    }
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
        {isLoading ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b7280'
            }}
          >
            <Loader2 size={48} className="text-gray-400 animate-spin mx-auto mb-4" />
            <p style={{ margin: 0, fontSize: '16px' }}>
              Đang tải danh sách tài liệu...
            </p>
          </div>
        ) : filteredDocuments.length === 0 ? (
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
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
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
                {getFileIcon(document.name)}
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
                  <span>Tải lên bởi {document.owner?.fullName || 'N/A'}</span>
                  <span>•</span>
                  <span>{formatDate(document.createdAt)}</span>
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
                <Button
                  onClick={() => {
                    setEditingDocument(document);
                    setEditName(document.name);
                    setEditDescription(document.description || '');
                    setShowEditModal(true);
                  }}
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
                  <FileText size={14} />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && documents.length > 0 && totalPages > 1 && (
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            padding: '16px 0'
          }}
        >
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              background: currentPage === 1 ? '#f3f4f6' : 'transparent',
              color: currentPage === 1 ? '#9ca3af' : '#FF5E13',
              border: currentPage === 1 ? '1px solid #d1d5db' : '1px solid #FF5E13',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Trước
          </Button>
          
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  background: page === currentPage ? '#FF5E13' : 'transparent',
                  color: page === currentPage ? 'white' : '#374151',
                  border: page === currentPage ? '1px solid #FF5E13' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: page === currentPage ? 600 : 400,
                  minWidth: '40px'
                }}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              background: currentPage === totalPages ? '#f3f4f6' : 'transparent',
              color: currentPage === totalPages ? '#9ca3af' : '#FF5E13',
              border: currentPage === totalPages ? '1px solid #d1d5db' : '1px solid #FF5E13',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Sau
          </Button>
        </div>
      )}

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
                disabled={isUploading}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isUploading ? 0.5 : 1
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                style={{
                  padding: '10px 20px',
                  background: uploadFile && !isUploading ? 'transparent' : '#f3f4f6',
                  color: uploadFile && !isUploading ? '#FF5E13' : '#9ca3af',
                  border: uploadFile && !isUploading ? '1px solid #FF5E13' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: uploadFile && !isUploading ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (uploadFile && !isUploading) {
                    e.currentTarget.style.background = '#FF5E13';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (uploadFile && !isUploading) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#FF5E13';
                  }
                }}
              >
                {isUploading && <Loader2 size={16} className="animate-spin" />}
                {isUploading ? 'Đang tải lên...' : 'Tải lên'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && editingDocument && (
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
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 20px 0' }}>
              Chỉnh sửa tài liệu
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Tên tài liệu</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Tên tài liệu" />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Mô tả (tùy chọn)</label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Mô tả ngắn về tài liệu..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button onClick={() => setShowEditModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px' }}>Hủy</Button>
              <Button
                onClick={async () => {
                  if (!editingDocument) return;
                  try {
                    const payload = { id: editingDocument.id, name: editName, description: editDescription || undefined };
                    const res = await documentService.updateDocument(payload);
                    if (res.success) {
                      toast.success('Cập nhật tài liệu thành công!');
                      setShowEditModal(false);
                      setEditingDocument(null);
                      fetchDocuments();
                    } else {
                      toast.error(`Lỗi: ${res.error}`);
                    }
                  } catch (err) {
                    console.error('Error updating document:', err);
                    toast.error('Có lỗi xảy ra khi cập nhật tài liệu');
                  }
                }}
                style={{ padding: '10px 20px', background: '#FF5E13', color: 'white', borderRadius: '8px' }}
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
