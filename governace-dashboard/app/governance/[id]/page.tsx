"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Calendar,
  User,
  Building2,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Circle,
  Users,
  Paperclip,
  MessageSquare,
  MoreVertical,
  Eye,
  FileText,
} from "lucide-react";
import type {
  GovernanceItem,
  User as UserType,
  Department,
} from "../../types/governance";

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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading governance item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center min-h-full">
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

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6 pb-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/governance")}
                className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Governance
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Governance Details
              </h1>
            </div>

            <Link
              href={`/governance/${itemId}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">#{item.number || item.id}</span>
            <span>•</span>
            <span>{item.title}</span>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-xl border ${statusConfig.color}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">{statusConfig.label}</h3>
                <p className="text-sm opacity-75">
                  Current status of this governance item
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{item.progress}%</div>
              <div className="text-sm opacity-75">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-current h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Description
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Subtasks */}
            {item.subtasks && item.subtasks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
                    Subtasks ({item.subtasks.filter((t) => t.done).length}/
                    {item.subtasks.length})
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  {item.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          subtask.done ? "text-green-500" : "text-gray-300"
                        }`}
                      />
                      <span
                        className={`flex-1 ${
                          subtask.done
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {subtask.title}
                      </span>
                      {subtask.dueDate && (
                        <span className="text-sm text-gray-500">
                          Due: {new Date(subtask.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RACI Matrix */}
            {item.raci && item.raci.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    RACI Matrix
                  </h2>
                </div>
                <div className="p-6">
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

                      return (
                        <div
                          key={role}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white mb-3 ${
                              role === "R"
                                ? "bg-green-500"
                                : role === "A"
                                ? "bg-blue-500"
                                : role === "C"
                                ? "bg-yellow-500"
                                : "bg-purple-500"
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
                </div>
              </div>
            )}

            {/* Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Paperclip className="w-5 h-5 mr-2 text-blue-600" />
                    Attachments ({item.attachments.length})
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  {item.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {attachment.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            Added by{" "}
                            {attachment.addedBy?.name ||
                              attachment.addedBy?.email}{" "}
                            on{" "}
                            {new Date(
                              attachment.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {item.comments && item.comments.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    Comments ({item.comments.length})
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {item.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-l-4 border-blue-200 pl-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {comment.author?.name || comment.author?.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {comment.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 mr-2" />
                    Owner
                  </div>
                  <div className="text-gray-900">
                    {item.owner
                      ? item.owner.name || item.owner.email
                      : "Unassigned"}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Building2 className="w-4 h-4 mr-2" />
                    Department
                  </div>
                  <div className="text-gray-900">
                    {item.department?.name || "Not specified"}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Due Date
                  </div>
                  <div className="text-gray-900">
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString()
                      : "No due date"}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </div>
                  <div className="text-gray-900">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </div>
                  <div className="text-gray-900">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {item.visibility && (
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Visibility
                    </div>
                    <div className="text-gray-900 capitalize">
                      {item.visibility}
                    </div>
                  </div>
                )}

                {item.actionitemType && (
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Action Item Type
                    </div>
                    <div className="text-gray-900">{item.actionitemType}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            {item._count && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Statistics
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Subtasks
                    </span>
                    <span className="text-sm text-gray-900">
                      {item._count.subtask || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Comments
                    </span>
                    <span className="text-sm text-gray-900">
                      {item._count.comment || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Attachments
                    </span>
                    <span className="text-sm text-gray-900">
                      {item._count.attachment || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-blue-600" />
                    Tags
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag: string) => (
                      <span
                        key={tag}
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
        </div>
      </div>
    </div>
  );
}
