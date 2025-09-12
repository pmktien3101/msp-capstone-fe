'use client';

import { Project } from '@/types/project';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

interface DocumentsProps {
  documents: Document[];
  selectedProject: Project | null;
}

export default function Documents({ documents, selectedProject }: DocumentsProps) {
  // Mock data - trong thực tế sẽ lấy từ API với projectId
  const documentsWithProject = documents.map((doc, index) => ({
    ...doc,
    projectId: index % 2 === 0 ? '1' : '2' // Mock project assignment
  }));

  const recentDocuments = documentsWithProject
    .filter(doc => !selectedProject || doc.projectId === selectedProject.id)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 4);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getFileIcon = (type: string) => {
    const fileType = type.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (fileType.includes('doc') || fileType.includes('docx')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (fileType.includes('xls') || fileType.includes('xlsx')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 17H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
          <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  return (
    <div className="documents">
      <div className="section-header">
        <h3>Tài liệu mới</h3>
      </div>

      <div className="documents-list">
        {recentDocuments.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="empty-icon">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Chưa có tài liệu nào</p>
          </div>
        ) : (
          recentDocuments.map((document) => (
            <div key={document.id} className="document-item">
              <div className="document-icon">
                {getFileIcon(document.type)}
              </div>
              <div className="document-info">
                <h5 className="document-name">{document.name}</h5>
                <p className="document-meta">
                  {document.size} • {formatDate(document.uploadedAt)}
                </p>
                <p className="document-uploader">
                  Upload bởi {document.uploadedBy}
                </p>
              </div>
              <div className="document-actions">
                <button 
                  className="btn-download"
                  onClick={() => window.open(document.url, '_blank')}
                  title="Tải xuống"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
