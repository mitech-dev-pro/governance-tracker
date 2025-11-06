"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  RefreshCw,
  Grid3X3,
  List,
  Tag,
  FileText,
  Check,
  Minus,
  User,
} from "lucide-react";
import type {
  GovernanceResponse,
  CreateGovernanceItemData,
  ApiError,
} from "../types/governance";
import CreateGovernanceModal from "../components/CreateGovernanceModal";

// User Avatar Component (reusable)
const UserAvatar = ({
  user,
  size = "sm",
}: {
  user: {
    id?: number | string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  size?: "xs" | "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const getInitials = (name?: string) => {
    if (!name) return user.email.charAt(0).toUpperCase();
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if user has a valid image URL and it's not empty
  if (
    user.image &&
    user.image.trim() !== "" &&
    user.image !== "null" &&
    user.image !== "undefined"
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
        src={user.image}
        alt={user.name || user.email}
      />
    );
  }

  // Show initials if user has a name, otherwise show user icon
  if (user.name && user.name.trim() !== "") {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium border-2 border-gray-200`}
      >
        {getInitials(user.name)}
      </div>
    );
  }

  // Fallback to user icon if no name
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200`}
    >
      <User className={`${iconSizes[size]} text-gray-600`} />
    </div>
  );
};

// Status configuration
const STATUS_CONFIG = {
  NOT_STARTED: {
    label: "Not Started",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    bgColor: "bg-slate-50",
    icon: Circle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    bgColor: "bg-blue-50",
    icon: Clock,
  },
  BLOCKED: {
    label: "Blocked",
    color: "bg-red-100 text-red-700 border-red-200",
    bgColor: "bg-red-50",
    icon: AlertCircle,
  },
  AT_RISK: {
    label: "At Risk",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    bgColor: "bg-amber-50",
    icon: AlertCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bgColor: "bg-emerald-50",
    icon: CheckCircle2,
  },
  DEFERRED: {
    label: "Deferred",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    bgColor: "bg-purple-50",
    icon: Clock,
  },
};

type SortField =
  | "title"
  | "status"
  | "progress"
  | "dueDate"
  | "createdAt"
  | "updatedAt";
type SortDirection = "asc" | "desc";

// Components
const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const Icon = config?.icon || Circle;

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
        config?.color || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      <Icon className="w-3 h-3 mr-1.5" />
      {config?.label || status}
    </div>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => {
  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-emerald-500";
    if (value >= 70) return "bg-blue-500";
    if (value >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium text-gray-700">{progress}%</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
            progress
          )}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const TableSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
    </div>
    <div className="divide-y divide-gray-200">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="bg-white rounded-xl border border-gray-200 py-16">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
        <Building2 className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No governance items found
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Get started by creating your first governance item to track compliance
        and manage organizational oversight.
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Governance Item
      </button>
    </div>
  </div>
);

