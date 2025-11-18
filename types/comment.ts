import { GetUserResponse } from "./user";

export interface CreateCommentRequest {
  taskId: string;
  userId: string;
  content: string;
}

export interface UpdateCommentRequest {
  id: string;
  content: string;
}

export interface GetCommentResponse {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;  // ISO 8601 UTC format
  updatedAt: string;  // ISO 8601 UTC format
  user?: GetUserResponse;
}