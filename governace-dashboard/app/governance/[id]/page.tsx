"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Building2,
  Download,
  Share,
  XCircle,
} from "lucide-react";

interface GovernanceItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  dueDate: string | null;
  visibility: string;
  actionitemType?: string;
  clauseRefs?: Record<string, unknown>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; email: string };
  department?: { id: string; name: string };
  raci: {
    responsible?: { id: string; name: string };
    accountable?: { id: string; name: string };
    consulted?: { id: string; name: string };
    informed?: { id: string; name: string };
  };
  attachment?: Array<{
    id: string;
    filename: string;
    url: string;
    size?: number;
  }>;
  comment?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: { id: string; name: string };
  }>;
  _count?: {
    subtask: number;
    comment: number;
    attachment: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  completed: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  on_hold: {
    label: "On Hold",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export default function GovernanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [item, setItem] = useState<GovernanceItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();

  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  useEffect(() => {
    if (!itemId) return;

    const fetchData = async () => {
      try {
        const [itemRes, usersRes] = await Promise.all([
          fetch(`/api/governance/${itemId}`, {
            headers: { "Cache-Control": "no-cache" },
          }),
          fetch("/api/users", { headers: { "Cache-Control": "no-cache" } }),
        ]);

        if (!itemRes.ok) {
          throw new Error("Failed to fetch governance item");
        }

        const itemData = await itemRes.json();
        const usersData = usersRes.ok ? await usersRes.json() : { users: [] };

        setItem(itemData);
        setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getStatusConfig = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    );
  };

  const assignRaciRole = async (role: string, userId: string) => {
    try {
      const response = await fetch(`/api/governance/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raci: {
            ...item?.raci,
            [role]: { id: userId },
          },
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItem(updatedItem);
      }
    } catch (error) {
      console.error("Error assigning RACI role:", error);
    }
  };

  const removeRaciRole = async (role: string) => {
    try {
      const response = await fetch(`/api/governance/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raci: {
            ...item?.raci,
            [role]: null,
          },
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItem(updatedItem);
      }
    } catch (error) {
      console.error("Error removing RACI role:", error);
    }
  };

  const getRaciRoleUser = (role: string) => {
    if (!item?.raci) return null;
    const roleData = item.raci[role as keyof typeof item.raci];
    if (!roleData?.id) return null;

    return users.find((user) => user.id === roleData.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Item
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const statusConf = getStatusConfig(item.status);
  const tabs = [
    { id: "details", label: "Details" },
    { id: "raci", label: "RACI Matrix" },
    { id: "attachments", label: "Attachments" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/governance"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Governance
              </Link>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {item.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}
              >
                {statusConf.label}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <div className="text-lg font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                      {item.title}
                    </div>
                  </div>

                  {/* Owner */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Owner
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded border text-gray-900">
                      {item.owner?.name || item.owner?.email || "Unassigned"}
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      Department
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded border text-gray-900">
                      {item.department?.name || "Not specified"}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due Date
                    </label>
                    <div
                      className={`bg-gray-50 px-3 py-2 rounded border ${
                        isOverdue(item.dueDate)
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {item.dueDate ? formatDate(item.dueDate) : "Not set"}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {item.progress}%
                        </span>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded border min-h-[100px] text-gray-900">
                      <p className="whitespace-pre-wrap">{item.description}</p>
                    </div>
                  </div>

                  {/* Created/Updated dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created Date
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded border text-gray-900 text-sm">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Updated
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded border text-gray-900 text-sm">
                      {formatDate(item.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "raci" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      RACI Matrix
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        "responsible",
                        "accountable",
                        "consulted",
                        "informed",
                      ].map((role, index) => {
                        const colors = [
                          "bg-red-500",
                          "bg-blue-500",
                          "bg-yellow-500",
                          "bg-green-500",
                        ];
                        const user = getRaciRoleUser(role);
                        return (
                          <div key={role}>
                            <label className="text-sm font-medium text-gray-700 mb-3 flex items-center capitalize">
                              <span
                                className={`w-3 h-3 rounded-full ${colors[index]} mr-2`}
                              ></span>
                              {role}
                            </label>
                            <div className="bg-gray-50 p-4 rounded border min-h-[120px]">
                              {user ? (
                                <div className="flex items-center justify-between bg-white p-3 rounded border">
                                  <span className="font-medium">
                                    {user.name}
                                  </span>
                                  <button
                                    onClick={() => removeRaciRole(role)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-gray-500 text-sm mb-2">
                                    No user assigned
                                  </p>
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        assignRaciRole(role, e.target.value);
                                        e.target.value = "";
                                      }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="">Select a user...</option>
                                    {users.map((user: User) => (
                                      <option key={user.id} value={user.id}>
                                        {user.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attachments" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Attachments
                    </h3>
                  </div>
                  <div className="p-6">
                    {item.attachment && item.attachment.length > 0 ? (
                      <div className="space-y-4">
                        {item.attachment.map((att, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                                <span className="text-blue-600 text-xs font-medium">
                                  {att.filename
                                    ? att.filename
                                        .split(".")
                                        .pop()
                                        ?.toUpperCase()
                                    : "FILE"}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {att.filename || "Unknown file"}
                                </div>
                                {att.size && (
                                  <div className="text-sm text-gray-500">
                                    {(att.size / 1024).toFixed(1)} KB
                                  </div>
                                )}
                              </div>
                            </div>
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No attachments
                        </h3>
                        <p className="text-gray-500">
                          No files have been attached to this governance item.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Activity Timeline
                    </h3>
                  </div>
                  <div className="p-6">
                    {item.comment && item.comment.length > 0 ? (
                      <div className="space-y-6">
                        {item.comment.map((comment, index) => (
                          <div key={index} className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {comment.author?.name?.charAt(0) || "?"}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {comment.author?.name || "Anonymous"}
                                  </h4>
                                  <time className="text-xs text-gray-500">
                                    {comment.createdAt
                                      ? formatDate(comment.createdAt)
                                      : ""}
                                  </time>
                                </div>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No activity
                        </h3>
                        <p className="text-gray-500">
                          No comments or activity recorded for this governance
                          item.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  href={`/governance/${item.id}/edit`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Item
                </Link>

                <button className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>

                <button className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </button>

                <hr className="border-gray-200" />

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="space-y-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}
                    >
                      {statusConf.label}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Statistics */}
                {item._count && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Statistics
                    </label>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtasks:</span>
                        <span className="font-medium">
                          {item._count.subtask || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Comments:</span>
                        <span className="font-medium">
                          {item._count.comment || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Files:</span>
                        <span className="font-medium">
                          {item._count.attachment || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
