"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  X,
  Plus,
  Trash2,
  User,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Circle,
  Users,
  ArrowLeft,
  Building2,
  Calendar,
  Shield,
  Eye,
  Globe,
  Briefcase,
  Target,
  UserCheck,
  PlusCircle,
  Sparkles,
  Settings,
  Flag,
  Archive,
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
  ownerId?: number;
  departmentId?: number;

  // Relationships
  owner?: User;
  user?: User;
  department?: Department;
  actionitem?: ActionItem[];
  assignment?: Assignment[];
  attachment?: Attachment[];
  auditevent?: AuditEvent[];
  auditplan?: AuditPlan[];
  comment?: Comment[];
  raci?: RaciRole[];
  risk?: Risk[];
  subtask?: Subtask[];

  // Legacy compatibility
  subtasks?: Subtask[];
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
  user: User;
}

interface AuditEvent {
  id: number;
  kind: string;
  message: string;
  createdAt: string;
  user?: User;
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
  user: User;
}

interface RaciRole {
  id: number;
  role: "R" | "A" | "C" | "I";
  user: User;
  userId: number;
  itemId: number;
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
  dueDate?: string | null;
  user?: User;
  itemId: number;
  assigneeId?: number | null;
}

interface UpdateGovernanceItemData {
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
  dueDate?: string | null;
  visibility: string;
  actionitemType?: string;
  clauseRefs?: Record<string, unknown>;
  tags?: string[];
  ownerId?: number | null;
  departmentId?: number | null;
}

// Enhanced Status configuration
const STATUS_CONFIG = {
  NOT_STARTED: {
    label: "Not Started",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    bgColor: "bg-slate-50",
    icon: Circle,
    gradient: "from-slate-400 to-slate-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    bgColor: "bg-blue-50",
    icon: Clock,
    gradient: "from-blue-500 to-indigo-600",
  },
  BLOCKED: {
    label: "Blocked",
    color: "bg-red-100 text-red-700 border-red-200",
    bgColor: "bg-red-50",
    icon: AlertCircle,
    gradient: "from-red-500 to-red-600",
  },
  AT_RISK: {
    label: "At Risk",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    bgColor: "bg-amber-50",
    icon: Flag,
    gradient: "from-amber-500 to-orange-600",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bgColor: "bg-emerald-50",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-600",
  },
  DEFERRED: {
    label: "Deferred",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    bgColor: "bg-purple-50",
    icon: Archive,
    gradient: "from-purple-500 to-purple-600",
  },
};

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    icon: Globe,
    description: "Visible to everyone",
  },
  {
    value: "department",
    label: "Department",
    icon: Building2,
    description: "Visible to department members",
  },
  {
    value: "private",
    label: "Private",
    icon: Eye,
    description: "Visible to assigned users only",
  },
];

const RACI_ROLES = [
  {
    value: "R",
    label: "Responsible",
    description: "Those who do the work",
    color: "bg-green-500",
  },
  {
    value: "A",
    label: "Accountable",
    description: "Those who are answerable",
    color: "bg-blue-500",
  },
  {
    value: "C",
    label: "Consulted",
    description: "Those whose opinions are sought",
    color: "bg-yellow-500",
  },
  {
    value: "I",
    label: "Informed",
    description: "Those who are kept up-to-date",
    color: "bg-purple-500",
  },
];

