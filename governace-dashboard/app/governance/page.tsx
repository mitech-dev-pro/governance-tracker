"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
} from "lucide-react";
import type {
  GovernanceResponse,
  CreateGovernanceItemData,
  ApiError,
} from "../types/governance";
import CreateGovernanceModal from "../components/CreateGovernanceModal";

// Status configuration
const STATUS_CONFIG = {
  NOT_STARTED: {
    label: "Not Started",
    color: "bg-gray-100 text-gray-800",
    icon: Circle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  BLOCKED: {
    label: "Blocked",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
  AT_RISK: {
    label: "At Risk",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  DEFERRED: {
    label: "Deferred",
    color: "bg-purple-100 text-purple-800",
    icon: Clock,
  },
};

// Components
const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const Icon = config?.icon || Circle;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        config?.color || "bg-gray-100 text-gray-800"
      }`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config?.label || status}
    </span>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
      >
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <Building2 className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No governance items found
    </h3>
    <p className="text-gray-500 mb-6">
      Get started by creating your first governance item.
    </p>
    <button
      onClick={onCreateClick}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus className="w-4 h-4 mr-2" />
      Create Governance Item
    </button>
  </div>
);

export default function GovernancePage() {
  const [data, setData] = useState<GovernanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setCurrentPage(1);
  };

  const handleCreateGovernanceItem = async (data: CreateGovernanceItemData) => {
    try {
      const response = await fetch("/api/governance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || "Failed to create governance item");
      }

      // Refresh the list
      await fetchGovernanceItems(1, searchTerm, statusFilter);
      setCurrentPage(1);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Governance Tracker
          </h1>
          <p className="text-gray-600">
            Manage and track governance items across your organization
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search governance items..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusFilter(key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === key
                        ? config.color
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Item
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && <LoadingSkeleton />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() =>
                fetchGovernanceItems(currentPage, searchTerm, statusFilter)
              }
              className="mt-2 text-red-600 hover:text-red-700 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {data.items.length === 0 ? (
              <EmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
            ) : (
              <>
                {/* Items Grid */}
                <div className="grid gap-6 mb-8">
                  {data.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Title and Status */}
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <StatusBadge status={item.status} />
                            {item.dueDate && isOverdue(item.dueDate) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Overdue
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {item.description}
                          </p>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Progress
                              </span>
                              <span className="text-sm text-gray-500">
                                {item.progress}%
                              </span>
                            </div>
                            <ProgressBar progress={item.progress} />
                          </div>

                          {/* Meta Information */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {item.owner && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{item.owner.name}</span>
                              </div>
                            )}
                            {item.department && (
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{item.department.name}</span>
                              </div>
                            )}
                            {item.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due {formatDate(item.dueDate)}</span>
                              </div>
                            )}
                            {item._count && (
                              <div className="flex items-center gap-3">
                                <span>{item._count.subtasks} subtasks</span>
                                <span>{item._count.comments} comments</span>
                                <span>{item._count.attachments} files</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-4 flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing{" "}
                        {(data.pagination.page - 1) * data.pagination.limit + 1}{" "}
                        to{" "}
                        {Math.min(
                          data.pagination.page * data.pagination.limit,
                          data.pagination.total
                        )}{" "}
                        of {data.pagination.total} items
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage(data.pagination.page - 1)
                          }
                          disabled={!data.pagination.hasPrev}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                          Page {data.pagination.page} of{" "}
                          {data.pagination.totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage(data.pagination.page + 1)
                          }
                          disabled={!data.pagination.hasNext}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
