import { GetUserResponse } from "./user";

export interface CreateDocumentRequest {
  name: string;
  ownerId: string;
  projectId: string;
  fileUrl: string;
  description?: string;
  size: number;
}

export interface UpdateDocumentRequest {
  id: string;
  name: string;
  description?: string;
}

export interface GetDocumentResponse {
  id: string;
  name: string;
  ownerId: string;
  projectId: string;
  fileUrl: string;
  description?: string;
  size: number;
  createdAt: string;  // ISO 8601 UTC format
  updatedAt: string;  // ISO 8601 UTC format
  owner?: GetUserResponse; 
}
