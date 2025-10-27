// Types for Governance API

export interface User {
  id: number;
  name: string | null;
  email: string;
}

export interface Department {
  id: number;
  name: string;
  code: string | null;
}

export interface Subtask {
  id: number;
  itemId: number;
  title: string;
  done: boolean;
  dueDate: Date | null;
  assigneeId: number | null;
  assignee?: User;
}

export interface Attachment {
  id: number;
  itemId: number;
  label: string;
  url: string;
  addedById: number;
  addedBy: User;
  createdAt: Date;
}

export interface Comment {
  id: number;
  itemId: number;
  body: string;
  authorId: number;
  author: User;
  createdAt: Date;
}

export interface RaciRole {
  id: number;
  itemId: number;
  userId: number;
  user: User;
  role: 'R' | 'A' | 'C' | 'I';
}

export type GovernanceStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'BLOCKED' 
  | 'AT_RISK' 
  | 'COMPLETED' 
  | 'DEFERRED';

export interface GovernanceItem {
  id: number;
  number?: number;
  title: string;
  description: string;
  status: GovernanceStatus;
  ownerId?: number;
  owner?: User;
  departmentId?: number;
  department?: Department;
  dueDate?: Date;
  clauseRefs?: Record<string, unknown> | null;
  progress: number;
  tags: string[];
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: Subtask[];
  raci?: RaciRole[];
  attachments?: Attachment[];
  comments?: Comment[];
  _count?: {
    subtasks: number;
    comments: number;
    attachments: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GovernanceResponse {
  items: GovernanceItem[];
  pagination: PaginationInfo;
}

export interface CreateGovernanceItemData {
  title: string;
  description: string;
  status?: GovernanceStatus;
  ownerId?: number;
  departmentId?: number;
  dueDate?: string;
  progress?: number;
  tags?: string[];
  visibility?: string;
}

export interface UpdateGovernanceItemData {
  title?: string;
  description?: string;
  status?: GovernanceStatus;
  ownerId?: number | null;
  departmentId?: number | null;
  dueDate?: string | null;
  progress?: number;
  tags?: string[];
  visibility?: string;
}

export interface GovernanceQueryParams {
  page?: number;
  limit?: number;
  status?: GovernanceStatus;
  departmentId?: number;
  ownerId?: number;
  search?: string;
}

export interface ApiError {
  error: string;
  errors?: Array<{
    code: string;
    message: string;
    path: (string | number)[];
  }>;
}