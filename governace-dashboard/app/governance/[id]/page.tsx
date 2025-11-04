"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Circle,
  Users,
  Paperclip,
  MessageSquare,
  Eye,
  FileText,
  RefreshCw,
  X,
  Hash,
  Activity,
  Shield,
  ClipboardList,
  Target,
} from "lucide-react";
import type { GovernanceItem } from "../../types/governance";

// Status configuration matching the main page
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

export default function GovernanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<GovernanceItem | null>(null);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("details");

  // Fetch governance item
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/governance/${itemId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch governance item");
        }

        const itemData: GovernanceItem = await response.json();
        setItem(itemData);
      } catch (error) {
        console.error("Failed to fetch item:", error);
        setError("Failed to load governance item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Not set";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (dueDate: string | Date | null | undefined) => {
    if (!dueDate) return false;
    const dateObj = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    return dateObj < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading governance details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {error || "Governance item not found"}
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[item.status]?.icon || Circle;
  const statusConfig = STATUS_CONFIG[item.status];

  const tabs = [
    { id: "details", label: "Details", icon: FileText },
    { id: "tasks", label: "Tasks & RACI", icon: ClipboardList },
    { id: "attachments", label: "Attachments", icon: Paperclip },
    { id: "comments", label: "Comments", icon: MessageSquare },
    { id: "audit", label: "Audit Trail", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/governance")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Governance
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">
                Governance Details
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <Link
                href={`/governance/${itemId}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button className="flex items-center px-3 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                <X className="w-4 h-4 mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Hash className="w-4 h-4 mr-1" />
                    ID: {item.number || item.id}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </span>
                  {isOverdue(item.dueDate) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Overdue
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Owner:</span>
                    <div className="font-medium text-gray-900">
                      {item.owner?.name || item.owner?.email || "Unassigned"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <div className="font-medium text-gray-900">
                      {item.department?.name || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <div
                      className={`font-medium ${
                        isOverdue(item.dueDate)
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {item.dueDate ? formatDate(item.dueDate) : "Not set"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-6 text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {item.progress}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
                <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <TabIcon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content - Takes more space */}
          <div className="xl:col-span-3">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Top Row - Description and Properties */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Description */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Description
                        </h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Properties - Moved from sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Properties
                        </h3>
                      </div>
                      <div className="p-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">
                            Status:
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">
                            Progress:
                          </span>
                          <span className="font-medium text-gray-900">
                            {item.progress}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">
                            Visibility:
                          </span>
                          <span className="text-gray-900 capitalize">
                            {item.visibility}
                          </span>
                        </div>
                        {item.actionitemType && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">
                              Type:
                            </span>
                            <span className="text-gray-900">
                              {item.actionitemType}
                            </span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-500 font-medium">
                              Created:
                            </span>
                            <span className="text-gray-900 text-xs">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">
                              Updated:
                            </span>
                            <span className="text-gray-900 text-xs">
                              {formatDate(item.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics and Tags Row */}
                {(item._count ||
                  (item.tags &&
                    Array.isArray(item.tags) &&
                    item.tags.length > 0)) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Statistics */}
                    {item._count && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Statistics
                          </h3>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="text-2xl font-bold text-blue-600">
                                {item._count.subtask || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                Subtasks
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <div className="text-2xl font-bold text-green-600">
                                {item._count.comment || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                Comments
                              </div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3">
                              <div className="text-2xl font-bold text-purple-600">
                                {item._count.attachment || 0}
                              </div>
                              <div className="text-xs text-gray-500">Files</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags &&
                      Array.isArray(item.tags) &&
                      item.tags.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                          <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Tag className="w-5 h-5 mr-2 text-blue-600" />
                              Tags
                            </h3>
                          </div>
                          <div className="p-6">
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Clause References */}
                {item.clauseRefs && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        Clause References
                      </h3>
                    </div>
                    <div className="p-6">
                      <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded border">
                        {JSON.stringify(item.clauseRefs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="space-y-6">
                {/* Subtasks */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-blue-600" />
                        Subtasks
                      </h3>
                      <span className="text-sm text-gray-500">
                        {item.subtasks
                          ? `${item.subtasks.filter((t) => t.done).length}/${
                              item.subtasks.length
                            } completed`
                          : "0 subtasks"}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {item.subtasks && item.subtasks.length > 0 ? (
                      <div className="space-y-3">
                        {item.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <CheckCircle2
                              className={`w-5 h-5 mt-0.5 ${
                                subtask.done
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            />
                            <div className="flex-1">
                              <div
                                className={`font-medium ${
                                  subtask.done
                                    ? "line-through text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {subtask.title}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 flex items-center space-x-4">
                                {subtask.assignee && (
                                  <span>
                                    Assigned to:{" "}
                                    {subtask.assignee.name ||
                                      subtask.assignee.email}
                                  </span>
                                )}
                                {subtask.dueDate && (
                                  <span>
                                    Due: {formatDate(subtask.dueDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No subtasks defined
                      </p>
                    )}
                  </div>
                </div>

                {/* RACI Matrix */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      RACI Matrix
                    </h3>
                  </div>
                  <div className="p-6">
                    {item.raci && item.raci.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {["R", "A", "C", "I"].map((role) => {
                          const roleItems =
                            item.raci?.filter((r) => r.role === role) || [];
                          const roleLabels = {
                            R: "Responsible",
                            A: "Accountable",
                            C: "Consulted",
                            I: "Informed",
                          };
                          const colors = {
                            R: "bg-green-500",
                            A: "bg-blue-500",
                            C: "bg-yellow-500",
                            I: "bg-purple-500",
                          };

                          return (
                            <div
                              key={role}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white mb-3 ${
                                  colors[role as keyof typeof colors]
                                }`}
                              >
                                {role}
                              </div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                {roleLabels[role as keyof typeof roleLabels]}
                              </h4>
                              <div className="space-y-1">
                                {roleItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="text-sm text-gray-600"
                                  >
                                    {item.user.name || item.user.email}
                                  </div>
                                ))}
                                {roleItems.length === 0 && (
                                  <div className="text-sm text-gray-400 italic">
                                    None assigned
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No RACI assignments defined
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attachments" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Paperclip className="w-5 h-5 mr-2 text-blue-600" />
                    Attachments ({item.attachments?.length || 0})
                  </h3>
                </div>
                <div className="p-6">
                  {item.attachments && item.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {item.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <Paperclip className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {attachment.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                Added by{" "}
                                {attachment.addedBy?.name ||
                                  attachment.addedBy?.email}{" "}
                                on {formatDate(attachment.createdAt)}
                              </div>
                            </div>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No attachments
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    Comments ({item.comments?.length || 0})
                  </h3>
                </div>
                <div className="p-6">
                  {item.comments && item.comments.length > 0 ? (
                    <div className="space-y-4">
                      {item.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border-l-4 border-blue-200 pl-4 py-2"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-gray-900">
                              {comment.author?.name || comment.author?.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                          <div className="text-gray-700 whitespace-pre-wrap">
                            {comment.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No comments
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Audit Trail
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Item Created
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Last Updated
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compact Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Essential Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Essential Info
                </h3>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="text-gray-900 font-medium">{item.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Number:</span>
                  <span className="text-gray-900">{item.number || "Auto"}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  href={`/governance/${itemId}/edit`}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Item
                </Link>
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <Users className="w-4 h-4 mr-2" />
                  Manage RACI
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Add File
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
