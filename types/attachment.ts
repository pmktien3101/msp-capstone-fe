// Request tạo attachment metadata cho task
export interface CreateTaskAttachmentRequest {
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  fileUrl: string;
}

// Response attachment của task
export interface TaskAttachmentResponse {
  id: string;
  taskId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  fileUrl: string;
  createdAt: string; // ISO 8601 UTC
}
