// Utility functions for governance management

import type { GovernanceItem, GovernanceStatus } from '../types/governance';

// Status utilities
export const getStatusColor = (status: GovernanceStatus): string => {
  const statusColors = {
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    BLOCKED: 'bg-red-100 text-red-800',
    AT_RISK: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DEFERRED: 'bg-purple-100 text-purple-800'
  };
  return statusColors[status] || statusColors.NOT_STARTED;
};

export const getStatusLabel = (status: GovernanceStatus): string => {
  const statusLabels = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    BLOCKED: 'Blocked',
    AT_RISK: 'At Risk',
    COMPLETED: 'Completed',
    DEFERRED: 'Deferred'
  };
  return statusLabels[status] || status;
};

// Date utilities
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isOverdue = (dueDate?: Date | string | null): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate?: Date | string | null): number | null => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Progress utilities
export const getProgressColor = (progress: number): string => {
  if (progress === 0) return 'bg-gray-200';
  if (progress < 25) return 'bg-red-500';
  if (progress < 50) return 'bg-yellow-500';
  if (progress < 75) return 'bg-blue-500';
  if (progress < 100) return 'bg-indigo-500';
  return 'bg-green-500';
};

export const calculateOverallProgress = (items: GovernanceItem[]): number => {
  if (items.length === 0) return 0;
  const totalProgress = items.reduce((sum, item) => sum + item.progress, 0);
  return Math.round(totalProgress / items.length);
};

// Sorting utilities
export const sortGovernanceItems = (
  items: GovernanceItem[], 
  sortBy: 'title' | 'status' | 'progress' | 'dueDate' | 'createdAt' = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc'
): GovernanceItem[] => {
  return [...items].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'progress':
        aValue = a.progress;
        bValue = b.progress;
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};

// Filter utilities
export const filterGovernanceItems = (
  items: GovernanceItem[],
  filters: {
    search?: string;
    status?: GovernanceStatus;
    ownerId?: number;
    departmentId?: number;
    overdue?: boolean;
  }
): GovernanceItem[] => {
  return items.filter(item => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Owner filter
    if (filters.ownerId && item.ownerId !== filters.ownerId) {
      return false;
    }

    // Department filter
    if (filters.departmentId && item.departmentId !== filters.departmentId) {
      return false;
    }

    // Overdue filter
    if (filters.overdue !== undefined) {
      const itemIsOverdue = isOverdue(item.dueDate);
      if (filters.overdue !== itemIsOverdue) {
        return false;
      }
    }

    return true;
  });
};

// Validation utilities
export const validateGovernanceItem = (data: Partial<GovernanceItem>): string[] => {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
    errors.push('Progress must be between 0 and 100');
  }

  if (data.dueDate && new Date(data.dueDate) < new Date()) {
    errors.push('Due date cannot be in the past');
  }

  return errors;
};

// Export utilities
export const exportToCSV = (items: GovernanceItem[]): string => {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Progress',
    'Owner',
    'Department',
    'Due Date',
    'Created At',
    'Updated At'
  ].join(',');

  const rows = items.map(item => [
    item.id,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.description.replace(/"/g, '""')}"`,
    item.status,
    item.progress,
    item.owner?.name || '',
    item.department?.name || '',
    item.dueDate ? formatDate(item.dueDate) : '',
    formatDate(item.createdAt),
    formatDate(item.updatedAt)
  ].join(','));

  return [headers, ...rows].join('\n');
};

// Statistics utilities
export const getGovernanceStats = (items: GovernanceItem[]) => {
  const total = items.length;
  const byStatus = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<GovernanceStatus, number>);

  const completed = byStatus.COMPLETED || 0;
  const inProgress = byStatus.IN_PROGRESS || 0;
  const notStarted = byStatus.NOT_STARTED || 0;
  const blocked = byStatus.BLOCKED || 0;
  const atRisk = byStatus.AT_RISK || 0;
  const deferred = byStatus.DEFERRED || 0;

  const overdue = items.filter(item => isOverdue(item.dueDate)).length;
  const dueThisWeek = items.filter(item => {
    if (!item.dueDate) return false;
    const days = getDaysUntilDue(item.dueDate);
    return days !== null && days <= 7 && days >= 0;
  }).length;

  const avgProgress = calculateOverallProgress(items);

  return {
    total,
    completed,
    inProgress,
    notStarted,
    blocked,
    atRisk,
    deferred,
    overdue,
    dueThisWeek,
    avgProgress,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byStatus
  };
};