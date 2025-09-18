import { Member } from './member';

export interface Comment {
  id: string;
  content: string;
  author: Member;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  parentId?: string; // For replies to comments
  isEdited?: boolean;
}

export interface CommentFormData {
  content: string;
  taskId: string;
  parentId?: string;
}
