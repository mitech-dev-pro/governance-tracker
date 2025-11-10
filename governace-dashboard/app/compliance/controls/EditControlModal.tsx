"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, Trash2 } from "lucide-react";
import {
  Control,
  UpdateControlInput,
  CONTROL_STATUSES,
  CONTROL_FREQUENCIES,
  CONTROL_CATEGORIES,
} from "../../types/compliance";

interface EditControlModalProps {
  isOpen: boolean;
  control: Control | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: (id: number) => void;
}

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface Department {
  id: number;
  name: string;
}

interface Policy {
  id: number;
  code: string;
  title: string;
}

interface Risk {
  id: number;
  title: string;
}

export default function EditControlModal({
  isOpen,
  control,
  onClose,
  onSuccess,
  onDelete,
}: EditControlModalProps) {
  const [formData, setFormData] = useState<Partial<UpdateControlInput>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && control) {
      setFormData({
        id: control.id,
        code: control.code,
        title: control.title,
        description: control.description,
        category: control.category,
        status: control.status,
        frequency: control.frequency,
        ownerId: control.ownerId,
        departmentId: control.departmentId,
        policyId: control.policyId,
        riskId: control.riskId,
        effectiveness: control.effectiveness,
      });
      fetchData();
    }
  }, [isOpen, control]);

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes, policiesRes, risksRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/departments"),
        fetch("/api/compliance/policies"),
        fetch("/api/risk"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (deptsRes.ok) {
        const data = await deptsRes.json();
        setDepartments(data.departments || []);
      }

      if (policiesRes.ok) {
        const data = await policiesRes.json();
        setPolicies(data.policies || []);
      }

      if (risksRes.ok) {
        const data = await risksRes.json();
        setRisks(data.risks || []);
      }
    } catch {
      console.error("Error fetching data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!control) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/compliance/controls/${control.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update control");
      }
    } catch {
      setError("An error occurred while updating the control");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (control) {
      onDelete(control.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({});
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !control) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Edit Control</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-semibold">Confirm Delete</h3>
                <p className="text-red-700 text-sm mt-1">
                  Are you sure you want to delete this control? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CONTROL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status || "ACTIVE"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as UpdateControlInput["status"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CONTROL_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Frequency
              </label>
              <select
                value={formData.frequency || "MONTHLY"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target
                      .value as UpdateControlInput["frequency"],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CONTROL_FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Owner
              </label>
              <select
                value={formData.ownerId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ownerId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No owner</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={formData.departmentId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    departmentId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Related Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Policy
              </label>
              <select
                value={formData.policyId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policyId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No policy</option>
                {policies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.code} - {policy.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Related Risk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Risk
              </label>
              <select
                value={formData.riskId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No risk</option>
                {risks.map((risk) => (
                  <option key={risk.id} value={risk.id}>
                    {risk.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Effectiveness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effectiveness (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.effectiveness || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  effectiveness: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Control Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-800">
                  {new Date(control.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 text-gray-800">
                  {new Date(control.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {control.lastReviewed && (
                <div>
                  <span className="text-gray-600">Last Reviewed:</span>
                  <span className="ml-2 text-gray-800">
                    {new Date(control.lastReviewed).toLocaleDateString()}
                  </span>
                </div>
              )}
              {control.nextReview && (
                <div>
                  <span className="text-gray-600">Next Review:</span>
                  <span className="ml-2 text-gray-800">
                    {new Date(control.nextReview).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Control</span>
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
