"use client";

import React, { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";
import {
  CreateControlInput,
  CONTROL_STATUSES,
  CONTROL_FREQUENCIES,
  CONTROL_CATEGORIES,
} from "../../types/compliance";

interface CreateControlModalProps {
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

export default function CreateControlModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateControlModalProps) {
  const [formData, setFormData] = useState<CreateControlInput>({
    code: "",
    title: "",
    description: "",
    category: CONTROL_CATEGORIES[0],
    status: "ACTIVE",
    frequency: "MONTHLY",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

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
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/compliance/controls", {
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
        setError(data.error || "Failed to create control");
      }
    } catch {
      setError("An error occurred while creating the control");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      category: CONTROL_CATEGORIES[0],
      status: "ACTIVE",
      frequency: "MONTHLY",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Control
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., AC-001"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
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
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter control title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the control and its purpose"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    status: e.target.value as CreateControlInput["status"],
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
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target
                      .value as CreateControlInput["frequency"],
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
                <option value="">Select policy (optional)</option>
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
                <option value="">Select risk (optional)</option>
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
              placeholder="0-100"
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
              {loading ? "Creating..." : "Create Control"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
