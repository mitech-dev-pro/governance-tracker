"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  Building2,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Circle,
  Users,
  Paperclip,
  MessageSquare,
  ArrowLeft,
  Info,
} from "lucide-react";
import type {
  GovernanceItem,
  UpdateGovernanceItemData,
  User as UserType,
  Department,
  GovernanceStatus,
  Subtask,
  RaciRole,
} from "../../../types/governance";

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

const RACI_ROLES = [
  { value: "R", label: "Responsible", description: "Those who do the work" },
  { value: "A", label: "Accountable", description: "Those who are answerable" },
  {
    value: "C",
    label: "Consulted",
    description: "Those whose opinions are sought",
  },
  {
    value: "I",
    label: "Informed",
    description: "Those who are kept up-to-date",
  },
];

export default function EditGovernancePage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<GovernanceItem | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const [clauseRefInput, setClauseRefInput] = useState("");
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
            ? new Date(itemData.dueDate).toISOString().split("T")[0]
            : undefined,
          progress: itemData.progress,
          tags: itemData.tags || [],
          visibility: itemData.visibility,
        });

        setSubtasks(itemData.subtasks || []);
        setRaciRoles(itemData.raci || []);

        // Fetch users and departments (you might want to cache these)
        const [usersResponse, departmentsResponse] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/departments"),
        ]);

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData);
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
    value: any
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
      const tempId = Date.now(); // Temporary ID for new subtasks
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
  const addRaciRole = (userId: number, role: "R" | "A" | "C" | "I") => {
    const existingRole = raciRoles.find(
      (r) => r.userId === userId && r.role === role
    );
    if (!existingRole) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setRaciRoles((prev) => [
          ...prev,
          {
            id: Date.now(), // Temporary ID
            itemId: parseInt(itemId),
            userId,
            user,
            role,
          },
        ]);
      }
    }
  };

  const removeRaciRole = (id: number) => {
    setRaciRoles((prev) => prev.filter((role) => role.id !== id));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await fetch(`/api/governance/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
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
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading governance item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center min-h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Governance item not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6 pb-8 min-h-full">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Edit Governance Item
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">#{item.number || item.id}</span>
            <span>•</span>
            <span>{item.title}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-800">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Title and Number */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number
                  </label>
                  <input
                    type="text"
                    value={item.number || `#${item.id}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter governance item title"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed description"
                  required
                />
              </div>

              {/* Status and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange(
                        "status",
                        e.target.value as GovernanceStatus
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress (%)
                  </label>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Assignment and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select owner</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate || ""}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-blue-600" />
                Tags
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
                Subtasks
              </h2>
            </div>
            <div className="p-6">
              {/* Existing Subtasks */}
              <div className="space-y-2 mb-4">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.done}
                      onChange={() => toggleSubtask(subtask.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Subtask */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSubtask())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add subtask..."
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RACI Matrix */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                RACI Matrix
              </h2>
            </div>
            <div className="p-6">
              {/* RACI Role Legend */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {RACI_ROLES.map((role) => (
                  <div
                    key={role.value}
                    className="text-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="font-semibold text-blue-600">
                      {role.value}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {role.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {role.description}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current RACI Assignments */}
              <div className="space-y-3">
                {raciRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                          role.role === "R"
                            ? "bg-green-500"
                            : role.role === "A"
                            ? "bg-blue-500"
                            : role.role === "C"
                            ? "bg-yellow-500"
                            : "bg-purple-500"
                        }`}
                      >
                        {role.role}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {role.user.name || role.user.email}
                        </div>
                        <div className="text-sm text-gray-600">
                          {RACI_ROLES.find((r) => r.value === role.role)?.label}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRaciRole(role.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add RACI Role */}
              <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    {RACI_ROLES.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        className={`px-3 py-2 rounded-lg font-medium text-white ${
                          role.value === "R"
                            ? "bg-green-500 hover:bg-green-600"
                            : role.value === "A"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : role.value === "C"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-purple-500 hover:bg-purple-600"
                        }`}
                      >
                        {role.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
