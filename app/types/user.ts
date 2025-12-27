// Enhanced User Types
import { Department, PaginationInfo } from './governance';

export interface User {
  id: number;
  name: string | null;
  email: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  departments?: UserDepartment[];
  roles?: UserRole[];
  _count?: {
    governanceitem: number;
    actionitem: number;
    assignment: number;
  };
}

export interface UserDepartment {
  id: number;
  userId: number;
  departmentId: number;
  department: Department;
  createdAt: Date;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  role: Role;
  createdAt: Date;
}

export interface Role {
  id: number;
  name: string;
  createdAt: Date;
  permissions?: RolePermission[];
}

export interface Permission {
  id: number;
  key: string;
  label: string;
  createdAt: Date;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  permission: Permission;
  createdAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  image?: string;
  departmentIds?: number[];
  roleIds?: number[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  departmentIds?: number[];
  roleIds?: number[];
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  departmentId?: number;
  roleId?: number;
  search?: string;
}

export interface UserResponse {
  users: User[];
  pagination: PaginationInfo;
}

// Re-export existing types for convenience
export * from './governance';