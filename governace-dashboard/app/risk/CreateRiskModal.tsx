"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import {
  CreateRiskInput,
  RISK_STATUSES,
  IMPACT_LEVELS,
  LIKELIHOOD_LEVELS,
} from "../types/risk";

interface CreateRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function CreateRiskModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRiskModalProps) {
  const [formData, setFormData] = useState<CreateRiskInput>({
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
      const response = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create risk");
      }
    } catch (err) {
      setError("An error occurred while creating the risk");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      impact: 3,
      likelihood: 3,
      status: "IN_PROGRESS",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const calculatedRating = formData.impact * formData.likelihood;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Risk
            </h2>
          </div>
          <button
            onClick={handleClose}
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
              placeholder="Enter risk title"
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
                    {level.value} - {level.label} ({level.description})
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
                    {level.value} - {level.label} ({level.description})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calculated Rating */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Calculated Risk Rating:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {calculatedRating}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Impact ({formData.impact}) × Likelihood ({formData.likelihood})
            </div>
          </div>

          {/* Owner */}
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
              <option value="">Select owner (optional)</option>
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
              <option value="">Select department (optional)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
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
                  status: e.target.value as CreateRiskInput["status"],
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
              <option value="">Select governance item (optional)</option>
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
              placeholder="Enter additional notes about this risk"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              {loading ? "Creating..." : "Create Risk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
