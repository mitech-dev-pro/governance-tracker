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
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Activity,
  BarChart3,
  Clock,
  Archive,
  TrendingUp,
  Target,
  FileText,
  Users,
  Eye,
  Flag,
  Settings,
  ListChecks,
  UserCheck,
  Briefcase,
  History,
} from "lucide-react";

// Complete interfaces matching ALL schema relationships
interface GovernanceItem {
  id: number;
  number?: number;
  title: string;
  description: string;
  status:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "BLOCKED"
    | "AT_RISK"
    | "COMPLETED"
    | "DEFERRED";
  progress: number;
  dueDate: string | null;
  visibility: string;
  actionitemType?: string;
  clauseRefs?: Record<string, unknown>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;

  // Direct relationships from schema
  owner?: User;
  user?: User; // API sometimes returns as 'user' instead of 'owner'
  department?: Department;

  // All relationship arrays from schema
  actionitem?: ActionItem[]; // Meeting action items
  assignment?: Assignment[]; // Task assignments
  attachment?: Attachment[]; // File attachments
  auditevent?: AuditEvent[]; // Audit trail events
  auditplan?: AuditPlan[]; // Audit plans
  comment?: Comment[]; // Comments/discussions
  raci?: RaciRole[]; // RACI matrix roles
  risk?: Risk[]; // Associated risks
  subtask?: Subtask[]; // Sub-tasks breakdown

  // For legacy compatibility
  attachments?: Attachment[];
  comments?: Comment[];
  subtasks?: Subtask[];

  _count?: {
    actionitem: number;
    assignment: number;
    attachment: number;
    auditevent: number;
    auditplan: number;
    comment: number;
    raci: number;
    risk: number;
    subtask: number;
  };
}

interface User {
  id: number;
  name?: string;
  email: string;
  image?: string;
}

interface Department {
  id: number;
  name: string;
  code?: string;
  createdAt: string;
}

interface ActionItem {
  id: number;
  title: string;
  status:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "BLOCKED"
    | "AT_RISK"
    | "COMPLETED"
    | "DEFERRED";
  dueDate?: string;
  meetingId?: number;
  owner?: User;
  meeting?: {
    id: number;
    date: string;
    type: string;
  };
}

interface Assignment {
  id: number;
  kind: string;
  user: User;
}

interface Attachment {
  id: number;
  label: string;
  url: string;
  createdAt: string;
  user: User; // addedBy in schema
}

interface AuditEvent {
  id: number;
  kind: string;
  message: string;
  createdAt: string;
  user?: User; // actor in schema
}

interface AuditPlan {
  id: number;
  title: string;
  quarter: string;
  scope: string;
  owner?: User;
}

interface Comment {
  id: number;
  body: string;
  createdAt: string;
  user: User; // author in schema
}

interface RaciRole {
  id: number;
  role: "R" | "A" | "C" | "I";
  user: User;
}

interface Risk {
  id: number;
  title: string;
  impact: number;
  likelihood: number;
  rating: number;
  status:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "BLOCKED"
    | "AT_RISK"
    | "COMPLETED"
    | "DEFERRED";
  notes?: string;
  createdAt: string;
  owner?: User;
  department?: Department;
}

interface Subtask {
  id: number;
  title: string;
  done: boolean;
  dueDate?: string;
  user?: User; // assignee in schema
}

const STATUS_CONFIG = {
  NOT_STARTED: {
    label: "Not Started",
    color: "bg-slate-100 text-slate-700",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
    icon: Activity,
  },
  BLOCKED: {
    label: "Blocked",
    color: "bg-red-100 text-red-700",
    icon: AlertTriangle,
  },
  AT_RISK: {
    label: "At Risk",
    color: "bg-amber-100 text-amber-700",
    icon: Flag,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckSquare,
  },
  DEFERRED: {
    label: "Deferred",
    color: "bg-purple-100 text-purple-700",
    icon: Archive,
  },
};

