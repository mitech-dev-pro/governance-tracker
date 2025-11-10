"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Trash2, Save } from "lucide-react";
import {
  Risk,
  UpdateRiskInput,
  RISK_STATUSES,
  IMPACT_LEVELS,
  LIKELIHOOD_LEVELS,
  getRiskLevel,
  getRiskColor,
} from "../types/risk";

interface EditRiskModalProps {
  isOpen: boolean;
  risk: Risk | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (id: number) => void;
}

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface Department {
  id: number;
  name: string;
  code?: string;
}

interface GovernanceItem {
  id: number;
  title: string;
  number?: number;
}

export default function EditRiskModal({
  isOpen,
  risk,
  onClose,
  onSuccess,
  onDelete,
}: EditRiskModalProps) {
  const [formData, setFormData] = useState<UpdateRiskInput>({
    id: 0,
    title: "",
    impact: 3,
    likelihood: 3,
    status: "IN_PROGRESS",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [governanceItems, setGovernanceItems] = useState<GovernanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when risk changes
  useEffect(() => {
    if (risk) {
      setFormData({
        id: risk.id,
        title: risk.title,
        ownerId: risk.ownerId,
        impact: risk.impact,
        likelihood: risk.likelihood,
        status: risk.status,
        notes: risk.notes,
        relatedItemId: risk.relatedItemId,
        departmentId: risk.departmentId,
      });
    }
  }, [risk]);

  // Fetch users, departments, and governance items
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes, itemsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/departments"),
        fetch("/api/governance"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (deptsRes.ok) {
        const data = await deptsRes.json();
        setDepartments(data.departments || []);
      }

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setGovernanceItems(data.items || []);
      }
    } catch {
      console.error("Error fetching data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/risk/${risk?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update risk");
      }
    } catch {
      setError("An error occurred while updating the risk");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!risk) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/risk/${risk.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (onDelete) {
          onDelete(risk.id);
        }
        onClose();
      } else {
        setError("Failed to delete risk");
      }
    } catch {
      setError("An error occurred while deleting the risk");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const calculatedRating = (formData.impact || 3) * (formData.likelihood || 3);
  const riskLevel = getRiskLevel(calculatedRating);
  const riskColor = getRiskColor(calculatedRating);

  if (!isOpen || !risk) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`w-6 h-6 text-${riskColor}-600`} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Edit Risk</h2>
              <p className="text-sm text-gray-500">Risk ID: #{risk.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Risk Level Indicator */}
          <div
            className={`bg-${riskColor}-50 border border-${riskColor}-200 rounded-lg p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Current Risk Level:
                </span>
                <span
                  className={`ml-2 text-lg font-bold text-${riskColor}-700`}
                >
                  {riskLevel}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold text-${riskColor}-700`}>
                  {calculatedRating}
                </div>
                <div className="text-xs text-gray-500">
                  {formData.impact} × {formData.likelihood}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Impact and Likelihood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.impact}
                onChange={(e) =>
                  setFormData({ ...formData, impact: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {IMPACT_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.value} - {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Likelihood <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.likelihood}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    likelihood: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LIKELIHOOD_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.value} - {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Owner and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Owner
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
                  setFormData({
                    ...formData,
                    departmentId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
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
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as UpdateRiskInput["status"],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {RISK_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Related Governance Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Governance Item
            </label>
            <select
              value={formData.relatedItemId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  relatedItemId: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select governance item</option>
              {governanceItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.number ? `#${item.number} - ` : ""}
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(risk.createdAt).toLocaleDateString()}
              </div>
              {risk.owner && (
                <div>
                  <span className="font-medium">Current Owner:</span>{" "}
                  {risk.owner.name || risk.owner.email}
                </div>
              )}
              {risk.department && (
                <div>
                  <span className="font-medium">Current Department:</span>{" "}
                  {risk.department.name}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this risk? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
