"use client";

import React, { useState, useEffect } from "react";
import { X, ClipboardCheck, Trash2 } from "lucide-react";
import {
  Audit,
  UpdateAuditInput,
  AUDIT_TYPES,
  AUDIT_STATUSES,
} from "../types/audit";

interface EditAuditModalProps {
  isOpen: boolean;
  audit: Audit | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
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

export default function EditAuditModal({
  isOpen,
  audit,
  onClose,
  onSuccess,
  onDelete,
}: EditAuditModalProps) {
  const [formData, setFormData] = useState<Partial<UpdateAuditInput>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && audit) {
      setFormData({
        id: audit.id,
        code: audit.code,
        title: audit.title,
        description: audit.description,
        type: audit.type,
        status: audit.status,
        scope: audit.scope,
        leadAuditorId: audit.leadAuditorId,
        departmentId: audit.departmentId,
        startDate: audit.startDate
          ? new Date(audit.startDate).toISOString().split("T")[0]
          : "",
        endDate: audit.endDate
          ? new Date(audit.endDate).toISOString().split("T")[0]
          : "",
        reportDate: audit.reportDate
          ? new Date(audit.reportDate).toISOString().split("T")[0]
          : undefined,
        conclusion: audit.conclusion || undefined,
      });
      fetchData();
    }
  }, [isOpen, audit]);

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/departments"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (deptsRes.ok) {
        const data = await deptsRes.json();
        setDepartments(data.departments || []);
      }
    } catch {
      console.error("Error fetching data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audit) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/audit/${audit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update audit");
      }
    } catch {
      setError("An error occurred while updating the audit");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudit = async () => {
    if (!audit) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/audit/${audit.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete();
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setError("Failed to delete audit");
      }
    } catch {
      setError("An error occurred while deleting the audit");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !audit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Edit Audit</h2>
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
                  Are you sure you want to delete this audit? This will also
                  delete all associated findings and schedules. This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAudit}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && !showDeleteConfirm && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {AUDIT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scope <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.scope || ""}
              onChange={(e) =>
                setFormData({ ...formData, scope: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lead Auditor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Auditor
              </label>
              <select
                value={formData.leadAuditorId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leadAuditorId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select lead auditor...</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Report Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Date
              </label>
              <input
                type="date"
                value={formData.reportDate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reportDate: e.target.value || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {AUDIT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conclusion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conclusion
            </label>
            <textarea
              value={formData.conclusion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  conclusion: e.target.value || undefined,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Audit conclusion and summary..."
            />
          </div>

          {/* Audit Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Audit Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Findings:</span>{" "}
                <span className="font-semibold">
                  {audit.findings?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Schedules:</span>{" "}
                <span className="font-semibold">
                  {audit.schedules?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>{" "}
                <span className="font-semibold">
                  {new Date(audit.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>{" "}
                <span className="font-semibold">
                  {new Date(audit.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Audit</span>
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Audit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