const Checkbox = ({
  checked,
  onChange,
  indeterminate = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
      ref={(input) => {
        if (input) input.indeterminate = indeterminate;
      }}
    />
    <div
      className={`w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center ${
        checked || indeterminate
          ? "bg-blue-600 border-blue-600"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
      {indeterminate && <Minus className="w-3 h-3 text-white" />}
    </div>
  </label>
);

const SortButton = ({
  field,
  currentSort,
  onSort,
}: {
  field: SortField;
  currentSort: { field: SortField; direction: SortDirection } | null;
  onSort: (field: SortField) => void;
}) => {
  const isActive = currentSort?.field === field;
  const direction = currentSort?.direction;

  return (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
    >
      {!isActive && <ArrowUpDown className="w-3 h-3" />}
      {isActive && direction === "asc" && (
        <ArrowUp className="w-3 h-3 text-blue-600" />
      )}
      {isActive && direction === "desc" && (
        <ArrowDown className="w-3 h-3 text-blue-600" />
      )}
    </button>
  );
};

const ActionDropdown = ({ item }: { item: GovernanceResponse["items"][0] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 w-44 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1">
            <Link
              href={`/governance/${item.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
            <Link
              href={`/governance/${item.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Link>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="w-4 h-4" />
              Duplicate
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const TableRow = ({
  item,
  selectedItems,
  handleSelectItem,
  formatDate,
  isOverdue,
}: {
  item: GovernanceResponse["items"][0];
  selectedItems: Set<number>;
  handleSelectItem: (id: number, checked: boolean) => void;
  formatDate: (date: Date | string) => string;
  isOverdue: (date?: Date | string) => boolean;
}) => (
  <tr
    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
      selectedItems.has(item.id) ? "bg-blue-50" : ""
    }`}
  >
    {/* Checkbox */}
    <td className="px-4 py-3 whitespace-nowrap">
      <Checkbox
        checked={selectedItems.has(item.id)}
        onChange={(checked) => handleSelectItem(item.id, checked)}
      />
    </td>

    {/* ID */}
    <td className="px-4 py-3 whitespace-nowrap">
      <span className="text-sm font-medium text-gray-900">
        {item.number || `#${item.id}`}
      </span>
    </td>

    {/* Title */}
    <td className="px-4 py-3">
      <div className="text-sm font-medium text-gray-900 truncate">
        <Link
          href={`/governance/${item.id}`}
          className="hover:text-blue-600 transition-colors"
        >
          {item.title}
        </Link>
      </div>
    </td>

    {/* Component (Description) */}
    <td className="px-4 py-3">
      <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
        {item.description}
      </div>
    </td>

    {/* Status */}
    <td className="px-4 py-3 whitespace-nowrap">
      <StatusBadge status={item.status} />
      {item.dueDate && isOverdue(item.dueDate) && (
        <div className="mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
            Overdue
          </span>
        </div>
      )}
    </td>

    {/* Progress */}
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-[60px]">
          <ProgressBar progress={item.progress} />
        </div>
        <span className="text-sm font-medium text-gray-700 min-w-[35px]">
          {item.progress}%
        </span>
      </div>
    </td>

    {/* Assignee */}
    <td className="px-4 py-3 whitespace-nowrap">
      {item.user ? (
        <div className="flex items-center gap-2">
          <UserAvatar user={item.user} size="xs" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {item.user.name || item.user.email.split("@")[0]}
            </div>
          </div>
        </div>
      ) : (
        <span className="text-sm text-gray-400">Unassigned</span>
      )}
    </td>

    {/* Department */}
    <td className="px-4 py-3 whitespace-nowrap">
      {item.department ? (
        <div className="flex items-center gap-1">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 truncate">
            {item.department.name}
          </span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      )}
    </td>

    {/* Due Date */}
    <td className="px-4 py-3 whitespace-nowrap">
      {item.dueDate ? (
        <div className="text-sm">
          <div
            className={`font-medium ${
              isOverdue(item.dueDate) ? "text-red-600" : "text-gray-900"
            }`}
          >
            {formatDate(item.dueDate)}
          </div>
        </div>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      )}
    </td>

    {/* View Details */}
    <td className="px-4 py-3 whitespace-nowrap text-center">
      <Link
        href={`/governance/${item.id}`}
        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
      >
        Details
      </Link>
    </td>

    {/* Action */}
    <td className="px-4 py-3 whitespace-nowrap text-center">
      <ActionDropdown item={item} />
    </td>
  </tr>
);

export default function GovernancePage() {
  const [data, setData] = useState<GovernanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch governance items
  const fetchGovernanceItems = async (page = 1, search = "", status = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/governance?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch governance items");
      }

      const result: GovernanceResponse = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchGovernanceItems(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  // Computed values
  const sortedItems = useMemo(() => {
    if (!data?.items || !sortConfig) return data?.items || [];

    return [...data.items].sort((a, b) => {
      const { field, direction } = sortConfig;
      let aValue: string | number | Date, bValue: string | number | Date;

      switch (field) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data?.items, sortConfig]);

  const allSelected =
    selectedItems.size === data?.items.length && data?.items.length > 0;
  const someSelected =
    selectedItems.size > 0 && selectedItems.size < (data?.items.length || 0);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    setSortConfig((current) => {
      if (current?.field === field) {
        return current.direction === "asc"
          ? { field, direction: "desc" }
          : null;
      }
      return { field, direction: "asc" };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(data?.items.map((item) => item.id) || []));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    setSelectedItems((current) => {
      const newSet = new Set(current);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleCreateGovernanceItem = async (data: CreateGovernanceItemData) => {
    try {
      // Format the data to ensure proper datetime format
      const formattedData = {
        ...data,
        // Convert datetime-local format to full ISO datetime string
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
      };

      const response = await fetch("/api/governance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || "Failed to create governance item");
      }

      // Refresh the list
      await fetchGovernanceItems(1, searchTerm, statusFilter);
      setCurrentPage(1);
      setSelectedItems(new Set());
    } catch (error) {
      throw error; // Re-throw to let modal handle the error
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate?: Date | string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleRefresh = () => {
    fetchGovernanceItems(currentPage, searchTerm, statusFilter);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 lg:p-6 pb-8 min-h-full">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                Governance Tracker
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Manage and track governance items across your organization
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm text-sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""} sm:mr-2`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button className="inline-flex items-center px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm text-sm">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Top Row - Search and Create Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search governance items..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
                />
              </div>

              {/* Create Button - Always visible */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base whitespace-nowrap"
              >
                <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Create Item</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>

            {/* Second Row - Filters and View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusFilter(key)}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      statusFilter === key
                        ? `${config.color} shadow-sm`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-600">
                  {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
                  selected
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <Edit2 className="w-4 h-4 mr-1 inline" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                    <Trash2 className="w-4 h-4 mr-1 inline" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading && <TableSkeleton />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800 mb-1">
                  Error loading data
                </h3>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <button
                  onClick={() =>
                    fetchGovernanceItems(currentPage, searchTerm, statusFilter)
                  }
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {data.items.length === 0 ? (
              <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
            ) : (
              <>
                {viewMode === "table" ? (
                  /* Clean Enterprise Table */
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-white px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            Showing:{" "}
                            <span className="font-medium">
                              1 to{" "}
                              {Math.min(itemsPerPage, data.pagination.total)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {data.pagination.total}
                            </span>{" "}
                            records
                          </span>
                          {selectedItems.size > 0 && (
                            <span className="text-sm text-blue-600 font-medium">
                              {selectedItems.size} selected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={itemsPerPage}
                            onChange={(e) =>
                              setItemsPerPage(Number(e.target.value))
                            }
                            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-200">
                            <th className="w-12 px-4 py-3 text-left">
                              <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th className="w-20 px-4 py-3 text-left">
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                ID
                                <SortButton
                                  field="createdAt"
                                  currentSort={sortConfig}
                                  onSort={handleSort}
                                />
                              </div>
                            </th>
                            <th className="w-48 px-4 py-3 text-left">
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Title
                                <SortButton
                                  field="title"
                                  currentSort={sortConfig}
                                  onSort={handleSort}
                                />
                              </div>
                            </th>
                            <th className="w-64 px-4 py-3 text-left">
                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Component
                              </div>
                            </th>
                            <th className="w-28 px-4 py-3 text-left">
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Status
                                <SortButton
                                  field="status"
                                  currentSort={sortConfig}
                                  onSort={handleSort}
                                />
                              </div>
                            </th>
                            <th className="w-24 px-4 py-3 text-left">
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Progress
                                <SortButton
                                  field="progress"
                                  currentSort={sortConfig}
                                  onSort={handleSort}
                                />
                              </div>
                            </th>
                            <th className="w-40 px-4 py-3 text-left">
                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Assignee
                              </div>
                            </th>
                            <th className="w-32 px-4 py-3 text-left">
                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Department
                              </div>
                            </th>
                            <th className="w-28 px-4 py-3 text-left">
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Due Date
                                <SortButton
                                  field="dueDate"
                                  currentSort={sortConfig}
                                  onSort={handleSort}
                                />
                              </div>
                            </th>
                            <th className="w-24 px-4 py-3 text-center">
                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                View
                              </div>
                            </th>
                            <th className="w-20 px-4 py-3 text-center">
                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Action
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {sortedItems.map((item) => (
                            <TableRow
                              key={item.id}
                              item={item}
                              selectedItems={selectedItems}
                              handleSelectItem={handleSelectItem}
                              formatDate={formatDate}
                              isOverdue={isOverdue}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                      <div className="space-y-4 p-4">
                        {sortedItems.map((item) => (
                          <div
                            key={item.id}
                            className={`bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 ${
                              selectedItems.has(item.id)
                                ? "border-blue-500 bg-blue-50/50"
                                : "hover:border-gray-300 hover:shadow-sm"
                            }`}
                          >
                            {/* Mobile Card Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <Checkbox
                                  checked={selectedItems.has(item.id)}
                                  onChange={(checked) =>
                                    handleSelectItem(item.id, checked)
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-semibold bg-gray-100 text-gray-900">
                                      #{item.number || item.id}
                                    </span>
                                    <StatusBadge status={item.status} />
                                  </div>
                                  <h4 className="font-semibold text-gray-900 leading-5 mb-2">
                                    <Link
                                      href={`/governance/${item.id}`}
                                      className="hover:text-blue-600 transition-colors"
                                    >
                                      {item.title}
                                    </Link>
                                  </h4>
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Progress
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {item.progress}%
                                </span>
                              </div>
                              <ProgressBar progress={item.progress} />
                            </div>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {item.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {item.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{item.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Meta Information Grid */}
                            <div className="grid grid-cols-1 gap-3 mb-4">
                              {item.user && (
                                <div className="flex items-center gap-3">
                                  <UserAvatar user={item.user} size="xs" />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-900 text-sm">
                                      {item.user.name ||
                                        item.user.email.split("@")[0]}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {item.user.email}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {item.department && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">
                                      {item.department.name}
                                    </span>
                                  </div>
                                )}
                                {item.dueDate && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span
                                      className={`text-sm ${
                                        isOverdue(item.dueDate)
                                          ? "text-red-600 font-medium"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {formatDate(item.dueDate)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Overdue Warning */}
                            {item.dueDate && isOverdue(item.dueDate) && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 border border-red-200">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm font-medium text-red-700">
                                    This item is overdue
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                              <Link
                                href={`/governance/${item.id}`}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Details
                              </Link>
                              <Link
                                href={`/governance/${item.id}/edit`}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Grid View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {sortedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ${
                          selectedItems.has(item.id)
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : "hover:border-gray-300"
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onChange={(checked) =>
                                handleSelectItem(item.id, checked)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {item.number || `#${item.id}`}
                                </span>
                                <StatusBadge status={item.status} />
                                {item.dueDate && isOverdue(item.dueDate) && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Overdue
                                  </span>
                                )}
                              </div>
                              <h4 className="font-semibold text-sm leading-5 mb-2 line-clamp-2">
                                <Link
                                  href={`/governance/${item.id}`}
                                  className="text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                  {item.title}
                                </Link>
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Link
                              href={`/governance/${item.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">
                              Progress
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.progress}%
                            </span>
                          </div>
                          <ProgressBar progress={item.progress} />
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                              >
                                <Tag className="w-2.5 h-2.5 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Meta Information */}
                        <div className="space-y-2 text-xs text-gray-600">
                          {item.user && (
                            <div className="flex items-center gap-2">
                              <UserAvatar user={item.user} size="xs" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">
                                  {item.user.name ||
                                    item.user.email.split("@")[0]}
                                </div>
                                <div className="text-gray-500 truncate">
                                  {item.user.email}
                                </div>
                              </div>
                            </div>
                          )}
                          {item.department && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              <span className="truncate">
                                {item.department.name}
                              </span>
                            </div>
                          )}
                          {item.dueDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span
                                className={`${
                                  isOverdue(item.dueDate)
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600"
                                }`}
                              >
                                {formatDate(item.dueDate)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <Link
                            href={`/governance/${item.id}/edit`}
                            className="flex-1 text-xs px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
                          >
                            <Edit2 className="w-3 h-3 mr-1 inline" />
                            Edit
                          </Link>
                          <Link
                            href={`/governance/${item.id}`}
                            className="flex-1 text-xs px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-center"
                          >
                            <Eye className="w-3 h-3 mr-1 inline" />
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination - Only show when there are records */}
            {data.items.length > 0 && (
              <div className="flex items-center justify-between py-3 px-6 bg-white border-t border-gray-200">
                {/* Left side - Showing records info */}
                <div className="text-sm text-gray-700">
                  <span>
                    Showing:{" "}
                    <span className="font-medium">
                      {(data.pagination.page - 1) * data.pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        data.pagination.page * data.pagination.limit,
                        data.pagination.total
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {data.pagination.total.toLocaleString()}
                    </span>{" "}
                    records
                  </span>
                </div>

                {/* Right side - Pagination controls */}
                <div className="flex items-center space-x-0">
                  {/* Previous button */}
                  <button
                    onClick={() => setCurrentPage(data.pagination.page - 1)}
                    disabled={!data.pagination.hasPrev}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    « Previous
                  </button>

                  {/* Page numbers */}
                  {(() => {
                    const currentPage = data.pagination.page;
                    const totalPages = data.pagination.totalPages;
                    const maxVisiblePages = 7;

                    let startPage = Math.max(
                      1,
                      currentPage - Math.floor(maxVisiblePages / 2)
                    );
                    const endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    return pages.map((page, index) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                          px-3 py-2 text-sm font-medium border-t border-b border-r transition-colors
                          ${
                            page === currentPage
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }
                          ${
                            index === pages.length - 1 && totalPages === 1
                              ? "rounded-r"
                              : ""
                          }
                        `}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  {/* Next button */}
                  <button
                    onClick={() => setCurrentPage(data.pagination.page + 1)}
                    disabled={!data.pagination.hasNext}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next »
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        <CreateGovernanceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateGovernanceItem}
        />
      </div>
    </div>
  );
}