// User Avatar Component
const UserAvatar = ({
  user,
  size = "sm",
}: {
  user: User;
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

// User Display Component with Avatar and Name
const UserDisplay = ({
  user,
  showEmail = false,
  size = "sm",
}: {
  user: User;
  showEmail?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) => {
  return (
    <div className="flex items-center space-x-3">
      <UserAvatar user={user} size={size} />
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {user.name || user.email}
        </p>
        {showEmail && user.name && (
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        )}
      </div>
    </div>
  );
};

export default function GovernanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [item, setItem] = useState<GovernanceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  useEffect(() => {
    if (!itemId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/governance/${itemId}`, {
          headers: { "Cache-Control": "no-cache" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch governance item");
        }

        const itemData = await response.json();
        setItem(itemData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  // Quick Actions
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/governance/${itemId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `governance-item-${itemId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export functionality coming soon!");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: item?.title,
        text: item?.description,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

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
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.NOT_STARTED
    );
  };

  const getRiskScore = () => {
    if (!item?.risk?.length) return 0;
    return Math.round(
      item.risk.reduce((acc, risk) => acc + risk.rating, 0) / item.risk.length
    );
  };

  const getCompletionRate = () => {
    const subtasks = item?.subtask || item?.subtasks || [];
    const completed = subtasks.filter((t) => t.done).length;
    const total = subtasks.length || 1;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading governance item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Item
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const statusConf = getStatusConfig(item.status);
  const StatusIcon = statusConf.icon;

  // All tabs representing schema relationships
  const tabs = [
    { id: "overview", label: "Overview", icon: Eye, count: null },
    { id: "details", label: "Details", icon: FileText, count: null },
    {
      id: "subtasks",
      label: "Subtasks",
      icon: ListChecks,
      count: item._count?.subtask || 0,
    },
    {
      id: "actionitems",
      label: "Action Items",
      icon: Target,
      count: item._count?.actionitem || 0,
    },
    {
      id: "raci",
      label: "RACI Matrix",
      icon: Users,
      count: item._count?.raci || 0,
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: UserCheck,
      count: item._count?.assignment || 0,
    },
    {
      id: "risks",
      label: "Risks",
      icon: AlertTriangle,
      count: item._count?.risk || 0,
    },
    {
      id: "attachments",
      label: "Files",
      icon: Paperclip,
      count: item._count?.attachment || 0,
    },
    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
      count: item._count?.comment || 0,
    },
    {
      id: "auditplans",
      label: "Audit Plans",
      icon: Briefcase,
      count: item._count?.auditplan || 0,
    },
    {
      id: "audittrail",
      label: "Audit Trail",
      icon: History,
      count: item._count?.auditevent || 0,
    },
    { id: "analytics", label: "Analytics", icon: BarChart3, count: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/governance"
                className="inline-flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Governance
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {item.title}
                  </h1>
                  <span className="text-gray-500">
                    #{item.number || item.id}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConf.color}`}
                  >
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConf.label}
                  </span>
                  {item.dueDate && (
                    <span
                      className={`text-sm ${
                        isOverdue(item.dueDate)
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      Due: {formatDate(item.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Share"
              >
                <Share className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Export"
              >
                <Download className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <Link
                href={`/governance/${item.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>

          {/* Complete Tab Navigation - All Schema Relationships */}
          <div className="mt-6">
            <nav className="flex space-x-1 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <TabIcon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Progress
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {item.progress}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Risk Score
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {getRiskScore()}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Completion
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {getCompletionRate()}%
                        </p>
                      </div>
                      <CheckSquare className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Comments
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {item._count?.comment || 0}
                        </p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Description & Key Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Description
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Key Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-600 mb-2">Owner</p>
                          {item.owner || item.user ? (
                            <UserDisplay
                              user={(item.owner || item.user)!}
                              showEmail={false}
                              size="md"
                            />
                          ) : (
                            <p className="font-medium text-gray-500">
                              Unassigned
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium">
                            {item.department?.name || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p
                            className={`font-medium ${
                              isOverdue(item.dueDate)
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {item.dueDate
                              ? formatDate(item.dueDate)
                              : "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relationships Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    All Relationships
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {item._count?.subtask || 0}
                      </div>
                      <div className="text-sm text-gray-600">Subtasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {item._count?.actionitem || 0}
                      </div>
                      <div className="text-sm text-gray-600">Action Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {item._count?.raci || 0}
                      </div>
                      <div className="text-sm text-gray-600">RACI Roles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {item._count?.risk || 0}
                      </div>
                      <div className="text-sm text-gray-600">Risks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {item._count?.attachment || 0}
                      </div>
                      <div className="text-sm text-gray-600">Files</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">
                        {item._count?.auditevent || 0}
                      </div>
                      <div className="text-sm text-gray-600">Audit Events</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Detailed Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {item.title}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      #{item.number || item.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConf.color}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConf.label}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{item.progress}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {item.owner || item.user ? (
                        <UserDisplay
                          user={(item.owner || item.user)!}
                          showEmail={true}
                          size="sm"
                        />
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {item.department?.name || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border capitalize">
                      {item.visibility}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Item Type
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {item.actionitemType || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Updated
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {formatDate(item.updatedAt)}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border min-h-[100px]">
                      <p className="whitespace-pre-wrap">{item.description}</p>
                    </div>
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== "overview" && activeTab !== "details" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Settings className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {tabs.find((t) => t.id === activeTab)?.label} Section
                </h3>
                <p className="text-gray-600 mb-4">
                  This section will show all{" "}
                  {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}{" "}
                  related to this governance item.
                </p>
                <p className="text-sm text-gray-500">
                  Count:{" "}
                  {item._count?.[activeTab as keyof typeof item._count] || 0}{" "}
                  items
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/governance/${item.id}/edit`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Item
                </Link>
                <button
                  onClick={handleExport}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={handleShare}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Progress Tracking
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Task Completion</span>
                    <span className="font-medium">{getCompletionRate()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getCompletionRate()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Statistics - All Schema Relationships */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                All Relationships
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtasks</span>
                  <span className="font-medium">
                    {item._count?.subtask || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Action Items</span>
                  <span className="font-medium">
                    {item._count?.actionitem || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">RACI Roles</span>
                  <span className="font-medium">{item._count?.raci || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assignments</span>
                  <span className="font-medium">
                    {item._count?.assignment || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risks</span>
                  <span className="font-medium">{item._count?.risk || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attachments</span>
                  <span className="font-medium">
                    {item._count?.attachment || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-medium">
                    {item._count?.comment || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Audit Plans</span>
                  <span className="font-medium">
                    {item._count?.auditplan || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Audit Events</span>
                  <span className="font-medium">
                    {item._count?.auditevent || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