export default function EnhancedEditGovernancePage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<GovernanceItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("basic");

  // Form data state
  const [formData, setFormData] = useState<UpdateGovernanceItemData>({
    title: "",
    description: "",
    status: "NOT_STARTED",
    progress: 0,
    tags: [],
    visibility: "department",
  });

  // Additional form states
  const [tagInput, setTagInput] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [raciRoles, setRaciRoles] = useState<RaciRole[]>([]);

  // Fetch governance item and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch governance item
        const itemResponse = await fetch(`/api/governance/${itemId}`);
        if (!itemResponse.ok) {
          throw new Error("Failed to fetch governance item");
        }
        const itemData: GovernanceItem = await itemResponse.json();
        setItem(itemData);

        // Set form data from item
        setFormData({
          title: itemData.title,
          description: itemData.description,
          status: itemData.status,
          ownerId: itemData.ownerId,
          departmentId: itemData.departmentId,
          dueDate: itemData.dueDate
            ? new Date(itemData.dueDate).toISOString().slice(0, 16)
            : undefined,
          progress: itemData.progress,
          tags: itemData.tags || [],
          visibility: itemData.visibility,
          actionitemType: itemData.actionitemType,
          clauseRefs: itemData.clauseRefs,
        });

        setSubtasks(itemData.subtask || itemData.subtasks || []);
        setRaciRoles(itemData.raci || []);

        // Fetch users and departments
        const [usersResponse, departmentsResponse] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/departments"),
        ]);

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData && Array.isArray(usersData.users)) {
            setUsers(usersData.users);
          } else if (Array.isArray(usersData)) {
            setUsers(usersData);
          } else {
            setUsers([]);
          }
        } else {
          setUsers([]);
        }

        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          if (departmentsData && Array.isArray(departmentsData.departments)) {
            setDepartments(departmentsData.departments);
          } else if (Array.isArray(departmentsData)) {
            setDepartments(departmentsData);
          } else {
            setDepartments([]);
          }
        } else {
          setDepartments([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setErrors({ general: "Failed to load governance item" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  // Handle form field changes
  const handleInputChange = (
    field: keyof UpdateGovernanceItemData,
    value: string | number | string[] | Date | null
  ) => {
    setFormData((prev: UpdateGovernanceItemData) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [field as string]: "",
      }));
    }
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      const newTags = [...(formData.tags || []), tagInput.trim()];
      handleInputChange("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags =
      formData.tags?.filter((tag: string) => tag !== tagToRemove) || [];
    handleInputChange("tags", newTags);
  };

  // Subtask management
  const addSubtask = () => {
    if (newSubtask.trim()) {
      const tempId = Date.now();
      setSubtasks((prev) => [
        ...prev,
        {
          id: tempId,
          itemId: parseInt(itemId),
          title: newSubtask.trim(),
          done: false,
          dueDate: null,
          assigneeId: null,
        },
      ]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (id: number) => {
    setSubtasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const removeSubtask = (id: number) => {
    setSubtasks((prev) => prev.filter((task) => task.id !== id));
  };

  // RACI management
  const assignRaciRole = (userId: number, role: "R" | "A" | "C" | "I") => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Remove existing user with this role
    const updatedRoles = raciRoles.filter((r) => r.role !== role);

    // Add the new assignment
    setRaciRoles([
      ...updatedRoles,
      {
        id: Date.now(),
        itemId: parseInt(itemId),
        userId,
        user,
        role,
      },
    ]);
  };

  const removeRaciRole = (role: "R" | "A" | "C" | "I") => {
    setRaciRoles((prev) => prev.filter((r) => r.role !== role));
  };

  const getRaciRoleUser = (role: "R" | "A" | "C" | "I") => {
    return raciRoles.find((r) => r.role === role)?.user;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const formattedData = {
        ...formData,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
      };

      const response = await fetch(`/api/governance/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formattedData,
          subtasks,
          raciRoles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update governance item");
      }

      router.push(`/governance/${itemId}`);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Governance Item
            </h3>
            <p className="text-gray-600">Fetching data and dependencies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Item Not Found
            </h3>
            <p className="text-gray-600">
              The governance item could not be loaded.
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Form completion calculation
  const getFormCompletion = () => {
    let completed = 0;
    const total = 6;

    if (formData.title && formData.description) completed++;
    if (formData.visibility && formData.status) completed++;
    if (formData.ownerId || formData.departmentId) completed++;
    if (subtasks.length > 0) completed++;
    if (raciRoles.length > 0) completed++;
    if (formData.tags && formData.tags.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  // Navigation sections
  const sections = [
    { id: "basic", label: "Basic Info", icon: FileText, required: true },
    { id: "details", label: "Details", icon: Settings, required: false },
    { id: "assignment", label: "Assignment", icon: Users, required: false },
    {
      id: "subtasks",
      label: "Subtasks",
      icon: CheckCircle2,
      count: subtasks.length,
    },
    { id: "raci", label: "RACI Matrix", icon: Target, count: raciRoles.length },
    {
      id: "metadata",
      label: "Metadata",
      icon: Tag,
      count: formData.tags?.length || 0,
    },
  ];

  const currentStatus = STATUS_CONFIG[formData.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-gray-700 font-medium shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit Governance Item
                  </h1>
                  <span className="text-gray-500">
                    #{item.number || item.id}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}
                  >
                    <currentStatus.icon className="w-4 h-4 mr-1" />
                    {currentStatus.label}
                  </span>
                  <span className="text-sm text-gray-600">{item.title}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  Task Progress
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-900">
                    {formData.progress}%
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${currentStatus.gradient} h-3 rounded-full transition-all duration-500 ease-out relative`}
                      style={{ width: `${formData.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  Form Completion
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-900">
                    {getFormCompletion()}%
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${getFormCompletion()}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              {saving && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600 mr-2"></div>
                  Saving...
                </div>
              )}
            </div>
          </div>

          {/* Section Navigation */}
          <div className="mt-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-sm">
              <nav className="flex space-x-1 overflow-x-auto">
                {sections.map((section) => {
                  const SectionIcon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-[1.02]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                      }`}
                    >
                      <SectionIcon
                        className={`w-4 h-4 mr-2 ${
                          isActive ? "text-white" : ""
                        }`}
                      />
                      {section.label}
                      {section.count !== undefined && section.count > 0 && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {section.count}
                        </span>
                      )}
                      {section.required && (
                        <span
                          className={`ml-1 text-xs ${
                            isActive ? "text-white/80" : "text-red-500"
                          }`}
                        >
                          *
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 pb-32">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Display */}
          {errors.general && (
            <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-2 border-red-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-semibold text-red-800">
                    Error occurred
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                </div>
                <button
                  onClick={() => setErrors({})}
                  className="ml-auto text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          {activeSection === "basic" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  Basic Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Core details and description of the governance item
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Title */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number
                    </label>
                    <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 font-mono">
                      #{item.number || item.id}
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter governance item title"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Provide a detailed description of this governance item..."
                    required
                  />
                </div>

                {/* Status and Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange(
                          "status",
                          e.target.value as
                            | "NOT_STARTED"
                            | "IN_PROGRESS"
                            | "BLOCKED"
                            | "AT_RISK"
                            | "COMPLETED"
                            | "DEFERRED"
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Progress (%)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) =>
                          handleInputChange(
                            "progress",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) =>
                          handleInputChange(
                            "progress",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Section */}
          {activeSection === "details" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-indigo-600" />
                  Additional Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Visibility, type, and metadata configuration
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Visibility and Action Item Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Visibility
                    </label>
                    <div className="space-y-2">
                      {VISIBILITY_OPTIONS.map((option) => {
                        const OptionIcon = option.icon;
                        return (
                          <label
                            key={option.value}
                            className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="radio"
                              name="visibility"
                              value={option.value}
                              checked={formData.visibility === option.value}
                              onChange={(e) =>
                                handleInputChange("visibility", e.target.value)
                              }
                              className="w-4 h-4 text-blue-600 mr-3"
                            />
                            <OptionIcon className="w-5 h-5 text-gray-500 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {option.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Action Item Type
                    </label>
                    <input
                      type="text"
                      value={formData.actionitemType || ""}
                      onChange={(e) =>
                        handleInputChange("actionitemType", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Policy Review, Compliance Check..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Section */}
          {activeSection === "assignment" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-green-600" />
                  Assignment & Timeline
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Owner, department, and deadline information
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Owner
                    </label>
                    <select
                      value={formData.ownerId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "ownerId",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select owner...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Department
                    </label>
                    <select
                      value={formData.departmentId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "departmentId",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dueDate || ""}
                      onChange={(e) =>
                        handleInputChange("dueDate", e.target.value || null)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          {activeSection === "subtasks" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-3 text-purple-600" />
                  Subtasks ({subtasks.length})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Break down work into manageable tasks
                </p>
              </div>
              <div className="p-6">
                {/* Existing Subtasks */}
                {subtasks.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          subtask.done
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={subtask.done}
                          onChange={() => toggleSubtask(subtask.id)}
                          className="w-5 h-5 text-green-600 bg-white border-2 border-gray-300 rounded focus:ring-green-500"
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
                        <button
                          type="button"
                          onClick={() => removeSubtask(subtask.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Subtask */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSubtask())
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Add a new subtask..."
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    disabled={!newSubtask.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RACI Section */}
          {activeSection === "raci" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-orange-600" />
                  RACI Matrix
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Define roles and responsibilities clearly
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {RACI_ROLES.map((roleInfo) => {
                    const assignedUser = getRaciRoleUser(
                      roleInfo.value as "R" | "A" | "C" | "I"
                    );
                    return (
                      <div
                        key={roleInfo.value}
                        className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <span
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl ${roleInfo.color}`}
                          >
                            {roleInfo.value}
                          </span>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {roleInfo.label}
                            </div>
                            <div className="text-sm text-gray-600">
                              {roleInfo.description}
                            </div>
                          </div>
                        </div>

                        {assignedUser ? (
                          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {assignedUser.name || assignedUser.email}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Currently assigned
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeRaciRole(
                                  roleInfo.value as "R" | "A" | "C" | "I"
                                )
                              }
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                            <div className="text-sm text-gray-500">
                              No one assigned to this role
                            </div>
                          </div>
                        )}

                        <select
                          value={assignedUser?.id || ""}
                          onChange={(e) => {
                            const userId = parseInt(e.target.value);
                            if (userId) {
                              assignRaciRole(
                                userId,
                                roleInfo.value as "R" | "A" | "C" | "I"
                              );
                            } else {
                              removeRaciRole(
                                roleInfo.value as "R" | "A" | "C" | "I"
                              );
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="">
                            {assignedUser
                              ? "Change assignment..."
                              : "Assign user..."}
                          </option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          {activeSection === "metadata" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg animate-in slide-in-from-right-4 duration-300">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Tag className="w-6 h-6 mr-3 text-cyan-600" />
                  Tags & Metadata
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Organize with tags and additional information
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tags ({formData.tags?.length || 0})
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-200 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      placeholder="Add a tag..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={
                        !tagInput.trim() ||
                        formData.tags?.includes(tagInput.trim())
                      }
                      className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Panel */}
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all font-medium text-sm min-w-[100px]"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
